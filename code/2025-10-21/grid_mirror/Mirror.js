// 🔄 Mirror the grid along the top-left to bottom-right diagonal
function mirrorDiagonal() {
  for (let y = 0; y < rows; y++) {
    for (let x = y + 1; x < cols; x++) {
      // Swap grid[y][x] with grid[x][y]
      let temp = grid[y][x];
      grid[y][x] = grid[x][y];
      grid[x][y] = temp;
    }
  }
}