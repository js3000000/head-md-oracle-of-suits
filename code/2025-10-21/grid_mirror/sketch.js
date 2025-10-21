let cols = 100;
let rows = 100;
let cellSize = 10;
let grid = [];
let mirroredGrid = [];

function setup() {
  // Extra width: +1 cell for the offset between the two grids
  createCanvas((cols * 2 + 1) * cellSize, rows * cellSize);
  noLoop();

  // Initialize original grid
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = int(random(2));
    }
  }

  // Create mirrored version
  mirroredGrid = mirrorDiagonal(grid);
}

function draw() {
  background(255);

  // Draw original grid
  drawGrid(grid, 0, 0);

  // Draw mirrored grid with an offset (1 cell gap)
  let offsetX = (cols + 1) * cellSize;
  drawGrid(mirroredGrid, offsetX, 0);
}

// 🧩 Function to draw any grid with top-left offset (ox, oy)
function drawGrid(g, ox, oy) {
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[0].length; x++) {
      fill(g[y][x] === 1 ? 0 : 255);
      stroke(0);
      rect(ox + x * cellSize, oy + y * cellSize, cellSize, cellSize);
    }
  }
}

// 🔁 Return a new grid mirrored diagonally (transpose)
function mirrorDiagonal(original) {
  let mirrored = [];

  for (let y = 0; y < rows; y++) {
    mirrored[y] = [];
    for (let x = 0; x < cols; x++) {
      // Transpose: flip x and y
      mirrored[y][x] = original[x][y];
    }
  }

  return mirrored;
}
