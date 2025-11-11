let bkg;
let maskedImg;
let cacheLosange;

function preload() {
  // charge l'image d'arrière-plan
  bkg = loadImage('./img/bkg.png');
  cacheLosange = loadImage('./img/diamond_cache.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  background(20);

  if (bkg) {
    imageMode(CENTER);
    image(bkg, width / 2, height / 2, width, height);
  }

  imageMode(CENTER);
  if (cacheLosange) {
    // garder proportions de l'image
    const ratio = Math.min(width / cacheLosange.width, height / cacheLosange.height);
    image(cacheLosange, width / 2, height / 2, cacheLosange.width * ratio, cacheLosange.height * ratio );
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
}