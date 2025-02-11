export class Menu {
  private hamburger: HTMLElement | null;
  private mobileMenu: HTMLElement | null;
  private isHamburgerOpen: boolean = false;

  constructor() {
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.initializeMenu();
  }

  private initializeMenu() {
    // Hamburger click handler
    this.hamburger?.addEventListener('click', () => this.toggleMobileMenu());

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (this.isHamburgerOpen && !this.hamburger?.contains(target)) {
        this.closeMobileMenu();
      }
    });

    // Close menu on resize if mobile menu is open
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isHamburgerOpen) {
        this.closeMobileMenu();
      }
    });
  }

  private toggleMobileMenu() {
    this.isHamburgerOpen = !this.isHamburgerOpen;
    this.mobileMenu?.classList.toggle('active');
  }

  private closeMobileMenu() {
    this.isHamburgerOpen = false;
    this.mobileMenu?.classList.remove('active');
  }
}
