// Enhanced Game Engine with collision detection and improved mechanics
(function() {
    let gameConsole = new GameConsole("space");
    let gameState = new GameState();
    let collisionSystem = new CollisionSystem();
    let gameMenu = new GameMenu(gameState, gameConsole);
    
    let stars = new StarsEffect(500);
    let ship = new EnhancedShip();
    let enemies = [];
    let enemySpawnTimer = 0;
    let difficultyTimer = 0;
    
    // Game configuration
    const ENEMY_SPAWN_INTERVAL = 2000; // milliseconds
    const ENEMY_TYPES = ["basic", "fast", "heavy", "hunter"];
    
    ship.bindToVelocity(stars);
    
    // Add core entities
    gameConsole.addEntity(stars);
    gameConsole.addEntity(ship);
    gameConsole.addEntity(gameMenu);
    
    // Enhanced game console with reset capability
    gameConsole.reset = function() {
        enemies = [];
        enemySpawnTimer = 0;
        difficultyTimer = 0;
        ship.health = ship.maxHealth;
        ship.invulnerable = false;
    };
    
    // Game update loop
    function gameUpdate(deltaTime) {
        if (!gameState.gameStarted || gameState.gamePaused || gameState.gameOver) {
            return;
        }
        
        // Spawn enemies
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }
        
        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const stillAlive = enemy.update(deltaTime);
            
            if (!stillAlive) {
                enemies.splice(i, 1);
            }
        }
        
        // Collision detection
        handleCollisions();
        
        // Difficulty scaling
        difficultyTimer += deltaTime;
        if (difficultyTimer >= 1000) {
            gameState.incrementScore(1);
            enemies.forEach(enemy => enemy.increaseDifficulty(gameState.score));
            difficultyTimer = 0;
        }
        
        // Check game over
        if (ship.health <= 0) {
            gameState.gameOver = true;
        }
    }
    
    function spawnEnemy() {
        // Choose enemy type based on level
        let enemyType = "basic";
        const rand = Math.random();
        
        if (gameState.level >= 2) {
            if (rand < 0.3) enemyType = "fast";
            else if (rand < 0.6) enemyType = "basic";
            else enemyType = "heavy";
        }
        
        if (gameState.level >= 4) {
            if (rand < 0.2) enemyType = "hunter";
        }
        
        const enemy = new EnhancedEnemyShip(ship, enemyType);
        enemy.init(gameConsole.canvas.width, gameConsole.canvas.height);
        enemies.push(enemy);
    }
    
    function handleCollisions() {
        const bullets = ship.getBullets();
        
        // Bullet-Enemy collisions
        const bulletEnemyCollisions = collisionSystem.checkBulletEnemyCollisions(bullets, enemies);
        
        bulletEnemyCollisions.forEach(collision => {
            const destroyed = collision.enemy.takeDamage(25);
            ship.removeBullet(collision.bulletIndex);
            
            if (destroyed) {
                gameState.incrementScore(collision.enemy.getPoints());
            }
        });
        
        // Player-Enemy collisions
        if (!ship.invulnerable) {
            const playerEnemyCollisions = collisionSystem.checkPlayerEnemyCollisions(ship, enemies);
            
            playerEnemyCollisions.forEach(collision => {
                ship.takeDamage(20);
                collision.enemy.destroy();
                gameState.loseLife();
            });
        }
    }
    
    function renderEnemies(context) {
        enemies.forEach(enemy => {
            enemy.render(context);
        });
    }
    
    // Add enemy rendering to game console
    gameConsole.addEntity({
        init: function() {},
        update: function() {},
        render: renderEnemies
    });
    
    // Add game update to console
    gameConsole.addEntity({
        init: function() {},
        update: gameUpdate,
        render: function() {}
    });
    
    // Input handling
    gameConsole.addMouseMoveListener(ship);
    
    document.addEventListener("keydown", function(event) {
        // Handle menu inputs
        gameMenu.handleKeyPress(event);
        
        // Handle game inputs
        if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
            if (event.code === 'Space') {
                event.preventDefault();
                ship.fireBullet();
            }
        }
    });
    
    // Mouse click to shoot
    document.addEventListener("click", function(event) {
        if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
            ship.fireBullet();
        }
    });
    
    // Start the game
    gameConsole.start();
})();