import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Check, X, Clock, CreditCard, Edit2, Plus, Trash2 } from 'lucide-react';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: '',
    eventDate: '',
    eventTime: '',
    address: '',
    duration: '4',
    productId: '',
    totalPrice: '',
    status: 'confirmed',
    depositAmount: '',
    paidAmount: ''
  });

  useEffect(() => {
    loadBookings();
    loadProducts();
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

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('available', true)
        .order('name');

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
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

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setBookingToDelete(null);
      loadBookings();
      alert('Réservation supprimée avec succès');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erreur lors de la suppression de la réservation');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let customerId = null;

      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', newBooking.customerEmail.toLowerCase().trim())
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: newBooking.customerName,
            email: newBooking.customerEmail.toLowerCase().trim(),
            phone: newBooking.customerPhone
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId,
          product_id: newBooking.productId,
          event_type: newBooking.eventType,
          event_date: newBooking.eventDate,
          event_time: newBooking.eventTime,
          address: newBooking.address,
          duration: parseInt(newBooking.duration),
          total_price: parseFloat(newBooking.totalPrice),
          status: newBooking.status,
          deposit_amount: newBooking.depositAmount ? parseFloat(newBooking.depositAmount) : 0,
          paid_amount: newBooking.paidAmount ? parseFloat(newBooking.paidAmount) : 0,
          deposit_paid: newBooking.depositAmount ? parseFloat(newBooking.depositAmount) > 0 : false,
          full_payment_paid: newBooking.paidAmount ? parseFloat(newBooking.paidAmount) >= parseFloat(newBooking.totalPrice) : false
        });

      if (bookingError) throw bookingError;

      setShowAddModal(false);
      setNewBooking({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        eventType: '',
        eventDate: '',
        eventTime: '',
        address: '',
        duration: '4',
        productId: '',
        totalPrice: '',
        status: 'confirmed',
        depositAmount: '',
        paidAmount: ''
      });
      loadBookings();
      alert('Réservation créée avec succès !');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Erreur lors de la création de la réservation');
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setNewBooking(prev => ({
      ...prev,
      productId,
      totalPrice: product ? product.price.toString() : ''
    }));
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
          <p className="text-gray-600">Gérez toutes les réservations de photobooths</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Ajouter une réservation</span>
        </button>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
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
                    <td className="py-3 px-4 text-sm font-semibold">
                      {booking.status === 'cancelled' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-gray-400 line-through">{Number(booking.total_price).toFixed(0)}€</span>
                          <span className="text-xs text-red-600 font-normal">(0€)</span>
                        </div>
                      ) : (
                        <span className="text-green-600">{Number(booking.total_price).toFixed(0)}€</span>
                      )}
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
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la réservation"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer cette réservation ?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Client :</span> {bookingToDelete.customers?.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Date :</span> {new Date(bookingToDelete.event_date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Montant :</span> {Number(bookingToDelete.total_price).toFixed(0)}€
                </p>
              </div>
              <p className="text-red-600 text-sm mt-4 font-medium">
                Cette action est irréversible !
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Supprimer définitivement
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nouvelle Réservation</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddBooking}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations Client</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nom complet *</label>
                        <input
                          type="text"
                          value={newBooking.customerName}
                          onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input
                          type="email"
                          value={newBooking.customerEmail}
                          onChange={(e) => setNewBooking({...newBooking, customerEmail: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label">Téléphone *</label>
                        <input
                          type="tel"
                          value={newBooking.customerPhone}
                          onChange={(e) => setNewBooking({...newBooking, customerPhone: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Détails de l'Événement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Type d'événement *</label>
                        <input
                          type="text"
                          value={newBooking.eventType}
                          onChange={(e) => setNewBooking({...newBooking, eventType: e.target.value})}
                          className="input-field"
                          placeholder="Mariage, Anniversaire, etc."
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Produit *</label>
                        <select
                          value={newBooking.productId}
                          onChange={(e) => handleProductChange(e.target.value)}
                          className="input-field"
                          required
                        >
                          <option value="">Sélectionner un produit</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.price}€
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Date de l'événement *</label>
                        <input
                          type="date"
                          value={newBooking.eventDate}
                          onChange={(e) => setNewBooking({...newBooking, eventDate: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Heure *</label>
                        <input
                          type="time"
                          value={newBooking.eventTime}
                          onChange={(e) => setNewBooking({...newBooking, eventTime: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label">Adresse *</label>
                        <input
                          type="text"
                          value={newBooking.address}
                          onChange={(e) => setNewBooking({...newBooking, address: e.target.value})}
                          className="input-field"
                          placeholder="Adresse complète de l'événement"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Durée (heures) *</label>
                        <input
                          type="number"
                          value={newBooking.duration}
                          onChange={(e) => setNewBooking({...newBooking, duration: e.target.value})}
                          className="input-field"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Statut</label>
                        <select
                          value={newBooking.status}
                          onChange={(e) => setNewBooking({...newBooking, status: e.target.value})}
                          className="input-field"
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="completed">Terminée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Paiement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Montant total * (€)</label>
                        <input
                          type="number"
                          value={newBooking.totalPrice}
                          onChange={(e) => setNewBooking({...newBooking, totalPrice: e.target.value})}
                          className="input-field"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Acompte versé (€)</label>
                        <input
                          type="number"
                          value={newBooking.depositAmount}
                          onChange={(e) => setNewBooking({...newBooking, depositAmount: e.target.value})}
                          className="input-field"
                          step="0.01"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="label">Montant payé (€)</label>
                        <input
                          type="number"
                          value={newBooking.paidAmount}
                          onChange={(e) => setNewBooking({...newBooking, paidAmount: e.target.value})}
                          className="input-field"
                          step="0.01"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Créer la réservation
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
