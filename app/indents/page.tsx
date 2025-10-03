'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { indentsApi } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { 
  FileText,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  X,
  Package,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Indent {
  id: string;
  materials: any[];
  status: string;
  createdAt: string;
  siteName?: string;
  totalItems: number;
  description?: string;
  material_name?: string;     // Add backend field
  siteId?: string;           // Add backend field
  quantity?: number;         // Add backend field
}

export default function IndentsPage() {
  const { user, hasRole } = useAuth();
  const [indents, setIndents] = useState<Indent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadIndents = async (pageNum = 1, status = statusFilter) => {
    try {
      setLoading(pageNum === 1);
      const filters: any = {
        page: pageNum,
        limit: 10,
      };

      if (status !== 'all') {
        filters.status = status.toUpperCase();
      }

      if (hasRole('Site Engineer') && user?.siteId) {
        filters.siteId = user.siteId;
      }

      const response = await indentsApi.getIndents(filters);

      if (pageNum === 1) {
        setIndents(response.indents || []);
      } else {
        setIndents(prev => [...prev, ...(response.indents || [])]);
      }

      setHasMore(response.indents.length === 10);
    } catch (error: any) {
      toast.error('Failed to load indents');
      console.error('Load indents error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadIndents(1, statusFilter);
      setPage(1);
    }
  }, [user, statusFilter, hasRole]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadIndents(nextPage, statusFilter);
  };

  const handleApproval = async (indentId: string, approved: boolean, notes?: string) => {
    try {
      await indentsApi.approveIndent(indentId, { approved, notes });
      toast.success(`Indent ${approved ? 'approved' : 'rejected'} successfully`);
      loadIndents(1, statusFilter);
    } catch (error: any) {
      toast.error(`Failed to ${approved ? 'approve' : 'reject'} indent`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'ordered': return <Package className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mobile-safe-area p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Indents</h1>
          {hasRole('Site Engineer') && (
            <Button asChild>
              <Link href="/indents/create">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Indents List */}
        {loading && indents.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : indents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No indents found</h3>
              <p className="text-gray-600 mb-4">
                {hasRole('Site Engineer') 
                  ? 'Create your first indent to get started.'
                  : 'No indents match your current filter.'
                }
              </p>
              {hasRole('Site Engineer') && (
                <Button asChild>
                  <Link href="/indents/create">Create Indent</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {indents.map((indent, index) => (
              <motion.div
                key={indent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Indent #{indent.id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {indent.createdAt ? formatDate(indent.createdAt) : 'Unknown Date'}
                          </p>
                          {indent.siteName && indent.siteName !== 'Unknown Site' && 
                            <p className="text-xs text-gray-500">
                              Site: {indent.siteName}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(indent.status)}>
                          {getStatusIcon(indent.status)}
                          <span className="ml-1">{indent.status || 'Unknown'}</span>
                        </Badge>
                      </div>

                      {/* Materials Summary */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {indent.totalItems || 0} items requested
                        </p>
                        {indent.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {indent.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <Link href={`/indents/${indent.id}`}>
                            View Details
                          </Link>
                        </Button>

                        {(hasRole('Purchase Team') || hasRole('Director')) && 
                         indent.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(indent.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(indent.id, false)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && indents.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={loadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
