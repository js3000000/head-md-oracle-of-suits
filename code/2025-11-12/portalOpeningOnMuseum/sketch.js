let frames = []; // tableau pour stocker les images
let totalFrames = 75; // nombre total de PNG
let currentFrame = 0;

let filename
let bkg;
let lastFrameTime = 0;
let frameDelay = 100; // ms entre chaque frame (ajuster pour vitesse)

// PRELOAD --------------------------

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
  createCanvas(windowWidth, windowHeight, WEBGL);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  

  // dessiner la frame courante centrée et redimensionnée pour tenir dans la fenêtre
  push();
  imageMode(CENTER); // centre l'image sur son point (0,0) en WEBGL
  //const img = frames[currentFrame];
  
  // utiliser la frame courante si disponible
  const img = frames.length > 0 ? frames[currentFrame] : null;
  if (img) {
    // calcule un facteur d'échelle pour fitter l'image dans la fenêtre sans la déformer
    const scaleFactor = min(width / img.width, height / img.height);
    const drawW = img.width * scaleFactor;
    const drawH = img.height * scaleFactor;
    
    // image joueur
    // changer taille image de fond ici
    background(60, 0, 0);
    noStroke();
    image(bkg, 0, 0, drawW/2, drawH/2);

    // play video animation
    /* video.size(drawW, drawH);
    video.loop();
    video.volume(0);
    image(video, 0, 0, drawW, drawH); // (0,0) = centre du canvas en WEBGL */
    
    // dessiner la frame courante
    image(img, 0, 0, drawW, drawH);

    // avancer la frame en fonction du tempo défini
    if (frames.length > 0 && (millis() - lastFrameTime) >= frameDelay) {
      currentFrame = (currentFrame + 1) % frames.length;
      lastFrameTime = millis();
    }

    

  // si pas de frames chargées, afficher le background pour éviter écran vide
  if (frames.length === 0 && bkg) {
    push();
    imageMode(CENTER);
    const scaleFactorBkg = min(width / bkg.width, height / bkg.height);
    image(bkg, 0, 0, bkg.width * scaleFactorBkg, bkg.height * scaleFactorBkg);
    pop();
  }



  }
  pop();

    push();
    noStroke();
    fill(0);
    // calculer de manière sûre la taille des barres même si bkg non défini
    const bkgW = bkg ? bkg.width : width;
    const bkgH = bkg ? bkg.height : height;
    const bkgScale = min(width / bkgW, height / bkgH);
    const barWidth = ((width - (bkgW * bkgScale)) / 2) + 10;
    rectMode(CENTER);
    rect(-width / 2 + barWidth / 2, 0, barWidth, height); // barre gauche
    rect(width / 2 - barWidth / 2, 0, barWidth, height); // barre droite
    pop();

    // ajouter barre noire en haut et en bas
    push();
    noStroke();
    fill(0);
    const barHeight = ((height - (bkgH * bkgScale)) / 2) + 10;
    rectMode(CENTER);
    rect(0, -height / 2 + barHeight / 2, width, barHeight); // barre haute
    rect(0, height / 2 - barHeight / 2, width, barHeight); // barre basse
    pop();

} // fin de draw()