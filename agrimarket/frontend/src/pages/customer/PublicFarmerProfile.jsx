import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Award, Leaf } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
export default function PublicFarmerProfile() {
  const { id } = useParams();
  const { data: farmer } = useQuery({ queryKey: ['farmer-public', id], queryFn: () => api.get(`/farmers/${id}`).then(r => r.data.data) });
  const { data: productsData } = useQuery({ queryKey: ['farmer-products', id], queryFn: () => api.get('/products', { params: { farmer: id } }).then(r => r.data.data) });
  if (!farmer) return <div className="page-container py-16 text-center"><div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 animate-pulse" /></div>;
  return (
    <div className="page-container py-8 max-w-6xl mx-auto space-y-8">
      <div className="card card-body">
        <div className="flex items-start gap-5 flex-wrap">
          {farmer.avatar ? <img src={farmer.avatar} alt={farmer.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          : <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700 flex-shrink-0">{farmer.name?.[0]?.toUpperCase()}</div>}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-800">{farmer.farmerProfile?.farmName || farmer.name}</h1>
            <p className="text-gray-600 mt-0.5">by {farmer.name}</p>
            {farmer.farmerProfile?.farmLocation && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{farmer.farmerProfile.farmLocation}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {farmer.farmerProfile?.rating > 0 && <span className="flex items-center gap-1 text-sm font-medium"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{farmer.farmerProfile.rating?.toFixed(1)} ({farmer.farmerProfile.reviewCount} reviews)</span>}
              {farmer.farmerProfile?.certifications?.map(c => <span key={c} className="badge-green text-xs">{c}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-primary-800 mb-4">Products from this farm ({productsData?.pagination?.total || 0})</h2>
        {productsData?.products?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{productsData.products.map(p=><ProductCard key={p._id} product={p} />)}</div>
        ) : <div className="text-center py-8 text-gray-400">No products listed yet.</div>}
      </div>
    </div>
  );
}
