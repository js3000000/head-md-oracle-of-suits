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

  background(20);
  // En WEBGL, l'origine (0,0) est le centre. Pour dessiner des éléments 2D en
  // coordonnées top-left (rect, etc.), on translate temporairement vers
  // -width/2, -height/2. Puis on reprend l'origine centrale pour dessiner
  // les éléments centrés (comme le cache losange) en x=0,y=0.

  // Dessins en coordonnées top-left
  push();
  translate(-width / 2, -height / 2);

  if (bkg) {
    // afficher l'image d'arrière-plan en gardant les proportions et en centrant
    const ratio = Math.max(width / bkg.width, height / bkg.height);
    // ici width/2,height/2 est toujours le centre en coordonnées top-left
    imageMode(CENTER);
    image(bkg, width / 2, height / 2, bkg.width * ratio, bkg.height * ratio);
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

  // Dessiner le cache losange au-dessus de tout (devant les cartes qui tombent)
  if (cacheLosange) {
    push();
    // en mode WEBGL l'origine est le centre — dessiner au centre (0,0)
    imageMode(CENTER);
    // garder les proportions et centrer
    const ratio = Math.min(width / cacheLosange.width, height / cacheLosange.height);
    image(cacheLosange, 0, 0, cacheLosange.width * ratio, cacheLosange.height * ratio);
    pop();
  }
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