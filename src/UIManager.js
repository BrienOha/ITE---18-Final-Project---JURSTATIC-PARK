export class UIManager {
    constructor() {
        this.titleScreen = document.getElementById('title-screen');
        this.uiContainer = document.getElementById('ui-container');
        this.settingsModal = document.getElementById('settings-modal');
        
        this.infoCard = document.getElementById('info-card');
        this.nameEl = document.getElementById('dino-name');
        this.heightEl = document.getElementById('dino-height');
        this.dietEl = document.getElementById('dino-diet'); 
        this.descEl = document.getElementById('dino-desc');
        this.dinoList = document.getElementById('dino-list');
        this.currentDino = null;

        this.qualitySelect = document.getElementById('set-quality');
        this.shadowBtn = document.getElementById('toggle-shadows');
        
        this.initButtons();
    }

    initButtons() {
        // --- TITLE SCREEN BUTTONS ---
        document.getElementById('btn-start').addEventListener('click', () => {
            this.titleScreen.style.opacity = '0';
            setTimeout(() => {
                this.titleScreen.classList.add('hidden');
                this.uiContainer.classList.remove('hidden');
            }, 800);
            window.dispatchEvent(new Event('startSimulation'));
        });

        document.getElementById('btn-settings-title').addEventListener('click', () => {
            this.settingsModal.classList.remove('hidden');
        });

        // --- GAME UI BUTTONS ---
        const gameSettingsBtn = document.getElementById('btn-open-settings-game');
        if(gameSettingsBtn) {
            gameSettingsBtn.addEventListener('click', () => {
                this.settingsModal.classList.remove('hidden');
            });
        }

        // --- SETTINGS MODAL ---
        document.getElementById('btn-close-settings').addEventListener('click', () => {
            this.settingsModal.classList.add('hidden');
            window.dispatchEvent(new CustomEvent('settingsChanged', { 
                detail: { 
                    quality: this.qualitySelect.value,
                    shadows: this.shadowBtn.classList.contains('active')
                }
            }));
        });

        this.shadowBtn.addEventListener('click', () => {
            this.shadowBtn.classList.toggle('active');
            this.shadowBtn.textContent = this.shadowBtn.classList.contains('active') ? 'ENABLED' : 'DISABLED';
        });
    }

    populateList(dinoData, callback) {
        this.dinoList.innerHTML = '';
        dinoData.forEach((dino, index) => {
            const li = document.createElement('li');
            li.textContent = dino.name;
            li.addEventListener('click', () => callback(index));
            this.dinoList.appendChild(li);
        });
    }

    showInfo(data) {
        if(this.currentDino === data.name) return;
        this.currentDino = data.name;

        // Update Content
        this.nameEl.textContent = data.name;
        this.heightEl.textContent = data.height + "m";
        if(this.dietEl && data.diet) this.dietEl.textContent = data.diet;
        this.descEl.textContent = data.desc;
        
        // FIX: Remove 'hidden' first so 'display: none' is gone
        this.infoCard.classList.remove('hidden');
        
        // FIX: Force a "reflow" so the browser realizes it needs to animate from opacity 0 to 1
        void this.infoCard.offsetWidth; 
        
        // Trigger the animation class
        this.infoCard.classList.add('active-card');
    }

    hideInfo() {
        if(!this.currentDino) return;
        this.currentDino = null;
        
        // Fade out by removing the active class
        this.infoCard.classList.remove('active-card');
        
        // Note: We do NOT add 'hidden' back immediately, otherwise the fade-out animation cuts off.
        // The CSS handles opacity: 0, which effectively hides it.
    }
}