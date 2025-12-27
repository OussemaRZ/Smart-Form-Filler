# Guide de Démarrage Rapide

## Installation (5 minutes)

### 1. Charger l'extension

1. Ouvrir Chrome
2. Aller à `chrome://extensions/`
3. Activer le "Mode développeur" (en haut à droite)
4. Cliquer sur "Charger l'extension non empaquetée"
5. Sélectionner le dossier du projet

### 2. Obtenir une clé API Gemini (gratuite)

1. Aller sur https://makersuite.google.com/app/apikey
2. Se connecter avec Google
3. Cliquer sur "Create API Key"
4. Copier la clé

### 3. Configurer l'extension

1. Cliquer sur l'icône de l'extension dans Chrome
2. Cliquer sur ⚙️ (Paramètres)
3. Coller votre clé API
4. Cliquer sur "Tester la connexion"
5. Entrer vos informations dans le champ Markdown
6. Cliquer sur "Enregistrer"

## Test rapide

1. Ouvrir le fichier `test-form.html` dans Chrome
2. Cliquer sur l'icône de l'extension
3. Cliquer sur "Remplir le formulaire"
4. Vérifier que les champs sont remplis

## Format des données

```markdown
# Mes Informations

## Identité
- Prénom : Jean
- Nom : Dupont
- Date de naissance : 15/03/1990

## Contact
- Email : jean.dupont@example.com
- Téléphone : +33612345678

## Adresse
- Rue : 123 Rue de la Paix
- Code postal : 75001
- Ville : Paris
- Pays : France

## Professionnel
- Société : TechCorp
- Poste : Développeur
```

## Utilisation

1. Naviguer vers un site avec un formulaire
2. Cliquer sur l'icône de l'extension
3. Vérifier le nombre de champs détectés
4. Cliquer sur "Remplir le formulaire"
5. Attendre l'analyse (quelques secondes)
6. Vérifier les valeurs remplies
7. Ajuster si nécessaire
8. Soumettre le formulaire

## Dépannage rapide

### "Configuration incomplète"
- Vérifier que vous avez bien sauvegardé la clé API et les données

### "Aucun champ détecté"
- Recharger la page
- Attendre que la page soit complètement chargée

### "Erreur API"
- Vérifier votre connexion internet
- Vérifier que la clé API est valide
- Vérifier le quota (console Google AI Studio)

### Les valeurs sont incorrectes
- Améliorer les descriptions dans votre document Markdown
- Utiliser les mêmes termes que les labels des formulaires

## Astuces

- **Soyez précis** : Plus vos données sont détaillées, meilleur sera le matching
- **Utilisez des sections** : Organisez vos données en sections logiques
- **Gardez le format** : Respectez toujours `- Clé : Valeur`
- **Testez localement** : Utilisez `test-form.html` pour tester vos modifications

## Sécurité

- ✅ Vos données restent locales
- ✅ Seules les requêtes API vont vers Google
- ✅ Pas de tracking
- ✅ Pas de serveur tiers

## Support

- Consulter le README.md complet
- Ouvrir une issue sur GitHub
- Vérifier la console Chrome (F12) pour les erreurs

---

**Bon remplissage automatique ! 🚀**
