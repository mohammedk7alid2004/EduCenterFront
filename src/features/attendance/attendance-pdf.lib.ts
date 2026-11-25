import { theme } from '@/config/theme';
import { downloadBlob } from '@/shared/utils';
import type { AttendanceDto } from './attendance.types';

type PdfLabels = {
  title: string;
  generatedAt: string;
  page: string;
  noRecords: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  group: string;
  status: string;
  date: string;
  statuses: Record<number, string>;
};

const PAGE_WIDTH = 1120;
const PAGE_HEIGHT = 790;
const PAGE_MARGIN = 42;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 42;
const ROWS_PER_PAGE = 10;

function color(name: keyof typeof theme.light): string {
  return `rgb(${theme.light[name]})`;
}

function trimText(context: CanvasRenderingContext2D, value: string, width: number): string {
  if (context.measureText(value).width <= width) return value;
  let truncated = value;
  while (truncated.length > 1 && context.measureText(`${truncated}…`).width > width) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

function drawCell(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  align: CanvasTextAlign,
): void {
  context.textAlign = align;
  context.fillText(
    trimText(context, value, width - 18),
    x + (align === 'right' ? width - 9 : 9),
    y,
  );
}

function formatDate(date: string, language: string): string {
  return new Intl.DateTimeFormat(language.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium',
  }).format(new Date(`${date}T00:00:00`));
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
  const pdf = new jsPDF({
    unit: 'px',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
    orientation: 'landscape',
    compress: true,
  });
  const pages = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const columns = [
    { label: labels.fullName, width: 190, value: (row: AttendanceDto) => row.fullName },
    { label: labels.group, width: 150, value: (row: AttendanceDto) => row.groupName ?? '—' },
    {
      label: labels.phoneNumber,
      width: 140,
      value: (row: AttendanceDto) => row.phoneNumber ?? '—',
    },
    { label: labels.email, width: 235, value: (row: AttendanceDto) => row.email ?? '—' },
    {
      label: labels.status,
      width: 125,
      value: (row: AttendanceDto) => labels.statuses[row.status],
    },
    {
      label: labels.date,
      width: 160,
      value: (row: AttendanceDto) => formatDate(row.attendanceDate, language),
    },
  ];
  const rightToLeft = language.startsWith('ar');

  for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
    if (pageIndex > 0) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'landscape');
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_WIDTH * 2;
    canvas.height = PAGE_HEIGHT * 2;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('errors.unknown');
    context.scale(2, 2);
    context.fillStyle = color('card');
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    context.fillStyle = color('primary');
    context.fillRect(0, 0, PAGE_WIDTH, 112);
    context.fillStyle = color('card');
    context.font = '700 27px Arial';
    context.textAlign = rightToLeft ? 'right' : 'left';
    context.fillText(labels.title, rightToLeft ? PAGE_WIDTH - PAGE_MARGIN : PAGE_MARGIN, 52);
    context.fillStyle = `rgb(${theme.light.card} / 0.78)`;
    context.font = '14px Arial';
    context.fillText(
      `${labels.generatedAt}: ${new Intl.DateTimeFormat(
        language.startsWith('ar') ? 'ar-EG' : 'en-GB',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        },
      ).format(new Date())}`,
      rightToLeft ? PAGE_WIDTH - PAGE_MARGIN : PAGE_MARGIN,
      82,
    );

    const startY = 150;
    const pageRows = rows.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE);
    let currentX = PAGE_MARGIN;
    context.fillStyle = color('table');
    context.fillRect(PAGE_MARGIN, startY, PAGE_WIDTH - PAGE_MARGIN * 2, HEADER_HEIGHT);
    context.fillStyle = color('tableHeading');
    context.font = '700 13px Arial';
    for (const column of columns) {
      drawCell(
        context,
        column.label,
        currentX,
        startY + 26,
        column.width,
        rightToLeft ? 'right' : 'left',
      );
      currentX += column.width;
    }

    if (pageRows.length === 0) {
      context.fillStyle = color('muted');
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.fillText(labels.noRecords, PAGE_WIDTH / 2, startY + 92);
    }

    pageRows.forEach((row, index) => {
      const rowY = startY + HEADER_HEIGHT + index * ROW_HEIGHT;
      context.fillStyle = index % 2 === 0 ? color('subtle') : color('card');
      context.fillRect(PAGE_MARGIN, rowY, PAGE_WIDTH - PAGE_MARGIN * 2, ROW_HEIGHT);
      context.strokeStyle = color('border');
      context.beginPath();
      context.moveTo(PAGE_MARGIN, rowY + ROW_HEIGHT);
      context.lineTo(PAGE_WIDTH - PAGE_MARGIN, rowY + ROW_HEIGHT);
      context.stroke();
      context.fillStyle = color('foreground');
      context.font = '13px Arial';
      let cellX = PAGE_MARGIN;
      for (const column of columns) {
        drawCell(
          context,
          column.value(row),
          cellX,
          rowY + 31,
          column.width,
          rightToLeft ? 'right' : 'left',
        );
        cellX += column.width;
      }
    });

    context.fillStyle = color('muted');
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText(
      `${labels.page} ${pageIndex + 1} / ${pages}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 30,
    );
    pdf.addImage(canvas, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }

  downloadBlob(pdf.output('blob'), 'StudentAttendance.pdf');
}
