function setup() {
  //Resize the canvas to window size
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);


// Un marionnette de forme humaine simple en 2d qu'on controle avec la souris
  // Corps
  fill(150, 100, 50);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 50, 50, 100);

  // Tête
  fill(200, 150, 100);
  ellipse(width / 2, height / 2 - 25, 50, 50);

  // Bras gauche avec une longueur fixe qui suit la position de la souris
  //et pivote autour de l'épaule
  line(width / 2 - 25, height / 2 + 25, mouseX, mouseY);
  // Bras droit
  line(width / 2 + 25, height / 2 + 25, mouseX, mouseY);

  // Jambes
  line(width / 2 - 15, height / 2 + 100, width / 2 - 15, height / 2 + 150);
  line(width / 2 + 15, height / 2 + 100, width / 2 + 15, height / 2 + 150);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}