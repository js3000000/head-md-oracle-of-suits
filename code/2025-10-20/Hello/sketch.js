function setup() {
  createCanvas(400, 400);
  background(100);
  stroke(0);             // Pixel color (black)
  strokeWeight(10);

}


function draw() {
  if (mouseIsPressed) {
    point(mouseX, mouseY);
  }
}