import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import OrderTimeline from '../../components/common/OrderTimeline';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data),
    enabled: !!id,
  });
  const cancel = useMutation({
    mutationFn: (reason) => api.patch(`/orders/${id}/cancel`, { reason }),
    onSuccess: () => { toast.success('Order cancelled'); qc.invalidateQueries(['order', id]); },
    onError: (e) => toast.error(e.response?.data?.message || 'Could not cancel'),
  });
  if (isLoading) return <div className="page-container py-8"><div className="card p-8 animate-pulse h-64" /></div>;
  if (!order) return <div className="page-container py-8 text-center text-gray-500">Order not found.</div>;
  return (
    <div className="page-container py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/my/orders" className="btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary-800">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a')}</p>
        </div>
        <span className={`status-${order.orderStatus} text-sm`}>{order.orderStatus?.replace(/_/g,' ')}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Order Items</h3>
            <div className="divide-y divide-gray-100">
              {order.items?.map(item => (
                <div key={item._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400 m-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}/{item.unit}</p>
                  </div>
                  <p className="font-bold text-primary-700 flex-shrink-0">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing?.subtotal}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={order.pricing?.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>{order.pricing?.deliveryCharge === 0 ? 'FREE' : `₹${order.pricing?.deliveryCharge}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (GST)</span><span>₹{order.pricing?.tax}</span></div>
              <div className="flex justify-between font-bold text-primary-800 text-base border-t border-gray-100 pt-2 mt-2"><span>Total</span><span className="text-primary-700">₹{order.pricing?.total}</span></div>
            </div>
          </div>
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-3">Delivery Address</h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{order.shippingAddress?.name}</p>
                <p className="text-sm text-gray-600 mt-0.5">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Tracking</h3>
            <OrderTimeline order={order} />
          </div>
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-2">Payment</h3>
            <p className="text-sm text-gray-600">Method: <span className="font-semibold capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
            <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentStatus}</span></p>
          </div>
          {['placed','confirmed'].includes(order.orderStatus) && (
            <button onClick={() => { if (window.confirm('Are you sure you want to cancel this order?')) cancel.mutate('Customer request'); }} disabled={cancel.isPending} className="btn-danger w-full btn-sm">
              {cancel.isPending ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
