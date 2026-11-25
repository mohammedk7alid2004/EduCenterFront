import { theme } from '@/config/theme';
import { downloadBlob } from '@/shared/utils';
import { ATTENDANCE_STATUS, type AttendanceDto, type AttendanceStatus } from './attendance.types';

type PdfLabels = {
  title: string;
  generatedAt: string;
  page: string;
  noRecords: string;
  fullName: string;
  phoneNumber: string;
  group: string;
  status: string;
  date: string;
  records: string;
  groups: string;
  period: string;
  allDates: string;
  multipleGroups: string;
  statuses: Record<AttendanceStatus, string>;
};

// A4 in points. Keeping the drawing surface in the same unit makes printed output predictable.
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 36;
const HEADER_HEIGHT = 86;
const TABLE_HEADER_HEIGHT = 32;
const ROW_HEIGHT = 34;
const FIRST_PAGE_ROWS = 12;
const FOLLOWING_PAGE_ROWS = 18;

function color(name: keyof typeof theme.light): string {
  return `rgb(${theme.light[name]})`;
}

function translucent(name: keyof typeof theme.light, opacity: number): string {
  return `rgb(${theme.light[name]} / ${opacity})`;
}

function trimText(context: CanvasRenderingContext2D, value: string, width: number): string {
  if (context.measureText(value).width <= width) return value;
  let truncated = value;
  while (truncated.length > 1 && context.measureText(`${truncated}...`).width > width) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function drawText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  align: CanvasTextAlign,
): void {
  context.textAlign = align;
  context.fillText(value, x, y);
}

function drawCell(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  align: CanvasTextAlign,
): void {
  drawText(
    context,
    trimText(context, value, width - 12),
    x + (align === 'right' ? width - 6 : 6),
    y,
    align,
  );
}

function formatDate(date: string, language: string): string {
  return new Intl.DateTimeFormat(language.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    dateStyle: 'short',
  }).format(new Date(`${date}T00:00:00`));
}

function getStatusColor(status: AttendanceStatus): keyof typeof theme.light {
  if (status === ATTENDANCE_STATUS.present) return 'success';
  if (status === ATTENDANCE_STATUS.late) return 'warning';
  if (status === ATTENDANCE_STATUS.excused) return 'info';
  return 'danger';
}

function getPeriod(rows: AttendanceDto[], language: string, allDates: string): string {
  if (rows.length === 0) return allDates;
  const dates = rows.map((row) => row.attendanceDate).sort();
  return dates[0] === dates[dates.length - 1]
    ? formatDate(dates[0], language)
    : `${formatDate(dates[0], language)} - ${formatDate(dates[dates.length - 1], language)}`;
}

async function loadBrandLogo(): Promise<HTMLImageElement | null> {
  const logo = new Image();
  logo.src = `${import.meta.env.BASE_URL}logo-3m2a.svg`;
  try {
    await logo.decode();
    return logo;
  } catch {
    return null;
  }
}

function drawHeader(
  context: CanvasRenderingContext2D,
  labels: PdfLabels,
  generatedDate: string,
  logo: HTMLImageElement | null,
): void {
  context.fillStyle = color('primary');
  context.fillRect(0, 0, PAGE_WIDTH, HEADER_HEIGHT);
  context.fillStyle = color('accent');
  context.fillRect(0, HEADER_HEIGHT - 5, PAGE_WIDTH, 5);
  if (logo) {
    context.drawImage(logo, PAGE_MARGIN, 27, 96, 34);
  } else {
    context.fillStyle = color('card');
    context.font = '800 25px Cairo, Arial, sans-serif';
    drawText(context, '3M2A', PAGE_MARGIN, 51, 'left');
  }
  context.fillStyle = translucent('card', 0.78);
  context.font = '10px Cairo, Arial, sans-serif';
  drawText(context, labels.generatedAt, PAGE_WIDTH - PAGE_MARGIN, 33, 'right');
  context.fillStyle = color('card');
  context.font = '700 12px Cairo, Arial, sans-serif';
  drawText(context, generatedDate, PAGE_WIDTH - PAGE_MARGIN, 53, 'right');
}

function drawInfoCard(
  context: CanvasRenderingContext2D,
  language: string,
  labels: PdfLabels,
  rows: AttendanceDto[],
  generatedDate: string,
): number {
  const rightToLeft = language.startsWith('ar');
  const y = 143;
  const width = PAGE_WIDTH - PAGE_MARGIN * 2;
  const groups = [...new Set(rows.map((row) => row.groupName).filter(Boolean))] as string[];
  const groupSummary =
    groups.length === 0
      ? '—'
      : groups.length === 1
        ? groups[0]
        : `${groups.length} ${labels.multipleGroups}`;
  const entries = [
    { label: labels.generatedAt, value: generatedDate },
    { label: labels.records, value: String(rows.length) },
    { label: labels.groups, value: groupSummary },
    { label: labels.period, value: getPeriod(rows, language, labels.allDates) },
  ];
  context.fillStyle = color('subtle');
  roundedRect(context, PAGE_MARGIN, y, width, 80, 10);
  context.strokeStyle = color('border');
  context.strokeRect(PAGE_MARGIN, y, width, 80);
  entries.forEach((entry, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const blockWidth = width / 2;
    const x = rightToLeft
      ? PAGE_MARGIN + width - column * blockWidth - 18
      : PAGE_MARGIN + column * blockWidth + 18;
    const align: CanvasTextAlign = rightToLeft ? 'right' : 'left';
    context.fillStyle = color('muted');
    context.font = '9px Cairo, Arial, sans-serif';
    drawText(context, entry.label, x, y + 20 + row * 34, align);
    context.fillStyle = color('foreground');
    context.font = '700 11px Cairo, Arial, sans-serif';
    drawText(context, trimText(context, entry.value, blockWidth - 36), x, y + 34 + row * 34, align);
  });
  return y + 96;
}

function drawSummary(
  context: CanvasRenderingContext2D,
  language: string,
  labels: PdfLabels,
  rows: AttendanceDto[],
  y: number,
): number {
  const rightToLeft = language.startsWith('ar');
  const statuses: AttendanceStatus[] = [
    ATTENDANCE_STATUS.present,
    ATTENDANCE_STATUS.late,
    ATTENDANCE_STATUS.excused,
    ATTENDANCE_STATUS.absent,
  ];
  const gap = 9;
  const cardWidth = (PAGE_WIDTH - PAGE_MARGIN * 2 - gap * 3) / 4;
  statuses.forEach((status, index) => {
    const visualIndex = rightToLeft ? 3 - index : index;
    const x = PAGE_MARGIN + visualIndex * (cardWidth + gap);
    const tone = getStatusColor(status);
    context.fillStyle = translucent(tone, status === ATTENDANCE_STATUS.present ? 0.13 : 0.1);
    roundedRect(context, x, y, cardWidth, 62, 10);
    context.fillStyle = color(tone);
    context.font = '800 19px Cairo, Arial, sans-serif';
    drawText(
      context,
      String(rows.filter((row) => row.status === status).length),
      x + cardWidth / 2,
      y + 29,
      'center',
    );
    context.fillStyle = color('tableHeading');
    context.font = '10px Cairo, Arial, sans-serif';
    drawText(context, labels.statuses[status], x + cardWidth / 2, y + 48, 'center');
  });
  return y + 82;
}

function drawStatusChip(
  context: CanvasRenderingContext2D,
  label: string,
  status: AttendanceStatus,
  x: number,
  y: number,
  width: number,
): void {
  const tone = getStatusColor(status);
  context.fillStyle = translucent(tone, 0.14);
  roundedRect(context, x + (width - 58) / 2, y - 14, 58, 20, 10);
  context.fillStyle = color(tone);
  context.font = '700 9px Cairo, Arial, sans-serif';
  drawText(context, trimText(context, label, 50), x + width / 2, y, 'center');
}

function drawTable(
  context: CanvasRenderingContext2D,
  language: string,
  labels: PdfLabels,
  rows: AttendanceDto[],
  y: number,
): void {
  const rightToLeft = language.startsWith('ar');
  const logicalColumns = [
    {
      label: labels.date,
      width: 88,
      value: (row: AttendanceDto) => formatDate(row.attendanceDate, language),
    },
    { label: labels.fullName, width: 118, value: (row: AttendanceDto) => row.fullName },
    { label: labels.group, width: 105, value: (row: AttendanceDto) => row.groupName ?? '—' },
    { label: labels.status, width: 82, value: (row: AttendanceDto) => labels.statuses[row.status] },
    {
      label: labels.phoneNumber,
      width: 130,
      value: (row: AttendanceDto) => row.phoneNumber ?? '—',
    },
  ];
  const columns = rightToLeft
    ? [...logicalColumns].reverse()
    : [
        logicalColumns[1],
        logicalColumns[2],
        logicalColumns[4],
        logicalColumns[3],
        logicalColumns[0],
      ];
  const tableWidth = columns.reduce((total, column) => total + column.width, 0);
  context.fillStyle = color('table');
  roundedRect(context, PAGE_MARGIN, y, tableWidth, TABLE_HEADER_HEIGHT, 8);
  context.fillStyle = color('tableHeading');
  context.font = '700 9px Cairo, Arial, sans-serif';
  let currentX = PAGE_MARGIN;
  for (const column of columns) {
    drawCell(context, column.label, currentX, y + 21, column.width, rightToLeft ? 'right' : 'left');
    currentX += column.width;
  }
  if (rows.length === 0) {
    context.fillStyle = color('muted');
    context.font = '12px Cairo, Arial, sans-serif';
    drawText(context, labels.noRecords, PAGE_WIDTH / 2, y + 66, 'center');
    return;
  }
  rows.forEach((row, index) => {
    const rowY = y + TABLE_HEADER_HEIGHT + index * ROW_HEIGHT;
    context.fillStyle = index % 2 === 0 ? color('card') : color('subtle');
    context.fillRect(PAGE_MARGIN, rowY, tableWidth, ROW_HEIGHT);
    context.strokeStyle = color('border');
    context.beginPath();
    context.moveTo(PAGE_MARGIN, rowY + ROW_HEIGHT);
    context.lineTo(PAGE_MARGIN + tableWidth, rowY + ROW_HEIGHT);
    context.stroke();
    context.fillStyle = color('foreground');
    context.font = '10px Cairo, Arial, sans-serif';
    let cellX = PAGE_MARGIN;
    for (const column of columns) {
      if (column.label === labels.status) {
        drawStatusChip(context, column.value(row), row.status, cellX, rowY + 22, column.width);
      } else {
        drawCell(
          context,
          column.value(row),
          cellX,
          rowY + 22,
          column.width,
          rightToLeft ? 'right' : 'left',
        );
      }
      cellX += column.width;
    }
  });
}

function drawFooter(
  context: CanvasRenderingContext2D,
  labels: PdfLabels,
  pageIndex: number,
  totalPages: number,
): void {
  context.strokeStyle = color('border');
  context.beginPath();
  context.moveTo(PAGE_MARGIN, PAGE_HEIGHT - 36);
  context.lineTo(PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 36);
  context.stroke();
  context.fillStyle = color('muted');
  context.font = '9px Cairo, Arial, sans-serif';
  drawText(context, '3M2A', PAGE_MARGIN, PAGE_HEIGHT - 18, 'left');
  drawText(
    context,
    `${labels.page} ${pageIndex + 1} / ${totalPages}`,
    PAGE_WIDTH - PAGE_MARGIN,
    PAGE_HEIGHT - 18,
    'right',
  );
}

export async function exportAttendancePdf({
  rows,
  language,
  labels,
}: {
  rows: AttendanceDto[];
  language: string;
  labels: PdfLabels;
}): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true });
  const generatedDate = new Intl.DateTimeFormat(language.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium',
  }).format(new Date());
  const logo = await loadBrandLogo();
  const firstPage = rows.slice(0, FIRST_PAGE_ROWS);
  const remainingRows = rows.slice(FIRST_PAGE_ROWS);
  const totalPages = Math.max(1, 1 + Math.ceil(remainingRows.length / FOLLOWING_PAGE_ROWS));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    if (pageIndex > 0) pdf.addPage('a4', 'portrait');
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_WIDTH * 2;
    canvas.height = PAGE_HEIGHT * 2;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('errors.unknown');
    context.scale(2, 2);
    context.direction = language.startsWith('ar') ? 'rtl' : 'ltr';
    context.fillStyle = color('card');
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    drawHeader(context, labels, generatedDate, logo);
    const pageRows =
      pageIndex === 0
        ? firstPage
        : remainingRows.slice(
            (pageIndex - 1) * FOLLOWING_PAGE_ROWS,
            pageIndex * FOLLOWING_PAGE_ROWS,
          );
    let tableY = 130;
    if (pageIndex === 0) {
      context.fillStyle = color('primary');
      context.font = '800 22px Cairo, Arial, sans-serif';
      drawText(
        context,
        labels.title,
        language.startsWith('ar') ? PAGE_WIDTH - PAGE_MARGIN : PAGE_MARGIN,
        121,
        language.startsWith('ar') ? 'right' : 'left',
      );
      tableY = drawSummary(
        context,
        language,
        labels,
        rows,
        drawInfoCard(context, language, labels, rows, generatedDate),
      );
    }
    drawTable(context, language, labels, pageRows, tableY);
    drawFooter(context, labels, pageIndex, totalPages);
    pdf.addImage(canvas, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }
  downloadBlob(pdf.output('blob'), 'StudentAttendance.pdf');
}
