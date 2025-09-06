import React from 'react';
import { useParams } from 'react-router-dom';
import ItemDetailPage from './components/ItemDetailPage';
import { StoreItem } from './lib/supabase';

interface AppDetailRouteProps {
  allItems: StoreItem[];
  onBack: () => void;
}

const AppDetailRoute: React.FC<AppDetailRouteProps> = ({ allItems, onBack }) => {
  const { id } = useParams();
  const item = allItems.find(i => String(i.id) === String(id));
  if (!item) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">App not found.</div>;
  }
  return <ItemDetailPage item={item} onBack={onBack} />;
};

export default AppDetailRoute;