/*
  # Ajouter une politique de suppression pour les messages de contact

  ## Description
  Cette migration ajoute une politique RLS permettant aux utilisateurs authentifiés
  de supprimer des messages de contact.

  ## Modifications

  ### Politiques RLS
  - Ajoute une politique DELETE sur `contact_messages` pour les utilisateurs authentifiés

  ## Sécurité
  - Seuls les utilisateurs authentifiés (admin/staff) peuvent supprimer des messages
  - Cohérent avec les autres politiques sur cette table

  ## Notes
  - Cette politique permet une meilleure gestion des messages depuis l'interface admin
*/

-- Politique de suppression pour contact_messages
CREATE POLICY "Contact messages can be deleted by authenticated users"
  ON contact_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );
