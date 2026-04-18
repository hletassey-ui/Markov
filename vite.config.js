# MarkovKey — Interface iPhone

Interface de prédiction de texte style iMessage avec modèle de Markov.

## Utilisation

1. **Lancer l'app** : `npm run dev` (ou `npm install && npm run dev`)
2. **Charger votre dataset** : cliquer sur l'icône 📚 (livre) et sélectionner un ou plusieurs fichiers `.txt`
3. **Commencer à taper** : les suggestions apparaissent en temps réel au-dessus du clavier
4. **Cliquer sur une suggestion** pour l'insérer
5. **Appuyer sur Entrée** pour "envoyer" le message (et que le modèle apprenne de votre phrase)

## Dataset

Placez vos fichiers `.txt` (livres, corpus) dans un dossier local, puis utilisez le bouton 📚 pour les charger.
Le modèle entraîné est automatiquement sauvegardé dans le `localStorage` du navigateur — pas besoin de recharger à chaque fois.

## Architecture

```
src/
  core/
    MarkovChain.js   — Modèle de Markov d'ordre N
    Predictor.js     — Façade : gère contexte et localStorage
  ui/
    KeyboardUI.js    — Interface iPhone / iMessage
  utils/
    corpus.js        — (vide, dataset fourni par l'utilisateur)
  app.js             — Point d'entrée
styles/
  main.css           — Design iPhone réaliste
```
