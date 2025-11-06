let son;

function preload() {
  // Charge le fichier audio avant le début du sketch
  son = loadSound('./sound/fire.mp3');
}

function setup() {
  createCanvas(400, 200);
  background(220);
  textAlign(CENTER, CENTER);
  text('Clique pour jouer le son', width / 2, height / 2);

}

function mousePressed() {
  // Joue le son au clic de souris
  if (son.isPlaying()) {
    son.stop();
  } else {
    // régler le volume à 0.5 avant de jouer
    son.setVolume(0.5);
    son.play();
  }
}