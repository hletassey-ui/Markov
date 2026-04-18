/**
 * Predictor.js
 * Charge le corpus depuis les fichiers .txt du dossier /dataset/.
 */

import { MarkovChain } from './MarkovChain.js';

const DATASET_FILES = [
  '/dataset/comptesse_de_segur.txt',
  '/dataset/Freida_McFadden_-_La_femme_de_m_233_nage_T1_2023.txt',
  '/dataset/Hunger-Games-2.txt',
  '/dataset/HUNGER_GAMES_TOME_1.txt',
  '/dataset/Le_tour_du_monde_en_80 jours.txt',
  '/dataset/Texte.txt',
];

export class Predictor {
  constructor({ order = 2, language = 'fr' } = {}) {
    this.chain = new MarkovChain(order);
    this.language = language;
    this._trained = false;
    this._sessionTokens = 0;
  }

  async initialize(onProgress) {
    const loaded = this.loadFromStorage();
    if (loaded) {
      this._trained = true;
      return this.chain.getStats();
    }

    const total = DATASET_FILES.length;
    let done = 0;

    for (const path of DATASET_FILES) {
      const filename = path.split('/').pop();
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        this.chain.train(text);
        done++;
        if (onProgress) onProgress(done, total, filename);
      } catch (err) {
        console.warn(`Impossible de charger ${path} :`, err);
        done++;
        if (onProgress) onProgress(done, total, filename);
      }
    }

    this._trained = true;
    this.saveToStorage();
    return this.chain.getStats();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('markov_model_v2');
      if (saved) {
        this.chain = MarkovChain.fromJSON(saved);
        this._trained = true;
        return true;
      }
    } catch (e) {
      console.warn('Impossible de charger depuis le localStorage :', e);
    }
    return false;
  }

  saveToStorage() {
    try {
      localStorage.setItem('markov_model_v2', this.chain.toJSON());
    } catch (e) {
      console.warn('Impossible de sauvegarder dans le localStorage :', e);
    }
  }

  getSuggestions(inputText, topN = 3) {
    if (!this._trained) return { type: 'prediction', suggestions: [] };

    const trimmed = inputText.trimStart();
    const endsWithSpace = inputText.endsWith(' ');
    const words = trimmed.split(/\s+/).filter(Boolean);

    if (words.length === 0) return { type: 'prediction', suggestions: [] };

    if (endsWithSpace) {
      const suggestions = this.chain.predictNextWord(words, topN);
      return { type: 'prediction', suggestions };
    } else {
      const currentWord = words[words.length - 1];
      const context = words.slice(0, -1);
      if (currentWord.length < 1) return { type: 'prediction', suggestions: [] };
      const suggestions = this.chain.completeWord(currentWord, context, topN);
      return { type: 'completion', suggestions, prefix: currentWord };
    }
  }

  learnFromInput(text) {
    if (text.trim().length < 3) return;
    this.chain.train(text);
    this._sessionTokens++;
    if (this._sessionTokens % 10 === 0) {
      this.saveToStorage();
    }
  }

  getStats() {
    return {
      ...this.chain.getStats(),
      sessionContributions: this._sessionTokens,
    };
  }

  reset() {
    this.chain = new MarkovChain(this.chain.order);
    this._trained = false;
    this._sessionTokens = 0;
    localStorage.removeItem('markov_model_v2');
  }
}
