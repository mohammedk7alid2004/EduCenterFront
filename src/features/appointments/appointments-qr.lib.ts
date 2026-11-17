import { theme } from '@/config';
import { downloadBlob } from '@/shared/lib';
import { APPOINTMENT_QR, QR_EXPORT_FORMAT } from './appointments.constants';

function hexColor(value: string): string {
  return `#${value
    .split(' ')
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}
export async function generateAppointmentQr(
  payload: string,
  size: number = APPOINTMENT_QR.previewSize,
): Promise<string> {
  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(payload, {
    width: size,
    margin: APPOINTMENT_QR.margin,
    errorCorrectionLevel: 'M',
    color: { dark: hexColor(theme.light.qrInk), light: hexColor(theme.light.qrPaper) },
  });
}
export async function exportAppointmentQr({
  payload,
  labels,
  id,
  language,
  format,
}: {
  payload: string;
  labels: string[];
  id: string;
  language: string;
  format: 'png' | 'pdf';
}): Promise<void> {
  await document.fonts.ready;
  const qr = new window.Image();
  qr.src = await generateAppointmentQr(payload, APPOINTMENT_QR.exportSize);
  await qr.decode();
  const canvas = document.createElement('canvas');
  canvas.width = APPOINTMENT_QR.cardWidth;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('appointments.qr.exportFailed');
  const font = `${APPOINTMENT_QR.labelFontSize}px ${window.getComputedStyle(document.body).fontFamily}`;
  context.font = font;
  const lines: string[] = [];
  for (const label of labels) {
    let line = '';
    for (const word of label.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (
        line &&
        context.measureText(candidate).width > canvas.width - APPOINTMENT_QR.codeTop * 2
      ) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
  }
  canvas.height =
    APPOINTMENT_QR.codeTop +
    APPOINTMENT_QR.exportSize +
    (lines.length + 1) * APPOINTMENT_QR.lineHeight +
    APPOINTMENT_QR.footerPadding;
  context.fillStyle = hexColor(theme.light.qrPaper);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(qr, (canvas.width - APPOINTMENT_QR.exportSize) / 2, APPOINTMENT_QR.codeTop);
  context.fillStyle = hexColor(theme.light.qrInk);
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.direction = language.startsWith('ar') ? 'rtl' : 'ltr';
  lines.forEach((line, index) =>
    context.fillText(
      line,
      canvas.width / 2,
      APPOINTMENT_QR.codeTop + APPOINTMENT_QR.exportSize + (index + 1) * APPOINTMENT_QR.lineHeight,
      canvas.width - APPOINTMENT_QR.codeTop * 2,
    ),
  );
  const fileName = `appointment-${id.replace(/[^a-zA-Z0-9-]/g, '')}-qr.${format}`;
  if (format === QR_EXPORT_FORMAT.pdf) {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      unit: 'px',
      format: [canvas.width, canvas.height],
      orientation: 'portrait',
      compress: true,
    });
    pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height);
    downloadBlob(pdf.output('blob'), fileName);
  } else {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('appointments.qr.exportFailed'))),
        'image/png',
      ),
    );
    downloadBlob(blob, fileName);
  }
}
