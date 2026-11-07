export const theme = {
  light: {
    primary: '15 61 58',
    secondary: '242 230 214',
    accent: '244 177 59',
    terracotta: '224 116 94',
    sand: '242 230 214',
    background: '248 250 252',
    foreground: '15 61 58',
    muted: '100 116 139',
    card: '255 255 255',
    border: '226 232 240',
    danger: '224 116 94',
    success: '21 128 61',
    warning: '244 177 59',
  },
  dark: {
    primary: '20 82 78',
    secondary: '30 41 59',
    accent: '244 177 59',
    terracotta: '224 116 94',
    sand: '242 230 214',
    background: '10 25 24',
    foreground: '241 245 249',
    muted: '148 163 184',
    card: '15 40 38',
    border: '30 70 66',
    danger: '252 165 165',
    success: '134 239 172',
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
