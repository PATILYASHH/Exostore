export const featuredItems = [
  {
    id: '1',
    title: 'Editor\'s Choice',
    subtitle: 'Hand-picked quality apps and games',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-purple-600 to-pink-600'
  },
  {
    id: '2',
    title: 'Top Charts',
    subtitle: 'Most popular downloads this week',
    image: 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600'
  },
  {
    id: '3',
    title: 'New Releases',
    subtitle: 'Latest apps and games just launched',
    image: 'https://images.pexels.com/photos/374559/pexels-photo-374559.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600'
  }
];

export const storeItems = [
  // Games
  {
    id: 'game1',
    title: 'Epic Adventure Quest',
    developer: 'GameStudio Pro',
    rating: 4.8,
    downloads: '10M+',
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Adventure',
    price: 'Free',
    description: 'Embark on an epic journey through mystical lands filled with ancient treasures and dangerous monsters.',
    type: 'games'
  },
  {
    id: 'game2',
    title: 'Racing Thunder',
    developer: 'Speed Studios',
    rating: 4.6,
    downloads: '50M+',
    image: 'https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Racing',
    price: 'Free',
    description: 'High-octane racing action with stunning graphics and realistic physics. Race against players worldwide.',
    type: 'games'
  },
  {
    id: 'game3',
    title: 'Puzzle Master',
    developer: 'MindGames Inc',
    rating: 4.7,
    downloads: '25M+',
    image: 'https://images.pexels.com/photos/691032/pexels-photo-691032.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Puzzle',
    price: '$2.99',
    description: 'Challenge your mind with hundreds of brain-teasing puzzles designed to improve cognitive abilities.',
    type: 'games'
  },
  {
    id: 'game4',
    title: 'Strategy Empire',
    developer: 'Tactical Games',
    rating: 4.5,
    downloads: '15M+',
    image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Strategy',
    price: 'Free',
    description: 'Build your empire, command armies, and conquer territories in this immersive strategy game.',
    type: 'games'
  },

  // Apps
  {
    id: 'app1',
    title: 'ProductiveFlow',
    developer: 'Efficiency Labs',
    rating: 4.9,
    downloads: '5M+',
    image: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Productivity',
    price: 'Free',
    description: 'Streamline your workflow with powerful task management, time tracking, and collaboration tools.',
    type: 'apps'
  },
  {
    id: 'app2',
    title: 'PhotoEdit Pro',
    developer: 'Creative Suite',
    rating: 4.7,
    downloads: '20M+',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Photography',
    price: '$4.99',
    description: 'Professional photo editing tools with AI-powered features and advanced filters for stunning results.',
    type: 'apps'
  },
  {
    id: 'app3',
    title: 'FitTracker',
    developer: 'HealthTech Solutions',
    rating: 4.6,
    downloads: '30M+',
    image: 'https://images.pexels.com/photos/38024/pexels-photo-38024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Health',
    price: 'Free',
    description: 'Track your fitness goals, monitor health metrics, and stay motivated with personalized workout plans.',
    type: 'apps'
  },
  {
    id: 'app4',
    title: 'BudgetMaster',
    developer: 'Financial Apps Co',
    rating: 4.8,
    downloads: '12M+',
    image: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Finance',
    price: 'Free',
    description: 'Take control of your finances with intelligent budgeting, expense tracking, and investment insights.',
    type: 'apps'
  },

  // Websites
  {
    id: 'web1',
    title: 'DevPortfolio',
    developer: 'WebCrafters Studio',
    rating: 4.9,
    downloads: '2M+',
    image: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Portfolio',
    price: 'Free',
    description: 'Showcase your development projects with this modern, responsive portfolio template.',
    type: 'websites'
  },
  {
    id: 'web2',
    title: 'E-Commerce Starter',
    developer: 'Commerce Solutions',
    rating: 4.7,
    downloads: '8M+',
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'E-commerce',
    price: '$19.99',
    description: 'Complete e-commerce website template with payment integration and inventory management.',
    type: 'websites'
  },
  {
    id: 'web3',
    title: 'Blog Platform',
    developer: 'Content Creators',
    rating: 4.5,
    downloads: '15M+',
    image: 'https://images.pexels.com/photos/265667/pexels-photo-265667.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Blog',
    price: 'Free',
    description: 'Modern blogging platform with SEO optimization, social media integration, and analytics.',
    type: 'websites'
  },
  {
    id: 'web4',
    title: 'Restaurant Menu',
    developer: 'Hospitality Web',
    rating: 4.6,
    downloads: '5M+',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    category: 'Restaurant',
    price: '$9.99',
    description: 'Beautiful restaurant website template with online ordering and reservation system.',
    type: 'websites'
  }
];