// Game Menu System
function GameMenu(gameState, gameConsole) {
    this.gameState = gameState;
    this.gameConsole = gameConsole;
    this.menuVisible = true;
    
    this.render = function(context) {
        if (this.menuVisible && !this.gameState.gameStarted) {
            this.renderMainMenu(context);
        } else if (this.gameState.gamePaused) {
            this.renderPauseMenu(context);
        } else if (this.gameState.gameOver) {
            this.renderGameOverMenu(context);
        } else if (this.gameState.gameStarted) {
            this.renderHUD(context);
        }
    };
    
    this.renderMainMenu = function(context) {
        // Semi-transparent overlay
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // Title
        context.fillStyle = "#00ffcc";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.fillText("SPACE DEFENDER", context.canvas.width / 2, context.canvas.height / 2 - 100);
        
        // Instructions
        context.fillStyle = "#ffffff";
        context.font = "24px Arial";
        context.fillText("Press SPACE to Start", context.canvas.width / 2, context.canvas.height / 2 - 20);
        context.fillText("Move mouse to control ship", context.canvas.width / 2, context.canvas.height / 2 + 20);
        context.fillText("Click or SPACE to shoot", context.canvas.width / 2, context.canvas.height / 2 + 60);
        
        // High score placeholder
        context.font = "18px Arial";
        context.fillText("High Score: 0", context.canvas.width / 2, context.canvas.height / 2 + 120);
    };
    
    this.renderPauseMenu = function(context) {
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        context.fillStyle = "#00ffcc";
        context.font = "36px Arial";
        context.textAlign = "center";
        context.fillText("PAUSED", context.canvas.width / 2, context.canvas.height / 2);
        
        context.fillStyle = "#ffffff";
        context.font = "18px Arial";
        context.fillText("Press P to Resume", context.canvas.width / 2, context.canvas.height / 2 + 40);
    };
    
    this.renderGameOverMenu = function(context) {
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        context.fillStyle = "#ff0000";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.fillText("GAME OVER", context.canvas.width / 2, context.canvas.height / 2 - 60);
        
        context.fillStyle = "#ffffff";
        context.font = "24px Arial";
        context.fillText("Final Score: " + this.gameState.score, context.canvas.width / 2, context.canvas.height / 2);
        context.fillText("Level Reached: " + this.gameState.level, context.canvas.width / 2, context.canvas.height / 2 + 40);
        
        context.font = "18px Arial";
        context.fillText("Press R to Restart", context.canvas.width / 2, context.canvas.height / 2 + 100);
    };
    
    this.renderHUD = function(context) {
        // Score
        context.fillStyle = "#00ffcc";
        context.font = "20px Arial";
        context.textAlign = "left";
        context.fillText("Score: " + this.gameState.score, 10, 30);
        
        // Level
        context.fillText("Level: " + this.gameState.level, 10, 55);
        
        // Lives
        context.fillText("Lives: " + this.gameState.lives, 10, 80);
        
        // Instructions
        context.fillStyle = "#ffffff";
        context.font = "14px Arial";
        context.textAlign = "right";
        context.fillText("P - Pause", context.canvas.width - 10, 30);
    };
    
    this.handleKeyPress = function(event) {
        if (!this.gameState.gameStarted && event.code === 'Space') {
            this.startGame();
        } else if (this.gameState.gameStarted && event.code === 'KeyP') {
            this.togglePause();
        } else if (this.gameState.gameOver && event.code === 'KeyR') {
            this.restartGame();
        }
    };
    
    this.startGame = function() {
        this.gameState.gameStarted = true;
        this.menuVisible = false;
    };
    
    this.togglePause = function() {
        this.gameState.gamePaused = !this.gameState.gamePaused;
    };
    
    this.restartGame = function() {
        this.gameState.reset();
        this.menuVisible = true;
        // Reset game entities
        this.gameConsole.reset();
    };
    
    this.init = function() {};
    this.update = function() {};
}