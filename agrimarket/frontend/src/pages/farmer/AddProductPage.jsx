import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import FormSelect from '../../components/common/FormSelect';

const CATEGORIES = ['vegetables','fruits','grains','dairy','pulses','spices','herbs','flowers','honey','eggs','other'];
const UNITS = ['kg','g','litre','ml','piece','dozen','bunch','packet'];

export default function AddProductPage({ editMode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', description:'', category:'vegetables', 'price.mrp':'', 'price.selling':'', 'price.unit':'kg', 'stock.quantity':'', isOrganic: false, tags:'' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      files.forEach(f => fd.append('images', f));
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product submitted for approval!');
      navigate('/farmer/products');
    } catch(e) { toast.error(e.response?.data?.message||'Failed to add product'); } finally { setLoading(false); }
  };
  
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/farmer/products" className="btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="text-2xl font-bold text-primary-800">{editMode?'Edit':'Add'} Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="card card-body space-y-4">
        <div className="form-group">
          <label className="label">Product Name *</label>
          <input required className="input" value={form.name} onChange={e=>f('name',e.target.value)} placeholder="e.g. Fresh Tomatoes" />
        </div>
        <div className="form-group">
          <label className="label">Description *</label>
          <textarea required className="input min-h-[100px]" value={form.description} onChange={e=>f('description',e.target.value)} placeholder="Describe your product..." />
        </div>
        <div className="grid grid-cols-2 gap-4 items-start">
          <FormSelect
            label="Category *"
            value={form.category}
            options={CATEGORIES}
            onChange={val => f('category', val)}
            required
          />
          <FormSelect
            label="Unit *"
            value={form['price.unit']}
            options={UNITS}
            onChange={val => f('price.unit', val)}
            required
          />
          <div className="form-group"><label className="label">MRP (₹) *</label><input required type="number" min="0" className="input" value={form['price.mrp']} onChange={e=>f('price.mrp',e.target.value)} /></div>
          <div className="form-group"><label className="label">Selling Price (₹) *</label><input required type="number" min="0" className="input" value={form['price.selling']} onChange={e=>f('price.selling',e.target.value)} /></div>
          <div className="form-group"><label className="label">Stock Quantity *</label><input required type="number" min="0" className="input" value={form['stock.quantity']} onChange={e=>f('stock.quantity',e.target.value)} /></div>
          <div className="form-group flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isOrganic} onChange={e=>f('isOrganic',e.target.checked)} className="w-4 h-4 rounded accent-primary-600" /><span className="label mb-0">Organic Product</span></label></div>
        </div>
        <div className="form-group"><label className="label">Product Images</label><label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"><Upload className="w-6 h-6 text-gray-400 mb-2" /><span className="text-sm text-gray-500">{files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload up to 5 images'}</span><input type="file" accept="image/*" multiple className="sr-only" onChange={e=>setFiles(Array.from(e.target.files))} /></label></div>
        <div className="form-group"><label className="label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={e=>f('tags',e.target.value)} placeholder="fresh, seasonal, local" /></div>
        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">{loading?<><span className="spinner border-white/40 border-t-white" />Submitting...</>:'Submit for Approval'}</button>
      </form>
    </div>
  );
}
