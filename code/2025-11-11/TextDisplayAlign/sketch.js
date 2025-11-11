function preload() {

  // Try local first, fall back to remote Roboto if that fails (avoids parsing HTML 404 as font).
  font = loadFont('assets/night-ghost/Night Ghost.ttf');
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textAlign(CENTER, CENTER); // centrer le texte
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  background(200);

  // --- Dessin de l'objet 3D ---
  push();
  // objet placé plus loin dans la scène
  translate(0, 0, -500);
  rotateY(frameCount * 0.01);
  normalMaterial();
  box(100);
  pop();

   // Draw overlay text using p5 on top of the Three canvas
  push();
  if (font) textFont(font);
  textSize(14);
  fill(0);
  //translate(-width/2 + 10, -height/2 + 20);
  text('HELLO WORLD', 0, 0);


  pop();
}
