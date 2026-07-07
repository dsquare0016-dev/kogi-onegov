import nodemailer from 'nodemailer';
import sql from './postgres';
import { decryptText } from './encryption';

interface SmtpConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  sender_name?: string;
  sender_email?: string;
  encryption_type?: string;
  is_enabled?: boolean;
}

// Global toggle check
async function isEmailNotificationsEnabled(): Promise<boolean> {
  try {
    // 1. Check global platform settings/system locks or system settings
    // Respect the global toggle. If toggled off globally, return false.
    const [smtp] = await sql`SELECT is_enabled FROM smtp_settings LIMIT 1`;
    if (smtp && smtp.is_enabled === false) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to check notification status:', err.message);
    return true; // Default to true if table error
  }
}

// Dynamic SMTP configuration loader (Option A with Option B fallback)
async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; senderName: string; senderEmail: string } | null> {
  let config: SmtpConfig | null = null;

  try {
    // Option A: Check smtp_settings table
    const [dbConfig] = await sql`SELECT * FROM smtp_settings WHERE is_enabled = true LIMIT 1`;
    if (dbConfig) {
      config = {
        host: dbConfig.host,
        port: Number(dbConfig.port),
        username: dbConfig.username,
        password: decryptText(dbConfig.password), // Decrypt password
        sender_name: dbConfig.sender_name,
        sender_email: dbConfig.sender_email,
        encryption_type: dbConfig.encryption_type,
        is_enabled: dbConfig.is_enabled
      };
    }
  } catch (err) {
    console.error('Failed to fetch SMTP settings from DB, trying env fallback:', err.message);
  }

  // Option B: Fallback to Environment Variables
  if (!config || !config.host) {
    const envHost = process.env.SMTP_HOST;
    const envPort = process.env.SMTP_PORT;
    if (envHost && envPort) {
      config = {
        host: envHost,
        port: Number(envPort),
        username: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
        sender_name: process.env.SMTP_SENDER_NAME || 'Kogi OneGov',
        sender_email: process.env.SMTP_SENDER_EMAIL || 'noreply@kogistate.gov.ng',
        encryption_type: process.env.SMTP_ENCRYPTION || 'STARTTLS',
        is_enabled: true
      };
    }
  }

  if (!config || !config.host) {
    console.warn('SMTP configuration is missing. Outbound emails will be logged only.');
    return null;
  }

  const isSecure = config.port === 465 || config.encryption_type === 'SSL' || config.encryption_type === 'TLS';

  const auth = config.username && config.password ? {
    user: config.username,
    pass: config.password
  } : undefined;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: isSecure,
    auth,
    tls: {
      rejectUnauthorized: false // Avoid SSL handshake rejection issues on local servers
    }
  });

  return {
    transporter,
    senderName: config.sender_name || 'Kogi OneGov',
    senderEmail: config.sender_email || 'noreply@kogistate.gov.ng'
  };
}

export async function sendEmail({
  to,
  subject,
  html,
  templateName,
  metadata
}: {
  to: string;
  subject: string;
  html: string;
  templateName?: string;
  metadata?: any;
}): Promise<{ success: boolean; error?: string }> {
  // 1. Check if email notifications are enabled globally
  const isEnabled = await isEmailNotificationsEnabled();
  if (!isEnabled) {
    console.log(`✉️ Email notifications disabled. Suppressing send to ${to}`);
    // Log suppression in DB for audit trail
    await logEmailDispatch({
      to,
      subject,
      templateName,
      status: 'Suppressed',
      errorMessage: 'Emails are disabled globally',
      metadata
    });
    return { success: false, error: 'Email notifications disabled globally' };
  }

  // 2. Fetch transporter config
  const smtp = await getTransporter();
  if (!smtp) {
    console.log(`✉️ No SMTP configured. Logging email to ${to} (Subject: ${subject})`);
    await logEmailDispatch({
      to,
      subject,
      templateName,
      status: 'LoggedOnly',
      errorMessage: 'SMTP settings missing (Logged only)',
      metadata
    });
    return { success: true };
  }

  try {
    const info = await smtp.transporter.sendMail({
      from: `"${smtp.senderName}" <${smtp.senderEmail}>`,
      to,
      subject,
      html
    });

    console.log(`✉️ Email successfully dispatched to ${to}. MessageId: ${info.messageId}`);
    
    // Log successful send
    await logEmailDispatch({
      to,
      subject,
      templateName,
      status: 'Sent',
      metadata: { ...metadata, messageId: info.messageId }
    });

    return { success: true };
  } catch (err: any) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    
    // Log failed send
    await logEmailDispatch({
      to,
      subject,
      templateName,
      status: 'Failed',
      errorMessage: err.message,
      metadata
    });

    return { success: false, error: err.message };
  }
}

// Log every send inside email_notification_logs
async function logEmailDispatch({
  to,
  subject,
  templateName,
  status,
  errorMessage,
  metadata
}: {
  to: string;
  subject: string;
  templateName?: string;
  status: 'Sent' | 'Failed' | 'Suppressed' | 'LoggedOnly';
  errorMessage?: string;
  metadata?: any;
}) {
  try {
    await sql`
      INSERT INTO email_notification_logs (
        recipient_email, subject, template_name, status, error_message, metadata
      ) VALUES (
        ${to}, ${subject}, ${templateName || null}, ${status}, ${errorMessage || null}, ${metadata ? JSON.stringify(metadata) : null}::jsonb
      )
    `;
  } catch (err) {
    console.error('Failed to log email dispatch to database:', err.message);
  }
}
