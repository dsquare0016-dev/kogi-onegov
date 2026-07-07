export function getWelcomeEmailTemplate(fullName: string, username: string, tempLoginUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">
        <h2 style="color: #0c2340; margin: 0;">Kogi State Government</h2>
        <p style="color: #C5A059; margin: 5px 0 0 0; font-weight: bold; font-size: 14px; text-transform: uppercase;">Digital Governance Platform</p>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          Your profile on the <strong>Kogi OneGov ERP Portal</strong> has been verified. A user account has been successfully created for you.
        </p>
        <div style="background-color: #f0f4f8; border-left: 4px solid #0c2340; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #0c2340;">Your Login Credentials</h4>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Username (Email):</strong> ${username}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Security Profile:</strong> Active Civil Service</p>
        </div>
        <p style="font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 25px;">
          To complete your onboarding, activate your credentials, and establish your secret PIN, please click the secure button below:
        </p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${tempLoginUrl}" style="background-color: #C5A059; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 5px; font-size: 14px; display: inline-block;">Activate Account</a>
        </div>
        <p style="font-size: 12px; color: #777; line-height: 1.5;">
          This activation link is valid for 24 hours. If you did not request this account, please contact the GDU security desk immediately.
        </p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© 2026 Kogi State Government ERP Portal. All Rights Reserved.</p>
        <p style="margin: 5px 0 0 0;">Lokoja, Kogi State, Nigeria.</p>
      </div>
    </div>
  `;
}

export function getPasswordResetTemplate(fullName: string, resetUrl: string, expiresHours = 1): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">
        <h2 style="color: #0c2340; margin: 0;">Kogi State Government</h2>
        <p style="color: #C5A059; margin: 5px 0 0 0; font-weight: bold; font-size: 14px; text-transform: uppercase;">Digital Governance Platform</p>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          We received a request to reset the password for your Kogi OneGov account.
        </p>
        <p style="font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 25px;">
          Please click the secure button below to choose a new password. This link will expire in <strong>${expiresHours} hour(s)</strong>.
        </p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${resetUrl}" style="background-color: #d9534f; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 5px; font-size: 14px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #777; line-height: 1.5;">
          If you did not request a password reset, please ignore this email or contact system security. No changes will be made to your account.
        </p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© 2026 Kogi State Government ERP Portal. All Rights Reserved.</p>
        <p style="margin: 5px 0 0 0;">Lokoja, Kogi State, Nigeria.</p>
      </div>
    </div>
  `;
}

export function getTransferNotificationTemplate(
  fullName: string,
  staffId: string,
  targetMdaName: string,
  targetDeptName: string,
  effectiveDate: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">
        <h2 style="color: #0c2340; margin: 0;">Official Posting &amp; Transfer Notification</h2>
        <p style="color: #C5A059; margin: 5px 0 0 0; font-weight: bold; font-size: 14px; text-transform: uppercase;">Kogi State Civil Service</p>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 15px; color: #333;">To: <strong>${fullName}</strong> (Staff ID: ${staffId})</p>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          This is an official notice that your posting coordinates have been updated in the master civil service database.
        </p>
        <div style="background-color: #f9f9f9; border: 1px solid #e2e8f0; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #0c2340; text-transform: uppercase; font-size: 12px;">New Posting Details</h4>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Target Ministry/MDA:</strong> ${targetMdaName}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Department/Unit:</strong> ${targetDeptName}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Effective Date:</strong> ${effectiveDate}</p>
        </div>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          Please coordinate with the Desk Officer at your target MDA for reporting guidelines and desk assignment.
        </p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© 2026 Office of the Head of Service, Kogi State. All Rights Reserved.</p>
      </div>
    </div>
  `;
}

export function getSecurityAlertTemplate(fullName: string, changes: string[], ipAddress: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d9534f; padding-bottom: 10px;">
        <h2 style="color: #d9534f; margin: 0;">Security Alert: Profile Change</h2>
        <p style="color: #555; margin: 5px 0 0 0; font-weight: bold; font-size: 12px; text-transform: uppercase;">Kogi OneGov ERP Portal</p>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 15px; color: #333;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          This is an automatic notification that your security profile parameters were updated recently.
        </p>
        <div style="background-color: #fdf2f2; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #d9534f;">Changes Made:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
            ${changes.map(c => `<li>${c}</li>`).join('')}
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #777;"><strong>IP Address:</strong> ${ipAddress} | <strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="font-size: 13px; color: #d9534f; font-weight: bold; line-height: 1.5;">
          If you did not authorize these changes, please notify the Superadmin immediately to freeze your account credentials.
        </p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© 2026 GDU Information Security Branch. All Rights Reserved.</p>
      </div>
    </div>
  `;
}

export function getRecruitmentMilestoneTemplate(
  candidateName: string,
  campaignTitle: string,
  applicationNumber: string,
  milestone: string,
  details: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">
        <h2 style="color: #0c2340; margin: 0;">Recruitment Process Update</h2>
        <p style="color: #C5A059; margin: 5px 0 0 0; font-weight: bold; font-size: 12px; text-transform: uppercase;">Kogi Civil Service Commission</p>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 15px; color: #333;">Dear <strong>${candidateName}</strong>,</p>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          Your application status for the campaign <strong>"${campaignTitle}"</strong> (App Number: <strong>${applicationNumber}</strong>) has been updated.
        </p>
        <div style="background-color: #f8fafc; border-top: 3px solid #C5A059; padding: 15px; margin: 20px 0; border-radius: 6px;">
          <h4 style="margin: 0 0 8px 0; color: #0c2340; font-size: 14px; text-transform: uppercase;">Current Phase: ${milestone}</h4>
          <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.5;">${details}</p>
        </div>
        <p style="font-size: 13px; color: #666; line-height: 1.5;">
          You can track your real-time status online at the official public portal using your application number.
        </p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© 2026 Kogi State Civil Service Commission. All Rights Reserved.</p>
      </div>
    </div>
  `;
}
