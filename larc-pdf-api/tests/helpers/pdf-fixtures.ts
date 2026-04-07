import { PDFDocument, StandardFonts } from 'pdf-lib';

export const createTemplatePdf = async (): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const form = pdfDoc.getForm();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText('Name:', { x: 40, y: 740, size: 12, font });
  page.drawText('City:', { x: 40, y: 700, size: 12, font });

  const name = form.createTextField('name');
  name.addToPage(page, { x: 120, y: 730, width: 300, height: 24 });

  const city = form.createTextField('city');
  city.addToPage(page, { x: 120, y: 690, width: 300, height: 24 });

  const subscribed = form.createCheckBox('subscribed');
  subscribed.addToPage(page, { x: 120, y: 650, width: 24, height: 24 });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
