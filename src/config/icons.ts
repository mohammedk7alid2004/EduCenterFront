import { createElement, type ComponentProps } from 'react';
import {
  QrCode,
  Image,
  FileText,
  Download,
  Clock,
  List,
  Facebook,
  Instagram,
  Linkedin,
  AlertCircle,
  Building2,
  CircleHelp,
  Info,
  Link,
  Copy,
  Upload,
  MapPin,
  CreditCard,
  ShieldCheck,
  ShieldEllipsis,
  CalendarDays,
  CircleUserRound,
  Grid2X2,
  Home,
  PanelLeft,
  ArrowLeft,
  ArrowRight,
  AtSign,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Filter,
  Globe,
  GraduationCap,
  Presentation,
  SquarePlus,
  ListChecks,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Phone,
  Plus,
  Search,
  StickyNote,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  X,
} from 'lucide-react';

function brandIcon(path: string) {
  return function BrandIcon(props: ComponentProps<'svg'>) {
    return createElement(
      'svg',
      { viewBox: '0 0 24 24', fill: 'currentColor', ...props },
      createElement('path', { d: path }),
    );
  };
}

function ContactUsIcon(props: ComponentProps<'svg'>) {
  return createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props,
    },
    createElement('path', {
      d: 'M4 7V6a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H8M8 8l4.1 3a2 2 0 0 0 2.4 0L19 8M2 11h4M1 15h6M3 19h3',
    }),
  );
}

function ScheduleGridIcon(props: ComponentProps<'svg'>) {
  return createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props,
    },
    createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 5 }),
    createElement('path', { d: 'M12 3v18M3 12h18' }),
  );
}
function ScheduleListIcon(props: ComponentProps<'svg'>) {
  return createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinejoin: 'round',
      ...props,
    },
    ...[3, 10, 17].map((y) =>
      createElement('rect', { key: y, x: 4, y, width: 16, height: 4, rx: 0.7 }),
    ),
  );
}

function StudentsIcon(props: ComponentProps<'svg'>) {
  return createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props,
    },
    createElement('path', {
      d: 'M2 5l5-2 5 2-5 2-5-2zm2 1v3c2 2 4 2 6 0V6M2 5v5m12-3 4-1.5L22 7l-4 1.5L14 7zm1.5 1v2c1.5 1.5 3.5 1.5 5 0V8',
    }),
    createElement('circle', { cx: 7, cy: 14, r: 2.5 }),
    createElement('circle', { cx: 18, cy: 14.5, r: 2 }),
    createElement('path', {
      d: 'M1.5 21c0-4 11-4 11 0-2.5 1.5-8.5 1.5-11 0zm13-1.5c2-1.5 7-1 8 1-1 1-3.5 1.5-6 .8',
    }),
  );
}

export const icons = {
  students: StudentsIcon,
  qrCode: QrCode,
  imageFile: Image,
  pdfFile: FileText,
  scheduleGrid: ScheduleGridIcon,
  scheduleList: ScheduleListIcon,
  contactUs: ContactUsIcon,
  download: Download,
  clock: Clock,
  list: List,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: brandIcon(
    'M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.4-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 20zm4.5-6c-.2-.1-1.4-.7-1.6-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.9-.1.1-.3.2-.5.1-1.4-.6-2.5-1.6-3.2-2.8-.2-.3.2-.5.5-.9.1-.2.1-.3 0-.5L9.7 8c-.1-.3-.3-.3-.5-.3h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.2-.9 2 0 1.2.9 2.4 1 2.5.1.2 1.8 2.9 4.4 4 1.6.7 2.2.6 2.6.5.8-.1 1.5-.7 1.7-1.3.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z',
  ),
  tiktok: brandIcon(
    'M16 2h-3v13a3 3 0 1 1-2-2.8V9.1a6 6 0 1 0 5 5.9V8a9 9 0 0 0 5 1V6a5 5 0 0 1-5-4z',
  ),
  socialX: brandIcon(
    'M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L5.5 22H2.3l8.2-9.4L2 2h6.5l4.4 6.7L18.9 2zm-1.1 18h1.7L7.5 4H5.7l12.1 16z',
  ),
  snapchat: brandIcon(
    'M12 2c-3 0-5 2.2-5 5.5V10c-.6.1-1.2-.6-1.8-.3-.6.3-.7 1.2 0 1.6l1.5.7c-.3 2-1.5 3.7-3.7 4.4-.7.2-.6 1 .2 1.3l1.7.4.6 1.5c1 .4 2-.3 3 .2 1 .6 2.1 1.2 3.5 1.2s2.5-.6 3.5-1.2c1-.5 2 .2 3-.2l.6-1.5 1.7-.4c.8-.3.9-1.1.2-1.3-2.2-.7-3.4-2.4-3.7-4.4l1.5-.7c.7-.4.6-1.3 0-1.6-.6-.3-1.2.4-1.8.3V7.5C17 4.2 15 2 12 2z',
  ),
  playStore: brandIcon(
    'M3 2.5v19L14 12 3 2.5zm1.6-.4L16 10.6l3.1-2.7L4.6 2.1zm0 19.8 14.5-5.8-3.1-2.7-11.4 8.5zM17.6 12l3.3 2.9c1.5-.9 1.5-2.9 0-3.8l-1.8-1-1.5 1.9z',
  ),
  appStore: brandIcon(
    'm13.3 3.3-.8 1.4-.8-1.4a1.4 1.4 0 0 0-2.4 1.4L11 7.6 6.1 16H3a1.4 1.4 0 0 0 0 2.8h10l-1.6-2.8H9.3l6.4-11.3a1.4 1.4 0 0 0-2.4-1.4zM5.8 19.5l-1 1.8a1.4 1.4 0 0 0 2.4 1.4l1.8-3.2H5.8zm8.5-9.3-1.6 2.9 5.5 9.6a1.4 1.4 0 0 0 2.4-1.4l-1.5-2.5H21a1.4 1.4 0 1 0 0-2.8h-3.5l-3.2-5.8z',
  ),
  building: Building2,
  help: CircleHelp,
  info: Info,
  link: Link,
  copy: Copy,
  upload: Upload,
  mapPin: MapPin,
  payment: CreditCard,
  alert: AlertCircle,
  system: ShieldCheck,
  permission: ShieldEllipsis,
  calendar: CalendarDays,
  classroom: Grid2X2,
  profile: CircleUserRound,
  home: Home,
  panel: PanelLeft,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  atSign: AtSign,
  bell: Bell,
  bookOpen: BookOpen,
  check: Check,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  eye: Eye,
  eyeOff: EyeOff,
  filter: Filter,
  globe: Globe,
  graduationCap: GraduationCap,
  teacher: Presentation,
  addSquare: SquarePlus,
  schedule: ListChecks,
  dashboard: LayoutDashboard,
  loader: LoaderCircle,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  pencil: Pencil,
  phone: Phone,
  plus: Plus,
  search: Search,
  stickyNote: StickyNote,
  toggleLeft: ToggleLeft,
  toggleRight: ToggleRight,
  trash: Trash2,
  users: Users,
  close: X,
} as const;

export type IconName = keyof typeof icons;
