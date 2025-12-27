// Smart Form Filler - Field Detector

/**
 * Détecte tous les champs de formulaire sur la page
 * et retourne leurs métadonnées avec détection intelligente du type
 */
function detectFields() {
  const fields = [];

  // Sélectionner tous les champs de formulaire visibles
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]):not([type="file"])');
  const textareas = document.querySelectorAll('textarea');
  const selects = document.querySelectorAll('select');

  // Traiter les inputs
  inputs.forEach((input, index) => {
    if (!isVisible(input)) return;

    const fieldInfo = extractFieldInfo(input, 'input', index);
    if (fieldInfo) {
      fields.push(fieldInfo);
    }
  });

  // Traiter les textareas
  textareas.forEach((textarea, index) => {
    if (!isVisible(textarea)) return;

    const fieldInfo = extractFieldInfo(textarea, 'textarea', index);
    if (fieldInfo) {
      fields.push(fieldInfo);
    }
  });

  // Traiter les selects
  selects.forEach((select, index) => {
    if (!isVisible(select)) return;

    const fieldInfo = extractFieldInfo(select, 'select', index);
    if (fieldInfo) {
      fields.push(fieldInfo);
    }
  });

  return fields;
}

/**
 * Vérifie si un élément est visible
 */
function isVisible(element) {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0' &&
         element.offsetParent !== null;
}

/**
 * Extrait les informations d'un champ
 */
function extractFieldInfo(element, elementType, index) {
  // Générer un identifiant unique
  const uniqueId = element.id || element.name || `${elementType}_${index}_${Date.now()}`;

  // Obtenir le label associé
  const label = getFieldLabel(element);

  // Obtenir le placeholder
  const placeholder = element.placeholder || '';

  // Obtenir le type
  const type = element.type || elementType;

  // Obtenir le name et id
  const name = element.name || '';
  const id = element.id || '';

  // Pour les select, obtenir les options
  let options = [];
  if (elementType === 'select') {
    options = Array.from(element.options).map(option => ({
      value: option.value,
      text: option.text
    }));
  }

  // Détection intelligente du type
  const detectedType = detectFieldType(element, label, placeholder, name, id, type);

  // Obtenir les attributs HTML5 de validation
  const required = element.required || element.hasAttribute('required');
  const pattern = element.pattern || '';
  const maxLength = element.maxLength > 0 ? element.maxLength : null;

  // Obtenir le contexte (texte autour du champ)
  const context = getFieldContext(element);

  return {
    uniqueId,
    elementType,
    label,
    placeholder,
    name,
    id,
    type,
    detectedType,
    options,
    required,
    pattern,
    maxLength,
    context,
    value: element.value || '',
    // Stocker la référence pour le remplissage (en utilisant un attribut data)
    selector: generateSelector(element, uniqueId)
  };
}

/**
 * Obtient le label associé à un champ
 */
function getFieldLabel(element) {
  // Chercher un label avec attribut for
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent.trim();
  }

  // Chercher un label parent
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return parentLabel.textContent.replace(element.textContent, '').trim();
  }

  // Chercher un label précédent
  const prevLabel = element.previousElementSibling;
  if (prevLabel && prevLabel.tagName === 'LABEL') {
    return prevLabel.textContent.trim();
  }

  // Chercher dans les éléments précédents proches
  let prev = element.previousElementSibling;
  let attempts = 0;
  while (prev && attempts < 3) {
    if (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV') {
      const text = prev.textContent.trim();
      if (text.length > 0 && text.length < 100) {
        return text;
      }
    }
    prev = prev.previousElementSibling;
    attempts++;
  }

  return '';
}

/**
 * Obtient le contexte autour du champ (texte proche)
 */
function getFieldContext(element) {
  const parent = element.parentElement;
  if (!parent) return '';

  const text = parent.textContent.replace(element.value, '').trim();
  return text.length < 200 ? text : text.substring(0, 200) + '...';
}

/**
 * Détecte intelligemment le type d'un champ
 */
function detectFieldType(element, label, placeholder, name, id, type) {
  const allText = `${label} ${placeholder} ${name} ${id}`.toLowerCase();

  // Email
  if (type === 'email' || /e-?mail|courriel|mail/.test(allText)) {
    return 'email';
  }

  // Téléphone
  if (type === 'tel' || /t[eé]l[eé]phone|phone|mobile|portable|cell/.test(allText)) {
    return 'phone';
  }

  // Date de naissance
  if (type === 'date' || /date.*naissance|birth.*date|dob|n[ée].*le|birthday/.test(allText)) {
    return 'birthdate';
  }

  // Date générique
  if (type === 'date' || /date/.test(allText)) {
    return 'date';
  }

  // Nom
  if (/^(nom|lastname|surname|family.*name)(?!.*pr[ée]nom)/i.test(allText)) {
    return 'lastname';
  }

  // Prénom
  if (/pr[ée]nom|firstname|given.*name|first.*name/.test(allText)) {
    return 'firstname';
  }

  // Nom complet
  if (/nom.*complet|full.*name|your.*name|name/.test(allText)) {
    return 'fullname';
  }

  // Adresse
  if (/adresse|address|street|rue/.test(allText)) {
    return 'address';
  }

  // Code postal
  if (/code.*postal|postal.*code|zip.*code|zip/.test(allText)) {
    return 'postalcode';
  }

  // Ville
  if (/ville|city/.test(allText)) {
    return 'city';
  }

  // Pays
  if (/pays|country|nation/.test(allText)) {
    return 'country';
  }

  // Société/Entreprise
  if (/soci[ée]t[ée]|entreprise|company|organization/.test(allText)) {
    return 'company';
  }

  // Poste/Profession
  if (/poste|profession|job.*title|position|occupation/.test(allText)) {
    return 'jobtitle';
  }

  // Numéro
  if (/num[ée]ro|number|no\.?/.test(allText) && !/t[eé]l/.test(allText)) {
    return 'number';
  }

  // Mot de passe
  if (type === 'password') {
    return 'password';
  }

  // Checkbox
  if (type === 'checkbox') {
    return 'checkbox';
  }

  // Radio
  if (type === 'radio') {
    return 'radio';
  }

  // Par défaut, texte
  return 'text';
}

/**
 * Génère un sélecteur CSS unique pour retrouver l'élément
 */
function generateSelector(element, uniqueId) {
  // Marquer l'élément avec un attribut data unique
  element.setAttribute('data-sff-id', uniqueId);
  return `[data-sff-id="${uniqueId}"]`;
}

/**
 * Obtient un élément par son sélecteur
 */
function getElementBySelector(selector) {
  return document.querySelector(selector);
}

// Exposer les fonctions globalement pour le content script
window.SFFFieldDetector = {
  detectFields,
  getElementBySelector
};
