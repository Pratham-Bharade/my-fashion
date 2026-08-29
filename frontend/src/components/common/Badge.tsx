import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg',
  };

  const variantStyles = {
    default: 'bg-stone-100 text-stone-700 border border-stone-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    gold: 'bg-gold-100 text-gold-900 border border-gold-300 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const getBadgeConfig = (st: string) => {
    switch (st.toUpperCase()) {
      case 'CONFIRMED':
      case 'ACCEPTED':
      case 'DELIVERED':
      case 'PAID':
      case 'APPROVED':
        return { variant: 'success' as const, label: st.replace(/_/g, ' ') };
      case 'PENDING':
      case 'SUBMITTED':
      case 'REVIEWING':
      case 'QUOTATION_SENT':
        return { variant: 'warning' as const, label: st.replace(/_/g, ' ') };
      case 'CUTTING':
      case 'STITCHING':
      case 'QUALITY_CHECK':
        return { variant: 'info' as const, label: st.replace(/_/g, ' ') };
      case 'READY':
        return { variant: 'gold' as const, label: 'READY FOR PICKUP' };
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
      case 'NO_SHOW':
      case 'EXPIRED':
        return { variant: 'danger' as const, label: st.replace(/_/g, ' ') };
      default:
        return { variant: 'default' as const, label: st.replace(/_/g, ' ') };
    }
  };

  const config = getBadgeConfig(status);
  return (
    <Badge variant={config.variant} className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 mr-0.5 animate-pulse" />
      {config.label}
    </Badge>
  );
};
