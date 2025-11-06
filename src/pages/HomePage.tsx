import React from 'react';
import SEO from '../components/SEO';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import PhotoboothShowcase from '../components/home/PhotoboothShowcase';
import Testimonials from '../components/home/Testimonials';
import Cta from '../components/home/Cta';

const HomePage = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PixBooth',
    description: 'Location de photobooths professionnels pour tous vos événements: mariages, soirées d\'entreprise, anniversaires et fêtes',
    url: window.location.origin,
    image: `${window.location.origin}/camera.svg`,
    priceRange: '€€',
    telephone: '+33-X-XX-XX-XX-XX',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8566,
      longitude: 2.3522
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127'
    }
  };

  return (
    <>
      <SEO
        title="PixBooth - Location de Photobooth Premium pour vos Événements"
        description="Louez un photobooth premium pour votre mariage, soirée d'entreprise ou événement. Animation originale, souvenirs instantanés et équipement haut de gamme. Devis gratuit."
        keywords="location photobooth, photobooth mariage, photobooth événement, photobooth entreprise, animation mariage, location borne photo, photobooth premium, photobooth Paris"
        url="/"
        structuredData={structuredData}
      />
      <Hero />
      <Features />
      <PhotoboothShowcase />
      <Testimonials />
      <Cta />
    </>
  );
};

export default HomePage;