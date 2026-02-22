// R-Type 1987 Authentic Clone
// Core mechanics: Force Pod system, Wave Cannon, authentic gameplay

class RType1987 {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'start'; // start, playing, paused, gameOver
        this.score = 0;
        this.highScore = localStorage.getItem('rtype1987HighScore') || 0;
        this.lives = 3;
        this.wave = 1;
        this.gameTime = 0;
        this.paused = false;
        
        // Player ship (R-9 Arrowhead)
        this.player = {
            x: 100,
            y: this.canvas.height / 2,
            width: 40,
            height: 30,
            speed: 3, // Slow deliberate pacing
            color: '#0af',
            hitbox: { x: 10, y: 5, width: 20, height: 20 }, // Large hitbox
            invulnerable: 0,
            blinkTimer: 0
        };
        
        // FORCE POD SYSTEM - Core mechanic
        this.forcePod = {
            x: this.player.x + 45,
            y: this.player.y,
            width: 24,
            height: 24,
            color: '#f80', // Orange orb
            attached: true,
            attachmentSide: 'front', // 'front' or 'rear'
            detachedSpeed: 5,
            detachedDirection: 1, // 1 for right, -1 for left when recalled
            level: 1, // 1-3
            weaponType: 'red', // 'red', 'blue', 'yellow'
            recallSpeed: 2,
            isRecalling: false,
            independentX: 0,
            independentY: 0
        };
        
        // WAVE CANNON system
        this.waveCannon = {
            charging: false,
            chargeLevel: 0,
            maxCharge: 100,
            chargeRate: 1.5,
            canFireNormal: true,
            cooldown: 0
        };
        
        // Game objects
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.backgroundStars = [];
        
        // Input state
        this.keys = {};
        this.setupInput();
        
        // Wave configuration
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 2000; // Slow, deliberate enemy patterns
        
        // Background
        this.initBackground();
        
        // UI elements
        this.updateUI();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
        
        // Event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
            
            if (e.key === ' ' && this.gameState === 'gameOver') {
                this.restartGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            
            // Wave Cannon release
            if ((e.key === 'z' || e.key === 'Z') && this.waveCannon.charging) {
                this.fireWaveCannon();
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        this.resetGameState();
    }
    
    restartGame() {
        this.gameState = 'playing';
        document.getElementById('gameOver').style.display = 'none';
        this.resetGameState();
    }
    
    resetGameState() {
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.gameTime = 0;
        
        // Reset player
        this.player.x = 100;
        this.player.y = this.canvas.height / 2;
        this.player.invulnerable = 0;
        
        // Reset Force Pod
        this.forcePod.attached = true;
        this.forcePod.attachmentSide = 'front';
        this.forcePod.level = 1;
        this.forcePod.weaponType = 'red';
        this.forcePod.isRecalling = false;
        
        // Reset Wave Cannon
        this.waveCannon.charging = false;
        this.waveCannon.chargeLevel = 0;
        this.waveCannon.canFireNormal = true;
        
        // Clear game objects
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        
        this.updateUI();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.paused = !this.paused;
        }
    }
    
    initBackground() {
        // Create starfield
        for (let i = 0; i < 200; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.2,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    updateBackground() {
        // Update star positions
        for (let star of this.backgroundStars) {
            star.x -= star.speed;
            if (star.x < -10) {
                star.x = this.canvas.width + 10;
                star.y = Math.random() * this.canvas.height;
            }
        }
    }
    
    renderBackground() {
        // Draw space background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        for (let star of this.backgroundStars) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    updatePlayer() {
        if (this.player.invulnerable > 0) {
            this.player.invulnerable--;
            this.player.blinkTimer = (this.player.blinkTimer + 1) % 10;
        }
        
        // Movement - slow and deliberate
        let moveX = 0, moveY = 0;
        
        if (this.keys['arrowleft'] || this.keys['a']) moveX = -1;
        if (this.keys['arrowright'] || this.keys['d']) moveX = 1;
        if (this.keys['arrowup'] || this.keys['w']) moveY = -1;
        if (this.keys['arrowdown'] || this.keys['s']) moveY = 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/√2
            moveY *= 0.707;
        }
        
        this.player.x += moveX * this.player.speed;
        this.player.y += moveY * this.player.speed;
        
        // Keep player on screen
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));
        this.player.y = Math.max(20, Math.min(this.canvas.height - 20, this.player.y));
        
        // Update Force Pod position based on attachment state
        this.updateForcePod();
        
        // Handle Wave Cannon charging
        this.updateWaveCannon();
        
        // Handle normal firing
        if (this.waveCannon.canFireNormal && (this.keys['z'] || this.keys['z'])) {
            this.fireNormalWeapon();
        }
        
        // Handle Force Pod controls
        if (this.keys['x'] || this.keys['x']) {
            this.handleForcePodControl();
            this.keys['x'] = false; // Consume the key press
        }
        
        // Handle Force weapon switching
        if (this.keys['c'] || this.keys['c']) {
            this.switchForceWeapon();
            this.keys['c'] = false; // Consume the key press
        }
    }
    
    updateForcePod() {
        if (this.forcePod.attached) {
            // Attached to ship
            if (this.forcePod.attachmentSide === 'front') {
                this.forcePod.x = this.player.x + 45;
            } else { // rear
                this.forcePod.x = this.player.x - 15;
            }
            this.forcePod.y = this.player.y;
            
            // Fire Force weapon when attached
            this.fireForceWeapon();
        } else {
            // Detached - independent movement
            if (this.forcePod.isRecalling) {
                // Move toward player for recall
                const dx = this.player.x - this.forcePod.x;
                const dy = this.player.y - this.forcePod.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 10) {
                    // Re-attach
                    this.forcePod.attached = true;
                    this.forcePod.isRecalling = false;
                    // Determine attachment side based on relative position
                    this.forcePod.attachmentSide = (this.forcePod.x < this.player.x) ? 'rear' : 'front';
                } else {
                    this.forcePod.x += (dx / dist) * this.forcePod.recallSpeed;
                    this.forcePod.y += (dy / dist) * this.forcePod.recallSpeed;
                }
            } else {
                // Move independently
                this.forcePod.x += this.forcePod.detachedSpeed * this.forcePod.detachedDirection;
                
                // Keep on screen
                if (this.forcePod.x < 0 || this.forcePod.x > this.canvas.width) {
                    this.forcePod.detachedDirection *= -1;
                }
                
                // Fire detached weapon
                this.fireDetachedForceWeapon();
            }
        }
    }
    
    handleForcePodControl() {
        if (this.forcePod.attached) {
            // Launch Force Pod
            this.forcePod.attached = false;
            this.forcePod.isRecalling = false;
            this.forcePod.detachedDirection = 1; // Fly forward
        } else if (!this.forcePod.isRecalling) {
            // Start recalling
            this.forcePod.isRecalling = true;
            this.forcePod.detachedDirection = (this.forcePod.x < this.player.x) ? 1 : -1;
        }
        // If already recalling, another press does nothing
    }
    
    switchForceWeapon() {
        const weapons = ['red', 'blue', 'yellow'];
        const currentIndex = weapons.indexOf(this.forcePod.weaponType);
        this.forcePod.weaponType = weapons[(currentIndex + 1) % weapons.length];
        this.updateForceWeaponUI();
    }
    
    updateWaveCannon() {
        if (this.keys['z'] || this.keys['Z']) {
            if (!this.waveCannon.charging && this.waveCannon.cooldown <= 0) {
                this.waveCannon.charging = true;
                this.waveCannon.canFireNormal = false; // Cannot fire normal shots while charging
            }
            
            if (this.waveCannon.charging) {
                this.waveCannon.chargeLevel = Math.min(
                    this.waveCannon.chargeLevel + this.waveCannon.chargeRate,
                    this.waveCannon.maxCharge
                );
                
                // Update UI
                document.getElementById('waveCannonBar').style.width = 
                    (this.waveCannon.chargeLevel / this.waveCannon.maxCharge * 100) + '%';
            }
        }
    }
    
    fireWaveCannon() {
        if (this.waveCannon.chargeLevel > 0) {
            // Create Wave Cannon beam
            const beamWidth = 10 + (this.waveCannon.chargeLevel / 10);
            const beamHeight = 15 + (this.waveCannon.chargeLevel / 5);
            
            this.bullets.push({
                x: this.player.x + this.player.width,
                y: this.player.y + this.player.height / 2 - beamHeight / 2,
                width: 60,
                height: beamHeight,
                speed: 12,
                color: this.getWaveCannonColor(this.waveCannon.chargeLevel),
                damage: Math.floor(this.waveCannon.chargeLevel / 20) + 1,
                piercing: true,
                isWaveCannon: true
            });
            
            // Reset charge
            this.waveCannon.charging = false;
            this.waveCannon.chargeLevel = 0;
            this.waveCannon.cooldown = 30; // 0.5 seconds at 60fps
            this.waveCannon.canFireNormal = true;
            
            // Update UI
            document.getElementById('waveCannonBar').style.width = '0%';
            
            // Visual effect
            this.createMuzzleFlash(this.player.x + this.player.width, this.player.y + this.player.height / 2, '#0af');
        }
    }
    
    getWaveCannonColor(chargeLevel) {
        if (chargeLevel < 33) return '#00f';
        if (chargeLevel < 66) return '#0af';
        return '#fff';
    }
    
    fireNormalWeapon() {
        // Rapid fire when Force Pod is detached
        const fireRate = this.forcePod.attached ? 15 : 8; // Slower when Force attached
        
        if (this.gameTime % fireRate === 0) {
            this.bullets.push({
                x: this.player.x + this.player.width,
                y: this.player.y + this.player.height / 2,
                width: 20,
                height: 5,
                speed: 10,
                color: '#ff0',
                damage: 1
            });
            
            this.createMuzzleFlash(this.player.x + this.player.width, this.player.y + this.player.height / 2, '#ff0');
        }
    }
    
    fireForceWeapon() {
        // Only fire when attached and not charging Wave Cannon
        if (!this.forcePod.attached || this.waveCannon.charging) return;
        
        const fireRate = 30; // Slow, deliberate firing
        
        if (this.gameTime % fireRate === 0) {
            let bullets = [];
            
            switch (this.forcePod.weaponType) {
                case 'red': // Counter-Air Laser
                    bullets = [
                        { x: 0, y: 0, angle: 0, color: '#f00' },
                        { x: 0, y: 0, angle: 0, color: '#00f' }
                    ];
                    if (this.forcePod.level >= 3) {
                        // DNA pattern at level 3
                        bullets.push({ x: 0, y: 5, angle: 0.1, color: '#f00' });
                        bullets.push({ x: 0, y: -5, angle: -0.1, color: '#00f' });
                    }
                    break;
                    
                case 'blue': // Rebound Laser
                    bullets = [
                        { x: 0, y: 10, angle: 0.3, color: '#0af' },
                        { x: 0, y: -10, angle: -0.3, color: '#0af' },
                        { x: 0, y: 0, angle: 0, color: '#0af' }
                    ];
                    break;
                    
                case 'yellow': // Counter-Ground Laser
                    bullets = [
                        { x: 0, y: 15, angle: Math.PI/2, color: '#ff0' },
                        { x: 0, y: -15, angle: -Math.PI/2, color: '#ff0' }
                    ];
                    break;
            }
            
            for (let bullet of bullets) {
                this.bullets.push({
                    x: this.forcePod.x + bullet.x,
                    y: this.forcePod.y + bullet.y,
                    width: 25,
                    height: 8,
                    speed: 8,
                    color: bullet.color,
                    damage: 2,
                    angle: bullet.angle,
                    isForceWeapon: true,
                    weaponType: this.forcePod.weaponType
                });
            }
        }
    }
    
    fireDetachedForceWeapon() {
        // Fire pattern based on Force Pod level
        const fireRate = 45;
        
        if (this.gameTime % fireRate === 0) {
            let patterns = [];
            
            switch (this.forcePod.level) {
                case 1:
                    // Single forward shot
                    patterns.push({ x: 0, y: 0, angle: 0 });
                    break;
                    
                case 2:
                    // V-shaped pattern
                    patterns.push({ x: 0, y: -5, angle: -0.1 });
                    patterns.push({ x: 0, y: 5, angle: 0.1 });
                    break;
                    
                case 3:
                    // K-shaped pattern (up, down, and forward)
                    patterns.push({ x: 0, y: -10, angle: -0.2 });
                    patterns.push({ x: 0, y: 10, angle: 0.2 });
                    patterns.push({ x: 0, y: -5, angle: -0.1 });
                    patterns.push({ x: 0, y: 5, angle: 0.1 });
                    break;
            }
            
            for (let pattern of patterns) {
                this.bullets.push({
                    x: this.forcePod.x,
                    y: this.forcePod.y + pattern.y,
                    width: 15,
                    height: 5,
                    speed: 7,
                    color: '#0f0',
                    damage: 1,
                    angle: pattern.angle
                });
            }
        }
    }
    
    createMuzzleFlash(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 4 + 2,
                color: color,
                life: 20,
                speed: Math.random() * 3 + 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= this.enemySpawnRate) {
            this.enemySpawnTimer = 0;
            
            // Create enemy with scripted pattern
            const enemyType = Math.floor(Math.random() * 3);
            let enemy;
            
            switch (enemyType) {
                case 0: // Basic enemy - straight line
                    enemy = {
                        x: this.canvas.width + 50,
                        y: Math.random() * (this.canvas.height - 100) + 50,
                        width: 30,
                        height: 30,
                        speed: 1.5,
                        color: '#f88',
                        health: 2,
                        pattern: 'straight',
                        patternTimer: 0,
                        canShoot: true,
                        shootTimer: 0
                    };
                    break;
                    
                case 1: // Swooping enemy - sine wave
                    enemy = {
                        x: this.canvas.width + 50,
                        y: this.canvas.height / 2,
                        width: 35,
                        height: 25,
                        speed: 1.2,
                        color: '#8f8',
                        health: 3,
                        pattern: 'sine',
                        patternTimer: 0,
                        amplitude: 100,
                        frequency: 0.02,
                        canShoot: true,
                        shootTimer: 0
                    };
                    break;
                    
                case 2: // Tank enemy - slow, shoots often
                    enemy = {
                        x: this.canvas.width + 50,
                        y: Math.random() * (this.canvas.height - 100) + 50,
                        width: 40,
                        height: 40,
                        speed: 0.8,
                        color: '#88f',
                        health: 5,
                        pattern: 'straight',
                        patternTimer: 0,
                        canShoot: true,
                        shootTimer: 30
                    };
                    break;
            }
            
            this.enemies.push(enemy);
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Update position based on pattern
            switch (enemy.pattern) {
                case 'straight':
                    enemy.x -= enemy.speed;
                    break;
                    
                case 'sine':
                    enemy.x -= enemy.speed;
                    enemy.patternTimer++;
                    enemy.y = this.canvas.height / 2 + 
                              Math.sin(enemy.patternTimer * enemy.frequency) * enemy.amplitude;
                    break;
            }
            
            // Enemy shooting
            if (enemy.canShoot) {
                enemy.shootTimer++;
                if (enemy.shootTimer >= 90) { // Every 1.5 seconds at 60fps
                    this.enemyShoot(enemy);
                    enemy.shootTimer = 0;
                }
            }
            
            // Remove if off screen
            if (enemy.x + enemy.width < 0) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    enemyShoot(enemy) {
        // Simple enemy shooting pattern
        this.enemyBullets.push({
            x: enemy.x,
            y: enemy.y + enemy.height / 2,
            width: 15,
            height: 5,
            speed: 4,
            color: '#f00',
            damage: 1
        });
    }
    
    updateBullets() {
        // Player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update position with angle
            bullet.x += Math.cos(bullet.angle || 0) * bullet.speed;
            bullet.y += Math.sin(bullet.angle || 0) * bullet.speed;
            
            // Remove if off screen
            if (bullet.x > this.canvas.width || bullet.x + bullet.width < 0 ||
                bullet.y > this.canvas.height || bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.x -= bullet.speed;
            
            // Remove if off screen
            if (bullet.x + bullet.width < 0) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;
            particle.life--;
            particle.size *= 0.95;
            
            if (particle.life <= 0 || particle.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Player vs Enemy Bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            // Check if Force Pod blocks the bullet (when attached)
            if (this.forcePod.attached && this.checkCollision(bullet, this.forcePod)) {
                // Force Pod is INDESTRUCTIBLE - absorbs bullet
                this.createExplosion(bullet.x, bullet.y, bullet.color);
                this.enemyBullets.splice(i, 1);
                continue;
            }
            
            // Check player hit
            if (this.player.invulnerable <= 0 && this.checkCollision(bullet, this.player)) {
                this.playerHit();
                this.enemyBullets.splice(i, 1);
            }
        }
        
        // Player vs Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.player.invulnerable <= 0 && this.checkCollision(enemy, this.player)) {
                this.playerHit();
            }
        }
        
        // Bullets vs Enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    enemy.health -= bullet.damage;
                    
                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
                        this.score += 100 * this.wave;
                        this.enemies.splice(j, 1);
                        
                        // Chance to spawn power-up
                        if (Math.random() < 0.2) {
                            this.spawnPowerUp(enemy.x, enemy.y);
                        }
                    } else {
                        // Hit effect
                        this.createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2, bullet.color);
                    }
                    
                    if (!bullet.piercing) {
                        bulletHit = true;
                    }
                    break;
                }
            }
            
            if (bulletHit && !bullet.piercing) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Force Pod vs Enemies (when detached)
        if (!this.forcePod.attached && !this.forcePod.isRecalling) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (this.checkCollision(this.forcePod, enemy)) {
                    // Force Pod damages enemies on contact
                    enemy.health -= 2;
                    this.createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#f80');
                    
                    if (enemy.health <= 0) {
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
                        this.score += 100 * this.wave;
                        this.enemies.splice(i, 1);
                    }
                }
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    playerHit() {
        if (this.player.invulnerable > 0) return;
        
        this.lives--;
        this.player.invulnerable = 120; // 2 seconds invulnerability at 60fps
        
        // Create explosion effect
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#0af');
        
        // Reset Force Pod
        this.forcePod.attached = true;
        this.forcePod.attachmentSide = 'front';
        this.forcePod.isRecalling = false;
        this.forcePod.x = this.player.x + 45;
        this.forcePod.y = this.player.y;
        
        if (this.lives <= 0) {
            this.gameOver();
        }
        
        this.updateUI();
    }
    
    spawnPowerUp(x, y) {
        // In R-Type, power-ups come from POW Armor
        // For now, just spawn a laser crystal
        const types = ['red', 'blue', 'yellow'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // This would be the power-up object
        // For simplicity, we'll just upgrade the Force Pod
        if (this.forcePod.level < 3) {
            this.forcePod.level++;
        }
        this.forcePod.weaponType = type;
        this.updateForceWeaponUI();
        
        // Visual effect
        this.createPowerUpEffect(x, y, type);
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 6 + 3,
                color: color,
                life: Math.random() * 30 + 20,
                speed: Math.random() * 4 + 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    
    createHitEffect(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 3 + 2,
                color: color,
                life: 15,
                speed: Math.random() * 2 + 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    
    createPowerUpEffect(x, y, type) {
        const colors = { red: '#f00', blue: '#00f', yellow: '#ff0' };
        const color = colors[type];
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 4 + 2,
                color: color,
                life: Math.random() * 40 + 20,
                speed: Math.random() * 3 + 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    
    updateWaveCannonCooldown() {
        if (this.waveCannon.cooldown > 0) {
            this.waveCannon.cooldown--;
        }
    }
    
    updateGameTime() {
        this.gameTime++;
        
        // Progress waves based on time
        if (this.gameTime % 3600 === 0) { // Every 60 seconds at 60fps
            this.wave++;
            this.updateUI();
            
            // Increase difficulty
            this.enemySpawnRate = Math.max(500, this.enemySpawnRate - 100);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score.toString().padStart(7, '0');
        document.getElementById('highScore').textContent = this.highScore.toString().padStart(7, '0');
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('wave').textContent = this.wave;
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('rtype1987HighScore', this.highScore);
        }
    }
    
    updateForceWeaponUI() {
        const weaponNames = {
            red: 'RED LASER',
            blue: 'BLUE LASER', 
            yellow: 'YELLOW LASER'
        };
        
        document.getElementById('forceWeapon').textContent = weaponNames[this.forcePod.weaponType];
        
        const status = this.forcePod.attached ? 
            `ATTACHED (${this.forcePod.attachmentSide.toUpperCase()})` : 
            'DETACHED';
        document.getElementById('forceStatus').textContent = status;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score.toString().padStart(7, '0');
        document.getElementById('finalWave').textContent = this.wave;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.renderBackground();
        
        // Draw particles
        for (let particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw enemy bullets
        for (let bullet of this.enemyBullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw player bullets
        for (let bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            
            if (bullet.isWaveCannon) {
                // Wave Cannon beam with glow
                this.ctx.shadowColor = bullet.color;
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                this.ctx.shadowBlur = 0;
            } else {
                this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        }
        
        // Draw enemies
        for (let enemy of this.enemies) {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Enemy details
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);
        }
        
        // Draw Force Pod
        if (this.forcePod) {
            this.ctx.fillStyle = this.forcePod.color;
            this.ctx.beginPath();
            this.ctx.arc(this.forcePod.x, this.forcePod.y, this.forcePod.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner detail
            this.ctx.fillStyle = '#ff0';
            this.ctx.beginPath();
            this.ctx.arc(this.forcePod.x, this.forcePod.y, this.forcePod.width/4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw player (with invulnerability blink)
        if (this.player.invulnerable <= 0 || this.player.blinkTimer < 5) {
            this.ctx.fillStyle = this.player.color;
            
            // R-9 Arrowhead shape
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.x, this.player.y + this.player.height/2);
            this.ctx.lineTo(this.player.x + this.player.width, this.player.y);
            this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Cockpit detail
            this.ctx.fillStyle = '#0ff';
            this.ctx.fillRect(this.player.x + 15, this.player.y + 10, 10, 10);
        }
        
        // Draw hitbox for debugging (optional)
        /*
        this.ctx.strokeStyle = '#f00';
        this.ctx.strokeRect(
            this.player.x + this.player.hitbox.x,
            this.player.y + this.player.hitbox.y,
            this.player.hitbox.width,
            this.player.hitbox.height
        );
        */
    }
    
    gameLoop(currentTime = performance.now()) {
        if (this.paused || this.gameState !== 'playing') {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        this.updateBackground();
        this.updatePlayer();
        this.spawnEnemies();
        this.updateEnemies();
        this.updateBullets();
        this.updateParticles();
        this.checkCollisions();
        this.updateWaveCannonCooldown();
        this.updateGameTime();
        
        // Render
        this.render();
        
        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new RType1987();
    
    // Make game accessible from console for debugging
    window.rtypeGame = game;
});
