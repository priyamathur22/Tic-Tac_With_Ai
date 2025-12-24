const boardElement = document.getElementById("board");
const startBtn = document.getElementById("startGame");
const playerInput = document.getElementById("playerName");
const gameSection = document.getElementById("game-section");
const newGameBtn = document.getElementById("newGame");

let board = Array(9).fill("");
let playerName = "Player";
let gameActive = false;

startBtn.addEventListener("click", () => {
  playerName = playerInput.value.trim() || "Player";
  gameActive = true;
  gameSection.style.display = "block";
  resetBoard();
});

newGameBtn.addEventListener("click", resetBoard);

function resetBoard() {
  board = Array(9).fill("");
  boardElement.innerHTML = "";
  createBoard();
}

function createBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handlePlayerMove);
    boardElement.appendChild(cell);
  }
}

function handlePlayerMove(e) {
  if (!gameActive) return;

  const index = e.target.dataset.index;
  if (board[index] !== "") return;

  board[index] = HUMAN;
  e.target.textContent = HUMAN;

  if (checkWinner(board) || isDraw(board)) {
    endGame();
    return;
  }

  aiMove();
}

function aiMove() {
  const move = findBestMove(board);
  if (move === -1) return;

  board[move] = AI;
  boardElement.children[move].textContent = AI;

  if (checkWinner(board) || isDraw(board)) {
    endGame();
  }
}

function endGame() {
  gameActive = false;

  const winner = checkWinner(board);
  let result = "Draw";

  if (winner === HUMAN) result = "Win";
  else if (winner === AI) result = "Loss";

  saveGameToHistory(playerName, result);
}
