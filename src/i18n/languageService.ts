import { messages } from './messages';

export class LanguageService {
  private static instance: LanguageService;
  private currentLanguage: 'sk' | 'en' = 'sk';

  private constructor() {
    this.updateLanguageButtonsVisibility();
  }

  static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  getCurrentLanguage(): 'sk' | 'en' {
    return this.currentLanguage;
  }

  setLanguage(lang: 'sk' | 'en', update3DTextFunc: () => void) {
    this.currentLanguage = lang;
    this.updatePageContent();
    update3DTextFunc();
    this.updateLanguageButtonsVisibility();
  }

  getMessage(key: string): string {
    return (messages as any)[this.currentLanguage][key] || key;
  }

  private updatePageContent() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        element.textContent = this.getMessage(key);
      }
    });
  }

  private updateLanguageButtonsVisibility() {
    const skButtons = document.querySelectorAll('[data-lang="sk"]') as NodeListOf<HTMLDivElement>;
    const enButtons = document.querySelectorAll('[data-lang="en"]') as NodeListOf<HTMLDivElement>;

    if (skButtons && enButtons) {
      if (this.currentLanguage === 'sk') {
        skButtons.forEach((btn) => (btn.style.display = 'none'));
        enButtons.forEach((btn) => (btn.style.display = 'block'));
      } else {
        enButtons.forEach((btn) => (btn.style.display = 'none'));
        skButtons.forEach((btn) => (btn.style.display = 'block'));
      }
    }
  }
}

declare global {
  interface Window {
    LanguageService: typeof LanguageService;
  }
}

window.LanguageService = LanguageService;
