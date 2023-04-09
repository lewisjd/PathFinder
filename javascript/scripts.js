// Define constants and variables
const gridSize = 15;
const grid = document.getElementById('grid');
const initBoardBtn = document.getElementById('init-board');
const findRouteBtn = document.getElementById('find-route');
const undoBtn = document.getElementById('undo');
let cells = [];
let actions = [];

// Initialize the grid
function initGrid() {
    grid.innerHTML = '';
    cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('mousedown', handleMouseDown);
        cell.addEventListener('mouseover', handleMouseOver);
        cell.addEventListener('mouseup', handleMouseUp);
        cell.addEventListener('contextmenu', handleContextMenu);
        grid.appendChild(cell);
        cells.push(cell);
    }
}

initGrid();

// Event listeners for buttons
initBoardBtn.addEventListener('click', initGrid);
findRouteBtn.addEventListener('click', findShortestRoute);
undoBtn.addEventListener('click', undo);

// Implement the event handlers and maze-solving algorithm here
// Helper functions
function getCoordinates(index) {
  return {
      x: index % gridSize,
      y: Math.floor(index / gridSize),
  };
}

function getIndex(x, y) {
  return y * gridSize + x;
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

class PriorityQueue {
  constructor() {
      this.elements = [];
  }

  isEmpty() {
      return this.elements.length === 0;
  }

  enqueue(element, priority) {
      this.elements.push({ element, priority });
      this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
      return this.elements.shift().element;
  }
}

// A* algorithm
function findShortestRoute() {
  const startCell = cells.find((cell) => cell.style.backgroundColor === 'green');
  const endCell = cells.find((cell) => cell.style.backgroundColor === 'red');
  if (!startCell || !endCell) {
      alert('Please set both start and end points.');
      return;
  }

  const start = getCoordinates(parseInt(startCell.dataset.index));
  const end = getCoordinates(parseInt(endCell.dataset.index));

  const openSet = new PriorityQueue();
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map(cells.map((_, index) => [index, Infinity]));

  gScore.set(getIndex(start.x, start.y), 0);
  openSet.enqueue(start, manhattanDistance(start, end));

  while (!openSet.isEmpty()) {
      const current = openSet.dequeue();
      const currentIndex = getIndex(current.x, current.y);

      if (current.x === end.x && current.y === end.y) {
          let node = end;
          const path = [end];
          while (cameFrom.has(getIndex(node.x, node.y))) {
              node = cameFrom.get(getIndex(node.x, node.y));
              path.push(node);
          }

          for (const point of path) {
              const cell = cells[getIndex(point.x, point.y)];
              if (cell.style.backgroundColor !== 'green' && cell.style.backgroundColor !== 'red') {
                  cell.style.backgroundColor = 'lightorange';
              }
          }

          return;
      }

      closedSet.add(currentIndex);

      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const neighbor = { x: current.x + dx, y: current.y + dy };
          const neighborIndex = getIndex(neighbor.x, neighbor.y);

          if (
              neighbor.x < 0 || neighbor.x >= gridSize ||
              neighbor.y < 0 || neighbor.y >= gridSize ||
              closedSet.has(neighborIndex) ||
              cells[neighborIndex].style.backgroundColor === 'black'
          ) {
              continue;
          }

          const tentativeGScore = gScore.get(currentIndex) + 1;
          if (tentativeGScore < gScore.get(neighborIndex)) {
              cameFrom.set(neighborIndex, current);
              gScore.set(neighborIndex, tentativeGScore);
              const fScore = tentativeGScore + manhattanDistance(neighbor, end);
              openSet.enqueue(neighbor, fScore);
          }
      }
  }

  alert('No path found.');
}

let dragging = false;
let dragColor = '';

function handleMouseDown(e) {
    e.preventDefault();
    dragging = true;
    if (e.shiftKey) {
        const popup = document.createElement('div');
        popup.innerHTML = `
            <ul>
                <li id="popup-start">Start</li>
                <li id="popup-end">End</li>
                <li id="popup-neither">Neither</li>
            </ul>
        `;
        popup.style.position = 'absolute';
        popup.style.left = `${e.pageX + 5}px`;
        popup.style.top = `${e.pageY + 5}px`;
        popup.style.backgroundColor = 'white';
        popup.style.border = '1px solid black';
        document.body.appendChild(popup);

        document.getElementById('popup-start').onclick = () => {
            e.target.style.backgroundColor = 'green';
            document.body.removeChild(popup);
        };
        document.getElementById('popup-end').onclick = () => {
            e.target.style.backgroundColor = 'red';
            document.body.removeChild(popup);
        };
        document.getElementById('popup-neither').onclick = () => {
            e.target.style.backgroundColor = 'white';
            document.body.removeChild(popup);
        };
    } else {
        dragColor = e.target.style.backgroundColor === 'black' ? 'white' : 'black';
        e.target.style.backgroundColor = dragColor;
        actions.push({ type: 'click', index: parseInt(e.target.dataset.index), color: e.target.style.backgroundColor });
    }
}

function handleMouseOver(e) {
    if (dragging && !e.shiftKey) {
        e.target.style.backgroundColor = dragColor;
        actions.push({ type: 'drag', index: parseInt(e.target.dataset.index), color: e.target.style.backgroundColor });
    }
}

function handleMouseUp() {
    dragging = false;
}

function handleContextMenu(e) {
    e.preventDefault();
}

function undo() {
    if (actions.length === 0) return;
    const lastAction = actions.pop();
    const cell = cells[lastAction.index];
    cell.style.backgroundColor = lastAction.color === 'black' ? 'white' : 'black';
    if (lastAction.type === 'drag') {
        while (actions.length > 0 && actions[actions.length - 1].type === 'drag') {
            undo();
        }
    }
}