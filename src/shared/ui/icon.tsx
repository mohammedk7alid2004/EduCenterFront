import type { ComponentProps } from 'react'; import { icons, type IconName } from '@/config';
interface IconProps extends ComponentProps<'svg'> { name: IconName; }
export function Icon({ name, ...props }: IconProps): JSX.Element { const Component = icons[name]; return <Component aria-hidden="true" {...props} />; }
