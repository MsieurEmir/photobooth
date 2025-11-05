import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Camera, LayoutDashboard, Calendar, Package, Image, MessageSquare, LogOut, Menu, X, User, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/admin/bookings', label: 'Réservations', icon: Calendar },
    { path: '/admin/products', label: 'Produits', icon: Package },
    { path: '/admin/gallery', label: 'Galerie', icon: Image },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/users', label: 'Administrateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-secondary text-white z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <Camera size={24} className="text-accent-yellow" />
              <span className="font-bold text-xl">PixBooth Admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <User size={18} />
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500">{profile?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/admin/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User size={16} />
                        <span className="text-sm">Mon Profil</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-[60px]">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: '60px' }}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            style={{ top: '60px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
