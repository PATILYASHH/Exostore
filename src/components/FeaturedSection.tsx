import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
}

interface FeaturedSectionProps {
  title: string;
  items: FeaturedItem[];
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ title, items }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium transition-colors duration-200">
          <span>See all</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`${item.gradient} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/90 text-sm">{item.subtitle}</p>
              </div>
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover ml-4 shadow-md"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;