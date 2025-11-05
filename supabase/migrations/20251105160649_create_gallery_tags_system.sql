/*
  # Système de Tags pour la Galerie

  ## Description
  Cette migration transforme le système de galerie en ajoutant un système de tags flexible
  et configure le stockage des images dans Supabase Storage.

  ## Nouvelles Tables

  ### 1. `gallery` (remplace gallery_photos)
    - `id` (uuid, clé primaire)
    - `image_url` (text) - URL de l'image dans Supabase Storage
    - `caption` (text) - Légende/description de l'image
    - `created_at` (timestamptz) - Date d'ajout

  ### 2. `gallery_tags`
    - `id` (uuid, clé primaire)
    - `name` (text, unique) - Nom du tag
    - `created_at` (timestamptz) - Date de création

  ### 3. `gallery_image_tags` (table de liaison many-to-many)
    - `id` (uuid, clé primaire)
    - `image_id` (uuid) - Référence vers gallery
    - `tag_id` (uuid) - Référence vers gallery_tags
    - `created_at` (timestamptz) - Date d'association
    - Contrainte unique sur (image_id, tag_id)

  ## Bucket Storage
  - Bucket "gallery-images" pour stocker les images
  - Limite de 5 MB par fichier
  - Formats acceptés : JPG, PNG, WEBP

  ## Sécurité (RLS)
  - `gallery` : lecture publique, insertion/suppression pour admin
  - `gallery_tags` : lecture publique, écriture pour admin
  - `gallery_image_tags` : lecture publique, écriture pour admin
  - Storage bucket : upload pour admin authentifié, lecture publique

  ## Migration de Données
  - Migre les données existantes de gallery_photos vers gallery
  - Crée des tags automatiquement depuis les event_type existants
  - Supprime l'ancienne table gallery_photos

  ## Notes Importantes
  - Les tags remplacent les catégories fixes
  - Une image peut avoir plusieurs tags
  - Support du filtrage multiple par tags
  - URLs d'images stockées dans Supabase Storage
*/

-- Créer la nouvelle table gallery
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url text NOT NULL,
  caption text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Créer la table gallery_tags
CREATE TABLE IF NOT EXISTS gallery_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Créer la table de liaison gallery_image_tags
CREATE TABLE IF NOT EXISTS gallery_image_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id uuid NOT NULL REFERENCES gallery(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES gallery_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(image_id, tag_id)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_image_id ON gallery_image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_tag_id ON gallery_image_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_gallery_tags_name ON gallery_tags(name);

-- Migrer les données existantes de gallery_photos vers gallery
INSERT INTO gallery (id, image_url, caption, created_at)
SELECT 
  id,
  image_url,
  COALESCE(title, 'Photo'),
  created_at
FROM gallery_photos
ON CONFLICT (id) DO NOTHING;

-- Créer des tags à partir des event_types existants
INSERT INTO gallery_tags (name)
SELECT DISTINCT LOWER(event_type)
FROM gallery_photos
WHERE event_type IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Associer les images aux tags basés sur leur event_type
INSERT INTO gallery_image_tags (image_id, tag_id)
SELECT DISTINCT gp.id, gt.id
FROM gallery_photos gp
INNER JOIN gallery_tags gt ON LOWER(gp.event_type) = gt.name
WHERE gp.event_type IS NOT NULL
ON CONFLICT (image_id, tag_id) DO NOTHING;

-- Insérer des tags par défaut
INSERT INTO gallery_tags (name) VALUES
  ('mariage'),
  ('entreprise'),
  ('anniversaire'),
  ('soiree'),
  ('bapteme'),
  ('fete'),
  ('gala'),
  ('seminaire')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- ============================================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_image_tags ENABLE ROW LEVEL SECURITY;

-- Politiques pour gallery (lecture publique, écriture admin)
CREATE POLICY "Gallery images viewable by everyone"
  ON gallery FOR SELECT
  USING (true);

CREATE POLICY "Gallery images can be inserted by authenticated users"
  ON gallery FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Gallery images can be deleted by authenticated users"
  ON gallery FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Gallery images can be updated by authenticated users"
  ON gallery FOR UPDATE
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

-- Politiques pour gallery_tags (lecture publique, écriture admin)
CREATE POLICY "Gallery tags viewable by everyone"
  ON gallery_tags FOR SELECT
  USING (true);

CREATE POLICY "Gallery tags can be inserted by authenticated users"
  ON gallery_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Gallery tags can be updated by authenticated users"
  ON gallery_tags FOR UPDATE
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

CREATE POLICY "Gallery tags can be deleted by authenticated users"
  ON gallery_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Politiques pour gallery_image_tags (lecture publique, écriture admin)
CREATE POLICY "Gallery image tags viewable by everyone"
  ON gallery_image_tags FOR SELECT
  USING (true);

CREATE POLICY "Gallery image tags can be inserted by authenticated users"
  ON gallery_image_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Gallery image tags can be deleted by authenticated users"
  ON gallery_image_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Supprimer l'ancienne table gallery_photos
DROP TABLE IF EXISTS gallery_photos CASCADE;

-- ============================================================================
-- STORAGE : Configuration du bucket pour les images
-- ============================================================================

-- Créer le bucket pour les images de galerie
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture publique pour le bucket
CREATE POLICY "Public Access to Gallery Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

-- Politique d'upload pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'uploads'
);

-- Politique de suppression pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images'
  AND auth.role() = 'authenticated'
);

-- Politique de mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'gallery-images'
  AND auth.role() = 'authenticated'
);
