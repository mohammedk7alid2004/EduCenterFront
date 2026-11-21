export const theme = {
  light: {
    qrInk: '0 0 0',
    qrPaper: '255 255 255',
    calendarTeal: '0 143 145',
    calendarPurple: '108 82 226',
    calendarMaroon: '91 23 35',
    calendarNavy: '16 52 80',
    calendarYellow: '251 216 74',
    calendarInk: '8 21 33',
    primary: '15 61 58',
    secondary: '242 230 214',
    accent: '244 177 59',
    terracotta: '224 116 94',
    sand: '242 230 214',
    background: '248 248 248',
    foreground: '33 33 33',
    muted: '165 165 165',
    tableHeading: '102 102 102',
    iconSurface: '228 234 237',
    permissionSurface: '231 237 236',
    card: '255 255 255',
    border: '214 214 214',
    sidebar: '10 38 36',
    subtle: '248 248 248',
    table: '240 240 240',
    overlay: '0 0 0',
    danger: '255 76 91',
    success: '0 185 124',
    info: '76 141 246',
    warning: '244 177 59',
  },
  dark: {
    qrInk: '0 0 0',
    qrPaper: '255 255 255',
    calendarTeal: '0 106 109',
    calendarPurple: '86 61 183',
    calendarMaroon: '91 23 35',
    calendarNavy: '16 52 80',
    calendarYellow: '251 216 74',
    calendarInk: '8 21 33',
    primary: '20 82 78',
    secondary: '30 41 59',
    accent: '244 177 59',
    terracotta: '224 116 94',
    sand: '242 230 214',
    background: '10 25 24',
    foreground: '241 245 249',
    muted: '148 163 184',
    tableHeading: '184 196 203',
    iconSurface: '28 58 55',
    permissionSurface: '28 58 55',
    card: '15 40 38',
    border: '30 70 66',
    sidebar: '10 25 24',
    subtle: '20 48 46',
    table: '25 58 55',
    overlay: '0 0 0',
    danger: '252 165 165',
    success: '134 239 172',
    info: '147 197 253',
    warning: '253 230 138',
  },
  radius: '0.75rem',
} as const;

export const semanticColorNames = Object.keys(theme.light) as Array<keyof typeof theme.light>;
export type ThemeMode = keyof Pick<typeof theme, 'light' | 'dark'>;

export function applyThemeTokens(mode: ThemeMode): void {
  const values = theme[mode];
  document.documentElement.style.cssText = `${semanticColorNames
    .map((key) => `--color-${key}:${values[key]}`)
    .join(';')};--radius-lg:${theme.radius}`;
  document.documentElement.dataset.theme = mode;
}
