let bkg;
let maskedImg;
let cacheLosange;

function preload() {
  // charge l'image d'arrière-plan
  bkg = loadImage('./img/bkg.png');
  cacheLosange = loadImage('./img/diamond_cache.png');

  firesound = loadSound('./sound/fire.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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

// if mouse is pressed, play sound
function mousePressed() {
  if (firesound.isPlaying()) {
    // .isPlaying() returns a boolean
    firesound.stop();
  } else {
    firesound.play();
  }
}