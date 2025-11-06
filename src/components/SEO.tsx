import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'PixBooth - Location de Photobooth',
  description = 'Location de photobooths pour vos événements, mariages, soirées d\'entreprise. Créez des souvenirs inoubliables avec PixBooth.',
  keywords = 'photobooth, location photobooth, mariage, événement, soirée entreprise, animation',
  image = '/camera.svg',
  url = '',
  type = 'website',
  noindex = false,
  structuredData
}) => {
  const baseUrl = window.location.origin;
  const fullUrl = url ? `${baseUrl}${url}` : window.location.href;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PixBooth',
    description: 'Location de photobooths professionnels pour tous vos événements',
    url: baseUrl,
    logo: `${baseUrl}/camera.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-X-XX-XX-XX-XX',
      contactType: 'customer service',
      availableLanguage: 'French'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR'
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="PixBooth" />
      <meta property="og:locale" content="fr_FR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      <meta name="theme-color" content="#FF6B6B" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {!structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(defaultStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
