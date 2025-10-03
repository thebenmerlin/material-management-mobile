'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ordersApi } from '@/lib/api';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { 
  ShoppingCart,
  Plus,
  Package,
  Truck,
  CheckCircle,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Order {
  id: string;
  indentId: string;
  vendorName: string;
  materials: any[];
  status: string;
  totalValue: number;
  createdAt: string;
  expectedDelivery?: string;
}

export default function OrdersPage() {
  const { user, hasRole } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authorized
    if (user && !hasRole(['Purchase Team', 'Director'])) {
      window.location.href = '/dashboard';
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersApi.getOrders();
        setOrders(response.orders || []);
      } catch (error: any) {
        toast.error('Failed to load orders');
        console.error('Load orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && hasRole(['Purchase Team', 'Director'])) {
      loadOrders();
    }
  }, [user, hasRole]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Package className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (!hasRole(['Purchase Team', 'Director'])) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mobile-safe-area p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <Button asChild>
            <Link href="/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Link>
          </Button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                Create your first order to get started.
              </p>
              <Button asChild>
                <Link href="/orders/create">Create Order</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
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
                            Order #{order.id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-500">
                              {order.vendorName}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </div>

                      {/* Order Details */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Materials:</span>
                          <span className="font-medium">
                            {order.materials?.length || 0} items
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(order.totalValue || 0)}
                          </span>
                        </div>
                        {order.expectedDelivery && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expected:</span>
                            <span className="font-medium">
                              {formatDate(order.expectedDelivery)}
                            </span>
                          </div>
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
                          <Link href={`/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>

                        {order.status === 'PENDING' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {orders.length}
                </p>
                <p className="text-sm text-blue-600">Total Orders</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </p>
                <p className="text-sm text-green-600">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
