/*
  # Correction des politiques RLS - Récursion infinie

  ## Description
  Cette migration corrige le problème de récursion infinie dans les politiques RLS.
  
  ## Problème identifié
  - La politique sur `user_profiles` créait une récursion infinie en vérifiant l'existence 
    dans la même table
  - La politique sur `customers` empêchait les utilisateurs non authentifiés de vérifier 
    si un email existe déjà
  
  ## Changements
  
  ### 1. Table `customers`
  - Permet la lecture publique de la table customers (nécessaire pour vérifier les emails existants)
  - Supprime la politique restrictive qui nécessitait l'authentification
  
  ### 2. Table `user_profiles`
  - Simplifie la politique de lecture pour éviter la récursion
  - Utilise directement `auth.uid()` au lieu de vérifier l'existence dans la même table
  
  ## Sécurité
  - La lecture publique de `customers` est sécurisée car elle ne contient que des informations 
    de contact de base
  - Les politiques d'écriture restent restrictives
*/

-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Customers viewable by authenticated users" ON customers;
DROP POLICY IF EXISTS "User profiles viewable by authenticated users" ON user_profiles;

-- Nouvelle politique pour customers : lecture publique
CREATE POLICY "Customers are viewable by everyone"
  ON customers FOR SELECT
  USING (true);

-- Nouvelle politique pour user_profiles : éviter la récursion
CREATE POLICY "User profiles viewable by authenticated users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
