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
    document.documentElement.style.setProperty('--grid-width', width);
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
    lastAction.forEach(({ cell, wasSelected, wasPath }) => {
        if (wasSelected) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
        if (wasPath) {
            cell.classList.add('path');
        } else {
            cell.classList.remove('path');
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

const mazeImageInput = document.getElementById('maze-image');
mazeImageInput.addEventListener('change', handleMazeImage);

function handleMazeImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function() {
        // Process the image and create the grid
        createGridFromImage(image);
    };
}

function createGridFromImage(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = image.width;
    const height = image.height;
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height).data;

    // Update the width and height input values
    widthInput.value = width;
    heightInput.value = height;

    generateGrid();

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const index = (i * width + j) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const cell = gridContainer.rows[i].cells[j];

            // Determine if the pixel is closer to black or white
            if (r + g + b < 255 * 3 / 2) {
                cell.classList.add('selected');
            } else {
                cell.classList.remove('selected');
            }
        }
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
        // Exclude the start cell by starting the loop from index 1
        const pathAction = [];
        for (let i = 1; i < path.length; i++) {
            const cell = path[i];
            cell.classList.add('path');
            pathAction.push({ cell: cell, wasPath: false });
        }
        actionHistory.push(pathAction);
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