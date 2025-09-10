import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, BarChart3, Settings, Database, Eye, Download, Star, Search, RefreshCw, TrendingUp, Package, Activity, Upload, ArrowLeft } from 'lucide-react';
import { supabase, StoreItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { logAdminAction } from '../lib/adminUtils';
import StorageTest from './StorageTest';

const AdminPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'analytics' | 'users' | 'settings' | 'debug' | 'hero'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalItems: 0,
    totalDownloads: 0,
    averageRating: 0,
    newItemsToday: 0,
    categoriesCount: {} as Record<string, number>,
    typeDistribution: {} as Record<string, number>
  });
  const { user, isAdmin } = useAuth();

  // Admin access control
  // If user is not signed in, always block
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // Strict admin access control - no exceptions
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <p className="text-sm text-gray-500">Only authorized administrators can access this panel.</p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    image: '',
    category: '',
    price: 'Free',
    description: '',
    type: 'games' as 'games' | 'apps' | 'websites',
    download_link: '',
    file_path: '',
    // Admin editable fields
    version: '',
    file_size: '',
    last_updated: '',
    // Open source fields
    is_opensource: false,
    github_url: '',
    // Cross-platform support fields
    has_web_version: false,
    has_app_version: false,
    web_version_url: '',
    app_version_url: '',
    cross_platform_notes: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Screenshots management
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  // Hero banner management state
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingHero, setEditingHero] = useState<any>(null);
  const [heroFormData, setHeroFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link_url: '',
    link_text: 'Learn More',
    banner_type: 'promotion' as 'app' | 'sponsor' | 'promotion',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchItems();
    fetchStats();
    fetchHeroBanners();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*');

      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      const totalDownloads = data?.reduce((sum, item) => sum + (item.download_count || 0), 0) || 0;
      const averageRating = data?.reduce((sum, item) => sum + (item.average_rating || 0), 0) / (data?.length || 1) || 0;
      const newItemsToday = data?.filter(item => item.created_at?.startsWith(today)).length || 0;
      
      const categoriesCount = data?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const typeDistribution = data?.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        totalItems: data?.length || 0,
        totalDownloads,
        averageRating,
        newItemsToday,
        categoriesCount,
        typeDistribution
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      console.log('Uploading image:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('store-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('store-files')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      console.log('Uploading file:', fileName, 'Size:', file.size);

      const { error: uploadError } = await supabase.storage
        .from('store-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }

      // Record file info in database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert([{
          filename: fileName,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          uploaded_by: user?.id
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the upload if DB insert fails
      }

      const { data } = supabase.storage
        .from('store-files')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully:', data.publicUrl);
      alert('File uploaded successfully!');
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemData = {
        ...formData,
        created_by: user?.id
      };

      let itemId: string;

      if (editingItem) {
        const { error } = await supabase
          .from('store_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        itemId = editingItem.id;
        logAdminAction('UPDATE_ITEM', { itemId: itemId, title: formData.title, adminEmail: user?.email });
      } else {
        const { data, error } = await supabase
          .from('store_items')
          .insert([itemData])
          .select('id')
          .single();

        if (error) throw error;
        itemId = data.id;
        logAdminAction('CREATE_ITEM', { itemId: itemId, title: formData.title, type: formData.type, adminEmail: user?.email });
      }

      // Save screenshots if any
      if (screenshots.length > 0) {
        await saveScreenshotsToDatabase();
      }

      await fetchItems();
      await fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const itemToDelete = items.find(item => item.id === id);
      const { error } = await supabase
        .from('store_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      logAdminAction('DELETE_ITEM', { itemId: id, title: itemToDelete?.title, adminEmail: user?.email });
      await fetchItems();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      developer: '',
      image: '',
      category: '',
      price: 'Free',
      description: '',
      type: 'games',
      download_link: '',
      file_path: '',
      // Admin editable fields
      version: '',
      file_size: '',
      last_updated: '',
      // Open source fields
      is_opensource: false,
      github_url: '',
      // Cross-platform support fields
      has_web_version: false,
      has_app_version: false,
      web_version_url: '',
      app_version_url: '',
      cross_platform_notes: ''
    });
    setScreenshots([]);
    setShowAddForm(false);
    setEditingItem(null);
  };

  // Screenshot upload functions
  const handleScreenshotUpload = async (file: File) => {
    if (!file) return null;

    setUploadingScreenshot(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `screenshots/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('store-files')
        .getPublicUrl(fileName);

      console.log('Screenshot uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert(`Failed to upload screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const addScreenshot = async (file: File) => {
    const url = await handleScreenshotUpload(file);
    if (url) {
      setScreenshots(prev => [...prev, url]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const saveScreenshotsToDatabase = async () => {
    // Screenshots feature disabled to prevent database errors
    console.log('Screenshots feature disabled - skipping database save');
    return;
  };

  const startEdit = (item: StoreItem) => {
    setFormData({
      title: item.title,
      developer: item.developer,
      image: item.image,
      category: item.category,
      price: item.price,
      description: item.description,
      type: item.type || 'games',
      download_link: item.download_link || '',
      file_path: item.file_path || '',
      // Admin editable fields
      version: item.version || '',
      file_size: item.file_size || '',
      last_updated: item.last_updated || '',
      // Open source fields
      is_opensource: item.is_opensource || false,
      github_url: item.github_url || '',
      // Cross-platform support fields
      has_web_version: item.has_web_version || false,
      has_app_version: item.has_app_version || false,
      web_version_url: item.web_version_url || '',
      app_version_url: item.app_version_url || '',
      cross_platform_notes: item.cross_platform_notes || ''
    });
    setEditingItem(item);
    loadItemScreenshots(item.id);
    setShowAddForm(true);
    setActiveTab('items');
  };

  const loadItemScreenshots = async (_itemId: string) => {
    // Screenshots feature disabled to prevent database errors
    console.log('Screenshots feature disabled - skipping database load');
    setScreenshots([]);
    return;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(items.map(item => item.category))];

  // Hero Banner Functions
  const fetchHeroBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHeroBanners(data || []);
    } catch (error) {
      console.error('Error fetching hero banners:', error);
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingHero) {
        const { error } = await supabase
          .from('hero_banners')
          .update(heroFormData)
          .eq('id', editingHero.id);

        if (error) throw error;
        await logAdminAction('Updated hero banner', editingHero.id);
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert([heroFormData]);

        if (error) throw error;
        await logAdminAction('Created hero banner', heroFormData.title);
      }

      fetchHeroBanners();
      resetHeroForm();
    } catch (error) {
      console.error('Error saving hero banner:', error);
      alert('Failed to save hero banner');
    }
  };

  const deleteHeroBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;

    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchHeroBanners();
      await logAdminAction('Deleted hero banner', id);
    } catch (error) {
      console.error('Error deleting hero banner:', error);
      alert('Failed to delete hero banner');
    }
  };

  const resetHeroForm = () => {
    setHeroFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link_url: '',
      link_text: 'Learn More',
      banner_type: 'promotion',
      is_active: true,
      display_order: 0
    });
    setShowHeroForm(false);
    setEditingHero(null);
  };

  const startEditHero = (hero: any) => {
    setHeroFormData(hero);
    setEditingHero(hero);
    setShowHeroForm(true);
  };

  const toggleHeroBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      fetchHeroBanners();
      await logAdminAction(`${!currentStatus ? 'Activated' : 'Deactivated'} hero banner`, id);
    } catch (error) {
      console.error('Error updating hero banner status:', error);
      alert('Failed to update banner status');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Admin Access Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800">Admin Access Active</h3>
            <p className="text-green-700">
              Logged in as: <span className="font-medium">{user?.email}</span>
            </p>
            <p className="text-sm text-green-600 mt-1">
              You have full administrative privileges for this store.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="text-blue-600"
        />
        <StatCard
          title="Total Downloads"
          value={stats.totalDownloads.toLocaleString()}
          icon={Download}
          color="text-green-600"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="text-yellow-600"
          subtitle="out of 5.0"
        />
        <StatCard
          title="New Today"
          value={stats.newItemsToday}
          icon={TrendingUp}
          color="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setActiveTab('items');
              setShowAddForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Item</span>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
          >
            <Eye className="w-5 h-5" />
            <span>Manage Items</span>
          </button>
          <button
            onClick={() => {
              fetchItems();
              fetchStats();
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {Object.entries(stats.categoriesCount).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{category}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Type Distribution</h3>
          <div className="space-y-2">
            {Object.entries(stats.typeDistribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Developer</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Rating</th>
                <th className="text-left py-2">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 5).map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{item.title}</td>
                  <td className="py-2 text-gray-600">{item.developer}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {item.rating}
                    </div>
                  </td>
                  <td className="py-2">{item.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ItemsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Manage Items</h2>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {filteredItems.length} items
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="games">Games</option>
            <option value="apps">Apps</option>
            <option value="websites">Websites</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.type === 'games' ? 'bg-purple-100 text-purple-800' :
                  item.type === 'apps' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.type}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{item.developer}</p>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{item.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{item.downloads} downloads</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startEdit(item)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-medium flex items-center justify-center space-x-1 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded font-medium flex items-center justify-center space-x-1 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const HeroBannersView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Hero Banners</h2>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {heroBanners.length} banners
          </span>
        </div>
        <button
          onClick={() => setShowHeroForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Hero Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {heroBanners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Banner Preview */}
            <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${banner.image_url})` }}>
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.banner_type === 'app' ? 'bg-blue-600 text-white' :
                  banner.banner_type === 'sponsor' ? 'bg-purple-600 text-white' :
                  'bg-green-600 text-white'
                }`}>
                  {banner.banner_type}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => toggleHeroBannerStatus(banner.id, banner.is_active)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    banner.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                  }`}
                >
                  {banner.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm opacity-90">{banner.subtitle}</p>}
              </div>
            </div>

            {/* Banner Details */}
            <div className="p-4">
              {banner.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{banner.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Order: {banner.display_order}</span>
                  {banner.link_url && (
                    <span className="text-blue-600">• Has Link</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditHero(banner)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHeroBanner(banner.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {heroBanners.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Hero Banners</h3>
          <p className="text-gray-500 mb-4">Create your first promotional banner to get started</p>
          <button
            onClick={() => setShowHeroForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create Hero Banner
          </button>
        </div>
      )}

      {/* Hero Banner Form Modal */}
      {showHeroForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingHero ? 'Edit Hero Banner' : 'Add Hero Banner'}
                </h3>
                <button
                  onClick={resetHeroForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleHeroSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={heroFormData.title}
                    onChange={(e) => setHeroFormData({...heroFormData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={heroFormData.subtitle}
                    onChange={(e) => setHeroFormData({...heroFormData, subtitle: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter banner subtitle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={heroFormData.description}
                    onChange={(e) => setHeroFormData({...heroFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter banner description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={heroFormData.image_url}
                    onChange={(e) => setHeroFormData({...heroFormData, image_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/banner-image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={heroFormData.link_url}
                    onChange={(e) => setHeroFormData({...heroFormData, link_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={heroFormData.link_text}
                    onChange={(e) => setHeroFormData({...heroFormData, link_text: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Learn More"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Type
                    </label>
                    <select
                      value={heroFormData.banner_type}
                      onChange={(e) => setHeroFormData({...heroFormData, banner_type: e.target.value as any})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="promotion">Promotion</option>
                      <option value="app">App</option>
                      <option value="sponsor">Sponsor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={heroFormData.display_order}
                      onChange={(e) => setHeroFormData({...heroFormData, display_order: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={heroFormData.is_active}
                    onChange={(e) => setHeroFormData({...heroFormData, is_active: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active (visible on website)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetHeroForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    {editingHero ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Store
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'items'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Database className="w-4 h-4 inline mr-2" />
                Items
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'users'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('hero')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'hero'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Hero Banners
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('debug')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'debug'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Debug
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'items' && <ItemsView />}
        {activeTab === 'hero' && <HeroBannersView />}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-500">Advanced analytics features coming soon!</p>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-500">User management features coming soon!</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-500">System settings coming soon!</p>
          </div>
        )}
        {activeTab === 'debug' && <StorageTest />}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Developer *
                    </label>
                    <input
                      type="text"
                      value={formData.developer}
                      onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'games' | 'apps' | 'websites' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="games">Games</option>
                      <option value="apps">Apps</option>
                      <option value="websites">Websites</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Action, Productivity, Entertainment"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Free, $9.99, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image *
                    </label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                      <div className="text-center text-gray-500 text-sm">OR</div>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleImageUpload(file);
                              if (url) {
                                setFormData({ ...formData, image: url });
                              }
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className={`w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors duration-200 ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Upload className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">Upload Image</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the item..."
                    required
                  />
                </div>

                {/* Admin Metadata Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    Admin Metadata
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Version
                      </label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1.0.0, v2.1, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Size
                      </label>
                      <input
                        type="text"
                        value={formData.file_size}
                        onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="25 MB, 1.2 GB, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Updated
                      </label>
                      <input
                        type="date"
                        value={formData.last_updated}
                        onChange={(e) => setFormData({ ...formData, last_updated: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Enhanced Category and Price Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category (Enhanced)
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <optgroup label="Games">
                          <option value="Action">Action</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Strategy">Strategy</option>
                          <option value="RPG">RPG</option>
                          <option value="Simulation">Simulation</option>
                          <option value="Sports">Sports</option>
                          <option value="Racing">Racing</option>
                          <option value="Puzzle">Puzzle</option>
                          <option value="Arcade">Arcade</option>
                          <option value="Indie">Indie</option>
                        </optgroup>
                        <optgroup label="Apps">
                          <option value="Productivity">Productivity</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Education">Education</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Social">Social</option>
                          <option value="Business">Business</option>
                          <option value="Developer Tools">Developer Tools</option>
                          <option value="Graphics & Design">Graphics & Design</option>
                          <option value="Music & Audio">Music & Audio</option>
                          <option value="Photo & Video">Photo & Video</option>
                        </optgroup>
                        <optgroup label="Websites">
                          <option value="E-commerce">E-commerce</option>
                          <option value="Portfolio">Portfolio</option>
                          <option value="Blog">Blog</option>
                          <option value="News">News</option>
                          <option value="Educational">Educational</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Business">Business</option>
                          <option value="Technology">Technology</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (Enhanced)
                      </label>
                      <div className="relative">
                        <select
                          value={formData.price === 'Free' || formData.price === '' ? 'free' : 'paid'}
                          onChange={(e) => {
                            if (e.target.value === 'free') {
                              setFormData({ ...formData, price: 'Free' });
                            } else {
                              setFormData({ ...formData, price: '$' });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        >
                          <option value="free">Free</option>
                          <option value="paid">Paid</option>
                        </select>
                        {formData.price !== 'Free' && (
                          <input
                            type="text"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="$9.99, $19.99, etc."
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Source Section */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Open Source Project
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_opensource"
                        checked={formData.is_opensource}
                        onChange={(e) => setFormData({ ...formData, is_opensource: e.target.checked })}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <label htmlFor="is_opensource" className="text-sm font-medium text-gray-700">
                        This is an open source project
                      </label>
                    </div>

                    {formData.is_opensource && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GitHub Repository URL *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="url"
                            value={formData.github_url}
                            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="https://github.com/username/repository"
                            required={formData.is_opensource}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Users will see a GitHub icon and can click to view the source code
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Screenshots Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demo Images / Screenshots (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload multiple screenshots to showcase your app or website (up to 8 images). Note: Database storage is currently disabled to prevent errors.
                  </p>
                  
                  {/* Screenshot Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors duration-200">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            for (const file of files) {
                              if (screenshots.length >= 8) {
                                alert('Maximum 8 screenshots allowed');
                                break;
                              }
                              await addScreenshot(file);
                            }
                          }
                        }}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className={`w-full flex flex-col items-center justify-center py-6 cursor-pointer ${
                          uploadingScreenshot ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingScreenshot ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-600">Uploading screenshot...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-gray-600 font-medium">Click to upload screenshots</span>
                            <span className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB each</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Screenshot Grid */}
                  {screenshots.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {screenshots.map((screenshot, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={screenshot}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {screenshots.length}/8 screenshots uploaded
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Download Link
                  </label>
                  <input
                    type="url"
                    value={formData.download_link}
                    onChange={(e) => setFormData({ ...formData, download_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/download"
                  />
                  <div className="mt-3">
                    <div className="text-center text-gray-500 text-sm mb-2">OR Upload File</div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".apk,.exe,.dmg,.zip,.rar,.7z,.tar,.gz,.app,.deb,.rpm,.msi"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) {
                              setFormData({ ...formData, file_path: url, download_link: url });
                            }
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors duration-200 ${
                          uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingFile ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">Uploading file...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-6 h-6 text-gray-600" />
                            <span className="text-sm text-gray-600 font-medium">Upload App/Game File</span>
                            <span className="text-xs text-gray-500">APK, EXE, DMG, ZIP, etc.</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {formData.file_path && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        ✓ File uploaded successfully
                      </div>
                    )}
                  </div>
                </div>

                {/* Cross-Platform Support Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Platform Availability</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If this item is available on multiple platforms (e.g., both as an app and website), configure the alternative versions here.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Web Version */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_web_version"
                          checked={formData.has_web_version}
                          onChange={(e) => setFormData({ ...formData, has_web_version: e.target.checked })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="has_web_version" className="ml-2 block text-sm font-medium text-gray-900">
                          Also available as web version
                        </label>
                      </div>
                      
                      {formData.has_web_version && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Web Version URL
                          </label>
                          <input
                            type="url"
                            value={formData.web_version_url}
                            onChange={(e) => setFormData({ ...formData, web_version_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="https://example.com/web-version"
                          />
                        </div>
                      )}
                    </div>

                    {/* App Version */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_app_version"
                          checked={formData.has_app_version}
                          onChange={(e) => setFormData({ ...formData, has_app_version: e.target.checked })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="has_app_version" className="ml-2 block text-sm font-medium text-gray-900">
                          Also available as app version
                        </label>
                      </div>
                      
                      {formData.has_app_version && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            App Version URL
                          </label>
                          <input
                            type="url"
                            value={formData.app_version_url}
                            onChange={(e) => setFormData({ ...formData, app_version_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="https://example.com/app-download"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cross-platform notes */}
                  {(formData.has_web_version || formData.has_app_version) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cross-Platform Notes (Optional)
                      </label>
                      <textarea
                        value={formData.cross_platform_notes}
                        onChange={(e) => setFormData({ ...formData, cross_platform_notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 'Web version has limited features' or 'App version includes offline mode'"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingItem ? 'Update' : 'Create'} Item</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
