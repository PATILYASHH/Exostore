// Only showing uploaded files now - demo data removed

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
}

const featuredItems: FeaturedItem[] = [
  {
    id: '1',
    title: 'Your Uploads',
    subtitle: 'Apps and games you have uploaded',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-purple-600 to-pink-600'
  },
  {
    id: '2',
    title: 'Recent Uploads',
    subtitle: 'Latest files you have added',
    image: 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600'
  },
  {
    id: '3',
    title: 'Popular Uploads',
    subtitle: 'Most downloaded uploaded files',
    image: 'https://images.pexels.com/photos/374559/pexels-photo-374559.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600'
  }
];

// Demo data removed - only showing uploaded files from database
const storeItems: any[] = [];

export { featuredItems, storeItems };