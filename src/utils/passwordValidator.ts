export interface PasswordStrength {
  score: number;
  feedback: string;
  isValid: boolean;
}

export const validatePassword = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length < 8) {
    feedback.push('Au moins 8 caractères');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Au moins une majuscule');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Au moins une minuscule');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Au moins un chiffre');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Au moins un caractère spécial');
  } else {
    score += 1;
  }

  const isValid = score === 5;
  const feedbackText = feedback.length > 0 ? feedback.join(', ') : 'Mot de passe fort';

  return {
    score,
    feedback: feedbackText,
    isValid,
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 2) return 'bg-red-500';
  if (score <= 3) return 'bg-orange-500';
  if (score <= 4) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getPasswordStrengthLabel = (score: number): string => {
  if (score <= 2) return 'Faible';
  if (score <= 3) return 'Moyen';
  if (score <= 4) return 'Bon';
  return 'Fort';
};

export const generateSecurePassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()';

  const all = lowercase + uppercase + numbers + special;

  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
};
