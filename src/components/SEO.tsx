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
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'PixBooth - Location de Photobooth',
  description = 'Location de photobooths pour vos événements, mariages, soirées d\'entreprise. Créez des souvenirs inoubliables avec PixBooth.',
  keywords = 'photobooth, location photobooth, mariage, événement, soirée entreprise, animation',
  image = '/camera.svg',
  url = '',
  type = 'website',
  noindex = false,
  structuredData,
  author = 'PixBooth',
  publishedTime,
  modifiedTime
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
    },
    sameAs: [
      'https://www.facebook.com/pixbooth',
      'https://www.instagram.com/pixbooth',
      'https://www.twitter.com/pixbooth',
      'https://www.linkedin.com/company/pixbooth'
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}

      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="PixBooth" />
      <meta property="og:locale" content="fr_FR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@pixbooth" />
      <meta name="twitter:creator" content="@pixbooth" />

      <meta name="theme-color" content="#FF6B6B" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="PixBooth" />
      <meta name="mobile-web-app-capable" content="yes" />

      <meta name="author" content={author} />
      <meta name="copyright" content="PixBooth © 2025" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      <meta name="geo.region" content="FR" />
      <meta name="geo.placename" content="Paris" />

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
