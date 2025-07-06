// Enhanced Ship with Three.js support and better graphics
function EnhancedShip() {
    let heading = 0;
    let speed = [0, 0];
    let velocityListeners = [];
    let bullets = [];
    
    this.health = 100;
    this.maxHealth = 100;
    this.radius = 25; // For collision detection
    this.invulnerable = false;
    this.invulnerabilityTime = 0;
    
    // Ship visual properties
    this.shipSprite = null;
    this.thrusterParticles = [];
    
    this.takeDamage = function(damage) {
        if (this.invulnerable) return;
        
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        
        // Brief invulnerability after taking damage
        this.invulnerable = true;
        this.invulnerabilityTime = 1000; // 1 second
    };

    this.renderHealth = function(context) {
        // Health bar background
        context.fillStyle = "rgba(255, 255, 255, 0.3)";
        context.fillRect(10, 10, 200, 20);
        
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.6 ? "#00ff00" : 
                           healthPercent > 0.3 ? "#ffff00" : "#ff0000";
        context.fillStyle = healthColor;
        context.fillRect(10, 10, this.health * 2, 20);
        
        // Health bar border
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.strokeRect(10, 10, 200, 20);
        
        // Health text
        context.fillStyle = "white";
        context.font = "12px Arial";
        context.textAlign = "center";
        context.fillText(`${this.health}/${this.maxHealth}`, 110, 24);
    };

    this.render = function(context) {
        // Render ship health
        this.renderHealth(context);
    
        // Render shield if invulnerable
        if (this.invulnerable) {
            this.renderShield(context);
        }
    
        const speedShift = magnify_vector(speed, 0.05);
    
        // Transform function to calculate positions
        let transform = (function(angle, len) {
            return vector_sum(magnify_vector(angle_to_vector(angle), len),
                              this.screenCenter,
                              speedShift);
        }).bind(this);
    
        // Enhanced ship design with multiple parts
        this.renderShipBody(context, transform);
        this.renderShipWings(context, transform);
        this.renderShipCockpit(context, transform);
        this.renderThrusters(context, transform);
    
        // Render bullets
        bullets.forEach(function(bullet) {
            bullet.render(context);
        });
    };
    
    this.renderShipBody = function(context, transform) {
        const tip = transform(heading, 40);
        const leftWing = transform(heading + Math.PI * 3 / 4, 25);
        const rightWing = transform(heading - Math.PI * 3 / 4, 25);
        const back = transform(heading + Math.PI, 15);
        
        // Main body gradient
        let gradient = context.createLinearGradient(tip[0], tip[1], back[0], back[1]);
        gradient.addColorStop(0, "#00ffcc");
        gradient.addColorStop(0.5, "#0099cc");
        gradient.addColorStop(1, "#004d99");
        
        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(tip[0], tip[1]);
        context.lineTo(leftWing[0], leftWing[1]);
        context.lineTo(back[0], back[1]);
        context.lineTo(rightWing[0], rightWing[1]);
        context.closePath();
        context.fill();
        
        // Body outline
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1;
        context.stroke();
    };
    
    this.renderShipWings = function(context, transform) {
        // Left wing detail
        const leftWingTip = transform(heading + Math.PI * 2 / 3, 35);
        const leftWingBase = transform(heading + Math.PI * 3 / 4, 20);
        
        context.fillStyle = "#0066aa";
        context.beginPath();
        context.moveTo(leftWingTip[0], leftWingTip[1]);
        context.lineTo(leftWingBase[0], leftWingBase[1]);
        context.lineTo(this.screenCenter[0], this.screenCenter[1]);
        context.closePath();
        context.fill();
        
        // Right wing detail
        const rightWingTip = transform(heading - Math.PI * 2 / 3, 35);
        const rightWingBase = transform(heading - Math.PI * 3 / 4, 20);
        
        context.beginPath();
        context.moveTo(rightWingTip[0], rightWingTip[1]);
        context.lineTo(rightWingBase[0], rightWingBase[1]);
        context.lineTo(this.screenCenter[0], this.screenCenter[1]);
        context.closePath();
        context.fill();
    };
    
    this.renderShipCockpit = function(context, transform) {
        const cockpit = transform(heading, 20);
        
        // Cockpit window
        context.fillStyle = "#88ddff";
        context.beginPath();
        context.arc(cockpit[0], cockpit[1], 8, 0, Math.PI * 2);
        context.fill();
        
        // Cockpit frame
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.stroke();
    };
    
    this.renderThrusters = function(context, transform) {
        if (vector_length(speed) > 10) {
            const leftThruster = transform(heading + Math.PI * 5 / 6, 20);
            const rightThruster = transform(heading - Math.PI * 5 / 6, 20);
            
            // Thruster flames
            const flameLength = Math.random() * 15 + 10;
            const flameColors = ['#ff4400', '#ff6600', '#ffaa00', '#ffdd00'];
            
            [leftThruster, rightThruster].forEach(thruster => {
                for (let i = 0; i < 3; i++) {
                    const flamePos = transform(heading + Math.PI, 25 + i * 5);
                    context.fillStyle = flameColors[i] || '#ff4400';
                    context.beginPath();
                    context.arc(flamePos[0], flamePos[1], 3 - i, 0, Math.PI * 2);
                    context.fill();
                }
            });
        }
    };

    this.renderShield = function(context) {
        const shieldRadius = 50;
        const alpha = Math.sin(Date.now() * 0.01) * 0.3 + 0.4;
        context.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        context.lineWidth = 3;

        context.beginPath();
        context.arc(this.screenCenter[0], this.screenCenter[1], shieldRadius, 0, Math.PI * 2);
        context.stroke();
        
        // Shield sparkles
        for (let i = 0; i < 8; i++) {
            const angle = (Date.now() * 0.005 + i * Math.PI / 4) % (Math.PI * 2);
            const sparklePos = vector_sum(this.screenCenter, 
                magnify_vector(angle_to_vector(angle), shieldRadius));
            
            context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            context.beginPath();
            context.arc(sparklePos[0], sparklePos[1], 2, 0, Math.PI * 2);
            context.fill();
        }
    };

    this.update = function(deltaTime) {
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.update(deltaTime);

            // Remove bullets that go off-screen
            if (bullet.position[0] < 0 || bullet.position[0] > this.width ||
                bullet.position[1] < 0 || bullet.position[1] > this.height) {
                bullets.splice(i, 1);
            }
        }
    };

    this.init = function(width, height) {
        this.width = width;
        this.height = height;
        this.screenCenter = [this.width / 2, this.height / 2];
        this.position = [...this.screenCenter]; // For collision detection
    };

    this.fireBullet = function() {
        const bulletVelocity = magnify_vector(angle_to_vector(heading), 600);
        const bulletPosition = vector_sum(this.screenCenter, 
            magnify_vector(angle_to_vector(heading), 30));
        bullets.push(new EnhancedBullet(bulletPosition, bulletVelocity));
    };
    
    this.getBullets = function() {
        return bullets;
    };
    
    this.removeBullet = function(index) {
        bullets.splice(index, 1);
    };

    this.onMouseMove = function(position) {
        let direction = [position[0] - this.width / 2, position[1] - this.height / 2];
        heading = vector_angle(direction);
        speed = [direction[0], direction[1]];

        velocityListeners.forEach(function(listener) {
            listener.onVelocityUpdated(speed);
        });
    };

    this.bindToVelocity = function(listener) {
        velocityListeners.push(listener);
    };
}

// Enhanced Bullet class
function EnhancedBullet(position, velocity) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 3;
    this.trail = [];
    this.maxTrailLength = 8;

    this.update = function(deltaTime) {
        // Add current position to trail
        this.trail.push([...this.position]);
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        this.position[0] += this.velocity[0] * deltaTime / 1000;
        this.position[1] += this.velocity[1] * deltaTime / 1000;
    };

    this.render = function(context) {
        // Render trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length * 0.5;
            const size = (i + 1) / this.trail.length * this.radius;
            
            context.fillStyle = `rgba(255, 100, 100, ${alpha})`;
            context.beginPath();
            context.arc(this.trail[i][0], this.trail[i][1], size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Render main bullet
        const gradient = context.createRadialGradient(
            this.position[0], this.position[1], 0,
            this.position[0], this.position[1], this.radius
        );
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.5, "#ff6666");
        gradient.addColorStop(1, "#ff0000");
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.position[0], this.position[1], this.radius, 0, Math.PI * 2);
        context.fill();
        
        // Bullet glow
        context.shadowColor = "#ff0000";
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(this.position[0], this.position[1], this.radius * 0.5, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
    };

    this.init = function() {};
}