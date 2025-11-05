import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Key, Trash2, Copy, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { validatePassword, generateSecurePassword, getPasswordStrengthColor, getPasswordStrengthLabel } from '../../utils/passwordValidator';
import type { Database } from '../../types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

const AdminUsersPage = () => {
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const [newUserData, setNewUserData] = useState({
    email: '',
    fullName: '',
    password: '',
  });

  const passwordStrength = validatePassword(newUserData.password);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!passwordStrength.isValid) {
      setError(passwordStrength.feedback);
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: newUserData.email,
            full_name: newUserData.fullName,
            role: 'admin',
          });

        if (profileError) throw profileError;

        setSuccess('Nouvel administrateur créé avec succès');
        setShowAddModal(false);
        setNewUserData({ email: '', fullName: '', password: '' });
        loadUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');

    try {
      const newPassword = generateSecurePassword();

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { password: newPassword }
      );

      if (updateError) throw updateError;

      setTempPassword(newPassword);
      setSuccess('Mot de passe réinitialisé avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe');
      setShowResetModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');

    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        selectedUser.id
      );

      if (deleteError) throw deleteError;

      setSuccess('Administrateur supprimé avec succès');
      setShowDeleteModal(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePassword = () => {
    setNewUserData({ ...newUserData, password: generateSecurePassword() });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-primary" />
            Administrateurs
          </h1>
          <p className="text-gray-600 mt-2">Gérez les comptes administrateurs ({users.length}/2)</p>
        </div>

        {users.length < 2 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={20} />
            Ajouter un Admin
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
        >
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5 mr-3" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start"
        >
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5 mr-3" size={20} />
          <p className="text-green-700 text-sm">{success}</p>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {users.map((admin, index) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{admin.full_name}</h3>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                </div>
              </div>
              {admin.id === currentUser?.id && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Vous
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Rôle:</strong> Administrateur</p>
              <p><strong>Créé le:</strong> {new Date(admin.created_at).toLocaleDateString('fr-FR')}</p>
            </div>

            <div className="flex gap-2">
              {admin.id !== currentUser?.id && (
                <>
                  <button
                    onClick={() => {
                      setSelectedUser(admin);
                      setShowResetModal(true);
                      setTempPassword('');
                    }}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Key size={16} />
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(admin);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 btn-secondary bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </>
              )}
              {admin.id === currentUser?.id && (
                <div className="text-sm text-gray-500 italic text-center w-full py-2">
                  Utilisez "Mon Profil" pour modifier votre mot de passe
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nouvel Administrateur</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">Adresse Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="label">Nom Complet</label>
                  <input
                    type="text"
                    id="fullName"
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">Mot de passe initial</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      className="input-field flex-1"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Générer
                    </button>
                  </div>
                  {newUserData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Force:</span>
                        <span className={`font-medium ${
                          passwordStrength.score <= 2 ? 'text-red-600' :
                          passwordStrength.score <= 3 ? 'text-orange-600' :
                          passwordStrength.score <= 4 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {getPasswordStrengthLabel(passwordStrength.score)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength.score)}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    L'administrateur devra changer ce mot de passe lors de sa première connexion.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowResetModal(false);
              setTempPassword('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Réinitialiser le Mot de Passe</h2>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setTempPassword('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {!tempPassword ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir réinitialiser le mot de passe de{' '}
                    <strong>{selectedUser?.full_name}</strong> ?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowResetModal(false);
                        setTempPassword('');
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
                    >
                      {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800 mb-3">
                      Le mot de passe a été réinitialisé avec succès. Copiez-le et transmettez-le à l'utilisateur de manière sécurisée.
                    </p>
                    <div className="bg-white border border-green-300 rounded-lg p-3 font-mono text-sm break-all">
                      {tempPassword}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyPassword}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copied ? 'Copié!' : 'Copier'}
                    </button>
                    <button
                      onClick={() => {
                        setShowResetModal(false);
                        setTempPassword('');
                      }}
                      className="flex-1 btn-primary"
                    >
                      Fermer
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Supprimer l'Administrateur</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Attention: Cette action est irréversible. Êtes-vous sûr de vouloir supprimer le compte de{' '}
                  <strong>{selectedUser?.full_name}</strong> ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersPage;
