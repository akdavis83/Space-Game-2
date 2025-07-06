// Game State Management
function GameState() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameStarted = false;
    this.gamePaused = false;
    this.gameOver = false;
    
    this.incrementScore = function(points) {
        this.score += points;
        // Level up every 1000 points
        if (this.score >= this.level * 1000) {
            this.level++;
        }
    };
    
    this.loseLife = function() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver = true;
        }
    };
    
    this.reset = function() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
    };
}