export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.fr',
  'outlook.com',
  'live.fr',
  'live.com',
  'hotmail.fr',
  'hotmail.com',
  'yahoo.fr',
  'yahoo.com',
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
  'sfr.fr',
  'laposte.net',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'aol.com',
  'aol.fr',
  'gmx.fr',
  'gmx.com',
  'msn.com',
  'bouygtel.fr',
  'bbox.fr',
  'club-internet.fr',
  'numericable.fr',
  'neuf.fr',
  'aliceadsl.fr',
  'cegetel.net',
  'tele2.fr',
  'mail.com',
  'yandex.com',
  'zoho.com'
];

const BLOCKED_PATTERNS = [
  /^[a-z]{2,4}@[a-z]{5,15}\.(fr|com)$/i,
  /test@test\./i,
  /admin@admin\./i,
  /example@example\./i,
  /fake@fake\./i,
  /demo@demo\./i
];

export const validateEmail = (email: string): EmailValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'L\'adresse email est requise'
    };
  }

  const trimmedEmail = email.trim().toLowerCase();

  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Veuillez entrer une adresse email valide'
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmedEmail)) {
      return {
        isValid: false,
        error: 'Cette adresse email semble fictive. Veuillez utiliser une adresse email réelle'
      };
    }
  }

  const emailParts = trimmedEmail.split('@');
  if (emailParts.length !== 2) {
    return {
      isValid: false,
      error: 'Format d\'email invalide'
    };
  }

  const [localPart, domainPart] = emailParts;

  if (localPart.length === 0 || localPart.length > 64) {
    return {
      isValid: false,
      error: 'La partie avant @ est invalide'
    };
  }

  if (domainPart.length === 0 || domainPart.length > 255) {
    return {
      isValid: false,
      error: 'Le domaine email est invalide'
    };
  }

  const domain = domainPart.toLowerCase();

  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: true
    };
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return {
      isValid: false,
      error: 'Le domaine email est invalide'
    };
  }

  const tld = domainParts[domainParts.length - 1];
  const validTLDs = ['com', 'fr', 'org', 'net', 'eu', 'be', 'ch', 'de', 'es', 'it', 'uk', 'ca', 'us'];

  if (!validTLDs.includes(tld)) {
    return {
      isValid: false,
      error: 'L\'extension du domaine n\'est pas reconnue. Utilisez un fournisseur d\'email connu (Gmail, Outlook, etc.)'
    };
  }

  const mainDomain = domainParts[domainParts.length - 2];
  if (mainDomain.length < 2) {
    return {
      isValid: false,
      error: 'Le domaine email est trop court'
    };
  }

  if (domainParts.length === 2 && mainDomain.length < 4) {
    return {
      isValid: false,
      error: 'Ce domaine email semble invalide. Veuillez utiliser un fournisseur d\'email reconnu (Gmail, Outlook, Yahoo, Orange, Free, etc.)'
    };
  }

  const suspiciousPatterns = [
    /^[a-z]{2,3}$/i,
    /^test/i,
    /^fake/i,
    /^demo/i,
    /^example/i,
    /^\d+$/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(mainDomain)) {
      return {
        isValid: false,
        error: 'Cette adresse email semble fictive. Veuillez utiliser une adresse email réelle'
      };
    }
  }

  return {
    isValid: true
  };
};

export const getSuggestedDomains = (): string[] => {
  return [
    'gmail.com',
    'outlook.fr',
    'outlook.com',
    'live.fr',
    'hotmail.fr',
    'yahoo.fr',
    'orange.fr',
    'free.fr',
    'laposte.net',
    'icloud.com'
  ];
};
