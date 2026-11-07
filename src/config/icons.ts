import { AlertCircle, Check, ChevronLeft, ChevronRight, LoaderCircle, LogOut, Menu, X } from 'lucide-react';
export const icons = { alert: AlertCircle, check: Check, chevronLeft: ChevronLeft, chevronRight: ChevronRight, loader: LoaderCircle, logout: LogOut, menu: Menu, close: X } as const;
export type IconName = keyof typeof icons;
