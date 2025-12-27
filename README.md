# Smart Form Filler

Extension Chrome intelligente qui remplit automatiquement les formulaires web en utilisant l'IA Gemini.

## 🚀 Fonctionnalités

- **Remplissage intelligent** : Utilise l'API Gemini pour analyser les champs et décider quelles informations insérer
- **Détection automatique** : Détecte intelligemment les types de champs (email, téléphone, adresse, etc.)
- **Support multi-types** : Gère les inputs texte, dropdowns, checkboxes, radio buttons, etc.
- **Stockage sécurisé** : Vos données restent locales sur votre appareil
- **Format Markdown** : Format simple et lisible pour vos informations personnelles

## 📦 Installation

### Installation en mode développeur

1. **Télécharger le code**
   ```bash
   git clone <repository-url>
   cd smart-form-filler
   ```

2. **Créer les icônes** (optionnel)
   ```bash
   # Si vous avez Python et PIL installé
   pip install pillow
   python3 << 'EOF'
   from PIL import Image, ImageDraw
   def create_icon(size):
       img = Image.new('RGB', (size, size), color='#4285F4')
       draw = ImageDraw.Draw(img)
       margin = size // 5
       draw.rectangle([margin, margin, size-margin, size-margin],
                      fill='white', outline='#4285F4', width=max(1, size//32))
       return img
   for size in [16, 48, 128]:
       create_icon(size).save(f'icons/icon{size}.png')
   EOF
   ```

   Note: L'extension fonctionnera même sans icônes personnalisées.

3. **Charger l'extension dans Chrome**
   - Ouvrir Chrome et aller à `chrome://extensions/`
   - Activer le "Mode développeur" (coin supérieur droit)
   - Cliquer sur "Charger l'extension non empaquetée"
   - Sélectionner le dossier du projet

## ⚙️ Configuration

### 1. Obtenir une clé API Gemini

1. Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Se connecter avec votre compte Google
3. Créer une nouvelle clé API (gratuit avec quota généreux)
4. Copier la clé

### 2. Configurer l'extension

1. Cliquer sur l'icône de l'extension dans Chrome
2. Cliquer sur l'icône ⚙️ (Paramètres)
3. Coller votre clé API Gemini
4. Cliquer sur "Tester la connexion" pour vérifier

### 3. Entrer vos informations

Dans la page de configuration, entrer vos informations au format Markdown :

```markdown
# Mes Informations Personnelles

## Identité
- Nom complet : Jean Dupont
- Prénom : Jean
- Nom : Dupont
- Date de naissance : 15/03/1990

## Contact
- Email : jean.dupont@example.com
- Téléphone : +33 6 12 34 56 78

## Adresse
- Adresse complète : 123 Rue de la Paix, 75001 Paris, France
- Rue : 123 Rue de la Paix
- Code postal : 75001
- Ville : Paris
- Pays : France

## Professionnel
- Société : TechCorp
- Poste : Développeur Senior
```

4. Cliquer sur "Enregistrer la configuration"

## 💡 Utilisation

1. **Naviguer vers une page avec un formulaire**
2. **Cliquer sur l'icône de l'extension**
   - Vous verrez le nombre de champs détectés
3. **Cliquer sur "Remplir le formulaire"**
   - L'IA Gemini analyse les champs
   - Les informations sont automatiquement remplies
4. **Vérifier et ajuster** si nécessaire
5. **Soumettre le formulaire** manuellement

## 🔒 Sécurité et confidentialité

- ✅ Toutes vos données personnelles sont stockées **localement** sur votre appareil
- ✅ Aucune information n'est envoyée à des serveurs tiers (sauf l'API Gemini pour l'analyse)
- ✅ La clé API est stockée de manière sécurisée dans le storage Chrome
- ✅ Communication chiffrée avec l'API Gemini (HTTPS)
- ✅ Pas de tracking, pas d'analytics

### Ce qui est envoyé à Gemini

Lorsque vous cliquez sur "Remplir le formulaire", l'extension envoie à Gemini :
1. La structure des champs du formulaire (labels, types, etc.)
2. Vos informations personnelles (du document Markdown)

Gemini analyse ces données et retourne un mapping pour savoir quelle valeur mettre dans quel champ.

## 🛠️ Fonctionnalités avancées

### Détection intelligente des types

L'extension détecte automatiquement :
- Emails
- Numéros de téléphone
- Dates de naissance
- Adresses postales (rue, ville, code postal, pays)
- Noms et prénoms
- Informations professionnelles

### Support des différents types de champs

- ✅ Input texte
- ✅ Input email
- ✅ Input téléphone
- ✅ Input date
- ✅ Textarea
- ✅ Select (dropdown)
- ✅ Checkbox
- ✅ Radio buttons

## 📝 Format du document Markdown

### Structure recommandée

```markdown
# Mes Informations

## Section 1
- Clé : Valeur
- Autre clé : Autre valeur

## Section 2
- Clé : Valeur
```

### Conseils

- Utilisez des sections (##) pour organiser vos informations
- Utilisez des listes à puces (-)
- Format : `- Nom du champ : Valeur`
- Plus vos descriptions sont claires, meilleur sera le matching

## ❓ Dépannage

### L'extension ne détecte pas les champs

- Rechargez la page
- Attendez quelques secondes après le chargement
- Vérifiez que les champs sont bien visibles

### L'API Gemini retourne une erreur

- Vérifiez que votre clé API est valide
- Vérifiez votre connexion internet
- Vérifiez que vous n'avez pas dépassé le quota gratuit
- Consultez la console Chrome (F12) pour plus de détails

### Les valeurs ne sont pas correctement remplies

- Vérifiez le format de vos données dans le Markdown
- Essayez d'être plus précis dans les noms de champs
- Certains formulaires avec JavaScript complexe peuvent nécessiter des ajustements manuels

### Les champs ne se remplissent pas

- Vérifiez la console Chrome (F12) pour des erreurs
- Certains sites empêchent le remplissage automatique pour des raisons de sécurité
- Rechargez la page et réessayez

## 🚧 Limitations connues

- ❌ Ne peut pas remplir les CAPTCHA
- ❌ Certains formulaires avec heavy JavaScript peuvent ne pas fonctionner
- ❌ Nécessite une clé API Gemini (gratuite mais avec quota)
- ❌ Dépend entièrement de la qualité de l'analyse de Gemini (pas de fallback)

## 🔄 Mises à jour futures

- [ ] Support de profils multiples
- [ ] Historique des formulaires remplis
- [ ] Mode de prévisualisation avant remplissage
- [ ] Export/Import de configurations
- [ ] Support d'autres LLM (Claude, OpenAI)

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Note** : Cette extension est un outil d'aide au remplissage de formulaires. Vérifiez toujours les informations avant de soumettre un formulaire, particulièrement pour des documents officiels ou sensibles.
