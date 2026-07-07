import { createServerFn } from "@tanstack/react-start";

export const generateReportDocument = createServerFn({ method: "POST" })
  .validator((data: { format: 'pdf' | 'docx' | 'xlsx'; type: string; filters?: any }) => data)
  .handler(async ({ data }) => {
    console.log(`Generating ${data.format} report for ${data.type}`);
    
    // Lazy load libraries to avoid bloat even on the server if necessary,
    // though server bloat is less of an issue than client bloat.
    
    if (data.format === 'pdf') {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      page.drawText(`Kogi OneGov - ${data.type} Report`, {
        x: 50,
        y: 750,
        size: 20,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 720,
        size: 12,
      });
      page.drawText(`This is a mock AI-generated PDF report.`, {
        x: 50,
        y: 680,
        size: 14,
      });
      
      const pdfBytes = await pdfDoc.save();
      return { fileData: Buffer.from(pdfBytes).toString('base64'), format: 'pdf', filename: `${data.type}-report.pdf` };
    }
    
    if (data.format === 'docx') {
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Kogi OneGov - ${data.type} Report`, bold: true, size: 32 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Generated on: ${new Date().toLocaleDateString()}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun("This is a mock AI-generated Word document report."),
              ],
            }),
          ],
        }],
      });
      
      const buffer = await Packer.toBuffer(doc);
      return { fileData: buffer.toString('base64'), format: 'docx', filename: `${data.type}-report.docx` };
    }
    
    if (data.format === 'xlsx') {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Report');
      sheet.addRow(['Metric', 'Value']);
      sheet.addRow(['Report Type', data.type]);
      sheet.addRow(['Generated Date', new Date().toLocaleDateString()]);
      sheet.addRow(['AI Analysis', 'Performance is stable.']);
      
      const buffer = await workbook.xlsx.writeBuffer();
      return { fileData: Buffer.from(buffer).toString('base64'), format: 'xlsx', filename: `${data.type}-report.xlsx` };
    }

    return null;
  });
