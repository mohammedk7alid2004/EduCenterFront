import type { Config } from 'tailwindcss';
import { semanticColorNames } from './src/config/theme';

const colors = Object.fromEntries(semanticColorNames.map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`]));
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: { colors, borderRadius: { lg: 'var(--radius-lg)' } } }, plugins: [] } satisfies Config;
