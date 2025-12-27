// Smart Form Filler - Background Service Worker

// Importer le client Gemini
importScripts('gemini-client.js');

// Écouter les messages de la popup et du content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    handleFillForm(request.tabId)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({
        success: false,
        error: error.message
      }));
    return true; // Permet une réponse asynchrone
  }

  if (request.action === 'testConnection') {
    testConnection(request.apiKey)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({
        success: false,
        error: error.message
      }));
    return true;
  }
});

/**
 * Gère le remplissage du formulaire
 */
async function handleFillForm(tabId) {
  try {
    // 1. Récupérer la configuration
    const config = await getConfiguration();

    if (!config.apiKey || !config.userData) {
      return {
        success: false,
        error: 'Configuration incomplète. Veuillez configurer l\'extension.'
      };
    }

    // 2. Obtenir les champs détectés depuis le content script
    const fieldsResponse = await sendMessageToTab(tabId, { action: 'getFields' });

    if (!fieldsResponse || !fieldsResponse.fields || fieldsResponse.fields.length === 0) {
      return {
        success: false,
        error: 'Aucun champ détecté sur cette page.'
      };
    }

    const fields = fieldsResponse.fields;
    console.log(`${fields.length} champs à analyser`);

    // 3. Analyser avec Gemini
    const geminiResult = await analyzeFieldsWithGemini(
      config.apiKey,
      fields,
      config.userData
    );

    const mapping = geminiResult.mapping;
    console.log('Mapping reçu de Gemini:', mapping);

    // 4. Envoyer le mapping au content script pour remplir
    const fillResponse = await sendMessageToTab(tabId, {
      action: 'fillFields',
      mapping: mapping
    });

    if (fillResponse && fillResponse.success) {
      return {
        success: true,
        filledCount: fillResponse.filledCount,
        errors: fillResponse.errors
      };
    } else {
      return {
        success: false,
        error: fillResponse?.error || 'Erreur lors du remplissage des champs'
      };
    }

  } catch (error) {
    console.error('Erreur dans handleFillForm:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue'
    };
  }
}

/**
 * Récupère la configuration depuis le storage
 */
async function getConfiguration() {
  try {
    // Essayer d'abord le sync storage
    let config = await chrome.storage.sync.get(['apiKey', 'userData']);

    // Si pas de données, essayer le local storage
    if (!config.apiKey || !config.userData) {
      config = await chrome.storage.local.get(['apiKey', 'userData']);
    }

    return config;
  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error);
    return {};
  }
}

/**
 * Envoie un message à un onglet et attend la réponse
 */
function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Teste la connexion API
 */
async function testConnection(apiKey) {
  try {
    const isValid = await testGeminiConnection(apiKey);
    return {
      success: isValid,
      message: isValid ? 'Connexion réussie' : 'Clé API invalide'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Initialisation
console.log('Smart Form Filler: Background service worker démarré');

// Gérer l'installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installée');
    // Ouvrir la page de configuration
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('Extension mise à jour');
  }
});
