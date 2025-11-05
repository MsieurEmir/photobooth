/*
  # Ajout des montants de paiement

  ## Description
  Cette migration ajoute des colonnes pour enregistrer les montants réellement payés
  pour les acomptes et les paiements complets.

  ## Modifications

  ### Table `bookings` - Nouveaux champs
    - `deposit_amount` (numeric) - Montant de l'acompte payé (par défaut 0)
    - `paid_amount` (numeric) - Montant total payé (par défaut 0)

  ## Notes
  - Les champs sont de type numeric(10,2) pour gérer les montants en euros avec centimes
  - Les valeurs par défaut sont 0 pour éviter les valeurs NULL
  - Ces champs permettent de suivre précisément les paiements reçus
*/

-- Ajouter les colonnes de montants de paiement à la table bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE bookings ADD COLUMN deposit_amount numeric(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE bookings ADD COLUMN paid_amount numeric(10, 2) DEFAULT 0;
  END IF;
END $$;
