/*
  # Ajout de la visibilité publique/privée pour les images de galerie

  ## Description
  Cette migration ajoute la possibilité de marquer des images de galerie comme publiques ou privées.
  Les images privées ne seront pas visibles sur la page galerie publique, mais resteront accessibles 
  dans l'interface d'administration.

  ## Changements

  1. Nouvelle Colonne
    - `gallery.is_public` (boolean, default: true)
      - true = image visible publiquement
      - false = image visible uniquement dans l'admin

  ## Notes Importantes
  - Toutes les images existantes seront automatiquement marquées comme publiques (is_public = true)
  - La valeur par défaut pour les nouvelles images est "public" (true)
  - Cette colonne ne nécessite pas de modification des politiques RLS existantes
  - Les administrateurs peuvent voir toutes les images indépendamment de leur statut de visibilité
*/

-- Add is_public column to gallery table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE gallery ADD COLUMN is_public boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Add index for better query performance on public images
CREATE INDEX IF NOT EXISTS idx_gallery_is_public ON gallery(is_public);

-- Add comment to document the column
COMMENT ON COLUMN gallery.is_public IS 'Détermine si l''image est visible publiquement (true) ou uniquement dans l''admin (false). Par défaut: true (public).';