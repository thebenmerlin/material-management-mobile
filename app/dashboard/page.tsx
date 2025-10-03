'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { reportsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Package,
  Users,
  IndianRupee
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardStats {
  totalIndents: number;
  pendingApproval: number;
  approvedIndents: number;
  receivedIndents: number;
  totalValue: number;
  thisMonthIndents: number;
  recentIndents: any[];
  chartData: any[];
  statusDistribution: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await reportsApi.getDashboardStats(
          hasRole('Site Engineer') ? user?.siteId : undefined
        );
        setStats(data);
      } catch (error: any) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardStats();
    }
  }, [user, hasRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const quickStats = [
    {
      title: 'Total Indents',
      value: stats?.totalIndents || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingApproval || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Approved',
      value: stats?.approvedIndents || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'This Month',
      value: stats?.thisMonthIndents || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mobile-safe-area p-4 space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            {hasRole('Director') && 'Manage all operations across sites'}
            {hasRole('Purchase Team') && 'Handle approvals and orders'}
            {hasRole('Site Engineer') && `Managing ${user?.siteName || 'your site'}`}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        {(hasRole('Purchase Team') || hasRole('Director')) && stats?.chartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5" />
                  <span>Monthly Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="indents" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Status Distribution */}
        {stats?.statusDistribution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Indents */}
        {stats?.recentIndents && stats.recentIndents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Recent Indents</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/indents">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {stats.recentIndents.map((indent, index) => (
                    <div key={indent.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          Indent #{indent.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {indent.materials?.length || 0} items • {indent.siteName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={indent.status === 'APPROVED' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {indent.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {hasRole('Site Engineer') && (
                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/indents/create" className="flex flex-col items-center space-y-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Create Indent</span>
                    </Link>
                  </Button>
                )}

                {(hasRole('Purchase Team') || hasRole('Director')) && (
                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/indents?filter=pending" className="flex flex-col items-center space-y-2">
                      <Clock className="h-6 w-6" />
                      <span className="text-sm">Pending Approvals</span>
                    </Link>
                  </Button>
                )}

                {hasRole('Purchase Team') && (
                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/orders/create" className="flex flex-col items-center space-y-2">
                      <Package className="h-6 w-6" />
                      <span className="text-sm">Create Order</span>
                    </Link>
                  </Button>
                )}

                {(hasRole('Purchase Team') || hasRole('Director')) && (
                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/reports" className="flex flex-col items-center space-y-2">
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-sm">View Reports</span>
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  );
}
