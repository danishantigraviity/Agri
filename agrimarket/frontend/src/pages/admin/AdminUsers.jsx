import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Users, Shield, User, Check, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users', role, search],
    queryFn: () => api.get('/admin/users', { params: { role: role||undefined, search: search||undefined, limit: 50 } }).then(r => r.data.data),
  });

  const toggle = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: () => { 
      toast.success('User status updated'); 
      qc.invalidateQueries(['admin-users']); 
    },
  });

  const ROLES = [
    { value: '',         label: 'All Users',   icon: Users,  color: 'gray' },
    { value: 'customer', label: 'Customers',   icon: User,   color: 'blue' },
    { value: 'farmer',   label: 'Farmers',     icon: Leaf,   color: 'emerald' },
    { value: 'admin',    label: 'Admins',      icon: Shield, color: 'purple' },
  ];

  if (isError) {
    const msg = error.response?.data?.message || error.message || 'Failed to fetch users';
    return (
      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><Users /></div>
        <h3 className="text-lg font-bold text-primary-800">Error Loading Users</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg}</p>
        <button onClick={() => qc.invalidateQueries(['admin-users'])} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-800 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform access and user roles</p>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="space-y-4">
        <div className="relative group max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300" />
          <input 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[1.5rem] text-sm transition-all duration-300 focus:border-primary-300 focus:ring-4 focus:ring-primary-500/5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-gray-300 outline-none placeholder:text-gray-400 font-medium" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
          {ROLES.map(r => {
            const Icon = r.icon;
            const isActive = role === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[1rem] border text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 shadow-sm
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-primary-200' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} strokeWidth={2.5} />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="card h-16 animate-pulse bg-gray-50" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                          <Users className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-primary-800">No users found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="hover:bg-primary-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-primary-800 group-hover:text-primary-700 transition-colors">{u.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                          ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 
                            u.role === 'farmer' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                            'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-600">{u.phone || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 font-bold">{format(new Date(u.createdAt), 'dd MMM yyyy')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                          ${u.isActive ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}>
                          <span className={`w-1 h-1 rounded-full bg-white ${u.isActive ? 'animate-pulse' : ''}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={()=>toggle.mutate(u._id)} 
                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm
                              ${u.isActive 
                                ? 'bg-white text-red-600 border border-red-100 hover:bg-red-50' 
                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'
                              }`}
                          >
                            {u.isActive ? <><UserX className="w-3.5 h-3.5"/> Deactivate</> : <><UserCheck className="w-3.5 h-3.5"/> Activate</>}
                          </button>
                        )}
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
