const gridContainer = document.querySelector(".grid-container");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const generateGridBtn = document.getElementById("generateGrid");
const backBtn = document.getElementById("back");
const findShortestRouteBtn = document.getElementById("findShortestRoute");

let dragging = false;
let dragColor = "white";
let gridSize = { width: 10, height: 10 };
let gridData = [];
let actionHistory = [];

generateGridBtn.addEventListener("click", generateGrid);
backBtn.addEventListener("click", undoLastAction);
findShortestRouteBtn.addEventListener("click", findShortestRoute);

function generateGrid() {
    gridSize.width = parseInt(widthInput.value);
    gridSize.height = parseInt(heightInput.value);
    gridData = new Array(gridSize.width * gridSize.height).fill("white");
  
    gridContainer.style.width = `${gridSize.width * 30}px`;
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize.width}, 30px)`; // Add this line
    gridContainer.innerHTML = "";

    for (let i = 0; i < gridSize.width * gridSize.height; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell", "white");
        cell.style.width = "30px";
        cell.style.height = "30px";

        cell.addEventListener("mousedown", cellMouseDown);
        cell.addEventListener("mouseover", cellMouseOver);
        cell.addEventListener("mouseup", cellMouseUp);
        cell.addEventListener("dblclick", cellDoubleClick);

        gridContainer.appendChild(cell);
    }
}

function cellMouseDown(event) {
    dragging = true;
    dragColor = event.target.classList.contains("white") ? "black" : "white";
    toggleCellColor(event.target);
    event.target.classList.add("green-border");
    actionHistory.push({ index: getIndex(event.target), type: "drag", color: dragColor });
}

function cellMouseOver(event) {
    if (dragging) {
        toggleCellColor(event.target, dragColor);
        event.target.classList.add("green-border");
        actionHistory.push({ index: getIndex(event.target), type: "drag", color: dragColor });
    }
}

function cellMouseUp(event) {
    dragging = false;
    gridContainer.querySelectorAll(".green-border").forEach(cell => cell.classList.remove("green-border"));
}

function cellDoubleClick(event) {
    const cell = event.target;
    const cellType = cell.getAttribute("data-cell-type");

    if (cellType === "start") {
        cell.setAttribute("data-cell-type", "end");
        cell.classList.remove("start");
        cell.classList.add("end");
        actionHistory.push({ index: getIndex(cell), type: "doubleClick", prevState: "start" });
    } else if (cellType === "end") {
        cell.setAttribute("data-cell-type", "");
        cell.classList.remove("end");
        cell.classList.add("white");
        actionHistory.push({ index: getIndex(cell), type: "doubleClick", prevState: "end" });
    } else {
        cell.setAttribute("data-cell-type", "start");
        cell.classList.remove("white");
        cell.classList.add("start");
        actionHistory.push({ index: getIndex(cell), type: "doubleClick", prevState: "" });
    }
}

function toggleCellColor(cell, color) {
    const oldColor = cell.classList.contains("white") ? "white" : "black";
    const newColor = color || oldColor === "white" ? "black" : "white";
    cell.classList.remove(oldColor);
    cell.classList.add(newColor);
    gridData[getIndex(cell)] = newColor;
}

function undoLastAction() {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory.pop();

    const cell = gridContainer.children[lastAction.index];

    switch (lastAction.type) {
        case "drag":
            toggleCellColor(cell);
            break;
        case "doubleClick":
            if (lastAction.prevState === "start") {
            cell.setAttribute("data-cell-type", "start");
            cell.classList.remove("end");
            cell.classList.add("start");
            } else if (lastAction.prevState === "end") {
            cell.setAttribute("data-cell-type", "end");
            cell.classList.remove("start");
            cell.classList.add("end");
            } else {
            cell.setAttribute("data-cell-type", "");
            cell.classList.remove("start");
            cell.classList.add("white");
            }
            break;
        }
}

function getIndex(cell) {
    return Array.from(gridContainer.children).indexOf(cell);
}
    
function findShortestRoute() {
    const startCell = Array.from(gridContainer.children).find(cell => cell.getAttribute("data-cell-type") === "start");
    const endCell = Array.from(gridContainer.children).find(cell => cell.getAttribute("data-cell-type") === "end");

    if (!startCell || !endCell) {
        alert("Please set a start and end point.");
        return;
    }

    const startIdx = getIndex(startCell);
    const endIdx = getIndex(endCell);

    const visited = new Set();
    const queue = [{ idx: startIdx, path: [startIdx] }];

    while (queue.length > 0) {
    const { idx, path } = queue.shift();
    const row = Math.floor(idx / gridSize.width);
    const col = idx % gridSize.width;

    if (idx === endIdx) {
        drawPath(path);
        return;
      }
      
      visited.add(idx);
      
      const neighbors = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 }
      ];
      
      for (const { row, col } of neighbors) {
        const neighborIdx = row * gridSize.width + col;
        if (
          row >= 0 && row < gridSize.height &&
          col >= 0 && col < gridSize.width &&
          gridData[neighborIdx] !== "black" &&
          !visited.has(neighborIdx)
        ) {
          queue.push({ idx: neighborIdx, path: path.concat(neighborIdx) });
        }
      }
    }

    alert("No path found.");
}

function drawPath(path) {
    path.forEach((idx, i) => {
      if (i > 0 && i < path.length - 1) {
        setTimeout(() => {
          const cell = gridContainer.children[idx];
          cell.classList.add("path");
        }, i * 100);
      }
    });
}
    
// Generate initial grid
generateGrid();