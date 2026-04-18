/**
 * app.js
 * Point d'entrée : initialise le Predictor et connecte l'UI iPhone.
 */

import { Predictor } from './core/Predictor.js';
import { KeyboardUI } from './ui/KeyboardUI.js';

async function main() {
  const predictor = new Predictor({ order: 2, language: 'fr' });
  const ui = new KeyboardUI(document.getElementById('app'));

  ui.showLoading('Chargement du modèle Markov…');

  // Chargement avec barre de progression
  const modelStats = await predictor.initialize((done, total, filename) => {
    ui.setLoadingProgress(done, total, filename);
  });

  ui.hideLoading();
  ui.setStatus('ready', `Prêt · ${modelStats.vocabularySize.toLocaleString()} mots`);

  // L'utilisateur tape → suggestions
  ui.onInput(inputText => {
    const result = predictor.getSuggestions(inputText, 3);
    ui.showSuggestions(result);
  });

  // Clic sur une suggestion → insertion
  ui.onSuggestionClick(suggestion => {
    ui.insertSuggestion(suggestion);
  });

  // Envoi d'un message
  ui.onSubmit(text => {
    predictor.learnFromInput(text);
    ui.addMessage(text);
    ui.clearInput();

    // Petite réponse générée par le modèle (fun)
    const words = text.trim().split(/\s+/);
    const generated = predictor.chain.generate(words.slice(-2), 6);
    if (generated && generated !== text.trim()) {
      setTimeout(() => {
        ui.addReceivedMessage('💬 ' + generated);
      }, 800);
    }
  });
}

main().catch(console.error);
