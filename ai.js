const express = require('express');
const bodyParser = require('body-parser');


const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});


function minimax(board, depth, player, force) {
    const scores = {
        X: 1,
        O: -1,
        tie: 0,
    };

    const opponent = player === 'X' ? 'O' : 'X';
    const winner = checkWinner(board);
    if (winner !== null) {
        return { score: scores[winner] };
    }

    if (depth > force) {
        return { score: 0 };
    }

    let bestMove = null;
    let bestScore = player === 'X' ? -Infinity : Infinity;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = player;

            const score = minimax(board, depth + 1, opponent, force).score;

            if (player === 'X') {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }

            board[i] = '';
        }
    }

    return { score: bestScore, move: bestMove };
}

function checkWinner(board) {
    const winPositions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < winPositions.length; i++) {
        const [a, b, c] = winPositions[i];
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }

    if (board.filter((cell) => cell === '').length === 0) {
        return 'tie';
    }

    return null;
}


app.post('/ai/move/', (req, res) => {

    const NextMove = minimax(req.body.board, req.body.depth, req.body.player, req.body.force).move;
    return res.json({ move: NextMove });
});



const port = 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});