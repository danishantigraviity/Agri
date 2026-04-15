import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Users, Settings2, ShieldCheck, UserCheck, Timer } from 'lucide-react';
import ActionDropdown from '../../components/common/ActionDropdown';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="group relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.03] transition-all duration-500 group-hover:scale-150 bg-gradient-to-br ${gradient}`} />
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg shadow-current/10`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-black text-primary-800 leading-none">{value}</p>
    </div>
  </div>
);

export default function AdminFarmers() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-farmers'],
    queryFn: () => api.get('/admin/users', { params: { role: 'farmer', limit: 50 } }).then(r => r.data.data),
  });

  const approve = useMutation({
    mutationFn: ({ id, action }) => api.patch(`/admin/farmers/${id}/approval`, { action }),
    onSuccess: (_, { action }) => { 
      toast.success(`Farmer ${action}d successfully`); 
      qc.invalidateQueries(['admin-farmers']); 
    },
  });

  if (isError) {
    const msg = error.response?.data?.message || error.message || 'Failed to fetch farmers';
    return (
      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><Users /></div>
        <h3 className="text-lg font-bold text-primary-800">Error Loading Farmers</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg}</p>
        <button onClick={() => qc.invalidateQueries(['admin-farmers'])} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    );
  }

  const farmers = data?.users || [];
  const approvedCount = farmers.filter(f => f.farmerProfile?.isApproved).length;
  const pendingCount = farmers.filter(f => !f.farmerProfile?.isApproved).length;

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-800 tracking-tight">Farmer Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve farmer applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Farmers" value={farmers.length} gradient="from-blue-400 to-indigo-600" />
        <StatCard icon={ShieldCheck} label="Verified" value={approvedCount} gradient="from-emerald-400 to-green-600" />
        <StatCard icon={Timer} label="Pending Review" value={pendingCount} gradient="from-amber-400 to-orange-500" />
      </div>

      {isLoading ? (
        <div className="card h-64 animate-pulse bg-gray-50" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Farm Information</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {farmers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                          <Users className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-primary-800">No applications</h3>
                        <p className="text-sm text-gray-500 mt-1">New farmer registrations will appear here for review.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  farmers?.map(f => (
                    <tr key={f._id} className="hover:bg-primary-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold border border-primary-100 uppercase">
                            {f.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-primary-800 group-hover:text-primary-700 transition-colors">{f.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-gray-700">{f.farmerProfile?.farmName || 'Pending Profile'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 font-medium">{f.farmerProfile?.farmLocation || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 font-bold">{format(new Date(f.createdAt), 'dd MMM yyyy')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                          ${f.farmerProfile?.isApproved 
                            ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                            : 'bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.3)]'}`}>
                          {f.farmerProfile?.isApproved ? <ShieldCheck className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                          {f.farmerProfile?.isApproved ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionDropdown 
                          label="Review"
                          icon={Settings2}
                          options={[
                            { 
                              label: 'Verify Farmer', 
                              icon: UserCheck, 
                              color: 'green', 
                              hidden: f.farmerProfile?.isApproved, 
                              onClick: () => approve.mutate({id:f._id,action:'approve'}) 
                            },
                            { 
                              label: 'Revoke Access', 
                              icon: XCircle, 
                              color: 'red', 
                              hidden: !f.farmerProfile?.isApproved, 
                              onClick: () => approve.mutate({id:f._id,action:'reject'}) 
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
