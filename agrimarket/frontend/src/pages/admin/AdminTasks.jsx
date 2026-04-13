import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Clock, CheckCircle, AlertCircle, 
  Trash2, Filter, MoreVertical, Calendar, User,
  ListTodo, Layers, Zap, X
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

const PRIORITY_COLORS = {
  low: 'bg-blue-50 text-blue-600 border-blue-100',
  medium: 'bg-amber-50 text-amber-600 border-amber-100',
  high: 'bg-orange-50 text-orange-600 border-orange-100',
  critical: 'bg-red-50 text-red-600 border-red-100',
};

const STATUS_ICONS = {
  pending: Clock,
  'in-progress': Zap,
  completed: CheckCircle,
  cancelled: X,
};

export default function AdminTasks() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: () => api.get('/admin/tasks').then(r => r.data.data),
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTask) => api.post('/admin/tasks', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-tasks']);
      setIsModalOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }) => api.patch(`/admin/tasks/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries(['admin-tasks']),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['admin-tasks']),
  });

  const filteredTasks = data?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-800 tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-primary-600" />
            Task Management
          </h1>
          <p className="text-gray-500 mt-1">Organize and track administrative workflows</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'pending', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                filterStatus === status 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks?.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status] || Clock;
          return (
            <div 
              key={task._id} 
              className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-500 ${
                task.status === 'completed' ? 'bg-green-500' : 
                task.status === 'in-progress' ? 'bg-primary-500' : 'bg-gray-200'
              }`} />

              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteTaskMutation.mutate(task._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-primary-600 transition-colors">
                {task.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                {task.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <User className="w-4 h-4" />
                    <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${
                    task.status === 'completed' ? 'text-green-600' : 'text-primary-600'
                  }`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="capitalize">{task.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <select 
                    value={task.status}
                    onChange={(e) => updateTaskMutation.mutate({ id: task._id, updates: { status: e.target.value } })}
                    className="text-[10px] font-black uppercase tracking-wider bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="pending">Mark Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTasks?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <Layers className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-800">No tasks found</h3>
          <p className="text-gray-500">Create your first administrative workflow task above.</p>
        </div>
      )}

      {/* Create Task Modal - Simplified for now */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-primary-800 mb-6 flex items-center gap-3">
              <Zap className="text-primary-600" /> New Task
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createTaskMutation.mutate(Object.fromEntries(formData));
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Title</label>
                <input name="title" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-600" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Description</label>
                <textarea name="description" rows="3" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Priority</label>
                  <select name="priority" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-600">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Due Date</label>
                  <input type="date" name="dueDate" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-600" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-50 rounded-2xl active:scale-95 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 active:scale-95 transition-all">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
