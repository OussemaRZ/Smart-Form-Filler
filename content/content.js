// Smart Form Filler - Content Script

let cachedFields = [];

// Détecter les champs au chargement de la page
window.addEventListener('load', () => {
  setTimeout(detectAndCacheFields, 1000);
});

// Aussi détecter après des changements DOM (pour les sites avec chargement dynamique)
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(detectAndCacheFields, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

/**
 * Détecte et met en cache les champs de formulaire
 */
function detectAndCacheFields() {
  if (typeof window.SFFFieldDetector === 'undefined') {
    console.warn('Field detector not loaded');
    return;
  }

  cachedFields = window.SFFFieldDetector.detectFields();
  console.log(`Smart Form Filler: ${cachedFields.length} champs détectés`);
}

/**
 * Écouter les messages de la popup et du background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getFields') {
    // Retourner les champs détectés
    sendResponse({ fields: cachedFields });
    return true;
  }

  if (request.action === 'fillFields') {
    // Remplir les champs avec les valeurs fournies
    const result = fillFields(request.mapping);
    sendResponse(result);
    return true;
  }

  if (request.action === 'detectFields') {
    // Re-détecter les champs
    detectAndCacheFields();
    sendResponse({ fields: cachedFields });
    return true;
  }
});

/**
 * Remplit les champs avec le mapping fourni
 */
function fillFields(mapping) {
  if (!mapping || typeof mapping !== 'object') {
    return { success: false, error: 'Mapping invalide', filledCount: 0 };
  }

  let filledCount = 0;
  const errors = [];

  for (const [uniqueId, value] of Object.entries(mapping)) {
    try {
      // Trouver le champ correspondant
      const fieldInfo = cachedFields.find(f => f.uniqueId === uniqueId);

      if (!fieldInfo) {
        errors.push(`Champ ${uniqueId} introuvable`);
        continue;
      }

      // Obtenir l'élément DOM
      const element = window.SFFFieldDetector.getElementBySelector(fieldInfo.selector);

      if (!element) {
        errors.push(`Élément ${uniqueId} introuvable dans le DOM`);
        continue;
      }

      // Remplir selon le type
      const filled = fillField(element, fieldInfo, value);

      if (filled) {
        filledCount++;
      }

    } catch (error) {
      errors.push(`Erreur pour ${uniqueId}: ${error.message}`);
    }
  }

  return {
    success: filledCount > 0,
    filledCount,
    errors: errors.length > 0 ? errors : null
  };
}

/**
 * Remplit un champ individuel
 */
function fillField(element, fieldInfo, value) {
  if (!element || value === null || value === undefined) {
    return false;
  }

  try {
    if (fieldInfo.elementType === 'select') {
      return fillSelectField(element, value, fieldInfo);
    }

    if (fieldInfo.type === 'checkbox') {
      return fillCheckboxField(element, value);
    }

    if (fieldInfo.type === 'radio') {
      return fillRadioField(element, value);
    }

    // Pour les inputs texte et textarea
    return fillTextualField(element, value);

  } catch (error) {
    console.error('Erreur lors du remplissage:', error);
    return false;
  }
}

/**
 * Remplit un champ texte ou textarea
 */
function fillTextualField(element, value) {
  const stringValue = String(value);

  // Définir la valeur
  element.value = stringValue;

  // Déclencher les événements pour que les validations JavaScript fonctionnent
  triggerEvents(element, ['input', 'change', 'blur']);

  return true;
}

/**
 * Remplit un select (dropdown)
 */
function fillSelectField(element, value, fieldInfo) {
  const stringValue = String(value).toLowerCase();

  // Essayer de trouver une correspondance exacte par valeur
  for (const option of element.options) {
    if (option.value.toLowerCase() === stringValue) {
      element.value = option.value;
      triggerEvents(element, ['change', 'blur']);
      return true;
    }
  }

  // Essayer de trouver une correspondance par texte
  for (const option of element.options) {
    if (option.text.toLowerCase().includes(stringValue) ||
        stringValue.includes(option.text.toLowerCase())) {
      element.value = option.value;
      triggerEvents(element, ['change', 'blur']);
      return true;
    }
  }

  // Essayer une correspondance partielle
  for (const option of element.options) {
    const optionText = option.text.toLowerCase();
    const optionValue = option.value.toLowerCase();

    if (optionText.includes(stringValue) ||
        optionValue.includes(stringValue) ||
        stringValue.includes(optionText)) {
      element.value = option.value;
      triggerEvents(element, ['change', 'blur']);
      return true;
    }
  }

  console.warn(`Aucune option trouvée pour "${value}" dans le select`);
  return false;
}

/**
 * Remplit une checkbox
 */
function fillCheckboxField(element, value) {
  // Convertir la valeur en booléen
  let boolValue = false;

  if (typeof value === 'boolean') {
    boolValue = value;
  } else if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    boolValue = lowerValue === 'true' ||
                lowerValue === 'yes' ||
                lowerValue === 'oui' ||
                lowerValue === '1' ||
                lowerValue === 'on';
  } else if (typeof value === 'number') {
    boolValue = value > 0;
  }

  element.checked = boolValue;
  triggerEvents(element, ['change', 'click']);

  return true;
}

/**
 * Remplit un radio button
 */
function fillRadioField(element, value) {
  const stringValue = String(value).toLowerCase();

  // Trouver tous les radio buttons avec le même name
  const radios = document.querySelectorAll(`input[type="radio"][name="${element.name}"]`);

  for (const radio of radios) {
    if (radio.value.toLowerCase() === stringValue ||
        (radio.nextSibling && radio.nextSibling.textContent.toLowerCase().includes(stringValue))) {
      radio.checked = true;
      triggerEvents(radio, ['change', 'click']);
      return true;
    }
  }

  return false;
}

/**
 * Déclenche les événements nécessaires pour la validation
 */
function triggerEvents(element, eventTypes) {
  eventTypes.forEach(eventType => {
    const event = new Event(eventType, {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);

    // Aussi déclencher la version Input pour certains frameworks
    if (eventType === 'input' || eventType === 'change') {
      const inputEvent = new InputEvent(eventType, {
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(inputEvent);
    }
  });
}

// Notifier que le content script est chargé
console.log('Smart Form Filler: Content script chargé');
