'use client';

import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  Upload, 
  Settings,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/indents',
    label: 'Indents',
    icon: FileText,
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: ShoppingCart,
    roles: ['Purchase Team', 'Director'],
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['Purchase Team', 'Director'],
  },
  {
    href: '/upload',
    label: 'Upload',
    icon: Upload,
    roles: ['Site Engineer'],
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();

  if (!user || pathname === '/login') return null;

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => hasRole(role));
  });

  return (
    <nav className="mobile-nav bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
