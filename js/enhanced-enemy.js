// Enhanced Enemy Ships with better graphics and AI
function EnhancedEnemyShip(target, enemyType = "basic") {
    this.position = [0, 0];
    this.target = target;
    this.radius = 20;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = 0.02;
    this.destroyed = false;
    this.explosionTime = 0;
    this.maxExplosionTime = 500;
    
    // Enemy type configuration
    this.enemyTypes = {
        "basic": { 
            color: "#ff4444", 
            health: 30, 
            speed: 80, 
            behavior: "direct",
            points: 10,
            size: 15
        },
        "fast": { 
            color: "#44ff44", 
            health: 20, 
            speed: 150, 
            behavior: "zigzag",
            points: 20,
            size: 12
        },
        "heavy": { 
            color: "#4444ff", 
            health: 80, 
            speed: 50, 
            behavior: "wave",
            points: 30,
            size: 25
        },
        "hunter": { 
            color: "#ff44ff", 
            health: 40, 
            speed: 120, 
            behavior: "circle",
            points: 25,
            size: 18
        }
    };
    
    this.type = this.enemyTypes[enemyType] || this.enemyTypes.basic;
    this.health = this.type.health;
    this.maxHealth = this.type.health;
    this.speed = this.type.speed;
    this.radius = this.type.size;
    this.behaviorTimer = 0;
    
    this.init = function(width, height) {
        const direction = normalize_vector([Math.random() - 0.5, Math.random() - 0.5]);
        snap_with_direction(this.position, direction, width, height);
        this.width = width;
        this.height = height;
    };

    this.update = function(deltaTime) {
        if (this.destroyed) {
            this.explosionTime += deltaTime;
            return this.explosionTime < this.maxExplosionTime;
        }
        
        this.behaviorTimer += deltaTime;
        this.angle += this.rotationSpeed;
        
        // Behavior-specific movement
        this.updateMovement(deltaTime);
        
        return true; // Continue existing
    };
    
    this.updateMovement = function(deltaTime) {
        const targetPosition = this.target.screenCenter;
        let direction;
        
        switch (this.type.behavior) {
            case "zigzag":
                const zigzagOffset = Math.sin(this.behaviorTimer * 0.005) * 100;
                const perpendicular = [
                    -(targetPosition[1] - this.position[1]),
                    targetPosition[0] - this.position[0]
                ];
                const normalizedPerp = normalize_vector(perpendicular);
                const offsetTarget = vector_sum(targetPosition, 
                    magnify_vector(normalizedPerp, zigzagOffset));
                
                direction = normalize_vector([
                    offsetTarget[0] - this.position[0],
                    offsetTarget[1] - this.position[1]
                ]);
                break;
                
            case "wave":
                const waveOffset = Math.sin(this.behaviorTimer * 0.003) * 50;
                direction = normalize_vector([
                    targetPosition[0] - this.position[0],
                    targetPosition[1] - this.position[1] + waveOffset
                ]);
                break;
                
            case "circle":
                const circleRadius = 200;
                const circleAngle = this.behaviorTimer * 0.002;
                const circleCenter = targetPosition;
                const circleTarget = [
                    circleCenter[0] + Math.cos(circleAngle) * circleRadius,
                    circleCenter[1] + Math.sin(circleAngle) * circleRadius
                ];
                
                direction = normalize_vector([
                    circleTarget[0] - this.position[0],
                    circleTarget[1] - this.position[1]
                ]);
                break;
                
            default: // direct
                direction = normalize_vector([
                    targetPosition[0] - this.position[0],
                    targetPosition[1] - this.position[1]
                ]);
                break;
        }
        
        const velocity = magnify_vector(direction, this.speed * deltaTime / 1000);
        this.position = vector_sum(this.position, velocity);
    };

    this.render = function(context) {
        if (this.destroyed) {
            this.renderExplosion(context);
            return;
        }
        
        this.renderEnemyShip(context);
        this.renderHealthBar(context);
    };
    
    this.renderEnemyShip = function(context) {
        context.save();
        context.translate(this.position[0], this.position[1]);
        context.rotate(this.angle);
        
        // Ship body
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, this.type.color);
        gradient.addColorStop(0.7, this.darkenColor(this.type.color, 0.5));
        gradient.addColorStop(1, this.darkenColor(this.type.color, 0.8));
        
        context.fillStyle = gradient;
        context.beginPath();
        
        // Different ship shapes based on type
        switch (this.type.behavior) {
            case "fast":
                this.renderFastShip(context);
                break;
            case "heavy":
                this.renderHeavyShip(context);
                break;
            case "hunter":
                this.renderHunterShip(context);
                break;
            default:
                this.renderBasicShip(context);
                break;
        }
        
        context.fill();
        
        // Ship outline
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1;
        context.stroke();
        
        // Engine glow
        this.renderEngineGlow(context);
        
        context.restore();
    };
    
    this.renderBasicShip = function(context) {
        // Triangle ship
        context.moveTo(this.radius, 0);
        context.lineTo(-this.radius * 0.7, -this.radius * 0.5);
        context.lineTo(-this.radius * 0.7, this.radius * 0.5);
        context.closePath();
    };
    
    this.renderFastShip = function(context) {
        // Sleek arrow shape
        context.moveTo(this.radius, 0);
        context.lineTo(-this.radius * 0.8, -this.radius * 0.3);
        context.lineTo(-this.radius * 0.5, 0);
        context.lineTo(-this.radius * 0.8, this.radius * 0.3);
        context.closePath();
    };
    
    this.renderHeavyShip = function(context) {
        // Bulky hexagon
        const sides = 6;
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * this.radius;
            const y = Math.sin(angle) * this.radius;
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
    };
    
    this.renderHunterShip = function(context) {
        // Diamond with extended wings
        context.moveTo(this.radius, 0);
        context.lineTo(0, -this.radius * 0.6);
        context.lineTo(-this.radius * 0.8, -this.radius * 0.8);
        context.lineTo(-this.radius * 0.5, 0);
        context.lineTo(-this.radius * 0.8, this.radius * 0.8);
        context.lineTo(0, this.radius * 0.6);
        context.closePath();
    };
    
    this.renderEngineGlow = function(context) {
        // Engine particles
        for (let i = 0; i < 3; i++) {
            const glowSize = Math.random() * 3 + 1;
            const glowX = -this.radius - Math.random() * 10;
            const glowY = (Math.random() - 0.5) * this.radius * 0.5;
            
            context.fillStyle = `rgba(255, 100, 0, ${0.8 - i * 0.2})`;
            context.beginPath();
            context.arc(glowX, glowY, glowSize, 0, Math.PI * 2);
            context.fill();
        }
    };
    
    this.renderHealthBar = function(context) {
        if (this.health >= this.maxHealth) return;
        
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = this.position[1] - this.radius - 10;
        
        // Background
        context.fillStyle = "rgba(255, 255, 255, 0.3)";
        context.fillRect(this.position[0] - barWidth/2, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.6 ? "#00ff00" : 
                           healthPercent > 0.3 ? "#ffff00" : "#ff0000";
        context.fillStyle = healthColor;
        context.fillRect(this.position[0] - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border
        context.strokeStyle = "white";
        context.lineWidth = 1;
        context.strokeRect(this.position[0] - barWidth/2, barY, barWidth, barHeight);
    };
    
    this.renderExplosion = function(context) {
        const progress = this.explosionTime / this.maxExplosionTime;
        const explosionRadius = this.radius * (1 + progress * 3);
        
        // Multiple explosion rings
        for (let i = 0; i < 5; i++) {
            const ringProgress = Math.max(0, progress - i * 0.1);
            const ringRadius = explosionRadius * ringProgress;
            const alpha = (1 - ringProgress) * 0.8;
            
            const colors = ['#ffff00', '#ff8800', '#ff4400', '#ff0000', '#880000'];
            context.fillStyle = `rgba(255, ${255 - i * 50}, 0, ${alpha})`;
            
            context.beginPath();
            context.arc(this.position[0], this.position[1], ringRadius, 0, Math.PI * 2);
            context.fill();
        }
        
        // Explosion particles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = explosionRadius * progress;
            const particleX = this.position[0] + Math.cos(angle) * distance;
            const particleY = this.position[1] + Math.sin(angle) * distance;
            
            context.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
            context.beginPath();
            context.arc(particleX, particleY, 2, 0, Math.PI * 2);
            context.fill();
        }
    };
    
    this.takeDamage = function(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
            return true; // Enemy destroyed
        }
        return false;
    };
    
    this.destroy = function() {
        this.destroyed = true;
        this.explosionTime = 0;
    };
    
    this.darkenColor = function(color, factor) {
        // Simple color darkening
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
        const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
        const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    };
    
    this.getPoints = function() {
        return this.type.points;
    };
    
    this.increaseDifficulty = function(score) {
        this.speed = this.type.speed + score / 200;
    };
}