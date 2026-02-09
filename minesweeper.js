const boardSize = 10;
const mineCount = 10;
let board = [];
let minesInstalled = 0;
let gameActive = false;
let currentMode = 'dig'; //'dig' or 'flag'
let flagsRemaining = mineCount;
let timerInterval = null;
let elapsedSeconds = 0;




function startGame() {
    gameActive = true;
    //hide the start overlay and start games
    document.getElementById('minesweeper-overlay').style.display = 'none';
    document.getElementById('minesweeper-ui').style.display = 'block';
    initGame();
    startTimer();
}

function endGame(message) {
    gameActive = false;
    stopTimer();
    //reveal all mines (optional but nice)
    board.forEach(row => {
        row.forEach(cell => {
            if (cell.isMine) {
                cell.element.innerText = '💣';
                cell.element.classList.add('mine');
            }
            cell.element.style.pointerEvents = 'none';
        });
    });

    setTimeout(() => {
        alert(message);
        //hide game UI
        document.getElementById('minesweeper-ui').style.display = 'none';
        //show start overlay
        document.getElementById('minesweeper-overlay').style.display = 'block';
        //hard reset board so layout collapses
        document.getElementById('minesweeper-board').innerHTML = '';
    }, 400);
}

function setDigMode() {
    currentMode = 'dig';
    updateModeUI();
}

function setFlagMode() {
    currentMode = 'flag';
    updateModeUI();
}

function updateModeUI() {
    document.getElementById('dig-btn').classList.toggle('active-btn', currentMode === 'dig');
    document.getElementById('flag-btn').classList.toggle('active-btn', currentMode === 'flag');
}

function startTimer() {
    stopTimer();

    elapsedSeconds = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedSeconds / 60)
        .toString()
        .padStart(2, '0');
    const seconds = (elapsedSeconds % 60)
        .toString()
        .padStart(2, '0');
    document.getElementById('minesweeper-timer').innerText = `${minutes}:${seconds}`;
}



function initGame() {
    const boardElement = document.getElementById('minesweeper-board');
    boardElement.innerHTML = ''; //clear previous game
    board = [];
    flagsRemaining = mineCount;
    updateFlagCount();
    stopTimer();
    elapsedSeconds = 0;
    updateTimerDisplay();
    startTimer();


    //create the grid
    for (let r = 0; r < boardSize; r++) {
        board[r] = [];
        for (let c = 0; c < boardSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellAction(r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(cell);
            });
            boardElement.appendChild(cell);
            board[r][c] = { isMine: false, revealed: false, element: cell };
        }
    }

    //plant mines randomly
    let planted = 0;
    while (planted < mineCount) {
        let r = Math.floor(Math.random() * boardSize);
        let c = Math.floor(Math.random() * boardSize);
        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            planted++;
        }
    }
}

function checkWin() {
    let revealedCount = 0;

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c].revealed && !board[r][c].isMine) {
                revealedCount++;
            }
        }
    }

    return revealedCount === (boardSize * boardSize - mineCount);
}

function handleCellAction(r, c) {
    if (!gameActive) return;
    const cell = board[r][c];
    if (currentMode === 'flag') {
        toggleFlag(cell.element);
    } else {
        revealCell(r, c);
    }
}

function revealCell(r, c) {
    if (!gameActive) return;
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) return;
    const cell = board[r][c];
    if (cell.revealed) return;
    if (cell.element.innerText === '🚩') return;

    cell.revealed = true;
    cell.element.classList.add('revealed');

    if (cell.isMine) {
        cell.element.innerText = '💣';
        cell.element.classList.add('mine');
        endGame('💥 Game Over!');
        return;
    }


    //count neighboring mines
    let minesNear = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nr = r + i, nc = c + j;
            if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                if (board[nr][nc].isMine) minesNear++;
            }
        }
    }

    if (minesNear > 0) {
        cell.element.innerText = minesNear;
    } else {
        //reveal neighbors if 0 mines nearby
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(r + i, c + j);
            }
        }
    }

    if (checkWin()) {
        endGame('🏆 You Win!');
    }
}

function toggleFlag(el) {
    if (el.classList.contains('revealed')) return;

    if (el.innerText === '🚩') {
        //remove flag
        el.innerText = '';
        flagsRemaining++;
    } else {
        //place flag only if available
        if (flagsRemaining === 0) return;
        el.innerText = '🚩';
        flagsRemaining--;
    }

    updateFlagCount();
}


function updateFlagCount() {
    document.getElementById('mine-count').innerText = flagsRemaining;
}


//export functions for html use
window.minesweeperStartGame = startGame;
window.minesweeperInitGame = initGame;
window.minesweeperEndGame = endGame;
window.minesweeperDigMode = setDigMode;
window.minesweeperFlagMode = setFlagMode;