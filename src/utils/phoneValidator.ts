export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

export const validatePhone = (phone: string): PhoneValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Le numéro de téléphone est requis'
    };
  }

  const cleanPhone = phone.replace(/[\s.\-()]/g, '');

  if (cleanPhone.startsWith('+33')) {
    const numberPart = cleanPhone.substring(3);

    if (!/^\d{9}$/.test(numberPart)) {
      return {
        isValid: false,
        error: 'Le numéro avec +33 doit contenir exactement 9 chiffres (ex: +33612345678)'
      };
    }

    if (!/^[1-9]/.test(numberPart)) {
      return {
        isValid: false,
        error: 'Le numéro doit commencer par un chiffre entre 1 et 9 après +33'
      };
    }

    const formatted = `+33 ${numberPart.substring(0, 1)} ${numberPart.substring(1, 3)} ${numberPart.substring(3, 5)} ${numberPart.substring(5, 7)} ${numberPart.substring(7, 9)}`;

    return {
      isValid: true,
      formatted
    };
  }

  if (cleanPhone.startsWith('0')) {
    if (!/^\d{10}$/.test(cleanPhone)) {
      return {
        isValid: false,
        error: 'Le numéro français doit contenir exactement 10 chiffres (ex: 0612345678)'
      };
    }

    const prefix = cleanPhone.substring(0, 2);
    const validPrefixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];

    if (!validPrefixes.includes(prefix)) {
      return {
        isValid: false,
        error: 'Le numéro doit commencer par 01, 02, 03, 04, 05, 06, 07, 08 ou 09'
      };
    }

    const formatted = `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 4)} ${cleanPhone.substring(4, 6)} ${cleanPhone.substring(6, 8)} ${cleanPhone.substring(8, 10)}`;

    return {
      isValid: true,
      formatted
    };
  }

  return {
    isValid: false,
    error: 'Le numéro doit commencer par 0 (10 chiffres) ou +33 (9 chiffres). Exemples: 0612345678 ou +33612345678'
  };
};

export const formatPhoneWhileTyping = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s.\-()]/g, '');

  if (cleanPhone.startsWith('+33')) {
    const numberPart = cleanPhone.substring(3);
    let formatted = '+33';

    if (numberPart.length > 0) {
      formatted += ` ${numberPart.substring(0, 1)}`;
    }
    if (numberPart.length > 1) {
      formatted += ` ${numberPart.substring(1, 3)}`;
    }
    if (numberPart.length > 3) {
      formatted += ` ${numberPart.substring(3, 5)}`;
    }
    if (numberPart.length > 5) {
      formatted += ` ${numberPart.substring(5, 7)}`;
    }
    if (numberPart.length > 7) {
      formatted += ` ${numberPart.substring(7, 9)}`;
    }

    return formatted;
  }

  if (cleanPhone.startsWith('0')) {
    let formatted = '';

    if (cleanPhone.length > 0) {
      formatted += cleanPhone.substring(0, 2);
    }
    if (cleanPhone.length > 2) {
      formatted += ` ${cleanPhone.substring(2, 4)}`;
    }
    if (cleanPhone.length > 4) {
      formatted += ` ${cleanPhone.substring(4, 6)}`;
    }
    if (cleanPhone.length > 6) {
      formatted += ` ${cleanPhone.substring(6, 8)}`;
    }
    if (cleanPhone.length > 8) {
      formatted += ` ${cleanPhone.substring(8, 10)}`;
    }

    return formatted;
  }

  return phone;
};
