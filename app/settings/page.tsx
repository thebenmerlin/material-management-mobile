'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRoleDisplayName } from '@/lib/utils';
import { 
  User,
  Building2,
  LogOut,
  Shield,
  Info,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mobile-safe-area p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="default">
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    {user.siteName && (
                      <Badge variant="outline">
                        {user.siteName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Site Information */}
        {user.siteName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Site Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Assigned Site</p>
                  <p className="font-medium text-gray-900">{user.siteName}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Role Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.role === 'Site Engineer' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Create Indents</span>
                      <Badge variant="outline" className="text-green-600">Allowed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mark Materials Received</span>
                      <Badge variant="outline" className="text-green-600">Allowed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Upload Receipts</span>
                      <Badge variant="outline" className="text-green-600">Allowed</Badge>
                    </div>
                  </>
                )}
                
                {user.role === 'Purchase Team' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approve Indents</span>
                      <Badge variant="outline" className="text-green-600">Allowed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Create Orders</span>
                      <Badge variant="outline" className="text-green-600">Allowed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">View Reports</span>
                      <Badge variant="outline" className="text-green-600">Allowed</Badge>
                    </div>
                  </>
                )}
                
                {user.role === 'Director' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Full Access</span>
                    <Badge variant="outline" className="text-green-600">All Permissions</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>App Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">App Name</span>
                <span className="text-sm font-medium">
                  {process.env.NEXT_PUBLIC_APP_NAME}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium">
                  {process.env.NEXT_PUBLIC_APP_VERSION}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform</span>
                <span className="text-sm font-medium flex items-center">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Web Mobile
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Your session is secured with industry-standard encryption. 
                Always log out when using shared devices.
              </p>
              
              <Button
                variant="destructive"
                onClick={logout}
                className="w-full"
                size="lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-8">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact your system administrator
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Built with security and reliability in mind
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <MobileNav />
    </div>
  );
}
