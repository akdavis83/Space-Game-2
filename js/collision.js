// Collision Detection System
function CollisionSystem() {
    this.checkCircleCollision = function(obj1, obj2) {
        const dx = obj1.position[0] - obj2.position[0];
        const dy = obj1.position[1] - obj2.position[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    };
    
    this.checkBulletEnemyCollisions = function(bullets, enemies) {
        const collisions = [];
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (this.checkCircleCollision(bullet, enemy)) {
                    collisions.push({
                        bullet: bullet,
                        enemy: enemy,
                        bulletIndex: i,
                        enemyIndex: j
                    });
                }
            }
        }
        
        return collisions;
    };
    
    this.checkPlayerEnemyCollisions = function(player, enemies) {
        const collisions = [];
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (this.checkCircleCollision(player, enemy)) {
                collisions.push({
                    enemy: enemy,
                    enemyIndex: i
                });
            }
        }
        
        return collisions;
    };
}