# R-Type 1987 Authentic Clone

An authentic recreation of the 1987 Irem arcade classic R-Type, implementing the exact mechanics that defined the original game.

## Authentic Mechanics Implemented

### 🟠 Force Pod System (Core Mechanic)
- **Orange orb** that attaches to front or rear of ship
- **Indestructible shield** when attached - blocks ALL enemy fire
- **Detachable** to fly forward independently with secondary weapons
- **Launch/Retrieve at will** with dedicated button (X key)
- **NOT a power-up** - it's the core gameplay mechanic
- **Three weapon types** when attached (Red/Blue/Yellow lasers)
- **Different firing patterns** when detached based on level

### 🌊 Wave Cannon
- **Hold fire button** (Z key) to charge with visual effect
- **Release** for powerful piercing beam
- **Charging prevents** normal rapid fire
- **Beam strength scales** with charge level
- **Authentic charging** visual feedback

### 🎮 Authentic Gameplay
- **SLOW deliberate pacing** (not fast-twitch)
- **Large player hitbox** (you NEED the Force Pod)
- **Enemies follow EXACT scripted patterns** (memorization-based)
- **Pattern-based difficulty**, not speed-based
- **Bio-mechanical Bydo alien aesthetic**

## Controls

- **Arrow Keys** / **WASD** - Move ship
- **Z** - Fire / Charge Wave Cannon
- **X** - Launch/Retrieve Force Pod
- **C** - Switch Force Weapon Type (Red/Blue/Yellow)
- **P** - Pause Game

## Force Pod Details

### When Attached:
- Acts as indestructible shield
- Blocks all enemy bullets
- Provides special weapon based on type:
  - **Red Laser**: Counter-Air, forward firing
  - **Blue Laser**: Rebound, bounces off walls  
  - **Yellow Laser**: Counter-Ground, vertical coverage

### When Detached:
- Flies forward independently
- Fires bullet patterns based on level:
  - **Level 1**: Single forward shot
  - **Level 2**: V-shaped pattern
  - **Level 3**: K-shaped pattern (up, down, forward)
- Damages enemies on contact
- Can be recalled to ship

## Wave Cannon Mechanics

1. **Hold Z** to begin charging
2. **Visual bar** shows charge level
3. **Normal firing disabled** while charging
4. **Release Z** to fire piercing beam
5. **Beam penetrates** multiple enemies
6. **Power scales** with charge time

## Technical Implementation

- Pure HTML5 Canvas + JavaScript
- No external dependencies
- 60 FPS game loop
- Collision detection system
- Particle effects for explosions/muzzle flashes
- Local storage for high scores
- Responsive design

## Deployment

Deploy to GitHub Pages:
```bash
# Clone repository
git clone https://github.com/yourusername/rtype-1987-authentic.git

# Deploy to GitHub Pages
# Enable GitHub Pages in repository settings
# Set source to main branch /docs folder or root
```

Or deploy manually:
1. Upload all files to web server
2. Access index.html to play

## Testing

Open `test.html` for detailed mechanics verification. Test includes:

1. Force Pod attach/detach mechanics
2. Wave Cannon charging system  
3. Enemy pattern behavior
4. Collision detection
5. Weapon switching

## Authenticity Checklist

- [x] Force Pod attaches front/rear
- [x] Force Pod blocks all enemy fire when attached
- [x] Force Pod flies independently when detached
- [x] Wave Cannon charges with visual feedback
- [x] Charging prevents normal fire
- [x] Slow, deliberate player movement
- [x] Large player hitbox
- [x] Scripted enemy patterns
- [x] Three Force weapon types
- [x] Bio-mechanical visual style

## Credits

Based on the 1987 Irem arcade game R-Type.

This is a fan recreation for educational purposes.

## License

MIT License - Free for educational and personal use.