import { BackgroundAudio } from './audio';
import { initFormular } from './formular';

export class Menu {
  private hamburger: HTMLElement | null;
  private mobileMenu: HTMLElement | null;
  private isHamburgerOpen: boolean = false;
  public isSubpageOpen: boolean = false;
  private backgroundAudio: BackgroundAudio;

  constructor(backgroundAudio: BackgroundAudio) {
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.backgroundAudio = backgroundAudio;
    this.initializeMenu();
  }

  private toggleMobileMenu() {
    this.isHamburgerOpen = !this.isHamburgerOpen;
    this.mobileMenu?.classList.toggle('active');
  }

  private closeMobileMenu() {
    this.isHamburgerOpen = false;
    this.mobileMenu?.classList.remove('active');
  }

  private addSubPageListener(container: HTMLDivElement, menuId: string, closeOnClickOutside: any) {
    // Pridaj event listener na portfolio link
    const sectionLink = document.querySelectorAll('#' + menuId + '');
    if (sectionLink) {
      sectionLink.forEach((sl) =>
        sl.addEventListener('click', (e) => {
          e.preventDefault();
          const allSubpages = document.querySelectorAll('.subpage-container');
          allSubpages.forEach((subpage) => {
            (subpage as HTMLElement).style.transform = 'translateY(100vh)';
          });

          document.body.style.overflow = 'hidden';
          container.style.transform = 'translateY(0)';
          console.log('menu: ' + menuId);
          this.isSubpageOpen = true;
          if(this.backgroundAudio)
            this.backgroundAudio.pause();
          document.querySelectorAll('.menu-button').forEach(btn => btn.classList.remove('menu-button-active'));
          const menuBtn = document.getElementById(menuId);
          if (menuBtn) menuBtn.classList.add('menu-button-active');
          if(closeOnClickOutside)
          document.addEventListener('click', closeOnClickOutside);
        }),
      );
    }
  }

  private createSubpageSection(subpageContainer: HTMLDivElement, closeId: string, menuId: string) {
    const closeOnClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ak klikám na prepínač jazyka, nerob nič
      if (target.closest('[data-lang]')) {
        return;
      }
      if (!subpageContainer.contains(target) && !target.closest('#' + menuId + '')) {
        subpageContainer.style.transform = 'translateY(100vh)';
        this.isSubpageOpen = false;
        console.log('closeOutside: ' + menuId);
        setTimeout(() => {
          document.body.style.overflow = 'auto';
        }, 500);
        document.removeEventListener('click', closeOnClickOutside);
        const menuBtn = document.getElementById(menuId);
        if (menuBtn) menuBtn.classList.remove('menu-button-active');
      }
    };

    // Pridaj event listener na zatváracie tlačidlo
    const closeBtn = document.getElementById(closeId);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        subpageContainer.style.transform = 'translateY(100vh)';
        this.isSubpageOpen = false;
        setTimeout(() => {
          document.body.style.overflow = 'auto';
        }, 500);
        document.removeEventListener('click', closeOnClickOutside);
        const menuBtn = document.getElementById(menuId);
        if (menuBtn) menuBtn.classList.remove('menu-button-active');
      });
    }

    this.addSubPageListener(subpageContainer, menuId, undefined);// closeOnClickOutside);

    return { subpageContainer, closeOnClickOutside };
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

    const portfolioContainer = document.getElementById('subpage-portfolio-container') as HTMLDivElement;
    const sluzbyContainer = document.getElementById('subpage-sluzby-container') as HTMLDivElement;
    const aboutContainer = document.getElementById('subpage-about-container') as HTMLDivElement;
    const cennikContainer = document.getElementById('subpage-cennik-container') as HTMLDivElement;
    const legislativaContainer = document.getElementById('subpage-legislativa-container') as HTMLDivElement;

    this.createSubpageSection(portfolioContainer, 'closePortfolio', 'portfolio-button');
    this.createSubpageSection(sluzbyContainer, 'closeSluzby', 'sluzby-button');
    this.createSubpageSection(aboutContainer, 'closeAbout', 'about-button');
    this.createSubpageSection(cennikContainer, 'closeCennik', 'cennik-button');
    this.createSubpageSection(legislativaContainer, 'closeLegislativa', 'legislativa-button');

    initFormular('service_um8zj4l', 'template_9tzop5i', 'contact-form', 'contact-form-success', 'contact-form-error');

    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach((button, index) => {
      const btn = button as HTMLElement;
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(20px)';
      btn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      btn.style.transitionDelay = `${index * 0.2}s`;

      // Show button with animation
      setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      }, 100);
    });
  }
}
