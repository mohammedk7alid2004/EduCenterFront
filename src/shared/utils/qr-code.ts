import { theme } from '@/app/config';
import { downloadBlob } from './download';

export const QR_CODE_CONFIG = {
  defaultLogo: '/logo-3m2a.svg',
  logoRatio: 0.2,
  logoPaddingRatio: 0.02,
  previewSize: 320,
  exportSize: 1000,
  margin: 4,
  cardWidth: 1200,
  codeTop: 60,
  labelFontSize: 34,
  lineHeight: 52,
  footerPadding: 60,
} as const;

export const QR_EXPORT_FORMAT = { png: 'png', pdf: 'pdf' } as const;

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
    if (source !== QR_CODE_CONFIG.defaultLogo) return loadQrLogo(QR_CODE_CONFIG.defaultLogo);
    throw error;
  }
}

export async function generateQrDataUrl(
  payload: string,
  size: number = QR_CODE_CONFIG.previewSize,
  logoSource: string = QR_CODE_CONFIG.defaultLogo,
): Promise<string> {
  const [{ default: QRCode }, logo] = await Promise.all([import('qrcode'), loadQrLogo(logoSource)]);
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, payload, {
    width: size,
    margin: QR_CODE_CONFIG.margin,
    errorCorrectionLevel: 'H',
    color: { dark: hexColor(theme.light.qrInk), light: hexColor(theme.light.qrPaper) },
  });
  const context = canvas.getContext('2d');
  if (!context) throw new Error('qr.generationFailed');

  const logoSize = size * QR_CODE_CONFIG.logoRatio;
  const padding = size * QR_CODE_CONFIG.logoPaddingRatio;
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

export async function renderQrCardCanvas({
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
  qr.src = await generateQrDataUrl(payload, QR_CODE_CONFIG.exportSize, logoSource);
  await qr.decode();

  const canvas = document.createElement('canvas');
  canvas.width = QR_CODE_CONFIG.cardWidth;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('qr.exportFailed');

  const font = `${QR_CODE_CONFIG.labelFontSize}px ${window.getComputedStyle(document.body).fontFamily}`;
  context.font = font;

  const lines: string[] = [];
  for (const label of labels) {
    let line = '';
    for (const word of label.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (
        line &&
        context.measureText(candidate).width > canvas.width - QR_CODE_CONFIG.codeTop * 2
      ) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }

  canvas.height =
    QR_CODE_CONFIG.codeTop +
    QR_CODE_CONFIG.exportSize +
    (lines.length + 1) * QR_CODE_CONFIG.lineHeight +
    QR_CODE_CONFIG.footerPadding;
  context.fillStyle = hexColor(theme.light.qrPaper);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(qr, (canvas.width - QR_CODE_CONFIG.exportSize) / 2, QR_CODE_CONFIG.codeTop);
  context.fillStyle = hexColor(theme.light.qrInk);
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.direction = language.startsWith('ar') ? 'rtl' : 'ltr';
  lines.forEach((line, index) =>
    context.fillText(
      line,
      canvas.width / 2,
      QR_CODE_CONFIG.codeTop + QR_CODE_CONFIG.exportSize + (index + 1) * QR_CODE_CONFIG.lineHeight,
      canvas.width - QR_CODE_CONFIG.codeTop * 2,
    ),
  );
  return canvas;
}

export async function exportQrCard({
  payload,
  labels,
  fileNameBase,
  language,
  format,
  logoSource,
}: {
  payload: string;
  labels: string[];
  fileNameBase: string;
  language: string;
  format: (typeof QR_EXPORT_FORMAT)[keyof typeof QR_EXPORT_FORMAT];
  logoSource?: string;
}): Promise<void> {
  const canvas = await renderQrCardCanvas({ payload, labels, language, logoSource });
  const fileName = `${fileNameBase}.${format}`;
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
        (result) => (result ? resolve(result) : reject(new Error('qr.exportFailed'))),
        'image/png',
      ),
    );
    downloadBlob(blob, fileName);
  }
}
