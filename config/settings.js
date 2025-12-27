// Smart Form Filler - Settings Script

const DEFAULT_TEMPLATE = `# Mes Informations Personnelles

## Identité
- Nom complet :
- Prénom :
- Nom :
- Date de naissance :
- Lieu de naissance :

## Contact
- Email :
- Téléphone :
- Téléphone fixe :

## Adresse
- Adresse complète :
- Rue :
- Numéro :
- Code postal :
- Ville :
- Pays :

## Professionnel
- Société :
- Poste :
- Années d'expérience :

## Autres
- Nationalité :
- Permis de conduire :
`;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Charger la configuration existante
  await loadSettings();

  // Event listeners
  document.getElementById('toggleApiKey').addEventListener('click', toggleApiKeyVisibility);
  document.getElementById('testApiBtn').addEventListener('click', testApiConnection);
  document.getElementById('loadTemplateBtn').addEventListener('click', loadTemplate);
  document.getElementById('showExampleBtn').addEventListener('click', showExample);
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);

  // Modal
  const modal = document.getElementById('exampleModal');
  const closeBtns = modal.querySelectorAll('.close-btn, .close-modal-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  });

  // Fermer la modal en cliquant à l'extérieur
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'apiKey',
      'userData',
      'syncData'
    ]);

    // Charger les valeurs
    if (settings.apiKey) {
      document.getElementById('apiKey').value = settings.apiKey;
    }

    if (settings.userData) {
      document.getElementById('userData').value = settings.userData;
    }

    // Options
    document.getElementById('syncData').checked = settings.syncData !== false;

  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error);
    showStatus('saveStatus', 'Erreur lors du chargement des paramètres.', 'error');
  }
}

function toggleApiKeyVisibility() {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleBtn = document.getElementById('toggleApiKey');

  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    apiKeyInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
}

async function testApiConnection() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const statusDiv = document.getElementById('apiStatus');
  const testBtn = document.getElementById('testApiBtn');

  if (!apiKey) {
    showStatus('apiStatus', 'Veuillez entrer une clé API.', 'error');
    return;
  }

  try {
    testBtn.disabled = true;
    testBtn.textContent = 'Test en cours...';
    statusDiv.className = 'status-message';
    statusDiv.textContent = '';

    // Test simple de l'API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Test' }]
          }]
        })
      }
    );

    if (response.ok) {
      showStatus('apiStatus', '✅ Connexion réussie ! Votre clé API fonctionne.', 'success');
    } else {
      const error = await response.json();
      showStatus('apiStatus', `❌ Erreur : ${error.error?.message || 'Clé API invalide'}`, 'error');
    }

  } catch (error) {
    showStatus('apiStatus', `❌ Erreur de connexion : ${error.message}`, 'error');
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = 'Tester la connexion';
  }
}

function loadTemplate() {
  const userDataTextarea = document.getElementById('userData');

  if (userDataTextarea.value.trim() && !confirm('Voulez-vous remplacer le contenu actuel par le modèle ?')) {
    return;
  }

  userDataTextarea.value = DEFAULT_TEMPLATE;
  showStatus('saveStatus', 'Modèle chargé avec succès.', 'info');
}

function showExample(e) {
  e.preventDefault();
  document.getElementById('exampleModal').style.display = 'flex';
}

async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const userData = document.getElementById('userData').value.trim();
  const syncData = document.getElementById('syncData').checked;
  const saveBtn = document.getElementById('saveBtn');

  // Validation
  if (!apiKey) {
    showStatus('saveStatus', 'La clé API est requise.', 'error');
    return;
  }

  if (!userData) {
    showStatus('saveStatus', 'Veuillez entrer vos informations personnelles.', 'error');
    return;
  }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Enregistrement...';

    // Choisir le storage en fonction de l'option syncData
    const storage = syncData ? chrome.storage.sync : chrome.storage.local;

    await storage.set({
      apiKey,
      userData,
      syncData,
      lastUpdated: Date.now()
    });

    showStatus('saveStatus', '✅ Configuration enregistrée avec succès !', 'success');

    // Auto-fermer le message après 2 secondes
    setTimeout(() => {
      const statusDiv = document.getElementById('saveStatus');
      statusDiv.style.display = 'none';
    }, 3000);

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    showStatus('saveStatus', `❌ Erreur lors de l'enregistrement : ${error.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Enregistrer la configuration';
  }
}

async function resetSettings() {
  if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.')) {
    return;
  }

  try {
    // Effacer toutes les données
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();

    // Réinitialiser le formulaire
    document.getElementById('apiKey').value = '';
    document.getElementById('userData').value = '';
    document.getElementById('syncData').checked = true;

    showStatus('saveStatus', '✅ Paramètres réinitialisés.', 'success');

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    showStatus('saveStatus', `❌ Erreur lors de la réinitialisation : ${error.message}`, 'error');
  }
}

function showStatus(elementId, message, type) {
  const statusDiv = document.getElementById(elementId);
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  statusDiv.style.display = 'block';
}
