import React from 'react';
import ItemCard from './ItemCard';
import { StoreItem } from '../lib/supabase';

interface CategoryGridProps {
  items: StoreItem[];
  category: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ items, category }) => {
  const filteredItems = category === 'all' ? items : items.filter(item => item.type === category);

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No items found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item) => (
        <ItemCard key={item.id} {...item} type={item.type} />
      ))}
    </div>
  );
};

export default CategoryGrid;