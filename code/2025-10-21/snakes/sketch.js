let snake;

function setup() {
  createCanvas(400, 400);
  snake = new Snake(100, 200, 10, 2); // start at (100, 200), 10 segments, speed 2
}

function draw() {
  background(220);
  
  // Control snake direction with arrow keys
  if (keyIsDown(LEFT_ARROW)) snake.setDirection(-1, 0);
  if (keyIsDown(RIGHT_ARROW)) snake.setDirection(1, 0);
  if (keyIsDown(UP_ARROW)) snake.setDirection(0, -1);
  if (keyIsDown(DOWN_ARROW)) snake.setDirection(0, 1);

  
  
  snake.update();
  snake.display();
}

function keyPressed() {
  if (key === 'l' || key === 'L') {
    // Toggle stop/start
    if (snake.speed !== 0) {
      snake.speed = 0;  // stop
    } else {
      snake.speed = 2;  // resume with original speed (change if needed)
    }
  }
}