let frames = []; // tableau pour stocker les images
let totalFrames = 75; // nombre total de PNG
let currentFrame = 0;

let filename
let bkg;

function preload() {
  // charger chaque image de la séquence
  for (let i = 0; i < totalFrames; i++) {
   filename = './videos/portalAnimation/portalCache_v1/portalCache_' + nf(i, 5) + '.png';
    frames.push(loadImage(filename));  
  }

  // image ending
  bkg = loadImage('./img/animation_ending_frame.png');

  // preload video
  video = createVideo(['./videos/animation.mp4']);
  video.hide(); // cacher le player vidéo

}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  //background(255, 25, 25); // ou un fond coloré pour voir la transparence

  // centrer l'origine (0,0) au milieu de la fenêtre



  // dessiner la frame courante centrée et redimensionnée pour tenir dans la fenêtre
  push();
  imageMode(CENTER); // centre l'image sur son point (0,0) en WEBGL
  const img = frames[currentFrame];
  if (img) {
    // calcule un facteur d'échelle pour fitter l'image dans la fenêtre sans la déformer
    const scaleFactor = min(width / img.width, height / img.height);
    const drawW = img.width * scaleFactor;
    const drawH = img.height * scaleFactor;
    
    // image joueur
    image(bkg, 0, 0, drawW, drawH);

    // play video animation
    video.size(drawW, drawH);
    video.loop();
    video.volume(0);
    image(video, 0, 0, drawW, drawH); // (0,0) = centre du canvas en WEBGL
    image(img, 0, 0, drawW, drawH); // (0,0) = centre du canvas en WEBGL
  }
  pop();

  // passer à la frame suivante
  currentFrame++;
  if (currentFrame >= frames.length) {
    currentFrame = 0; // boucle infinie
  }

    push();
    noStroke();
    fill(0);
    const barWidth = ((width - (bkg.width * min(width / bkg.width, height / bkg.height))) / 2) + 10;
    rectMode(CENTER);
    rect(-width / 2 + barWidth / 2, 0, barWidth, height); // barre gauche
    rect(width / 2 - barWidth / 2, 0, barWidth, height); // barre droite
    pop();

}