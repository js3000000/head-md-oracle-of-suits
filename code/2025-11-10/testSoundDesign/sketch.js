let bgSound;
let started = false;
let bgImg;
let showBgImage = true;

// muted/autoplay helpers
let desiredVol = 0.08; // target volume after unmute
let initialMuted = true; // start muted to increase chances of autoplay
let volumeSlider;
let muteBtn;

function preload() {
  bgSound = loadSound('./sound/fire.mp3');
  // start at zero; we'll try to autoplay muted and let the user unmute later

  // try to load a background image
}

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  textSize(14);


}


function draw() {
  /*   // background image or flat color
    if (showBgImage && bgImg) background(bgImg);
    else background(220);
  
    ellipse(width / 2, height / 2, 50, 50);
  
    if (!started) {
      fill(0);
      text("Cliquez pour autoriser l'audio (ou cliquez 'Unmute')", width / 2, height - 20);
    } */

  circle(width / 2, height / 2, 50);

  if (bgSound && !soundPlayed) {
    soundPlayed = true;
    bgSound.play();
  }

}