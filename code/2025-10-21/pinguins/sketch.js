


let huddle;

function setup() {
  createCanvas(400, 400);
  huddle = new Huddle(100); // 20 penguins
}

function draw() {
  background(220);
  
  huddle.update(mouseX, mouseY);
  huddle.display();
}
