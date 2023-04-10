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

const findPathBtn = document.getElementById('find-path');
findPathBtn.addEventListener('click', findPath);


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

function findPath() {
    if (!startPoint || !endPoint) {
        alert('Please set both start and end points.');
        return;
    }

    const path = bfs(startPoint, endPoint);
    if (path) {
        for (const cell of path) {
            cell.classList.add('path');
        }
    } else {
        alert('No path found between start and end points.');
    }
}

function bfs(start, end) {
    const queue = [{ cell: start, path: [] }];
    const visited = new Set();

    while (queue.length > 0) {
        const { cell, path } = queue.shift();
        if (cell === end) {
            return path;
        }

        if (visited.has(cell) || cell.classList.contains('selected')) {
            continue;
        }

        visited.add(cell);

        for (const neighbor of getNeighbors(cell)) {
            if (!visited.has(neighbor) && !neighbor.classList.contains('selected')) {
                queue.push({ cell: neighbor, path: [...path, cell] });
            }
        }
    }

    return null;
}

function getNeighbors(cell) {
    const neighbors = [];
    const row = cell.parentElement;
    const i = Array.from(row.children).indexOf(cell);
    const j = Array.from(row.parentElement.children).indexOf(row);

    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
    ];

    for (const { x, y } of directions) {
        const newRow = gridContainer.children[j + y];
        if (newRow) {
            const newCell = newRow.children[i + x];
            if (newCell) {
                neighbors.push(newCell);
            }
        }
    }

    return neighbors;
}