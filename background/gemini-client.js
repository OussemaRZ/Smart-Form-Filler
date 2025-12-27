// Smart Form Filler - Gemini API Client

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_NAME = 'gemini-pro';

/**
 * Appelle l'API Gemini pour analyser les champs et mapper les valeurs
 */
async function analyzeFieldsWithGemini(apiKey, fields, userData) {
  if (!apiKey || !fields || !userData) {
    throw new Error('Paramètres manquants pour l\'analyse');
  }

  const prompt = buildPrompt(fields, userData);

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erreur API: ${response.status}`);
    }

    const data = await response.json();

    // Extraire le texte de la réponse
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Réponse vide de l\'API Gemini');
    }

    // Parser la réponse JSON
    const mapping = parseGeminiResponse(generatedText);

    return {
      success: true,
      mapping,
      rawResponse: generatedText
    };

  } catch (error) {
    console.error('Erreur lors de l\'appel à Gemini:', error);
    throw error;
  }
}

/**
 * Construit le prompt pour Gemini
 */
function buildPrompt(fields, userData) {
  const prompt = `Tu es un assistant intelligent qui aide à remplir des formulaires web automatiquement.

INFORMATIONS DE L'UTILISATEUR:
${userData}

CHAMPS DU FORMULAIRE À REMPLIR:
${JSON.stringify(fields.map(f => ({
  uniqueId: f.uniqueId,
  label: f.label,
  placeholder: f.placeholder,
  name: f.name,
  type: f.type,
  detectedType: f.detectedType,
  options: f.options?.length > 0 ? f.options : undefined,
  context: f.context
})), null, 2)}

INSTRUCTIONS:
1. Analyse chaque champ du formulaire et comprends quelle information est demandée
2. Cherche dans les informations de l'utilisateur la valeur correspondante
3. Pour les champs SELECT (dropdown), tu dois choisir la valeur (value) ou le texte (text) de l'option qui correspond le mieux aux informations de l'utilisateur
4. Assure-toi que les formats sont corrects (dates, téléphones, etc.)
5. Si aucune information ne correspond à un champ, ne l'inclus pas dans la réponse

RÉPONSE ATTENDUE:
Retourne UNIQUEMENT un objet JSON valide au format suivant, sans texte supplémentaire:
{
  "uniqueId_du_champ": "valeur_à_insérer",
  "uniqueId_du_champ2": "valeur_à_insérer2"
}

Exemple de réponse:
{
  "email-input": "jean.dupont@example.com",
  "phone": "+33612345678",
  "country": "France"
}

RÉPONSE JSON:`;

  return prompt;
}

/**
 * Parse la réponse de Gemini pour extraire le JSON
 */
function parseGeminiResponse(responseText) {
  try {
    // Nettoyer la réponse en retirant les markdown code blocks si présents
    let cleanedText = responseText.trim();

    // Retirer les blocs de code markdown ```json ... ```
    const jsonBlockMatch = cleanedText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonBlockMatch) {
      cleanedText = jsonBlockMatch[1];
    }

    // Retirer tout texte avant le premier { et après le dernier }
    const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      cleanedText = jsonMatch[1];
    }

    // Parser le JSON
    const mapping = JSON.parse(cleanedText);

    // Valider que c'est bien un objet
    if (typeof mapping !== 'object' || mapping === null || Array.isArray(mapping)) {
      throw new Error('Format de réponse invalide');
    }

    return mapping;

  } catch (error) {
    console.error('Erreur lors du parsing de la réponse Gemini:', error);
    console.error('Réponse brute:', responseText);
    throw new Error('Impossible de parser la réponse de l\'IA');
  }
}

/**
 * Teste la connexion à l'API Gemini
 */
async function testGeminiConnection(apiKey) {
  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test de connexion'
            }]
          }]
        })
      }
    );

    return response.ok;

  } catch (error) {
    console.error('Erreur test connexion:', error);
    return false;
  }
}

// Exporter les fonctions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeFieldsWithGemini,
    testGeminiConnection
  };
}
