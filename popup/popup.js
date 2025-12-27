// Smart Form Filler - Popup Script

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const settingsBtn = document.getElementById('settingsBtn');
  const fillBtn = document.getElementById('fillBtn');

  // Ouvrir les paramètres
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Remplir le formulaire
  fillBtn.addEventListener('click', fillForm);

  // Vérifier la configuration et les champs détectés
  await checkStatus();
}

async function checkStatus() {
  try {
    // Vérifier si la configuration est complète
    const { apiKey, userData } = await chrome.storage.sync.get(['apiKey', 'userData']);

    if (!apiKey || !userData) {
      showError('Configuration incomplète. Veuillez configurer l\'extension.');
      return;
    }

    // Obtenir le nombre de champs détectés sur la page actuelle
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showError('Impossible d\'accéder à la page actuelle.');
      return;
    }

    // Envoyer un message au content script pour obtenir les champs
    chrome.tabs.sendMessage(tab.id, { action: 'getFields' }, (response) => {
      if (chrome.runtime.lastError) {
        showError('Erreur de communication avec la page. Rechargez la page.');
        return;
      }

      if (response && response.fields) {
        updateFieldsCount(response.fields.length);

        if (response.fields.length > 0) {
          document.getElementById('fillBtn').disabled = false;
          updateStatus('✅', 'Prêt à remplir');
        } else {
          updateStatus('ℹ️', 'Aucun champ détecté');
        }
      }
    });

  } catch (error) {
    showError('Erreur lors de la vérification du statut.');
    console.error(error);
  }
}

async function fillForm() {
  const fillBtn = document.getElementById('fillBtn');

  try {
    // Afficher l'état de chargement
    fillBtn.classList.add('loading');
    fillBtn.disabled = true;
    updateStatus('⏳', 'Analyse en cours...');
    hideMessages();

    // Obtenir l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Envoyer un message au background script pour traiter le formulaire
    chrome.runtime.sendMessage(
      { action: 'fillForm', tabId: tab.id },
      (response) => {
        fillBtn.classList.remove('loading');

        if (chrome.runtime.lastError) {
          showError('Erreur de communication avec le service.');
          fillBtn.disabled = false;
          updateStatus('❌', 'Erreur');
          return;
        }

        if (response && response.success) {
          showSuccess(`Formulaire rempli avec succès ! ${response.filledCount} champ(s) rempli(s).`);
          updateStatus('✅', 'Rempli avec succès');

          // Réactiver le bouton après un délai
          setTimeout(() => {
            fillBtn.disabled = false;
          }, 2000);
        } else {
          showError(response?.error || 'Erreur lors du remplissage du formulaire.');
          fillBtn.disabled = false;
          updateStatus('❌', 'Erreur');
        }
      }
    );

  } catch (error) {
    fillBtn.classList.remove('loading');
    fillBtn.disabled = false;
    showError('Erreur inattendue.');
    updateStatus('❌', 'Erreur');
    console.error(error);
  }
}

function updateFieldsCount(count) {
  document.getElementById('fieldsCount').textContent = count;
}

function updateStatus(icon, text) {
  document.getElementById('statusIcon').textContent = icon;
  document.getElementById('statusText').textContent = text;
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  // Auto-masquer après 5 secondes
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.style.display = 'block';

  // Auto-masquer après 3 secondes
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 3000);
}

function hideMessages() {
  document.getElementById('errorMessage').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
}
