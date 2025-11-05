/*
  # Ajout de la Colonne Color aux Tags de Galerie

  ## Description
  Cette migration ajoute une colonne 'color' à la table gallery_tags pour permettre
  l'assignation de couleurs personnalisées à chaque tag. Les tags existants recevront
  des couleurs par défaut attrayantes.

  ## Modifications
  1. Ajout de la colonne `color` (text) à gallery_tags
     - Stocke les couleurs au format hexadécimal (ex: #3B82F6)
     - Valeur par défaut: #6B7280 (gris neutre)
  
  2. Attribution de couleurs par défaut aux tags existants
     - Palette de couleurs vives et professionnelles
     - Couleurs bien contrastées pour une meilleure lisibilité

  ## Palette de Couleurs
  - Bleu: #3B82F6 (événements entreprise/professionnels)
  - Rose: #EC4899 (mariages/anniversaires)
  - Violet: #8B5CF6 (soirées/galas)
  - Vert: #10B981 (baptêmes/cérémonies)
  - Orange: #F59E0B (fêtes)
  - Rouge: #EF4444 (événements spéciaux)
  - Cyan: #06B6D4 (séminaires)
  - Indigo: #6366F1 (autres événements)
*/

-- Ajouter la colonne color à gallery_tags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_tags' AND column_name = 'color'
  ) THEN
    ALTER TABLE gallery_tags ADD COLUMN color text DEFAULT '#6B7280' NOT NULL;
  END IF;
END $$;

-- Assigner des couleurs par défaut aux tags existants basés sur leur nom
UPDATE gallery_tags
SET color = CASE 
  WHEN name ILIKE '%entreprise%' OR name ILIKE '%business%' OR name ILIKE '%corporate%' THEN '#3B82F6'
  WHEN name ILIKE '%mariage%' OR name ILIKE '%wedding%' THEN '#EC4899'
  WHEN name ILIKE '%soiree%' OR name ILIKE '%soirée%' OR name ILIKE '%party%' OR name ILIKE '%gala%' THEN '#8B5CF6'
  WHEN name ILIKE '%bapteme%' OR name ILIKE '%baptême%' OR name ILIKE '%baptism%' THEN '#10B981'
  WHEN name ILIKE '%anniversaire%' OR name ILIKE '%birthday%' THEN '#F59E0B'
  WHEN name ILIKE '%fete%' OR name ILIKE '%fête%' OR name ILIKE '%celebration%' THEN '#EF4444'
  WHEN name ILIKE '%seminaire%' OR name ILIKE '%séminaire%' OR name ILIKE '%seminar%' THEN '#06B6D4'
  ELSE '#6366F1'
END
WHERE color = '#6B7280';
