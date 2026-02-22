// R-Type 1987 Authentic Sound System
// Generates R-Type style audio using Web Audio API

class RTypeSounds {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = {};
        this.musicPlaying = false;
        this.currentMusic = null;
        
        // Sound presets
        this.presets = {
            // Weapon sounds
            playerShot: { type: 'square', freq: 800, duration: 0.05, volume: 0.3 },
            forceShot: { type: 'sawtooth', freq: 600, duration: 0.1, volume: 0.4 },
            waveCannonCharge: { type: 'sine', freq: 200, duration: 0.5, volume: 0.5, sweep: true },
            waveCannonFire: { type: 'noise', duration: 0.3, volume: 0.7, filter: true },
            
            // Force Pod sounds
            forceAttach: { type: 'sine', freq: 400, duration: 0.2, volume: 0.4, sweepUp: true },
            forceDetach: { type: 'sine', freq: 600, duration: 0.2, volume: 0.4, sweepDown: true },
            
            // Enemy sounds
            enemyShot: { type: 'square', freq: 300, duration: 0.08, volume: 0.2 },
            enemyDestroy: { type: 'noise', duration: 0.4, volume: 0.5, filter: true },
            
            // Player sounds
            playerHit: { type: 'square', freq: 200, duration: 0.3, volume: 0.6, sweepDown: true },
            playerDestroy: { type: 'noise', duration: 1.0, volume: 0.8, filter: true },
            
            // Power-up sounds
            powerUp: { type: 'sine', freq: 800, duration: 0.3, volume: 0.4, sweepUp: true },
            
            // Menu sounds
            menuSelect: { type: 'square', freq: 600, duration: 0.1, volume: 0.3 },
            menuConfirm: { type: 'sine', freq: 800, duration: 0.2, volume: 0.4, sweepUp: true }
        };
        
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7; // Master volume
            
            console.log('R-Type Sound System initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    // Generate a sound based on preset
    playSound(presetName) {
        if (!this.audioContext) return;
        
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`Sound preset not found: ${presetName}`);
            return;
        }
        
        const now = this.audioContext.currentTime;
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Set oscillator type
        if (preset.type === 'noise') {
            // Create noise buffer
            const bufferSize = this.audioContext.sampleRate * preset.duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noiseSource = this.audioContext.createBufferSource();
            noiseSource.buffer = buffer;
            
            if (preset.filter) {
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1000;
                filter.Q.value = 1;
                
                noiseSource.connect(filter);
                filter.connect(gainNode);
            } else {
                noiseSource.connect(gainNode);
            }
            
            // Configure gain envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(preset.volume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);
            
            // Play and schedule cleanup
            noiseSource.start(now);
            noiseSource.stop(now + preset.duration);
            noiseSource.onended = () => {
                noiseSource.disconnect();
                gainNode.disconnect();
            };
            
            return;
        }
        
        // For regular oscillator sounds
        oscillator.type = preset.type;
        
        // Set frequency with optional sweep
        if (preset.sweep) {
            oscillator.frequency.setValueAtTime(preset.freq * 0.5, now);
            oscillator.frequency.exponentialRampToValueAtTime(preset.freq * 2, now + preset.duration);
        } else if (preset.sweepUp) {
            oscillator.frequency.setValueAtTime(preset.freq, now);
            oscillator.frequency.exponentialRampToValueAtTime(preset.freq * 2, now + preset.duration);
        } else if (preset.sweepDown) {
            oscillator.frequency.setValueAtTime(preset.freq * 2, now);
            oscillator.frequency.exponentialRampToValueAtTime(preset.freq, now + preset.duration);
        } else {
            oscillator.frequency.value = preset.freq;
        }
        
        // Configure gain envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(preset.volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);
        
        // Add filter if specified
        if (preset.filter) {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            
            oscillator.disconnect();
            oscillator.connect(filter);
            filter.connect(gainNode);
        }
        
        // Play and schedule cleanup
        oscillator.start(now);
        oscillator.stop(now + preset.duration);
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }
    
    // Play R-Type style background music
    playMusic(track = 'stage1') {
        if (!this.audioContext || this.musicPlaying) return;
        
        this.musicPlaying = true;
        
        // Create main oscillator for bass
        const bassOsc = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.value = 110; // A2
        
        // Create lead oscillator
        const leadOsc = this.audioContext.createOscillator();
        const leadGain = this.audioContext.createGain();
        leadOsc.type = 'square';
        
        // Create filter for lead
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        filter.Q.value = 0.5;
        
        // Connect nodes
        bassOsc.connect(bassGain);
        leadOsc.connect(filter);
        filter.connect(leadGain);
        bassGain.connect(this.masterGain);
        leadGain.connect(this.masterGain);
        
        // Set volumes
        bassGain.gain.value = 0.1;
        leadGain.gain.value = 0.2;
        
        // R-Type style arpeggio pattern
        const leadNotes = [330, 392, 494, 392]; // E4, G4, B4, G4
        let noteIndex = 0;
        
        const playNote = () => {
            const now = this.audioContext.currentTime;
            leadOsc.frequency.setValueAtTime(leadNotes[noteIndex], now);
            
            // Filter envelope
            filter.frequency.setValueAtTime(3000, now);
            filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
            
            noteIndex = (noteIndex + 1) % leadNotes.length;
        };
        
        // Start playing
        bassOsc.start();
        leadOsc.start();
        
        // Play first note immediately
        playNote();
        
        // Schedule notes (R-Type has a driving 120 BPM rhythm)
        const interval = 0.5; // 120 BPM = 0.5 seconds per beat
        for (let i = 1; i < 100; i++) {
            setTimeout(() => {
                if (this.musicPlaying) playNote();
            }, i * interval * 1000);
        }
        
        this.currentMusic = { bassOsc, leadOsc, bassGain, leadGain, filter };
    }
    
    // Stop background music
    stopMusic() {
        if (!this.musicPlaying || !this.currentMusic) return;
        
        const now = this.audioContext.currentTime;
        const { bassOsc, leadOsc, bassGain, leadGain, filter } = this.currentMusic;
        
        // Fade out
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        // Stop oscillators after fade
        setTimeout(() => {
            bassOsc.stop();
            leadOsc.stop();
            bassOsc.disconnect();
            leadOsc.disconnect();
            bassGain.disconnect();
            leadGain.disconnect();
            filter.disconnect();
        }, 500);
        
        this.musicPlaying = false;
        this.currentMusic = null;
    }
    
    // Sound effects for specific game events
    playerShoot() {
        this.playSound('playerShot');
    }
    
    forcePodShoot() {
        this.playSound('forceShot');
    }
    
    waveCannonCharge() {
        this.playSound('waveCannonCharge');
    }
    
    waveCannonFire() {
        this.playSound('waveCannonFire');
    }
    
    forceAttach() {
        this.playSound('forceAttach');
    }
    
    forceDetach() {
        this.playSound('forceDetach');
    }
    
    enemyShoot() {
        this.playSound('enemyShot');
    }
    
    enemyDestroy() {
        this.playSound('enemyDestroy');
    }
    
    playerHit() {
        this.playSound('playerHit');
    }
    
    playerDestroy() {
        this.playSound('playerDestroy');
    }
    
    powerUpCollect() {
        this.playSound('powerUp');
    }
    
    menuSelect() {
        this.playSound('menuSelect');
    }
    
    menuConfirm() {
        this.playSound('menuConfirm');
    }
    
    // Set master volume (0.0 to 1.0)
    setVolume(level) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, level));
        }
    }
    
    // Mute/unmute all sounds
    mute(shouldMute = true) {
        if (this.masterGain) {
            this.masterGain.gain.value = shouldMute ? 0 : 0.7;
        }
    }
    
    // Resume audio context (required after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RTypeSounds;
}