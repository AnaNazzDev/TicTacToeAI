const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const forceBtn = document.getElementsByName('force');
let selectedForce = document.querySelector('input[name="force"]:checked').value;
const message = document.getElementById("winner");
const resetButton = document.getElementById("btn");

for (let i = 0; i < forceBtn.length; i++) {
    forceBtn[i].addEventListener('change', function () {
        selectedForce = document.querySelector('input[name="force"]:checked').value;
    });
}

let gameState = ["", "", "", "", "", "", "", "", ""];
let winner = null;
let currentPlayer = "X";
let isComputerTurn = false;

// Check if any row, column or diagonal is completed by a single player
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (gameState[a] !== "" && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            winner = gameState[a];
            message.innerText = `${winner} has won the game!`;
            resetButton.disabled = false;
            return true;
        }
    }

    if (!gameState.includes("")) {
        winner = "tie";
        message.innerText = "It's a tie!";
        resetButton.disabled = false;
        return true;
    }

    return false;
}

// Update the board to reflect the current game state
function displayBoard(index) {
    cells[index].innerText = currentPlayer;
    cells[index].classList.add(currentPlayer.toLowerCase());
    message.innerText = `Current turn: ${currentPlayer}`;
}

// Make a move for the computer player
function computerPlay() {
    if (isComputerTurn == false) {
        return;
    }
    fetch("ai/move", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            board: gameState,
            player: currentPlayer,
            force: selectedForce,
            depth: gameState.length <= 1 ? 0 : 1
        })
    })
        .then(response => response.json())
        .then(data => {
            const index = data.move;
            gameState[index] = currentPlayer;
            displayBoard(index);

            if (checkWinner()) {
                return;
            }

            currentPlayer = currentPlayer === "X" ? "O" : "X";
            isComputerTurn = false;
            message.innerText = `Player's turn`;
        })
        .catch(error => console.log(error));
}

// Handle a player move
function playerPlay(index) {
    if (isComputerTurn == true) {
        return;
    }
    // check if the cell is empty and if winner var is null
    if (gameState[index] !== "" || winner !== null) {
        return;
    }

    gameState[index] = currentPlayer;
    displayBoard(index);

    if (checkWinner()) {
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    isComputerTurn = true;

    if (currentPlayer === "O") {
        let rdm = Math.random() * (1000 - 400) + 400;
        setTimeout(computerPlay, rdm);
    }
    message.innerText = `AI's turn`;
}

// Reset the game board
function resetGame() {
    gameState = ["", "", "", "", "", "", "", "", ""];
    winner = null;
    currentPlayer = "X";
    message.innerText = "";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove("x");
        cell.classList.remove("o");
    });
    resetButton.disabled = true;
    isComputerTurn = false;
}

// Add event listeners to the board and reset button
cells.forEach((cell, index) => {
    cell.addEventListener("click", () => playerPlay(index));
});


resetButton.addEventListener("click", resetGame);

// Reset the game board on page load
message.innerText = `Player's turn`;
