import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Check, AlertCircle, Calendar, Clock, MapPin, Users, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Product = Database['public']['Tables']['products']['Row'];

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedProduct = searchParams.get('product');

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    product: preselectedProduct || '',
    date: '',
    time: '',
    duration: '4',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    eventType: '',
    guests: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('price', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data);
        if (!formData.product) {
          setFormData(prev => ({ ...prev, product: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    "Mariage", "Anniversaire", "Soirée d'entreprise", "Salon professionnel", 
    "Conférence", "Gala", "Remise de diplôme", "Autre"
  ];

  const totalPrice = () => {
    const product = products.find(p => p.id === formData.product);
    const basePrice = product ? Number(product.price) : 0;
    const durationMultiplier = parseFloat(formData.duration) / 4;
    return Math.round(basePrice * durationMultiplier);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.product) newErrors.product = "Veuillez sélectionner un photobooth";
      if (!formData.date) newErrors.date = "Veuillez sélectionner une date";
      if (!formData.time) newErrors.time = "Veuillez sélectionner une heure";
    }
    
    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = "Veuillez entrer votre prénom";
      if (!formData.lastName) newErrors.lastName = "Veuillez entrer votre nom";
      if (!formData.email) newErrors.email = "Veuillez entrer votre email";
      if (!formData.phone) newErrors.phone = "Veuillez entrer votre téléphone";
      if (!formData.address) newErrors.address = "Veuillez entrer l'adresse de l'événement";
      if (!formData.eventType) newErrors.eventType = "Veuillez sélectionner un type d'événement";
      
      // Email validation
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Veuillez entrer un email valide";
      }
      
      // Phone validation
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = "Veuillez entrer un numéro de téléphone valide (10 chiffres)";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      let customerId: string;

      const { data: existingCustomer, error: customerLookupError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (customerLookupError) {
        console.error('Error looking up customer:', customerLookupError);
        throw new Error('Erreur lors de la vérification du client. Veuillez réessayer.');
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address
          })
          .eq('id', customerId);

        if (updateError) {
          console.error('Error updating customer:', updateError);
          throw new Error('Erreur lors de la mise à jour des informations client.');
        }
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          })
          .select()
          .single();

        if (customerError) {
          console.error('Error creating customer:', customerError);
          if (customerError.code === '23505') {
            throw new Error('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse.');
          }
          throw new Error('Erreur lors de la création du profil client. Veuillez vérifier vos informations.');
        }

        if (!newCustomer) {
          throw new Error('Erreur: Impossible de créer le profil client.');
        }

        customerId = newCustomer.id;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId,
          product_id: formData.product,
          event_date: formData.date,
          event_time: formData.time,
          duration: parseInt(formData.duration),
          address: formData.address,
          event_type: formData.eventType,
          guests_count: formData.guests ? parseInt(formData.guests) : null,
          special_requests: formData.specialRequests || null,
          total_price: totalPrice(),
          status: 'pending',
          deposit_paid: false,
          full_payment_paid: false
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);

        if (bookingError.code === '23503') {
          throw new Error('Erreur: Le produit sélectionné n\'est plus disponible. Veuillez sélectionner un autre photobooth.');
        }

        if (bookingError.code === '23505') {
          throw new Error('Une réservation existe déjà pour cette date et cet horaire. Veuillez choisir une autre date.');
        }

        throw new Error('Erreur lors de la création de la réservation. Veuillez vérifier vos informations et réessayer.');
      }

      if (!bookingData) {
        throw new Error('Erreur: La réservation n\'a pas pu être créée.');
      }

      setCurrentStep(3);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de la réservation. Veuillez réessayer.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === formData.product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-accent-purple text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Réservation</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Complétez le formulaire ci-dessous pour réserver votre photobooth.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-300'}`}>
                <Camera size={20} />
              </div>
              <span className="text-sm mt-2">Sélection</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}>
                <Users size={20} />
              </div>
              <span className="text-sm mt-2">Informations</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}>
                <Check size={20} />
              </div>
              <span className="text-sm mt-2">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card p-6"
                  >
                    <h2 className="text-2xl font-bold mb-6">Sélection du Photobooth</h2>
                    
                    <div className="mb-6">
                      <label htmlFor="product" className="label">Modèle de Photobooth</label>
                      <select
                        id="product"
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        className={`input-field ${errors.product ? 'border-error' : ''}`}
                        disabled={products.length === 0}
                      >
                        {products.length === 0 ? (
                          <option value="">Aucun produit disponible</option>
                        ) : (
                          products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {Number(product.price).toFixed(0)}€
                            </option>
                          ))
                        )}
                      </select>
                      {errors.product && <p className="text-error text-sm mt-1">{errors.product}</p>}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="date" className="label">Date de l'événement</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.date ? 'border-error' : ''}`}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      {errors.date && <p className="text-error text-sm mt-1">{errors.date}</p>}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="time" className="label">Heure de début</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.time ? 'border-error' : ''}`}
                          required
                        />
                      </div>
                      {errors.time && <p className="text-error text-sm mt-1">{errors.time}</p>}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="duration" className="label">Durée (heures)</label>
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="3">3 heures</option>
                        <option value="4">4 heures</option>
                        <option value="5">5 heures</option>
                        <option value="6">6 heures</option>
                        <option value="8">8 heures</option>
                      </select>
                    </div>
                    
                    <div className="text-right mt-6">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn-primary"
                      >
                        Continuer
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card p-6"
                  >
                    <h2 className="text-2xl font-bold mb-6">Informations de Contact</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label htmlFor="firstName" className="label">Prénom</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`input-field ${errors.firstName ? 'border-error' : ''}`}
                          placeholder="John"
                          required
                        />
                        {errors.firstName && <p className="text-error text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="label">Nom</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`input-field ${errors.lastName ? 'border-error' : ''}`}
                          placeholder="Doe"
                          required
                        />
                        {errors.lastName && <p className="text-error text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="email" className="label">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field ${errors.email ? 'border-error' : ''}`}
                        placeholder="john@example.com"
                        required
                      />
                      {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="phone" className="label">Téléphone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input-field ${errors.phone ? 'border-error' : ''}`}
                        placeholder="06 12 34 56 78"
                        required
                      />
                      {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="address" className="label">Adresse de l'événement</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.address ? 'border-error' : ''}`}
                          placeholder="123 Rue de la Fête, 75001 Paris"
                          required
                        />
                      </div>
                      {errors.address && <p className="text-error text-sm mt-1">{errors.address}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label htmlFor="eventType" className="label">Type d'événement</label>
                        <select
                          id="eventType"
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleChange}
                          className={`input-field ${errors.eventType ? 'border-error' : ''}`}
                          required
                        >
                          <option value="">Sélectionner...</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors.eventType && <p className="text-error text-sm mt-1">{errors.eventType}</p>}
                      </div>
                      <div>
                        <label htmlFor="guests" className="label">Nombre d'invités (approximatif)</label>
                        <input
                          type="number"
                          id="guests"
                          name="guests"
                          value={formData.guests}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="100"
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="specialRequests" className="label">Demandes spéciales (optionnel)</label>
                      <textarea
                        id="specialRequests"
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleChange}
                        className="input-field min-h-[100px]"
                        placeholder="Informations complémentaires, accessoires spécifiques, etc."
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn-outline order-2 sm:order-1"
                      >
                        Retour
                      </button>
                      <a
                        href="https://wa.me/33612345678?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20un%20photobooth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline border-green-500 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center gap-2 order-3 sm:order-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </a>
                      <button
                        type="submit"
                        className="btn-primary order-1 sm:order-3"
                        disabled={submitting}
                      >
                        {submitting ? 'Envoi en cours...' : 'Réserver Maintenant'}
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card p-6 border-t-4 border-success"
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-success mb-2">Réservation Confirmée!</h2>
                      <p className="text-gray-600">
                        Merci pour votre réservation. Nous vous avons envoyé un email de confirmation à {formData.email}.
                      </p>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Détails de la réservation</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Photobooth:</div>
                          <div className="font-medium">{getSelectedProduct()?.name}</div>
                          
                          <div className="text-gray-600">Date:</div>
                          <div className="font-medium">{formData.date}</div>
                          
                          <div className="text-gray-600">Heure:</div>
                          <div className="font-medium">{formData.time}</div>
                          
                          <div className="text-gray-600">Durée:</div>
                          <div className="font-medium">{formData.duration} heures</div>
                          
                          <div className="text-gray-600">Total:</div>
                          <div className="font-bold text-primary">{totalPrice()}€</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Prochaines étapes</h3>
                        <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
                          <li>Notre équipe vous contactera sous 24h pour finaliser les détails.</li>
                          <li>Un acompte de 30% sera demandé pour confirmer la réservation.</li>
                          <li>Notre équipe arrivera 1h avant le début de l'événement pour l'installation.</li>
                        </ol>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-4">
                        Pour toute question, contactez-nous à <span className="text-primary">contact@pixbooth.fr</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => window.location.href = '/'}
                        className="btn-secondary"
                      >
                        Retour à l'accueil
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
            
            {/* Summary */}
            {currentStep < 3 && (
              <div className="md:col-span-1">
                <div className="card p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-4">Récapitulatif</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Photobooth:</span>
                      <span className="font-medium">{getSelectedProduct()?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formData.date || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heure:</span>
                      <span className="font-medium">{formData.time || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-medium">{formData.duration} heures</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-primary">{totalPrice()}€</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-4 text-sm flex gap-3">
                    <AlertCircle className="text-accent-yellow flex-shrink-0 mt-0.5" size={18} />
                    <p>Un acompte de 30% sera demandé pour confirmer la réservation.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;