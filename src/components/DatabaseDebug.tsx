import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';

const DatabaseDebug: React.FC = () => {
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      console.log('Store items from database:', data);
      setStoreItems(data || []);
    } catch (err) {
      console.error('Error fetching store items:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-lg text-green-900">Admin Database Status</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Admin Only</span>
        </div>
        <button 
          onClick={fetchStoreItems}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div className="text-red-800">
            <strong>Database Error:</strong> {error}
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <span className="font-medium text-green-900">Found {storeItems.length} apps in your store database</span>
      </div>
      
      {storeItems.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">📱</span>
            <strong className="text-yellow-800">No apps uploaded yet</strong>
          </div>
          <p className="text-yellow-700 text-sm">
            Use the admin panel to upload your first app, or run the SQL setup script in Supabase to add sample data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {storeItems.slice(0, 4).map((item) => (
            <div key={item.id} className="p-3 bg-white rounded border border-green-200">
              <div className="flex items-start space-x-3">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48/e5e7eb/6b7280?text=App';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.developer}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{item.category}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {storeItems.length > 4 && (
            <div className="col-span-full text-center text-sm text-green-600">
              ... and {storeItems.length - 4} more apps in your store
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseDebug;
