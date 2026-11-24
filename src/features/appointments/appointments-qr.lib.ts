import { theme } from '@/config';
import { downloadBlob } from '@/shared/utils';
import { APPOINTMENT_QR, QR_EXPORT_FORMAT } from './appointments.constants';

function hexColor(value: string): string {
  return `#${value
    .split(' ')
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}
async function loadQrLogo(source: string): Promise<HTMLImageElement> {
  const image = new window.Image();
  image.crossOrigin = 'anonymous';
  image.src = source;
  try {
    await image.decode();
    return image;
  } catch (error) {
    if (source !== APPOINTMENT_QR.defaultLogo) return loadQrLogo(APPOINTMENT_QR.defaultLogo);
    throw error;
  }
}
export async function generateAppointmentQr(
  payload: string,
  size: number = APPOINTMENT_QR.previewSize,
  logoSource: string = APPOINTMENT_QR.defaultLogo,
): Promise<string> {
  const [{ default: QRCode }, logo] = await Promise.all([import('qrcode'), loadQrLogo(logoSource)]);
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, payload, {
    width: size,
    margin: APPOINTMENT_QR.margin,
    errorCorrectionLevel: 'H',
    color: { dark: hexColor(theme.light.qrInk), light: hexColor(theme.light.qrPaper) },
  });
  const context = canvas.getContext('2d');
  if (!context) throw new Error('appointments.qr.generationFailed');
  const logoSize = size * APPOINTMENT_QR.logoRatio;
  const padding = size * APPOINTMENT_QR.logoPaddingRatio;
  const start = (size - logoSize) / 2;
  context.fillStyle = hexColor(theme.light.qrPaper);
  context.fillRect(
    start - padding,
    start - padding,
    logoSize + padding * 2,
    logoSize + padding * 2,
  );
  context.fillStyle = hexColor(theme.light.primary);
  context.beginPath();
  context.roundRect(start, start, logoSize, logoSize, padding);
  context.fill();
  const ratio = Math.min(
    (logoSize - padding * 2) / logo.naturalWidth,
    (logoSize - padding * 2) / logo.naturalHeight,
  );
  const width = logo.naturalWidth * ratio;
  const height = logo.naturalHeight * ratio;
  context.drawImage(logo, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL('image/png');
}
export async function renderAppointmentQrCanvas({
  payload,
  labels,
  language,
  logoSource,
}: {
  payload: string;
  labels: string[];
  language: string;
  logoSource?: string;
}): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const qr = new window.Image();
  qr.src = await generateAppointmentQr(payload, APPOINTMENT_QR.exportSize, logoSource);
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
  return canvas;
}

export async function exportAppointmentQr({
  payload,
  labels,
  id,
  language,
  format,
  logoSource,
  lectureNumber,
}: {
  payload: string;
  labels: string[];
  id: string;
  language: string;
  format: 'png' | 'pdf';
  logoSource?: string;
  lectureNumber?: number;
}): Promise<void> {
  const canvas = await renderAppointmentQrCanvas({ payload, labels, language, logoSource });
  const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');
  const suffix = lectureNumber !== undefined ? `-lecture-${lectureNumber}` : '';
  const fileName = `appointment-${sanitizedId}${suffix}-qr.${format}`;
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

export async function exportAllLecturesQr({
  lectures,
  id,
  language,
  logoSource,
}: {
  lectures: { payload: string; labels: string[]; lectureNumber: number }[];
  id: string;
  language: string;
  logoSource?: string;
}): Promise<void> {
  if (lectures.length === 0) return;
  const { jsPDF } = await import('jspdf');
  let pdf: InstanceType<typeof jsPDF> | null = null;

  for (let i = 0; i < lectures.length; i++) {
    const canvas = await renderAppointmentQrCanvas({
      payload: lectures[i].payload,
      labels: lectures[i].labels,
      language,
      logoSource,
    });
    if (!pdf) {
      pdf = new jsPDF({
        unit: 'px',
        format: [canvas.width, canvas.height],
        orientation: 'portrait',
        compress: true,
      });
    } else {
      pdf.addPage([canvas.width, canvas.height], 'portrait');
    }
    pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height);
  }

  if (pdf) {
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');
    const fileName = `appointment-${sanitizedId}-all-lectures.pdf`;
    downloadBlob(pdf.output('blob'), fileName);
  }
}
