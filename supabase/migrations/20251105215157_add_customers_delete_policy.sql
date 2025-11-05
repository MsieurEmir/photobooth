/*
  # Ajout de la politique de suppression pour les clients

  ## Description
  Cette migration ajoute une politique RLS permettant aux administrateurs authentifiés
  de supprimer des clients de la base de données.

  ## Modifications
  
  ### Politiques RLS `customers`
    - Ajout de la politique DELETE pour permettre aux admins de supprimer des clients

  ## Notes Importantes
  - Seuls les utilisateurs authentifiés avec le rôle admin peuvent supprimer des clients
  - La suppression d'un client supprimera également toutes ses réservations (CASCADE)
*/

-- Politique pour permettre la suppression des clients par les admins
CREATE POLICY "Customers can be deleted by admins"
  ON customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );