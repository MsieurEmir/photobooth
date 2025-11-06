import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Product = Database['public']['Tables']['products']['Row'];

const CatalogPage = () => {
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filter === "all"
    ? products
    : products.filter(product => product.category === filter);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: window.location.origin
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Catalogue',
            item: `${window.location.origin}/catalog`
          }
        ]
      },
      {
        '@type': 'ItemList',
        itemListElement: filteredProducts.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image_url,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock'
            }
          }
        }))
      }
    ]
  };

  return (
    <div>
      <SEO
        title="Catalogue Photobooths - Location de Bornes Photo Premium | PixBooth"
        description="Découvrez notre gamme complète de photobooths à louer : modèles premium, spécialités et bornes photos personnalisées. Tarifs dégressifs et équipement professionnel."
        keywords="catalogue photobooth, location borne photo, photobooth premium, tarif photobooth, louer photobooth, borne selfie, photobooth mariage prix"
        url="/catalog"
        type="website"
        structuredData={structuredData}
      />
      <div className="bg-primary text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Photobooths</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Découvrez notre gamme complète de photobooths pour tous types d'événements.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : (
          <>
        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-full transition-all ${
              filter === "all" 
                ? "bg-primary text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter("premium")}
            className={`px-6 py-2 rounded-full transition-all ${
              filter === "premium" 
                ? "bg-primary text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => setFilter("specialty")}
            className={`px-6 py-2 rounded-full transition-all ${
              filter === "specialty" 
                ? "bg-primary text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            Spécialité
          </button>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="card overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={`${product.name} - Photobooth à louer pour vos événements`}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-primary px-3 py-1 rounded-full text-sm font-medium">
                    {Number(product.price).toFixed(0)}€ / jour
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <ul className="space-y-2 mb-6">
                  {Array.isArray(product.features) && (product.features as string[]).map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <span className="w-2 h-2 bg-accent-coral rounded-full mr-2 mt-1.5"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Link 
                    to={`/booking?product=${product.id}`} 
                    className="btn-primary flex-1"
                  >
                    Réserver
                  </Link>
                  <button 
                    className="btn-outline flex-1"
                  >
                    Détails
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Aucun produit trouvé pour cette catégorie.</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;