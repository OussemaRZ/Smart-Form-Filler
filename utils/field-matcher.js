// Smart Form Filler - Field Matcher

/**
 * Fait correspondre les champs avec les données utilisateur
 * (utilisé en fallback si Gemini échoue)
 */
function matchFieldsToData(fields, parsedUserData) {
  if (!fields || !parsedUserData || !parsedUserData.flatData) {
    return {};
  }

  const mapping = {};

  for (const field of fields) {
    const value = findBestMatch(field, parsedUserData);

    if (value !== null && value !== undefined && value !== '') {
      mapping[field.uniqueId] = value;
    }
  }

  return mapping;
}

/**
 * Trouve la meilleure correspondance pour un champ
 */
function findBestMatch(field, parsedUserData) {
  // Stratégie 1: Correspondance par type détecté
  const typeMatch = matchByDetectedType(field.detectedType, parsedUserData);
  if (typeMatch) return typeMatch;

  // Stratégie 2: Correspondance par label
  if (field.label) {
    const labelMatch = matchByKeywords(field.label, parsedUserData);
    if (labelMatch) return labelMatch;
  }

  // Stratégie 3: Correspondance par name
  if (field.name) {
    const nameMatch = matchByKeywords(field.name, parsedUserData);
    if (nameMatch) return nameMatch;
  }

  // Stratégie 4: Correspondance par placeholder
  if (field.placeholder) {
    const placeholderMatch = matchByKeywords(field.placeholder, parsedUserData);
    if (placeholderMatch) return placeholderMatch;
  }

  // Stratégie 5: Correspondance par contexte
  if (field.context) {
    const contextMatch = matchByKeywords(field.context, parsedUserData);
    if (contextMatch) return contextMatch;
  }

  return null;
}

/**
 * Correspondance par type détecté
 */
function matchByDetectedType(detectedType, parsedUserData) {
  const typeMapping = {
    'email': ['email', 'e-mail', 'courriel', 'mail'],
    'phone': ['telephone', 'phone', 'mobile', 'tel', 'portable'],
    'firstname': ['prenom', 'firstname', 'first_name'],
    'lastname': ['nom', 'lastname', 'last_name', 'surname'],
    'fullname': ['nom_complet', 'fullname', 'full_name', 'name'],
    'birthdate': ['date_de_naissance', 'date_naissance', 'birthdate', 'birth_date', 'dob'],
    'address': ['adresse', 'address', 'rue', 'street', 'adresse_complete'],
    'city': ['ville', 'city'],
    'postalcode': ['code_postal', 'postal_code', 'zip_code', 'zip'],
    'country': ['pays', 'country'],
    'company': ['societe', 'company', 'entreprise', 'organization'],
    'jobtitle': ['poste', 'job_title', 'profession', 'position']
  };

  const keywords = typeMapping[detectedType];
  if (!keywords) return null;

  for (const keyword of keywords) {
    if (parsedUserData.flatData[keyword]) {
      return parsedUserData.flatData[keyword];
    }
  }

  return null;
}

/**
 * Correspondance par mots-clés
 */
function matchByKeywords(text, parsedUserData) {
  if (!text) return null;

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  // Chercher une correspondance exacte
  if (parsedUserData.flatData[normalized]) {
    return parsedUserData.flatData[normalized];
  }

  // Chercher dans les mots individuels
  for (const word of words) {
    if (word.length < 3) continue; // Ignorer les mots trop courts

    if (parsedUserData.flatData[word]) {
      return parsedUserData.flatData[word];
    }

    // Chercher des correspondances partielles
    for (const [key, value] of Object.entries(parsedUserData.flatData)) {
      if (key.includes(word) || word.includes(key)) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Normalise un texte pour la comparaison
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '_') // Remplacer les caractères spéciaux
    .replace(/^_+|_+$/g, ''); // Supprimer les _ au début/fin
}

/**
 * Valide et formate une valeur selon le type de champ
 */
function validateAndFormatValue(value, fieldType, detectedType) {
  if (!value) return value;

  const stringValue = String(value).trim();

  switch (detectedType) {
    case 'email':
      return validateEmail(stringValue) ? stringValue : null;

    case 'phone':
      return formatPhone(stringValue);

    case 'postalcode':
      return formatPostalCode(stringValue);

    case 'date':
    case 'birthdate':
      return formatDate(stringValue);

    default:
      return stringValue;
  }
}

/**
 * Valide un email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formate un numéro de téléphone
 */
function formatPhone(phone) {
  // Garder uniquement les chiffres et le +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Si le numéro commence par 0 et qu'il n'y a pas de +, essayer d'ajouter +33 pour la France
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+33' + cleaned.substring(1);
  }

  return cleaned;
}

/**
 * Formate un code postal
 */
function formatPostalCode(postalCode) {
  // Garder uniquement les chiffres
  return postalCode.replace(/\D/g, '');
}

/**
 * Formate une date
 */
function formatDate(dateString) {
  // Essayer de parser différents formats de date
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})-(\d{2})-(\d{4})/ // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      // Retourner au format YYYY-MM-DD pour les inputs de type date
      if (format === formats[0] || format === formats[2]) {
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
      return dateString;
    }
  }

  return dateString;
}

/**
 * Calcule un score de confiance pour un matching
 */
function calculateConfidenceScore(field, value, matchMethod) {
  let score = 0;

  // Bonus selon la méthode de matching
  const methodScores = {
    'detectedType': 0.9,
    'label': 0.8,
    'name': 0.7,
    'placeholder': 0.6,
    'context': 0.5
  };

  score = methodScores[matchMethod] || 0.5;

  // Bonus si la valeur n'est pas vide
  if (value && value.length > 0) {
    score += 0.1;
  }

  // Malus si le champ est optionnel et qu'on n'est pas sûr
  if (!field.required && score < 0.7) {
    score *= 0.8;
  }

  return Math.min(score, 1.0);
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    matchFieldsToData,
    findBestMatch,
    validateAndFormatValue,
    calculateConfidenceScore
  };
}
