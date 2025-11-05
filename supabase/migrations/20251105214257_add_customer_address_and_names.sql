/*
  # Ajout des colonnes prénom, nom et adresse à la table customers

  ## Description
  Cette migration ajoute les colonnes first_name, last_name et address à la table customers
  pour une meilleure gestion des données clients. La colonne 'name' existante est conservée
  pour la compatibilité avec les données existantes.

  ## Modifications
  
  ### Table `customers`
    - Ajout de `first_name` (text) - Prénom du client
    - Ajout de `last_name` (text) - Nom de famille du client
    - Ajout de `address` (text, nullable) - Adresse du client

  ## Notes Importantes
  - Les colonnes sont ajoutées de manière sûre avec IF NOT EXISTS
  - La colonne 'name' existante est conservée pour éviter toute perte de données
  - L'adresse est nullable car elle n'est pas toujours disponible pour tous les clients existants
*/

-- Ajouter la colonne first_name si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN first_name text;
  END IF;
END $$;

-- Ajouter la colonne last_name si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_name text;
  END IF;
END $$;

-- Ajouter la colonne address si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'address'
  ) THEN
    ALTER TABLE customers ADD COLUMN address text;
  END IF;
END $$;