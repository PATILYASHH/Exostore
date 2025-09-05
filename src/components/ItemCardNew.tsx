import React from 'react';
import { StoreItem } from '../lib/supabase';
import ItemInteractions from './ItemInteractions';

interface ItemCardProps extends StoreItem {
  onStatsUpdate?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = (item) => {
  const {
    title,
    developer,
    image,
    category,
    price = 'Free',
    description
  } = item;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
            />
          </div>

          {/* App Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-gray-600 truncate">{developer}</p>

            {/* Category and Price */}
            <div className="flex items-center justify-between mt-3">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {category}
              </span>
              <span className={`text-sm font-medium ${price === 'Free' ? 'text-green-600' : 'text-gray-900'}`}>
                {price}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* Interactive Elements - Downloads, Ratings, Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ItemInteractions item={item} onStatsUpdate={item.onStatsUpdate} />
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
