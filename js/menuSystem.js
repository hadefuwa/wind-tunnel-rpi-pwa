// Menu System for Wind Tunnel App
// Simple navigation between pages

class MenuSystem {
    constructor() {
        this.currentPage = 'main';
        this.pages = ['main', 'stlSetup', 'settings'];
        this.init();
    }

    init() {
        // Get menu buttons
        this.menuButtons = {
            main: document.getElementById('menuMain'),
            stlSetup: document.getElementById('menuSTLSetup'),
            settings: document.getElementById('menuSettings')
        };

        // Get page elements
        this.pageElements = {
            main: document.getElementById('mainPage'),
            stlSetup: document.getElementById('stlSetupPage'),
            settings: document.getElementById('settingsPage')
        };

        // Add click event listeners to menu buttons
        this.menuButtons.main.addEventListener('click', () => this.showPage('main'));
        this.menuButtons.stlSetup.addEventListener('click', () => this.showPage('stlSetup'));
        this.menuButtons.settings.addEventListener('click', () => this.showPage('settings'));

        // Add back button listeners
        const backToMainBtn = document.getElementById('backToMainBtn');
        const backToMainFromSettings = document.getElementById('backToMainFromSettings');
        const openSTLSetupBtn = document.getElementById('openSTLSetup');

        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', () => this.showPage('main'));
        }

        if (backToMainFromSettings) {
            backToMainFromSettings.addEventListener('click', () => this.showPage('main'));
        }

        if (openSTLSetupBtn) {
            openSTLSetupBtn.addEventListener('click', () => this.showPage('stlSetup'));
        }

        // Show main page by default
        this.showPage('main');
    }

    showPage(pageName) {
        // Hide all pages
        this.pages.forEach(page => {
            const pageElement = this.pageElements[page];
            const menuButton = this.menuButtons[page];
            
            if (pageElement) {
                pageElement.classList.remove('active');
            }
            
            if (menuButton) {
                menuButton.classList.remove('active');
            }
        });

        // Show selected page
        const selectedPage = this.pageElements[pageName];
        const selectedButton = this.menuButtons[pageName];
        
        if (selectedPage) {
            selectedPage.classList.add('active');
        }
        
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        this.currentPage = pageName;
        
        // Notify other systems about page change
        if (window.stlSetupManager && pageName === 'stlSetup') {
            window.stlSetupManager.onPageShow();
        }
        
        if (window.modelManager && pageName === 'settings') {
            window.modelManager.onPageShow();
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

// Initialize menu system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuSystem = new MenuSystem();
}); 