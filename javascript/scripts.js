const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const generateBtn = document.getElementById('generate');
const gridContainer = document.getElementById('grid');
const blackBtn = document.getElementById('black');
const whiteBtn = document.getElementById('white');
const undoBtn = document.getElementById('undo');

generateBtn.addEventListener('click', generateGrid);
blackBtn.addEventListener('click', setColorToBlack);
whiteBtn.addEventListener('click', setColorToWhite);
undoBtn.addEventListener('click', undoLastAction);

const startBtn = document.getElementById('start');
const endBtn = document.getElementById('end');
startBtn.addEventListener('click', () => setStartEndMode('start'));
endBtn.addEventListener('click', () => setStartEndMode('end'));


let isDrawing = false;
let currentColor = 'black';
let actionHistory = [];
let actionInProgress = [];

let startEndMode = null;
let startPoint = null;
let endPoint = null;

function generateGrid() {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    gridContainer.addEventListener('dragstart', (e) => e.preventDefault());
    gridContainer.innerHTML = '';

    for (let i = 0; i < height; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < width; j++) {
            const cell = document.createElement('td');
            cell.classList.add('cell');
            cell.addEventListener('mousedown', toggleCell);
            cell.addEventListener('mouseover', applyColorOnDrag);
            cell.addEventListener('mouseup', () => isDrawing = false);
            row.appendChild(cell);
        }
        gridContainer.appendChild(row);
    }
}

function toggleCell(event) {
    if (startEndMode) {
        setStartEndPoint(event.target);
        return;
    }
    isDrawing = true;
    applyColor(event.target);
    document.addEventListener('mouseup', finalizeAction);
}

function setStartEndPoint(cell) {
    if (startEndMode === 'start') {
        if (startPoint) {
            startPoint.classList.remove('start');
        }
        cell.classList.add('start');
        startPoint = cell;
    } else if (startEndMode === 'end') {
        if (endPoint) {
            endPoint.classList.remove('end');
        }
        cell.classList.add('end');
        endPoint = cell;
    }
    setStartEndMode(null);
}

function applyColorOnDrag(event) {
    if (!isDrawing) return;
    applyColor(event.target);
}

function finalizeAction() {
    if (actionInProgress.length > 0) {
        actionHistory.push(actionInProgress);
        actionInProgress = [];
    }

    document.removeEventListener('mouseup', finalizeAction);
    gridContainer.querySelectorAll('.action-in-progress').forEach(cell => cell.classList.remove('action-in-progress'));
}

function applyColor(cell) {
    if (!cell.classList.contains('action-in-progress')) {
        actionInProgress.push({ cell: cell, wasSelected: cell.classList.contains('selected') });
        cell.classList.add('action-in-progress');
    }

    if (currentColor === 'black') {
        cell.classList.add('selected');
    } else {
        cell.classList.remove('selected');
    }
}

function setColorToBlack() {
    currentColor = 'black';
    deselectAllButtons();
    blackBtn.classList.add('selected');
}

function setColorToWhite() {
    currentColor = 'white';
    deselectAllButtons();
    whiteBtn.classList.add('selected');
}

function undoLastAction() {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory.pop();
    lastAction.forEach(({ cell, wasSelected }) => {
        if (wasSelected) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
    });
}

function deselectAllButtons() {
    blackBtn.classList.remove('selected');
    whiteBtn.classList.remove('selected');
    startBtn.classList.remove('selected');
    endBtn.classList.remove('selected');
}

function setStartEndMode(mode) {
    startEndMode = mode;
    deselectAllButtons();
    if (mode === 'start') {
        startBtn.classList.add('selected');
    } else if (mode === 'end') {
        endBtn.classList.add('selected');
    }
}

// Generate initial grid
generateGrid();
