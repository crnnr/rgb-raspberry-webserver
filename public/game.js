let currentPlayer = "X";
const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
let gameActive = true; //allow or prevent move

document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    document.getElementById('new-game').addEventListener('click', startNewGame);
});

function initializeBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = board[i][j];
            cell.addEventListener('click', () => makeMove(i, j));
            row.appendChild(cell);
        }
        gameBoard.appendChild(row);
    }
}

function makeMove(row, col) {
    if (!gameActive) return; // Stop any moves game is not active
    if (board[row][col] === '') {
        board[row][col] = currentPlayer;
        const cell = document.querySelectorAll('.cell')[row * 3 + col];
        cell.textContent = currentPlayer;
        if (checkForWin(currentPlayer)) {
            handleWin(currentPlayer);
            return;
        }
        if (checkForTie()) {
            alert("It's a tie!");
            startNewGame();
            return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    } else {
        alert("This cell is already taken. Please choose another cell.");
    }
}

function checkForWin(player) {
    const winConditions = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ];
    return winConditions.some(line => {
        if (line.every(index => board[index[0]][index[1]] === player)) {
            highlightWin(line);
            return true;
        }
        return false;
    });
}

function highlightWin(line) {
    line.forEach(index => {
        const winningCell = document.querySelectorAll('.cell')[index[0] * 3 + index[1]];
        winningCell.style.color = 'green';
    });
    displayWinnerOnMatrix(currentPlayer);
    gameActive = false; // Stop game after win
}

function displayWinnerOnMatrix(winner) {
    fetch(`/display-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner })
    });
}

function checkForTie() {
    return board.flat().every(cell => cell !== '');
}

function startNewGame() {
    gameActive = true; // Reactivate the game
    fetch('/reset-game', { method: 'POST' })
        .then(() => {
            board.forEach(row => row.fill(''));
            currentPlayer = "X";
            initializeBoard();
        })
        .catch(error => console.error('Error:', error));
}

