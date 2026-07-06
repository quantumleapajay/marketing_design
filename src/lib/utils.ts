import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarColors(initials: string) {
  const colors: Record<string, string> = {
    'RK': 'bg-blue-100 text-blue-600',
    'PS': 'bg-purple-100 text-purple-600',
    'AP': 'bg-green-100 text-green-700',
    'SR': 'bg-red-100 text-red-600',
    'VS': 'bg-amber-100 text-amber-700',
  };
  return colors[initials] || 'bg-slate-100 text-slate-600';
}
