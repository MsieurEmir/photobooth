import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Shield, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthLabel } from '../../utils/passwordValidator';

const ProfilePage = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const passwordStrength = validatePassword(passwordData.newPassword);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ full_name: profileData.fullName })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSuccess('Profil mis à jour avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setError(passwordStrength.feedback);
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword,
      });

      if (signInError) {
        throw new Error('Mot de passe actuel incorrect');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      setSuccess('Mot de passe changé avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <User className="text-primary" />
          Mon Profil
        </h1>
        <p className="text-gray-600 mt-2">Gérez vos informations personnelles et votre sécurité</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informations Personnelles</h2>
              <p className="text-sm text-gray-600">Modifiez vos informations</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
            </div>

            <div>
              <label htmlFor="fullName" className="label">
                Nom Complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Rôle</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={profile?.role === 'admin' ? 'Administrateur' : 'Staff'}
                  disabled
                  className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <Lock className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Changer le Mot de Passe</h2>
              <p className="text-sm text-gray-600">Mettez à jour votre mot de passe</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="label">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="label">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field pl-10"
                  required
                />
              </div>
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Force du mot de passe:</span>
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
                  <p className="text-xs text-gray-600 mt-1">{passwordStrength.feedback}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Exigences:</strong> 8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <Lock size={20} />
              {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
