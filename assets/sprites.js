// R-Type 1987 Authentic Sprite System
// Creates authentic R-Type style sprites programmatically

class RTypeSprites {
    constructor(ctx) {
        this.ctx = ctx;
        
        // R-Type color palette (based on arcade version)
        this.palette = {
            // Player ship colors
            shipBlue: '#0af',
            shipLightBlue: '#8cf',
            shipDarkBlue: '#06a',
            cockpit: '#0ff',
            
            // Force Pod colors
            forceOrange: '#f80',
            forceYellow: '#ff0',
            forceRed: '#f00',
            forceGlow: '#fa0',
            
            // Enemy colors (Bydo bio-mechanical)
            bydoRed: '#f44',
            bydoPurple: '#a4f',
            bydoGreen: '#4f4',
            bydoYellow: '#ff4',
            bydoFlesh: '#f96',
            bydoMetal: '#888',
            
            // Weapon colors
            bulletYellow: '#ff0',
            laserRed: '#f00',
            laserBlue: '#0af',
            laserYellow: '#ff0',
            waveCannonBlue: '#0af',
            waveCannonWhite: '#fff',
            
            // Background colors
            spaceDark: '#001',
            spaceMedium: '#114',
            spaceLight: '#338'
        };
    }
    
    // Draw R-9 Arrowhead ship
    drawShip(x, y, width, height, angle = 0) {
        this.ctx.save();
        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.rotate(angle);
        
        // Main body (arrowhead shape)
        this.ctx.fillStyle = this.palette.shipBlue;
        this.ctx.beginPath();
        this.ctx.moveTo(-width/2, 0);
        this.ctx.lineTo(width/2, -height/2);
        this.ctx.lineTo(width/2, height/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Engine details
        this.ctx.fillStyle = this.palette.shipDarkBlue;
        this.ctx.fillRect(-width/4, -height/4, width/4, height/2);
        
        // Cockpit
        this.ctx.fillStyle = this.palette.cockpit;
        this.ctx.beginPath();
        this.ctx.arc(-width/6, 0, height/6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing details
        this.ctx.strokeStyle = this.palette.shipLightBlue;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(width/4, -height/3);
        this.ctx.lineTo(width/2, -height/2);
        this.ctx.moveTo(width/4, height/3);
        this.ctx.lineTo(width/2, height/2);
        this.ctx.stroke();
        
        // Engine glow
        const gradient = this.ctx.createLinearGradient(-width/2, 0, -width/2 - 10, 0);
        gradient.addColorStop(0, this.palette.shipLightBlue);
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-width/2 - 10, -height/4, 10, height/2);
        
        this.ctx.restore();
    }
    
    // Draw Force Pod (glowing orange orb)
    drawForcePod(x, y, size, attached = true, level = 1) {
        this.ctx.save();
        
        // Outer glow
        const outerGradient = this.ctx.createRadialGradient(
            x, y, size/2,
            x, y, size
        );
        outerGradient.addColorStop(0, this.palette.forceGlow + 'cc');
        outerGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = outerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main orb
        const mainGradient = this.ctx.createRadialGradient(
            x - size/4, y - size/4, 0,
            x, y, size/2
        );
        mainGradient.addColorStop(0, this.palette.forceYellow);
        mainGradient.addColorStop(0.5, this.palette.forceOrange);
        mainGradient.addColorStop(1, this.palette.forceRed);
        
        this.ctx.fillStyle = mainGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner energy core
        this.ctx.fillStyle = this.palette.forceYellow;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pulsing effect
        const pulseSize = size/6 + Math.sin(Date.now() / 200) * size/12;
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Level indicator (dots around orb)
        if (level > 1) {
            this.ctx.fillStyle = '#fff';
            for (let i = 0; i < level; i++) {
                const angle = (i / level) * Math.PI * 2;
                const dotX = x + Math.cos(angle) * (size/2 + 5);
                const dotY = y + Math.sin(angle) * (size/2 + 5);
                this.ctx.beginPath();
                this.ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    // Draw Bydo enemy (bio-mechanical style)
    drawBydoEnemy(x, y, width, height, type = 'basic') {
        this.ctx.save();
        
        switch (type) {
            case 'basic':
                this.drawBasicBydo(x, y, width, height);
                break;
            case 'swooper':
                this.drawSwooperBydo(x, y, width, height);
                break;
            case 'tank':
                this.drawTankBydo(x, y, width, height);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawBasicBydo(x, y, width, height) {
        // Organic-mechanical hybrid design
        this.ctx.fillStyle = this.palette.bydoRed;
        this.ctx.fillRect(x, y, width, height);
        
        // Mechanical parts
        this.ctx.fillStyle = this.palette.bydoMetal;
        this.ctx.fillRect(x + width/4, y, width/2, height/4);
        this.ctx.fillRect(x + width/4, y + height*3/4, width/2, height/4);
        
        // Organic details
        this.ctx.fillStyle = this.palette.bydoFlesh;
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, width/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye/optic
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, width/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, width/12, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawSwooperBydo(x, y, width, height) {
        // Winged bio-mechanical enemy
        this.ctx.fillStyle = this.palette.bydoPurple;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height/2);
        this.ctx.lineTo(x + width/3, y);
        this.ctx.lineTo(x + width, y + height/3);
        this.ctx.lineTo(x + width, y + height*2/3);
        this.ctx.lineTo(x + width/3, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wings
        this.ctx.fillStyle = this.palette.bydoGreen;
        this.ctx.fillRect(x + width/3, y - height/4, width/3, height/4);
        this.ctx.fillRect(x + width/3, y + height, width/3, height/4);
        
        // Mechanical details
        this.ctx.fillStyle = this.palette.bydoMetal;
        this.ctx.fillRect(x + width/2, y + height/4, width/4, height/2);
        
        // Energy core
        this.ctx.fillStyle = this.palette.bydoYellow;
        this.ctx.beginPath();
        this.ctx.arc(x + width/4, y + height/2, width/6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawTankBydo(x, y, width, height) {
        // Heavy armored enemy
        this.ctx.fillStyle = this.palette.bydoMetal;
        this.ctx.fillRect(x, y, width, height);
        
        // Armor plates
        this.ctx.fillStyle = this.palette.bydoRed;
        this.ctx.fillRect(x + width/8, y + height/8, width*3/4, height*3/4);
        
        // Bio-organic core
        this.ctx.fillStyle = this.palette.bydoFlesh;
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Weapon ports
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + width/4, y + height/4, width/8, height/8);
        this.ctx.fillRect(x + width/4, y + height*5/8, width/8, height/8);
        this.ctx.fillRect(x + width*5/8, y + height/4, width/8, height/8);
        this.ctx.fillRect(x + width*5/8, y + height*5/8, width/8, height/8);
    }
    
    // Draw Wave Cannon beam
    drawWaveCannon(x, y, width, height, chargeLevel) {
        this.ctx.save();
        
        // Beam with gradient
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
        if (chargeLevel < 33) {
            gradient.addColorStop(0, '#00f');
            gradient.addColorStop(1, '#0af');
        } else if (chargeLevel < 66) {
            gradient.addColorStop(0, '#0af');
            gradient.addColorStop(0.5, '#4ff');
            gradient.addColorStop(1, '#0af');
        } else {
            gradient.addColorStop(0, '#4ff');
            gradient.addColorStop(0.3, '#fff');
            gradient.addColorStop(0.7, '#fff');
            gradient.addColorStop(1, '#4ff');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
        
        // Glow effect
        this.ctx.shadowColor = gradient;
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
        
        // Energy particles along beam
        const particleCount = Math.floor(width / 10);
        for (let i = 0; i < particleCount; i++) {
            const particleX = x + Math.random() * width;
            const particleY = y + Math.random() * height;
            const size = Math.random() * 3 + 1;
            
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // Draw laser beam (Red/Blue/Yellow)
    drawLaser(x, y, width, height, colorType, angle = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        let gradient;
        switch (colorType) {
            case 'red':
                gradient = this.ctx.createLinearGradient(0, -height/2, 0, height/2);
                gradient.addColorStop(0, '#f00');
                gradient.addColorStop(0.5, '#f88');
                gradient.addColorStop(1, '#f00');
                break;
            case 'blue':
                gradient = this.ctx.createLinearGradient(0, -height/2, 0, height/2);
                gradient.addColorStop(0, '#00f');
                gradient.addColorStop(0.5, '#88f');
                gradient.addColorStop(1, '#00f');
                break;
            case 'yellow':
                gradient = this.ctx.createLinearGradient(0, -height/2, 0, height/2);
                gradient.addColorStop(0, '#ff0');
                gradient.addColorStop(0.5, '#ff8');
                gradient.addColorStop(1, '#ff0');
                break;
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, -height/2, width, height);
        
        // Glow
        this.ctx.shadowColor = gradient;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(0, -height/2, width, height);
        this.ctx.shadowBlur = 0;
        
        this.ctx.restore();
    }
    
    // Draw explosion effect
    drawExplosion(x, y, size, color) {
        this.ctx.save();
        
        // Fireball core
        const coreGradient = this.ctx.createRadialGradient(
            x, y, 0,
            x, y, size
        );
        coreGradient.addColorStop(0, '#fff');
        coreGradient.addColorStop(0.3, '#ff0');
        coreGradient.addColorStop(0.6, color || '#f00');
        coreGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Shockwave rings
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ringSize = size * (1 + i * 0.5);
            const alpha = 0.3 - i * 0.1;
            
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, ringSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Debris particles
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 2;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            const particleSize = Math.random() * 4 + 2;
            
            this.ctx.fillStyle = color || '#f00';
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // Draw background starfield with R-Type style
    drawStarfield(canvasWidth, canvasHeight, time) {
        // Dark space background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, this.palette.spaceDark);
        gradient.addColorStop(0.5, this.palette.spaceMedium);
        gradient.addColorStop(1, this.palette.spaceLight);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Stars with parallax effect
        const starLayers = [
            { count: 50, size: 1, speed: 0.2, color: '#fff' },
            { count: 30, size: 1.5, speed: 0.5, color: '#ccc' },
            { count: 20, size: 2, speed: 1.0, color: '#aaa' }
        ];
        
        for (const layer of starLayers) {
            for (let i = 0; i < layer.count; i++) {
                // Deterministic star positions based on layer and index
                const seed = layer.count * 1000 + i;
                const x = (Math.sin(seed * 127.1) * 43758.5453) % 1 * canvasWidth;
                const y = (Math.sin(seed * 311.7) * 52564.5555) % 1 * canvasHeight;
                
                // Animate stars
                const starX = (x - time * layer.speed) % canvasWidth;
                if (starX < 0) starX += canvasWidth;
                
                // Draw star
                this.ctx.fillStyle = layer.color;
                this.ctx.beginPath();
                this.ctx.arc(starX, y, layer.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Twinkle effect
                if (Math.sin(time * 0.001 + seed) > 0.8) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.beginPath();
                    this.ctx.arc(starX, y, layer.size * 1.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        
        // Distant nebulae (R-Type style background elements)
        this.drawNebulae(canvasWidth, canvasHeight, time);
    }
    
    // Draw background nebulae (organic, bio-mechanical looking)
    drawNebulae(canvasWidth, canvasHeight, time) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        
        // Organic shapes in background
        const shapes = [
            { x: canvasWidth * 0.2, y: canvasHeight * 0.3, size: 100, color: '#338' },
            { x: canvasWidth * 0.7, y: canvasHeight * 0.6, size: 150, color: '#446' },
            { x: canvasWidth * 0.4, y: canvasHeight * 0.8, size: 80, color: '#225' }
        ];
        
        for (const shape of shapes) {
            // Animate slowly
            const animX = shape.x + Math.sin(time * 0.0005) * 50;
            const animY = shape.y + Math.cos(time * 0.0003) * 30;
            
            // Organic blob shape
            this.ctx.fillStyle = shape.color;
            this.ctx.beginPath();
            this.ctx.arc(animX, animY, shape.size, 0, Math.PI * 2);
            
            // Add organic irregularities
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = shape.size * (0.8 + Math.sin(time * 0.001 + i) * 0.2);
                const pointX = animX + Math.cos(angle) * radius;
                const pointY = animY + Math.sin(angle) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(pointX, pointY);
                } else {
                    this.ctx.lineTo(pointX, pointY);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // Draw power-up (laser crystal)
    drawPowerUp(x, y, size, type) {
        this.ctx.save();
        
        let color;
        switch (type) {
            case 'red': color = '#f00'; break;
            case 'blue': color = '#00f'; break;
            case 'yellow': color = '#ff0'; break;
            default: color = '#0f0';
        }
        
        // Crystal shape
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x + size, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.lineTo(x - size, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Inner glow
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size/2);
        this.ctx.lineTo(x + size/2, y);
        this.ctx.lineTo(x, y + size/2);
        this.ctx.lineTo(x - size/2, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Pulsing effect
        const pulseAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // Draw bullet/projectile
    drawBullet(x, y, width, height, color) {
        this.ctx.save();
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        
        // Add glow for energy weapons
        if (color === '#ff0' || color === '#f00' || color === '#00f') {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(x, y, width, height);
            this.ctx.shadowBlur = 0;
        }
        
        this.ctx.restore();
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RTypeSprites;
}