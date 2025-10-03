import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'PENDING': 'text-yellow-600 bg-yellow-50',
    'APPROVED': 'text-green-600 bg-green-50',
    'REJECTED': 'text-red-600 bg-red-50',
    'ORDERED': 'text-blue-600 bg-blue-50',
    'RECEIVED': 'text-purple-600 bg-purple-50',
    'PARTIAL': 'text-orange-600 bg-orange-50',
    'CLOSED': 'text-gray-600 bg-gray-50',
    'DAMAGED': 'text-red-600 bg-red-50',
  };

  return statusColors[status.toUpperCase()] || 'text-gray-600 bg-gray-50';
}

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'Site Engineer': 'Site Engineer',
    'Purchase Team': 'Purchase Team', 
    'Director': 'Director',
  };
  
  return roleNames[role] || role;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}



