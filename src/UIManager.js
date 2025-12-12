export class UIManager {
    constructor() {
        this.infoCard = document.getElementById('info-card');
        this.nameEl = document.getElementById('dino-name');
        this.heightEl = document.getElementById('dino-height');
        this.dietEl = document.getElementById('dino-diet'); // Simplified
        this.descEl = document.getElementById('dino-desc');
        this.dinoList = document.getElementById('dino-list');
        
        this.currentDino = null;
    }

    populateList(dinoData, callback) {
        dinoData.forEach((dino, index) => {
            const li = document.createElement('li');
            li.textContent = dino.name;
            li.addEventListener('click', () => callback(index));
            this.dinoList.appendChild(li);
        });
    }

    showInfo(data) {
        if(this.currentDino === data.name) return; // Prevent flickering
        this.currentDino = data.name;

        this.nameEl.textContent = data.name;
        this.heightEl.textContent = data.height + "m";
        this.descEl.textContent = data.desc;
        
        this.infoCard.classList.remove('hidden');
    }

    hideInfo() {
        if(!this.currentDino) return;
        this.currentDino = null;
        this.infoCard.classList.add('hidden');
    }
}