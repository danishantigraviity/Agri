import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import FormSelect from '../../components/common/FormSelect';

const CATEGORIES = ['vegetables','fruits','grains','dairy','pulses','spices','herbs','flowers','honey','eggs','other'];
const UNITS = ['kg','g','litre','ml','piece','dozen','bunch','packet'];

export default function AddProductPage({ editMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name:'', 
    description:'', 
    category:'vegetables', 
    'price.mrp':'', 
    'price.selling':'', 
    'price.unit':'kg', 
    'stock.quantity':'', 
    isOrganic: false, 
    tags:'' 
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(editMode);

  useEffect(() => {
    if (editMode && id) {
      fetchProduct();
    }
  }, [editMode, id]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const { data } = await api.get(`/products/${id}`);
      const p = data.data;
      setForm({
        name: p.name || '',
        description: p.description || '',
        category: p.category || 'vegetables',
        'price.mrp': p.price?.mrp || '',
        'price.selling': p.price?.selling || '',
        'price.unit': p.price?.unit || 'kg',
        'stock.quantity': p.stock?.quantity || '',
        isOrganic: p.isOrganic || false,
        tags: p.tags?.join(', ') || ''
      });
    } catch (err) {
      toast.error('Failed to fetch product details');
      navigate('/farmer/products');
    } finally {
      setFetching(false);
    }
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      // Handle nested keys specifically to match model structure if needed, 
      // or send flattening logic. Most backends expect flat for FormData.
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      files.forEach(f => fd.append('images', f));
      
      if (editMode) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product submitted for approval!');
      }
      navigate('/farmer/products');
    } catch(e) { 
      toast.error(e.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} product`); 
    } finally { 
      setLoading(false); 
    }
  };
  
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Link to="/farmer/products" className="btn-icon">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-primary-800 tracking-tight">
          {editMode ? 'Edit' : 'Add New'} Product
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="card card-body space-y-6 shadow-sm border-gray-100">
        <div className="form-group">
          <label className="label">Product Name *</label>
          <input 
            required 
            className="input" 
            value={form.name} 
            onChange={e=>f('name',e.target.value)} 
            placeholder="e.g. Fresh Tomatoes" 
          />
        </div>

        <div className="form-group">
          <label className="label">Description *</label>
          <textarea 
            required 
            className="input min-h-[120px] py-3" 
            value={form.description} 
            onChange={e=>f('description',e.target.value)} 
            placeholder="Describe your product's quality, freshness, and origin..." 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="form-group">
            <label className="label">MRP (₹) *</label>
            <input 
              required 
              type="number" 
              min="0" 
              className="input" 
              value={form['price.mrp']} 
              onChange={e=>f('price.mrp',e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="label">Selling Price (₹) *</label>
            <input 
              required 
              type="number" 
              min="0" 
              className="input" 
              value={form['price.selling']} 
              onChange={e=>f('price.selling',e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="label">Stock Quantity *</label>
            <input 
              required 
              type="number" 
              min="0" 
              className="input" 
              value={form['stock.quantity']} 
              onChange={e=>f('stock.quantity',e.target.value)} 
            />
          </div>
          <div className="form-group flex items-end h-[68px]">
            <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 w-full hover:bg-white hover:border-primary-200 transition-all">
              <input 
                type="checkbox" 
                checked={form.isOrganic} 
                onChange={e=>f('isOrganic',e.target.checked)} 
                className="w-5 h-5 rounded accent-primary-600 cursor-pointer" 
              />
              <span className="text-sm font-bold text-gray-700">Certified Organic</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Product Images</label>
          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group overflow-hidden bg-gray-50/50">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-black text-gray-600 uppercase tracking-widest">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Upload Images'}
            </span>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-1">PNG, JPG up to 10MB</p>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={e=>setFiles(Array.from(e.target.files))} />
          </label>
          {editMode && <p className="text-[10px] text-amber-600 font-bold mt-2 uppercase">⚠️ Keep empty to retain existing images</p>}
        </div>

        <div className="form-group">
          <label className="label">Tags (comma separated)</label>
          <input 
            className="input" 
            value={form.tags} 
            onChange={e=>f('tags',e.target.value)} 
            placeholder="fresh, seasonal, local" 
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-primary-600/20 active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {editMode ? 'Updating...' : 'Submitting...'}
              </div>
            ) : (
              editMode ? 'Update Product' : 'Submit for Approval'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
