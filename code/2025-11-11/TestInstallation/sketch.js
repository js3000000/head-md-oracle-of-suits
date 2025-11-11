let bkg;
let maskedImg;
let cacheLosange;

let cam;
let camZ;

let firesound;
let cardModel;

let video;
let videoDrawWidth;
let videoDrawHeight;

function preload() {

  // 2d images
  bkg = loadImage('./img/bkg.png');
  cacheLosange = loadImage('./img/diamond_cache.png');


  // fonts
  font = loadFont('assets/night-ghost/Night Ghost.ttf');

  // sounds
  firesound = loadSound('./sound/fire.mp3');

  // 3d models
  cardModel = loadModel('./3dmodel/Card.obj', true);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // initialiser la caméra et la profondeur Z
  cam = createCamera();
  // position Z par défaut basée sur le FOV (PI/3 par défaut)
  camZ = (height / 2) / Math.tan(PI / 6);
  cam.setPosition(0, 0, camZ);
  cam.lookAt(0, 0, 0);
  // régler la perspective pour correspondre à la taille du canvas
  perspective(PI / 3, width / height, 0.1, 10000);

  videoDrawWidth = 480;
  videoDrawHeight = 360;
  // setup video pour webcam
  video = createCapture(VIDEO);
  // garder proportions
  video.size(videoDrawWidth, videoDrawHeight);
  video.hide();

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // recalculer perspective et repositionner la caméra
  camZ = camZ || ((height / 2) / Math.tan(PI / 6));
  cam.setPosition(0, 0, camZ);
  cam.lookAt(0, 0, 0);
  perspective(PI / 3, width / height, 0.1, 10000);
}

const ratioPlaneVideo = 1.75;

function draw() {
  //background(200, 40, 0);
  push();


  // afficher webcam video as background
  // ajouter alpha to video
  // alpha value between 0 (transparent) and 255 (opaque)
  //tint(255, 150); // 150 = alpha (0-255)
  texture(video);
  // reculer dans les z pour que ce soit en arrière-plan
  translate(0, 0, 0);
  // dessiner un plan avec la texture vidéo 
  plane(videoDrawWidth * ratioPlaneVideo, videoDrawHeight * ratioPlaneVideo);
  pop();

  // brun background
  //background(50, 30, 0);
  // En WEBGL, l'origine (0,0) est le centre. Pour dessiner des éléments 2D en
  // coordonnées top-left (rect, etc.), on translate temporairement vers
  // -width/2, -height/2. Puis on reprend l'origine centrale pour dessiner
  // les éléments centrés (comme le cache losange) en x=0,y=0.

  // Dessins en coordonnées top-left
  push();
  translate(-width / 2, -height / 2);

  if (bkg) {
    // reculer seulement le background dans les z sans affecter les barres/rects
    push();
    const bgDepth = -2000; // background très loin
    translate(0, 0, bgDepth);

    // afficher l'image d'arrière-plan en gardant les proportions et en centrant
    const ratio = Math.max(width / bkg.width, height / bkg.height);
    imageMode(CENTER);
    image(bkg, width / 2, height / 2, bkg.width * ratio, bkg.height * ratio);
    pop();
  }

  // mettre des barres noires en haut et en bas
  fill(0);
  noStroke();
  const barHeight = (height - (cacheLosange ? (Math.min(width / cacheLosange.width, height / cacheLosange.height) * cacheLosange.height) : 0)) / 2;
  rect(0, 0, width, barHeight);
  rect(0, height - barHeight, width, barHeight);

  // mettre des barres noires à gauche et à droite
  const barWidth = (width - (cacheLosange ? (Math.min(width / cacheLosange.width, height / cacheLosange.height) * cacheLosange.width) : 0)) / 2;
  rect(0, 0, barWidth, height);
  rect(width - barWidth, 0, barWidth, height);

  pop();

  // Dessiner le modèle 3D de la carte au centre — le positionner entre le background et le cache
  if (cardModel) {
    push();
    const modelZ = -1000; // profondeur du modèle (entre bgDepth et cacheDepth)
    translate(0, 0, modelZ);
    // légère inclinaison pour un meilleur effet 3D
    rotateX(-0.1);
    rotateY(frameCount * 0.1);
    scale(2); // ajuster la taille si nécessaire
    noStroke();
    fill(255);
    model(cardModel);
    pop();
  }

  // Dessiner le cache losange au-dessus de tout (devant les cartes qui tombent)
  if (cacheLosange) {
    push();
    // rapprocher le cache vers la caméra pour qu'il soit au-dessus (blanc = transparent si tu ajoutes mask)
    const cacheDepth = 0; // valeur positive = plus proche de la caméra
    translate(0, 0, cacheDepth);
    // en mode WEBGL l'origine est le centre — dessiner au centre (0,0)
    imageMode(CENTER);
    // garder les proportions et centrer
    const ratio = Math.min(width / cacheLosange.width, height / cacheLosange.height);

    // add alpha to cache losange
    //tint(10, 200); // 200 = alpha (0-255)
    image(cacheLosange, 0, 0, cacheLosange.width * ratio, cacheLosange.height * ratio);
    pop();
  }

  // afficher texte au centre au dessus de tout devant le cache losange translate webgl
  // --- TEXTE AU-DESSUS DU CACHE LOSANGE ---

  //background(200);

  // Texte 2D par-dessus
  push();
  if (font) textFont(font);
  textSize(10);
  fill(250);
  // move to top-left
  translate(100, -130, 300);

  // centered
  textAlign(CENTER);
  text('PLANETE MARS', 0, 0);
  text('MUSEE DU JEU', 0, 15);
  text('AN 3000', 0, 30);
  pop();

}

// souris : molette pour zoomer/dézoomer (changer la profondeur Z de la caméra)
function mouseWheel(event) {
  // event.delta positif = scroll vers le bas (éloigne la caméra)
  // ajuster facteur si nécessaire (ici 1)
  camZ += event.delta;
  camZ = constrain(camZ, 50, 20000);
  cam.setPosition(0, 0, camZ);
  cam.lookAt(0, 0, 0);
  // empêcher le scroll de la page
  return false;
}

// if mouse is pressed, play sound
function mousePressed() {
  if (firesound.isPlaying()) {
    // .isPlaying() returns a boolean
    firesound.stop();
  } else {
    firesound.play();
  }
}