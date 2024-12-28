// Selectors
const cells = document.querySelectorAll('.cell');
const titleHeader = document.querySelector('#titleheader');
const xPlayerDisplay = document.querySelector('#xPlayerDisplay');
const oPlayerDisplay = document.querySelector('#oPlayerDisplay');
const restartBtn = document.querySelector('#restartBtn');

// Initialize variables
let player = 'X';
let player_mark = 'X';
let bot;
let bot_mark = bot;
let isPauseGame = false;
let isGameStart = false;
let timerInterval; // Timer ID
let timerCount; // Countdown value

// Array to track cell states
const inputCells = [
    '', '', '',
    '', '', '',
    '', '', ''
];

// Winning conditions
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Add event listeners to cells
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => tapCell(cell, index));
});

// Function to handle cell tap
function tapCell(cell, index) {
    player_mark = player;
    if (cell.textContent === '' && !isPauseGame) {
        stopTimer(); // Stop timer
        isGameStart = true;
        updateCell(cell, index); // Update cell with player's move

        if (!checkWinner()) {
            changePlayer(); // Switch turn to bot
            stopTimer(); // Ensure timer doesn't run during bot's turn
            Botpick(); // Bot makes its move
        }
    }
}

// Update cell with player's move
function updateCell(cell, index) {
    cell.textContent = player;
    inputCells[index] = player;
    cell.style.color = (player === 'X') ? '#1892EA' : '#A737FF';
}

// Change player turn
function changePlayer() {
    player = (player === 'X') ? 'O' : 'X';
}

// Check for a winner or draw
function checkWinner() {
    for (const [a, b, c] of winConditions) {
        if (inputCells[a] === player &&
            inputCells[b] === player &&
            inputCells[c] === player) {
            declareWinner([a, b, c]);

            isGameStart = false;
            return true;
        }
    }

    // Check for a draw
    if (inputCells.every(cell => cell !== '')) {
        declareDraw();
        return true;
    }

    return false;
}

// Declare the winner
function declareWinner(winningIndices) {
    titleHeader.style.color = 'white';
    titleHeader.textContent = `${player} Wins!`;
    isPauseGame = true;

    // Highlight winning cells
    winningIndices.forEach(index => {
        // cells[index].style.background = '#2A2343'; 
        cells[index].style.background = (cells[index] === player_mark) ? '#122a22' : '#2a1218';
    });

    restartBtn.style.visibility = 'visible';
}

// Declare a draw
function declareDraw() {
    titleHeader.style.color = 'white';
    titleHeader.textContent = 'Draw!';
    isPauseGame = true;
    restartBtn.style.visibility = 'visible';
    cells.forEach(cell => {
        cell.style.background = '#614cb2';
    });
}

// function to choose player
function choosePlayer(selectedPlayer) {
    // Ensure the game hasn't started
    if (!isGameStart) {
        // Override the selected player value
        player = selectedPlayer
        
        if (player == 'X') {
            // Hightlight X display
            bot = 'O';
            player_mark = 'X'
            xPlayerDisplay.classList.add('player-active')
            oPlayerDisplay.classList.remove('player-active')
        } else {
            // Hightlight O display
            bot = 'X';
            player_mark = 'O'
            xPlayerDisplay.classList.remove('player-active')
            oPlayerDisplay.classList.add('player-active')
        }
    }
}

// Restart the game
restartBtn.addEventListener('click', () => {
    restartBtn.style.visibility = 'hidden';
    inputCells.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.background = '';
    });
    isPauseGame = false;
    isGameStart = false;
    titleHeader.style.color = 'white';
    titleHeader.textContent = 'Choose';
});

// Bot logic
function Botpick() {
    isPauseGame = true; // Pause the game during bot's turn

    setTimeout(() => {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < inputCells.length; i++) {
            if (inputCells[i] === '') {
                inputCells[i] = player; // Simulate bot's move
                let score = minimax(inputCells, false); // Evaluate move
                inputCells[i] = ''; // Undo move
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        if (move !== undefined) {
            updateCell(cells[move], move); // Bot makes the best move
            if (!checkWinner()) {
                changePlayer(); // Switch back to player's turn
                startTimer(); // Start timer for player's turn
            }
        }

        isPauseGame = false; // Resume the game
    }, 150); // Bot takes 0.15 seconds to move
}

// Timer logic
function startTimer() {
    timerCount = 2; // Set countdown to 2 seconds
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timerCount--;
        updateTimerDisplay();

        if (timerCount <= 0) {
            clearInterval(timerInterval); // Stop timer
            titleHeader.textContent = 'Time Up! Bot’s Turn'; // Show timeout message
            changePlayer(); // Switch to bot
            Botpick(); // Bot moves
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); // Stop the timer
    titleHeader.textContent = ''; // Clear timer display
}

// Update timer display
function updateTimerDisplay() {
    titleHeader.textContent = `00:0${timerCount}`;
    titleHeader.style.color = 'red';
    if (timerCount <= 0) {
        titleHeader.style.color = 'white';
    }
}

// Minimax algorithm
function minimax(board, isMaximizing) {
    let enemy = (player === 'X') ? 'O' : 'X';
    if (checkWinnerForMinimax(player)) return 10;
    if (checkWinnerForMinimax(enemy)) return -10;
    if (board.every(cell => cell !== '')) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = player;
                let score = minimax(board, false);
                board[i] = ''; // Undo move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = enemy;
                let score = minimax(board, true);
                board[i] = ''; // Undo move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Helper to check winner for minimax
function checkWinnerForMinimax(mark) {
    return winConditions.some(([a, b, c]) => 
        inputCells[a] === mark && 
        inputCells[b] === mark && 
        inputCells[c] === mark
    );
}
