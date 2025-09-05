import React from 'react';
import { Star, Download } from 'lucide-react';
import { StoreItem } from '../lib/supabase';

interface ItemCardProps extends StoreItem {}

const ItemCard: React.FC<ItemCardProps> = ({
  title,
  developer,
  rating,
  downloads,
  image,
  category,
  price = 'Free',
  description,
  type,
  download_link,
  file_path
}) => {
  const getButtonText = () => {
    return type === 'websites' ? 'View' : 'Install';
  };

  const handleAction = () => {
    if (download_link) {
      window.open(download_link, '_blank');
    } else if (file_path) {
      window.open(file_path, '_blank');
    }
  };

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
            
            {/* Rating and Downloads */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-700">{rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{downloads}</span>
              </div>
            </div>

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

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={handleAction}
            disabled={!download_link && !file_path}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;