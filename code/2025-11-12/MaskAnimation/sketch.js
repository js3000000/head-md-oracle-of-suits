let frames = []; // tableau pour stocker les images
let totalFrames = 75; // nombre total de PNG
let currentFrame = 0;

let filename

function preload() {
  // charger chaque image de la séquence
  for (let i = 0; i < totalFrames; i++) {
   filename = './videos/portalAnimation/portalCache_v1/portalCache_' + nf(i, 5) + '.png';
    frames.push(loadImage(filename));  
  }

}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255, 25, 25); // ou un fond coloré pour voir la transparence

  // dessiner la frame courante centrée et redimensionnée pour tenir dans la fenêtre
  push();
  imageMode(CENTER); // centre l'image sur son point (0,0) en WEBGL
  const img = frames[currentFrame];
  if (img) {
    // calcule un facteur d'échelle pour fitter l'image dans la fenêtre sans la déformer
    const scaleFactor = min(width / img.width, height / img.height);
    const drawW = img.width * scaleFactor;
    const drawH = img.height * scaleFactor;
    image(img, 0, 0, drawW, drawH); // (0,0) = centre du canvas en WEBGL
  }
  pop();

  // passer à la frame suivante
  currentFrame++;
  if (currentFrame >= frames.length) {
    currentFrame = 0; // boucle infinie
  }
}