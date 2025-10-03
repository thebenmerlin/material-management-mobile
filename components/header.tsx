'use client';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRoleDisplayName } from '@/lib/utils';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">
            {process.env.NEXT_PUBLIC_APP_NAME}
          </h1>
          <p className="text-sm text-gray-500">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {user.name}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getRoleDisplayName(user.role)}
              </Badge>
              {user.siteName && (
                <Badge variant="outline" className="text-xs">
                  {user.siteName}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
