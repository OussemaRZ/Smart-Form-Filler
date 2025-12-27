// Smart Form Filler - Markdown Parser

/**
 * Parse un document Markdown contenant les informations de l'utilisateur
 * et retourne un objet structuré
 */
function parseMarkdown(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') {
    return { sections: {}, raw: '', flatData: {} };
  }

  const sections = {};
  const flatData = {};
  let currentSection = 'general';

  sections[currentSection] = [];

  const lines = markdownText.split('\n');

  for (let line of lines) {
    line = line.trim();

    // Ignorer les lignes vides
    if (!line) continue;

    // Détection des sections (## Titre)
    if (line.startsWith('## ')) {
      currentSection = line.substring(3).trim().toLowerCase();
      sections[currentSection] = [];
      continue;
    }

    // Détection des titres principaux (# Titre) - ignorer
    if (line.startsWith('# ')) {
      continue;
    }

    // Détection des listes à puces (- clé : valeur)
    if (line.startsWith('- ')) {
      const content = line.substring(2).trim();
      const colonIndex = content.indexOf(':');

      if (colonIndex > 0) {
        const key = content.substring(0, colonIndex).trim();
        const value = content.substring(colonIndex + 1).trim();

        if (value) {
          const dataEntry = { key, value };
          sections[currentSection].push(dataEntry);

          // Créer une version aplatie pour un accès facile
          const flatKey = `${currentSection}.${normalizeKey(key)}`;
          flatData[flatKey] = value;

          // Ajouter aussi sans le préfixe de section pour recherche générique
          flatData[normalizeKey(key)] = value;
        }
      }
    }
  }

  return {
    sections,
    flatData,
    raw: markdownText
  };
}

/**
 * Normalise une clé pour faciliter la recherche
 */
function normalizeKey(key) {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '_') // Remplacer les caractères spéciaux par _
    .replace(/^_+|_+$/g, ''); // Supprimer les _ au début et à la fin
}

/**
 * Recherche une valeur dans les données parsées en utilisant des mots-clés
 */
function searchValue(parsedData, keywords) {
  if (!parsedData || !parsedData.flatData) {
    return null;
  }

  const normalizedKeywords = keywords.map(k => normalizeKey(k));

  // Rechercher une correspondance exacte
  for (const keyword of normalizedKeywords) {
    if (parsedData.flatData[keyword]) {
      return parsedData.flatData[keyword];
    }
  }

  // Rechercher une correspondance partielle
  for (const keyword of normalizedKeywords) {
    for (const [key, value] of Object.entries(parsedData.flatData)) {
      if (key.includes(keyword) || keyword.includes(key)) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Obtient toutes les données sous forme de texte structuré
 * (utile pour envoyer à l'IA)
 */
function getStructuredText(parsedData) {
  if (!parsedData || !parsedData.sections) {
    return '';
  }

  let text = '';

  for (const [sectionName, entries] of Object.entries(parsedData.sections)) {
    if (entries.length === 0) continue;

    text += `${sectionName.toUpperCase()}:\n`;

    for (const entry of entries) {
      text += `  - ${entry.key}: ${entry.value}\n`;
    }

    text += '\n';
  }

  return text;
}

/**
 * Obtient un résumé des informations disponibles
 */
function getSummary(parsedData) {
  if (!parsedData || !parsedData.sections) {
    return { sections: 0, fields: 0 };
  }

  const sectionCount = Object.keys(parsedData.sections).length;
  let fieldCount = 0;

  for (const entries of Object.values(parsedData.sections)) {
    fieldCount += entries.length;
  }

  return {
    sections: sectionCount,
    fields: fieldCount
  };
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseMarkdown,
    searchValue,
    getStructuredText,
    getSummary,
    normalizeKey
  };
}
