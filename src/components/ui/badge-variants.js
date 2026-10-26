import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono',
        danger: 'border-rose-500/20 bg-rose-500/10 text-rose-400 font-mono',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
