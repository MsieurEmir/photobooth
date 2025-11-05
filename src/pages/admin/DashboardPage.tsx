import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Camera, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  newMessages: number;
}

const DashboardPage = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    newMessages: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, customers(*), products(name)');

      const { data: customers } = await supabase
        .from('customers')
        .select('id');

      const { data: messages } = await supabase
        .from('contact_messages')
        .select('id')
        .eq('status', 'new');

      if (bookings) {
        const totalRevenue = bookings
          .filter(booking => booking.status !== 'cancelled')
          .reduce((sum, booking) => sum + Number(booking.total_price), 0);
        const pendingCount = bookings.filter(b => b.status === 'pending').length;

        setStats({
          totalBookings: bookings.length,
          pendingBookings: pendingCount,
          totalRevenue: totalRevenue,
          totalCustomers: customers?.length || 0,
          newMessages: messages?.length || 0,
        });

        setRecentBookings(bookings.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {profile?.full_name || 'Admin'} - Aperçu de votre activité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Réservations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Calendar className="text-primary" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En Attente</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalRevenue.toFixed(0)}€</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {stats.newMessages > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-8 border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <AlertCircle className="text-yellow-600 mr-3" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Nouveaux Messages</h3>
                <p className="text-sm text-gray-600">
                  Vous avez {stats.newMessages} nouveau{stats.newMessages > 1 ? 'x' : ''} message{stats.newMessages > 1 ? 's' : ''} non lu{stats.newMessages > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Dernières Réservations</h2>
            <TrendingUp className="text-primary" size={24} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Aucune réservation pour le moment
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{booking.customers?.name}</td>
                      <td className="py-3 px-4 text-sm">{booking.products?.name}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(booking.event_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold">
                        {booking.status === 'cancelled' ? (
                          <span className="text-gray-400 line-through">{Number(booking.total_price).toFixed(0)}€</span>
                        ) : (
                          <span className="text-green-600">{Number(booking.total_price).toFixed(0)}€</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
