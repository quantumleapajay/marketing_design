import React from 'react';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const normalize = (status: string) => status.trim().toLowerCase();

const statusClassMap: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-800 border-blue-100',
  live: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200',
  failed: 'bg-red-50 text-red-700 border-red-100',
  draft: 'bg-gray-100 text-gray-500 border-gray-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
  sent: 'bg-green-50 text-green-700 border-green-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  refunded: 'bg-red-50 text-red-600 border-red-100',
  active: 'bg-green-50 text-green-700 border-green-100',
  inactive: 'bg-gray-100 text-gray-400 border-gray-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = normalize(status);
  const isPaid = normalized.includes('paid');
  const mappedClass = isPaid ? statusClassMap.sent : statusClassMap[normalized] || statusClassMap.draft;

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-none',
        mappedClass,
        className
      )}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
