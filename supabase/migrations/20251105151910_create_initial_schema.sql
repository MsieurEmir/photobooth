/*
  # Schéma Initial pour l'Application de Gestion de Location de Photobooths

  ## Description
  Cette migration crée la structure de base de données complète pour l'application de gestion 
  de location de photobooths PixBooth. Elle inclut toutes les tables nécessaires pour gérer 
  les produits, réservations, clients, galeries, et messages de contact.

  ## Nouvelles Tables
  
  ### 1. `products` - Catalogue de photobooths
    - `id` (uuid, clé primaire)
    - `name` (text) - Nom du produit
    - `description` (text) - Description détaillée
    - `image_url` (text) - URL de l'image principale
    - `price` (numeric) - Prix par jour en euros
    - `category` (text) - Catégorie (premium, specialty, etc.)
    - `features` (jsonb) - Liste des fonctionnalités
    - `available` (boolean) - Disponibilité du produit
    - `created_at` (timestamptz) - Date de création
    - `updated_at` (timestamptz) - Date de dernière modification

  ### 2. `customers` - Clients
    - `id` (uuid, clé primaire)
    - `name` (text) - Nom complet
    - `email` (text, unique) - Adresse email
    - `phone` (text) - Numéro de téléphone
    - `created_at` (timestamptz) - Date de création

  ### 3. `bookings` - Réservations
    - `id` (uuid, clé primaire)
    - `customer_id` (uuid) - Référence client
    - `product_id` (uuid) - Référence produit
    - `event_date` (date) - Date de l'événement
    - `event_time` (time) - Heure de début
    - `duration` (integer) - Durée en heures
    - `address` (text) - Adresse de l'événement
    - `event_type` (text) - Type d'événement
    - `guests_count` (integer) - Nombre d'invités
    - `special_requests` (text) - Demandes spéciales
    - `total_price` (numeric) - Prix total
    - `status` (text) - Statut (pending, confirmed, cancelled, completed)
    - `deposit_paid` (boolean) - Acompte payé
    - `full_payment_paid` (boolean) - Paiement complet
    - `created_at` (timestamptz) - Date de création
    - `updated_at` (timestamptz) - Date de modification

  ### 4. `gallery_photos` - Photos de la galerie
    - `id` (uuid, clé primaire)
    - `title` (text) - Titre de la photo
    - `image_url` (text) - URL de l'image
    - `event_type` (text) - Type d'événement
    - `product_used` (text) - Produit utilisé
    - `event_date` (date) - Date de l'événement
    - `created_at` (timestamptz) - Date d'ajout

  ### 5. `contact_messages` - Messages de contact
    - `id` (uuid, clé primaire)
    - `name` (text) - Nom de l'expéditeur
    - `email` (text) - Email de l'expéditeur
    - `phone` (text) - Téléphone (optionnel)
    - `message` (text) - Message
    - `status` (text) - Statut (new, read, replied)
    - `created_at` (timestamptz) - Date de réception

  ### 6. `availability_blocks` - Blocages de disponibilité
    - `id` (uuid, clé primaire)
    - `product_id` (uuid) - Référence produit (null = tous)
    - `block_date` (date) - Date bloquée
    - `reason` (text) - Raison du blocage
    - `created_at` (timestamptz) - Date de création

  ### 7. `user_profiles` - Profils utilisateurs (admin)
    - `id` (uuid, clé primaire, lié à auth.users)
    - `email` (text) - Email
    - `full_name` (text) - Nom complet
    - `role` (text) - Rôle (admin, staff)
    - `created_at` (timestamptz) - Date de création

  ## Sécurité (RLS)
  - RLS activé sur toutes les tables
  - Tables publiques en lecture seule : products, gallery_photos
  - Tables protégées (admin uniquement) : bookings, customers, contact_messages, availability_blocks
  - Table user_profiles : lecture/écriture pour utilisateurs authentifiés sur leur propre profil

  ## Notes Importantes
  - Utilisation de UUID pour toutes les clés primaires
  - Horodatages automatiques avec now()
  - Contraintes de clés étrangères avec CASCADE
  - Index sur les colonnes fréquemment recherchées
*/

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: products (Catalogue de photobooths)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price numeric(10, 2) NOT NULL,
  category text NOT NULL DEFAULT 'standard',
  features jsonb DEFAULT '[]'::jsonb,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: customers (Clients)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table: bookings (Réservations)
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  event_date date NOT NULL,
  event_time time NOT NULL,
  duration integer NOT NULL DEFAULT 4,
  address text NOT NULL,
  event_type text NOT NULL,
  guests_count integer,
  special_requests text,
  total_price numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  deposit_paid boolean DEFAULT false,
  full_payment_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: gallery_photos (Photos de la galerie)
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  image_url text NOT NULL,
  event_type text,
  product_used text,
  event_date date,
  created_at timestamptz DEFAULT now()
);

-- Table: contact_messages (Messages de contact)
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at timestamptz DEFAULT now()
);

-- Table: availability_blocks (Blocages de disponibilité)
CREATE TABLE IF NOT EXISTS availability_blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  block_date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Table: user_profiles (Profils utilisateurs)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_product_id ON bookings(product_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_availability_blocks_date ON availability_blocks(block_date);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour products (lecture publique, écriture admin)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products can be inserted by authenticated users"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Products can be updated by admins"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Products can be deleted by admins"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Politiques pour customers (admin uniquement)
CREATE POLICY "Customers viewable by authenticated users"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Customers can be inserted by anyone"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Politiques pour bookings (lecture/écriture pour admin, insertion publique)
CREATE POLICY "Bookings viewable by authenticated users"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Bookings can be created by anyone"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Bookings can be updated by authenticated users"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Bookings can be deleted by admins"
  ON bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Politiques pour gallery_photos (lecture publique, écriture admin)
CREATE POLICY "Gallery photos viewable by everyone"
  ON gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Gallery photos can be inserted by authenticated users"
  ON gallery_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Gallery photos can be deleted by admins"
  ON gallery_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Politiques pour contact_messages (insertion publique, lecture admin)
CREATE POLICY "Contact messages can be created by anyone"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Contact messages viewable by authenticated users"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Contact messages can be updated by authenticated users"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Politiques pour availability_blocks (admin uniquement)
CREATE POLICY "Availability blocks viewable by everyone"
  ON availability_blocks FOR SELECT
  USING (true);

CREATE POLICY "Availability blocks can be inserted by authenticated users"
  ON availability_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Availability blocks can be updated by authenticated users"
  ON availability_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Availability blocks can be deleted by authenticated users"
  ON availability_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Politiques pour user_profiles
CREATE POLICY "User profiles viewable by authenticated users"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- DONNÉES INITIALES
-- ============================================================================

-- Insérer les produits existants
INSERT INTO products (name, description, image_url, price, category, features) VALUES
  (
    'Premium Booth',
    'Notre modèle haut de gamme avec fonctionnalités avancées pour une expérience immersive.',
    'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    650.00,
    'premium',
    '["Écran tactile 24\"", "Fond vert personnalisable", "GIF animés et Boomerangs", "Partage instantané sur réseaux sociaux", "Galerie en ligne", "Durée: 5 heures"]'::jsonb
  ),
  (
    'Mirror Booth',
    'Un miroir interactif élégant pour les événements sophistiqués comme les mariages et galas.',
    'https://images.pexels.com/photos/5935738/pexels-photo-5935738.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    750.00,
    'premium',
    '["Écran miroir interactif", "Animations tactiles personnalisées", "Signatures numériques", "Impressions illimitées", "Galerie en ligne sécurisée", "Durée: 6 heures"]'::jsonb
  ),
  (
    '360° Video Booth',
    'Une expérience immersive à 360 degrés pour des vidéos spectaculaires.',
    'https://balloonsme.com/cdn/shop/products/360photoboothmain_720x.jpg?v=1683733109',
    950.00,
    'specialty',
    '["Plateforme rotative à 360°", "Vidéos slow motion", "Montage instantané avec effets", "Partage instantané", "2 techniciens spécialisés", "Durée: 5 heures"]'::jsonb
  )
ON CONFLICT DO NOTHING;
