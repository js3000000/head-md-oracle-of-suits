let bkg;
let maskedImg;
let cacheLosange;
let cam;
let camZ;

function preload() {
  // charge l'image d'arrière-plan
  bkg = loadImage('./img/bkg.png');
  cacheLosange = loadImage('./img/diamond_cache.png');

  firesound = loadSound('./sound/fire.mp3');

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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // recalculer perspective et repositionner la caméra
  camZ = camZ || ((height / 2) / Math.tan(PI / 6));
  cam.setPosition(0, 0, camZ);
  cam.lookAt(0, 0, 0);
  perspective(PI / 3, width / height, 0.1, 10000);
}

function draw() {

  // brun background
  background(50, 30, 0);
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
    translate(900, 0, modelZ);
    // légère inclinaison pour un meilleur effet 3D
    rotateX(-0.1);
    rotateY(frameCount * 0.01);
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
    const cacheDepth = 200; // valeur positive = plus proche de la caméra
    translate(0, 0, cacheDepth);
    // en mode WEBGL l'origine est le centre — dessiner au centre (0,0)
    imageMode(CENTER);
    // garder les proportions et centrer
    const ratio = Math.min(width / cacheLosange.width, height / cacheLosange.height);
    image(cacheLosange, 0, 0, cacheLosange.width * ratio, cacheLosange.height * ratio);
    pop();
  }

  // afficher texte au centre au dessus de tout
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  // placer le texte légèrement devant le modèle mais derrière le cache si nécessaire
  // translate(0,0,50);
  text("Oracle of Suits", 0, 0);
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