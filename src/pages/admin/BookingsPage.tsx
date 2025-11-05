import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Check, X, Clock, CreditCard, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Booking {
  id: string;
  event_date: string;
  event_time: string;
  total_price: number;
  status: string;
  deposit_paid: boolean;
  full_payment_paid: boolean;
  deposit_amount: number;
  paid_amount: number;
  customers: { name: string; email: string; phone: string };
  products: { name: string };
  event_type: string;
  address: string;
  duration: number;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPayment, setEditingPayment] = useState<{bookingId: string, field: 'deposit' | 'paid'} | null>(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, customers(*), products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setBookings(data as any);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const updatePaymentStatus = async (bookingId: string, field: 'deposit_paid' | 'full_payment_paid', value: boolean) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ [field]: value })
        .eq('id', bookingId);

      if (error) throw error;
      loadBookings();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Erreur lors de la mise à jour du paiement');
    }
  };

  const startEditingAmount = (bookingId: string, field: 'deposit' | 'paid', currentAmount: number) => {
    setEditingPayment({ bookingId, field });
    setEditAmount(currentAmount.toString());
  };

  const savePaymentAmount = async () => {
    if (!editingPayment) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    try {
      const fieldName = editingPayment.field === 'deposit' ? 'deposit_amount' : 'paid_amount';
      const { error } = await supabase
        .from('bookings')
        .update({ [fieldName]: amount })
        .eq('id', editingPayment.bookingId);

      if (error) throw error;

      setEditingPayment(null);
      setEditAmount('');
      loadBookings();
    } catch (error) {
      console.error('Error updating payment amount:', error);
      alert('Erreur lors de la mise à jour du montant');
    }
  };

  const cancelEditingAmount = () => {
    setEditingPayment(null);
    setEditAmount('');
  };

  const getPaymentStatus = (booking: Booking) => {
    if (booking.full_payment_paid) {
      return { label: 'Payé', color: 'bg-green-100 text-green-800', icon: '✓' };
    } else if (booking.deposit_paid) {
      return { label: 'Acompte', color: 'bg-blue-100 text-blue-800', icon: '◐' };
    } else {
      return { label: 'Non payé', color: 'bg-gray-100 text-gray-600', icon: '○' };
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
          <p className="text-gray-600">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
        <p className="text-gray-600">Gérez toutes les réservations de photobooths</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Paiement</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customers?.name}</p>
                        <p className="text-xs text-gray-500">{booking.event_type}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="text-gray-700">{booking.customers?.email}</p>
                        <p className="text-xs text-gray-500">{booking.customers?.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{booking.products?.name}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="font-medium">
                          {new Date(booking.event_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-500">{booking.event_time}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-green-600">
                      {Number(booking.total_price).toFixed(0)}€
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(booking.status)}`}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex flex-col gap-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium text-center ${getPaymentStatus(booking).color}`}>
                          {getPaymentStatus(booking).label}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updatePaymentStatus(booking.id, 'deposit_paid', !booking.deposit_paid)}
                              className={`flex-1 px-2 py-1 text-xs rounded ${booking.deposit_paid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                              title="Marquer acompte payé"
                            >
                              Acompte
                            </button>
                            {editingPayment?.bookingId === booking.id && editingPayment.field === 'deposit' ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="w-20 px-1 py-1 text-xs border rounded"
                                  placeholder="0"
                                  autoFocus
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') savePaymentAmount();
                                    if (e.key === 'Escape') cancelEditingAmount();
                                  }}
                                />
                                <button
                                  onClick={savePaymentAmount}
                                  className="px-1 py-1 text-xs bg-green-600 text-white rounded"
                                  title="Enregistrer"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={cancelEditingAmount}
                                  className="px-1 py-1 text-xs bg-red-600 text-white rounded"
                                  title="Annuler"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditingAmount(booking.id, 'deposit', booking.deposit_amount || 0)}
                                className="px-1 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                                title="Modifier montant acompte"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 text-center">
                            {booking.deposit_amount > 0 ? `${Number(booking.deposit_amount).toFixed(0)}€` : '0€'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updatePaymentStatus(booking.id, 'full_payment_paid', !booking.full_payment_paid)}
                              className={`flex-1 px-2 py-1 text-xs rounded ${booking.full_payment_paid ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                              title="Marquer paiement complet"
                            >
                              Complet
                            </button>
                            {editingPayment?.bookingId === booking.id && editingPayment.field === 'paid' ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="w-20 px-1 py-1 text-xs border rounded"
                                  placeholder="0"
                                  autoFocus
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') savePaymentAmount();
                                    if (e.key === 'Escape') cancelEditingAmount();
                                  }}
                                />
                                <button
                                  onClick={savePaymentAmount}
                                  className="px-1 py-1 text-xs bg-green-600 text-white rounded"
                                  title="Enregistrer"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={cancelEditingAmount}
                                  className="px-1 py-1 text-xs bg-red-600 text-white rounded"
                                  title="Annuler"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditingAmount(booking.id, 'paid', booking.paid_amount || 0)}
                                className="px-1 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                                title="Modifier montant total payé"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 text-center">
                            {booking.paid_amount > 0 ? `${Number(booking.paid_amount).toFixed(0)}€` : '0€'}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
