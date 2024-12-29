// Selectors
const cells = document.querySelectorAll('.cell');
const titleHeader = document.querySelector('#titleheader');
const xPlayerDisplay = document.querySelector('#xPlayerDisplay');
const oPlayerDisplay = document.querySelector('#oPlayerDisplay');
const restartBtn = document.querySelector('#restartBtn');

// Game state variables
let currentPlayer = '';
let player = '';
let bot = '';
let isGamePaused = false;
let gameStarted = false;
let timerInterval;
let countdown = 2; // Countdown in seconds
let difficulty = 'hard';
let Xcolor = '#1892EA';
let Ocolor = '#A737FF';
let isdark = true;

const gameState = Array(9).fill('');
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Event Listeners
cells.forEach((cell, index) => cell.addEventListener('click', () => handleCellClick(index)));
restartBtn.addEventListener('click', resetGame);

// Core Game Logic
function handleCellClick(index) {
    if (gameState[index] !== '' || isGamePaused || !gameStarted) return;

    makeMove(index, currentPlayer);

    const winningIndices = checkWin(currentPlayer);
    if (winningIndices) {
        declareWinner(winningIndices); // Declare winner and highlight cells
        return;
    }

    if (isDraw()) {
        endGame("It's a Draw!");
        return;
    }

    switchTurn();
}

function makeMove(index, player) {
    gameState[index] = player; // Update the game state with the current player's move
    cells[index].textContent = player; // Display the player's move in the cell
    cells[index].style.color = player === 'X' ? Xcolor : Ocolor; // Apply color based on player
}

function switchTurn() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Toggle between players
    updateTurnIndicator();  // Update the UI to reflect whose turn it is

    // If it's the bot's turn, automatically make the move after a delay
    if (currentPlayer === bot) {
        isGamePaused = true;
        setTimeout(() => {
            if (difficulty === 'easy') {
                easyBotMove();
            } else {
                botMove();
            }
            isGamePaused = false;
        }, 125);
    } else {
        startTimer();
    }
}

function botMove() {
    stopTimer(); // Stop the timer when the bot makes a move

    const bestMove = findBestMove(); // Find the best move for the bot
    makeMove(bestMove, currentPlayer); // Make the move on the board

    const winningIndices = checkWin(currentPlayer); // Check if the bot won
    if (winningIndices) {
        declareWinner(winningIndices); // Declare the bot's win and highlight the winning cells
        return;
    }

    if (isDraw()) {
        endGame("It's a Draw!"); // Check if it's a draw
        return;
    }

    switchTurn(); // Switch turn to the player after the bot moves
}

function easyBotMove() {
    stopTimer(); // Stop the timer when the bot makes a move

    const availableMoves = gameState
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);

    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Choose a random available move
    makeMove(randomMove, currentPlayer); // Make the move on the board

    const winningIndices = checkWin(currentPlayer); // Check if the bot won
    if (winningIndices) {
        declareWinner(winningIndices); // Declare the bot's win and highlight the winning cells
        return;
    }

    if (isDraw()) {
        endGame("It's a Draw!"); // Check if it's a draw
        return;
    }

    switchTurn(); // Switch turn to the player after the bot moves
}

function findBestMove() {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = bot;
            let score = minimax(gameState, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// Utility Functions
function checkWin(player) {
    for (let condition of winConditions) {
        if (condition.every(index => gameState[index] === player)) {
            stopTimer(); // Ensure the timer stops if there's a winner
            return condition; // Return the winning indices
        }
    }
    return null; // No winner yet
}

function declareWinner(winningIndices) {
    stopTimer(); // Stop the timer
    titleHeader.textContent = `${currentPlayer} Wins!`;
    titleHeader.style.color = currentPlayer === 'X' ? Xcolor : Ocolor;
    
    isGamePaused = true; // Pause the game to prevent further interaction

    // Highlight the winning cells
    winningIndices.forEach(index => {
        cells[index].style.background = currentPlayer === player
            ? (isdark ? '#122a22' : '#50be99')
            : (isdark ? '#2a1218' : '#d96a74');
    });

    restartBtn.style.visibility = 'visible'; // Show the restart button
}


function isDraw() {
    return gameState.every(cell => cell !== '');
}

function endGame(message) {
    stopTimer(); // Stop the timer
    titleHeader.textContent = message;
    titleHeader.style.color = 'white';
    isGamePaused = true; // Pause the game to prevent further interaction
    restartBtn.style.visibility = 'visible';
}

function resetGame() {
    gameState.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        if (isdark) {
            cell.style.background = '';
        } else {
            cell.style.background = 'var(--primary-light)';
        }
    });
    currentPlayer = '';
    isGamePaused = false;
    gameStarted = false;
    titleHeader.textContent = 'Choose';
    titleHeader.style.color = 'white';
    restartBtn.style.visibility = 'hidden';
    xPlayerDisplay.classList.remove('player-active');
    oPlayerDisplay.classList.remove('player-active');
}

function choosePlayer(selectedPlayer) {
    if (!gameStarted) { // Ensure the game hasn't started
        player = selectedPlayer;
        currentPlayer = selectedPlayer;
        bot = player === 'X' ? 'O' : 'X';
        gameStarted = true;

        // Highlight the correct player display
        if (player === 'X') {
            xPlayerDisplay.classList.add('player-active');
            oPlayerDisplay.classList.remove('player-active');
        } else {
            xPlayerDisplay.classList.remove('player-active');
            oPlayerDisplay.classList.add('player-active');

            // If the bot is 'X', make the first move
            currentPlayer = bot; // Set turn to the bot
            
            // Bot makes the first move
            if (difficulty === 'easy') {
                easyBotMove();
            } else {
                botMove();  
            }        
            currentPlayer = player; // Return turn to the player
        }
        updateTurnIndicator();
    }
}


function updateTurnIndicator() {
    if (currentPlayer === 'X') {
        xPlayerDisplay.classList.add('player-active');
        oPlayerDisplay.classList.remove('player-active');
    } else {
        xPlayerDisplay.classList.remove('player-active');
        oPlayerDisplay.classList.add('player-active');
    }
}

// Timer Logic
function startTimer() {
    countdown = 2;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        countdown--;
        updateTimerDisplay();
        if (countdown <= 0) {
            clearInterval(timerInterval);
            titleHeader.textContent = "Time Out!";
            titleHeader.style.color = 'red';
            botMove();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    titleHeader.textContent = `00:0${countdown}`;
    titleHeader.style.color = countdown <= 0 ? 'white' : 'red';
}

// Minimax Algorithm
function minimax(board, isMaximizing) {
    if (checkWin(bot)) return 10;
    if (checkWin(player)) return -10;
    if (board.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = bot;
                let score = minimax(board, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = player;
                let score = minimax(board, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Initialize
resetGame();

// Settings
function togglePopup() {
    const popup = document.getElementById('popup');
    popup.classList.toggle('hidden');
}

// Manage Difficulty checkboxes
document.querySelectorAll('input[name="difficulty"]').forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Uncheck all other checkboxes in the same group
            document.querySelectorAll('input[name="difficulty"]').forEach((other) => {
                if (other !== this) other.checked = false;
            });

            // Set difficulty based on selection
            if (document.getElementById('easyDifficulty').checked) {
                difficulty = 'easy';
            } else {
                difficulty = 'hard';
            }
        }
    });
});

document.querySelectorAll('input[name="theme"]').forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
        // If the checkbox is checked, uncheck the other
        if (this.checked) {
            document.querySelectorAll('input[name="theme"]').forEach((other) => {
                if (other !== this) other.checked = false;
            });

            // Apply the theme styles based on the selected checkbox
            if (document.getElementById('lightTheme').checked) {
                Xcolor = '#36a9fa';
                Ocolor = '#9939e3';
                isdark = false;
                document.querySelector('#xPlayerDisplay').style.background = 'var(--primary-light)';
                document.querySelector('#xPlayerDisplay').style.border = 'var(--primary-light)';
                document.querySelector('#xPlayerDisplay').style.color = 'var(--Xcolor-light)';

                document.querySelector('#oPlayerDisplay').style.background = 'var(--primary-light)';
                document.querySelector('#oPlayerDisplay').style.border = 'var(--primary-light)';
                document.querySelector('#oPlayerDisplay').style.color = 'var(--Ocolor-light)';

                document.querySelector('#restartBtn').style.background = 'var(--primary-light)';

                const cells = document.querySelectorAll('#board .cell');
                cells.forEach((cell) => {
                    cell.style.background = 'var(--primary-light)';
                })

                document.querySelector('main').style.background = 'var(--background-light)';
            } else if (document.getElementById('darkTheme').checked) {
                Xcolor = '#1892EA';
                Ocolor = '#A737FF';
                isdark = true;
                document.querySelector('#xPlayerDisplay').style.background = 'var(--primary-dark)';
                document.querySelector('#xPlayerDisplay').style.border = 'var(--primary-dark)';
                document.querySelector('#xPlayerDisplay').style.color = 'var(--Xcolor)';

                document.querySelector('#oPlayerDisplay').style.background = 'var(--primary-dark)';
                document.querySelector('#oPlayerDisplay').style.border = 'var(--primary-dark)';
                document.querySelector('#oPlayerDisplay').style.color = 'var(-Ocolor)';

                document.querySelector('#restartBtn').style.background = 'var(--primary-dark)';

                const cells = document.querySelectorAll('#board .cell');
                cells.forEach((cell) => {
                    cell.style.background = 'var(--primary-dark)';
                    
                })

                document.querySelector('main').style.background = 'var(--background-dark)';
            }
        }
    });
});
