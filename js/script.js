let board = Array(9).fill(null);
let gameActive = false;
let scores = { X: 0, O: 0 };
let gameHistoryData = [];

document.addEventListener('DOMContentLoaded', () => {
    
    // START SESSION: Initializes player and resets session data
    document.getElementById('startGame').onclick = () => {
        const nameInput = document.getElementById('playerName');
        const nameValue = nameInput.value.trim();
        if (!nameValue) return alert("Please enter your name!");

        document.querySelector('.score-card:first-child .label').innerText = nameValue.toUpperCase() + " (X)";
        
        scores = { X: 0, O: 0 };
        gameHistoryData = [];
        document.getElementById('pScore').innerText = '0';
        document.getElementById('aScore').innerText = '0';
        document.getElementById('historyList').innerHTML = '';
        initGame();
    };

    // CLEAR HISTORY: Hard reset for the entire application
    document.getElementById('clearHistory').onclick = () => {
        board = Array(9).fill(null);
        gameActive = false;
        scores = { X: 0, O: 0 };
        gameHistoryData = [];
        
        const nameInput = document.getElementById('playerName');
        nameInput.value = ""; 
        document.querySelector('.score-card:first-child .label').innerText = "PLAYER (X)";
        
        document.getElementById('pScore').innerText = '0';
        document.getElementById('aScore').innerText = '0';
        document.getElementById('historyList').innerHTML = '';
        document.getElementById('gameStatus').innerText = "Session Reset. Enter name.";
        document.getElementById('treeContainer').innerText = "AI Offline.";
        
        clearBoardUI();
    };

    // MODAL HANDLERS: Controls for game result popup
    document.getElementById('modalCrossClose').onclick = () => {
        document.getElementById('resultModal').style.display = 'none';
        initGame();
    };
    document.getElementById('modalPlayAgain').onclick = () => {
        document.getElementById('resultModal').style.display = 'none';
        initGame();
    };
    document.getElementById('modalViewBoard').onclick = () => {
        document.getElementById('resultModal').style.display = 'none';
        gameActive = false;
        document.getElementById('gameStatus').innerText = "Viewing result. Click Reset to play again.";
    };
    document.getElementById('modalExit').onclick = () => location.reload();

    document.getElementById('resetGame').onclick = initGame;

    // EVENT DELEGATION: Cell click listeners
    document.querySelectorAll('.cell').forEach(cell => {
        cell.onclick = (e) => {
            let idx = parseInt(e.target.dataset.index);
            if (gameActive && board[idx] === null) userMove(idx);
        };
    });
});

// GAME ENGINE: State management functions
function initGame() {
    const name = document.getElementById('playerName').value || "Player";
    board = Array(9).fill(null);
    gameActive = true;
    document.getElementById('gameStatus').innerText = `${name}'s Turn (X)`;
    clearBoardUI();
    document.getElementById('resultModal').style.display = 'none';
    document.getElementById('treeContainer').innerText = "AI Analyzing...";
}

function clearBoardUI() {
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('winning-cell', 'x-move', 'o-move');
        c.innerText = '';
    });
}

function userMove(idx) {
    board[idx] = 'X';
    updateUI(board);
    if (!checkGameOver()) {
        gameActive = false;
        document.getElementById('gameStatus').innerText = "AI is thinking...";
        setTimeout(aiMove, 600);
    }
}

function aiMove() {
    let move = findBestMove(board);
    if (move !== -1) {
        board[move] = 'O';
        updateUI(board);
        renderLogs(currentDecisionTree);
        if (!checkGameOver()) {
            gameActive = true;
            const name = document.getElementById('playerName').value || "Player";
            document.getElementById('gameStatus').innerText = `${name}'s Turn (X)`;
        }
    }
}

function updateUI(currentBoard) {
    const cells = document.querySelectorAll('.cell');
    currentBoard.forEach((val, i) => {
        cells[i].innerText = val || '';
        cells[i].classList.remove('x-move', 'o-move');
        if (val === 'X') cells[i].classList.add('x-move');
        if (val === 'O') cells[i].classList.add('o-move');
    });
}

// WIN LOGIC: Checks for winner or draw and updates history
function checkGameOver() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let winner = null;
    for (let c of wins) {
        if (board[c[0]] && board[c[0]] === board[c[1]] && board[c[0]] === board[c[2]]) {
            winner = board[c[0]];
            c.forEach(idx => document.querySelectorAll('.cell')[idx].classList.add('winning-cell'));
            break;
        }
    }
    if (winner || !board.includes(null)) {
        gameActive = false;
        const name = document.getElementById('playerName').value || "Player";
        let msg = winner === 'O' ? "Tic-Tac AI Wins!" : (winner === 'X' ? `${name} Won!` : "Strategic Draw!");
        
        if (winner === 'O') scores.O++;
        if (winner === 'X') scores.X++;
        document.getElementById('aScore').innerText = scores.O;
        document.getElementById('pScore').innerText = scores.X;

        const matchRecord = {
            board: [...board],
            result: msg,
            logs: [...currentDecisionTree]
        };
        gameHistoryData.push(matchRecord);
        saveToHistoryUI(matchRecord);

        setTimeout(() => {
            document.getElementById('modalWinner').innerText = msg;
            document.getElementById('resultModal').style.display = 'flex';
        }, 500);
        return true;
    }
    return false;
}

// UI HELPERS: History and AI Logs
function saveToHistoryUI(match) {
    const historyList = document.getElementById('historyList');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.cursor = 'pointer'; 
    item.innerHTML = `<strong>${match.result}</strong><br><small>Click to view replay</small>`;
    
    item.onclick = () => {
        gameActive = false;
        updateUI(match.board);
        renderLogs(match.logs);
        document.getElementById('gameStatus').innerText = "REPLAY: " + match.result;
        
        document.querySelectorAll('.history-item').forEach(i => i.style.borderColor = 'rgba(255,255,255,0.1)');
        item.style.borderColor = 'var(--accent-cyan)';
    };
    
    historyList.prepend(item);
}

function renderLogs(logs) {
    let container = document.getElementById('treeContainer');
    container.innerHTML = '<strong>Analysis:</strong><br>';
    if(logs.length === 0) container.innerHTML += "No logs for this turn.";
    logs.forEach(l => { 
        container.innerHTML += `<div style="font-size:0.85rem; border-bottom:1px solid #334155; padding:4px 0;">Spot ${l.index}: Score ${l.score}</div>`; 
    });
}