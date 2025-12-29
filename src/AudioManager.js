export class AudioManager {
    constructor() {
        // Channel 1: The Roar (One shot)
        this.roar = new Audio('/sounds/roar.mp3');
        this.roar.volume = 0.8;

        // Channel 2: Music (Loop, Muteable)
        this.bgm = new Audio('/sounds/music.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.4; 

        // Channel 3: Ambient Nature (Loop, Always On)
        this.ambient = new Audio('/sounds/ambient.mp3');
        this.ambient.loop = true;
        this.ambient.volume = 0.6; 

        this.isMusicMuted = false;
    }

    // Call this when user clicks "ACKNOWLEDGE"
    async startExperience() {
        try {
            // 1. Play Roar
            await this.roar.play();

            // 2. Start Background Audio (Music + Ambient)
            // We use a slight delay so the roar stands out
            this.bgm.play().catch(e => console.warn("Music block", e));
            this.ambient.play().catch(e => console.warn("Ambient block", e));
            
        } catch (e) {
            console.warn("Audio failed to start (interaction needed)", e);
        }
    }

    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        
        // Mute ONLY the music, keep ambient nature sounds running
        this.bgm.muted = this.isMusicMuted;
        
        return this.isMusicMuted;
    }
}