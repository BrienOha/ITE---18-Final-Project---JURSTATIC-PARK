import { AudioManager } from './AudioManager.js';

export class UIManager {
    constructor() {
        // DOM Elements
        this.disclaimerScreen = document.getElementById('disclaimer-screen');
        this.titleScreen = document.getElementById('title-screen');
        this.uiContainer = document.getElementById('ui-container');
        this.settingsModal = document.getElementById('settings-modal');
        this.audioControls = document.getElementById('audio-controls');
        
        // Info Card
        this.infoCard = document.getElementById('info-card');
        this.nameEl = document.getElementById('dino-name');
        this.sciEl = document.getElementById('dino-sci');
        this.heightEl = document.getElementById('dino-height');
        this.dietEl = document.getElementById('dino-diet'); 
        this.descEl = document.getElementById('dino-desc');
        this.dinoList = document.getElementById('dino-list');
        this.currentDino = null;

        // Controls
        this.qualitySelect = document.getElementById('set-quality');
        this.shadowBtn = document.getElementById('toggle-shadows');
        this.muteBtn = document.getElementById('btn-mute-music');
        
        // Initialize Audio Manager
        this.audio = new AudioManager();

        this.initButtons();
    }

    initButtons() {
        // --- 1. DISCLAIMER (Starts Audio) ---
        const ackBtn = document.getElementById('btn-acknowledge');
        if (ackBtn) {
            ackBtn.addEventListener('click', () => {
                // Fade out disclaimer
                this.disclaimerScreen.style.opacity = '0';
                setTimeout(() => {
                    this.disclaimerScreen.classList.add('hidden');
                    
                    // Show Title & Audio Controls
                    this.titleScreen.classList.remove('hidden');
                    this.audioControls.classList.remove('hidden');
                    
                    // Force Title opacity
                    requestAnimationFrame(() => this.titleScreen.style.opacity = '1');
                }, 1000);

                // FIX: Call the correct function in AudioManager
                this.audio.startExperience();
            });
        }

        // --- 2. AUDIO MUTE BUTTON ---
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => {
                const isMuted = this.audio.toggleMusic();
                if (isMuted) {
                    this.muteBtn.textContent = "MUSIC: OFF";
                    this.muteBtn.style.opacity = "0.5";
                    this.muteBtn.style.textDecoration = "line-through";
                } else {
                    this.muteBtn.textContent = "MUSIC: ON";
                    this.muteBtn.style.opacity = "1";
                    this.muteBtn.style.textDecoration = "none";
                }
            });
        }

        

        // --- 3. START GAME ---
        const startBtn = document.getElementById('btn-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.titleScreen.style.opacity = '0';
                setTimeout(() => {
                    this.titleScreen.classList.add('hidden');
                    this.uiContainer.classList.remove('hidden');
                }, 800);
                window.dispatchEvent(new Event('startSimulation'));
            });
        }

        // --- SETTINGS LOGIC ---
        const settingsTitleBtn = document.getElementById('btn-settings-title');
        if(settingsTitleBtn) {
            settingsTitleBtn.addEventListener('click', () => {
                this.settingsModal.classList.remove('hidden');
            });
        }

        const gameSettingsBtn = document.getElementById('btn-open-settings-game');
        if(gameSettingsBtn) {
            gameSettingsBtn.addEventListener('click', () => {
                this.settingsModal.classList.remove('hidden');
            });
        }

        const closeSettingsBtn = document.getElementById('btn-close-settings');
        if(closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                this.settingsModal.classList.add('hidden');
                window.dispatchEvent(new CustomEvent('settingsChanged', { 
                    detail: { 
                        quality: this.qualitySelect.value,
                        shadows: this.shadowBtn.classList.contains('active')
                    }
                }));
            });
        }

        if(this.shadowBtn) {
            this.shadowBtn.addEventListener('click', () => {
                this.shadowBtn.classList.toggle('active');
                this.shadowBtn.textContent = this.shadowBtn.classList.contains('active') ? 'ENABLED' : 'DISABLED';
            });
        }
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

        this.nameEl.textContent = data.name;
        this.sciEl.textContent = data.sciName || data.name; 
        this.heightEl.textContent = data.height + "m";
        if(this.dietEl && data.diet) this.dietEl.textContent = data.diet;
        this.descEl.textContent = data.desc;
        
        this.infoCard.classList.remove('hidden');
        void this.infoCard.offsetWidth; 
        this.infoCard.classList.add('active-card');
    }

    hideInfo() {
        if(!this.currentDino) return;
        this.currentDino = null;
        this.infoCard.classList.remove('active-card');
    }

    
}