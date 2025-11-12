let frames = []; // tableau pour stocker les images
let totalFrames = 75; // nombre total de PNG
let currentFrame = 0;

let filename
let bkg;
let lastFrameTime = 0;
let frameDelay = 10; // ms entre chaque frame (ajuster pour vitesse)

let portalOpen = false;

// PRELOAD -----------------------------

function preload() {
  // charger chaque image de la séquence
  for (let i = 0; i < totalFrames; i++) {
    filename = './videos/portalAnimation/portalCache_v1/portalCache_' + nf(i, 5) + '.png';
    frames.push(loadImage(filename));
  }

  // image ending
  bkg = loadImage('./img/museum.png');


} // fin preload


function setup() {
  createCanvas(windowWidth, windowHeight);

  // après une courte attente, commencer l'animation du portail
  setTimeout(() => {
    portalOpen = true;
  }, 1300);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  // dessiner la frame courante centrée et redimensionnée pour tenir dans la fenêtre
  push();
  imageMode(CENTER);
  const cx = width / 2;
  const cy = height / 2;
  //const img = frames[currentFrame];

  // utiliser la frame courante si disponible
  const img = frames.length > 0 ? frames[currentFrame] : null;
  if (img) {


    // image musée au fond (centrée)
    background(60, 0, 0);
    noStroke();
    if (bkg) {
      const scaleB = min(width / bkg.width, height / bkg.height);
      const bW = bkg.width * scaleB;
      const bH = bkg.height * scaleB;
      image(bkg, cx, cy, bW, bH);
    }
    // calculer un facteur d'échelle pour fitter l'image dans la fenêtre sans la déformer
    const scaleFactor = min(width / img.width, height / img.height);
    const drawW = img.width * scaleFactor;
    const drawH = img.height * scaleFactor;

    // dessiner la frame courante
    if (!portalOpen) {
      image(img, cx, cy, drawW, drawH);
    } else {
      // si le portail est ouvert, afficher la frame de repos (dernière)
      image(frames[frames.length - 1], cx, cy, drawW, drawH);
    }

    // avancer la frame en fonction du tempo défini
    if (frames.length > 0 && (millis() - lastFrameTime) >= frameDelay) {
      currentFrame = (currentFrame + 1) % frames.length;
      lastFrameTime = millis();
    }

  }
  pop();


  // BARRES NOIRES -----------------------------

  push();
  noStroke();
  fill(0);
  // calculer de manière sûre la taille des barres même si bkg non défini
  const bkgW = bkg ? bkg.width : width;
  const bkgH = bkg ? bkg.height : height;
  const bkgScale = min(width / bkgW, height / bkgH);
  const barWidth = ((width - (bkgW * bkgScale)) / 2) + 10;
  rectMode(CENTER);
  // reposition for 2D canvas coordinates
  rect(barWidth / 2, cy, barWidth, height); // barre gauche
  rect(width - barWidth / 2, cy, barWidth, height); // barre droite
  pop();

  // ajouter barre noire en haut et en bas
  push();
  noStroke();
  fill(0);
  const barHeight = ((height - (bkgH * bkgScale)) / 2) + 10;
  rectMode(CENTER);
  rect(cx, barHeight / 2, width, barHeight); // barre haute
  rect(cx, height - barHeight / 2, width, barHeight); // barre basse
  pop();

} // fin de draw()