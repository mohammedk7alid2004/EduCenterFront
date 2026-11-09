import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  Menu,
  X,
} from 'lucide-react';

export const icons = {
  alert: AlertCircle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  check: Check,
  checkCircle: CheckCircle2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  eye: Eye,
  eyeOff: EyeOff,
  loader: LoaderCircle,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  close: X,
} as const;

export type IconName = keyof typeof icons;
