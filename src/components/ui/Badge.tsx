import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        // Variantes para Ambientes
        production: 'border-transparent bg-red-500/20 text-red-400',
        staging: 'border-transparent bg-yellow-500/20 text-yellow-400',
        development: 'border-transparent bg-blue-500/20 text-blue-400',
        // Variantes para Status de Certificado
        valid: 'border-transparent bg-green-500/20 text-green-400',
        expiring: 'border-transparent bg-yellow-500/20 text-yellow-400',
        insecure: 'border-transparent bg-orange-500/20 text-orange-400',
        expired: 'border-transparent bg-red-500/20 text-red-400',
        invalid: 'border-transparent bg-destructive text-destructive-foreground',
        unknown: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };