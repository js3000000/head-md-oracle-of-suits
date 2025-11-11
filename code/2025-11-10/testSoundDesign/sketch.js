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
  soundFormats('mp3', 'wav');
  bgSound = loadSound('sound/fire.mp3');
  // start at zero; we'll try to autoplay muted and let the user unmute later
  if (bgSound) bgSound.setVolume(0);

  // try to load a background image
  bgImg = loadImage('img/background0087.png', () => {}, () => { bgImg = null; });
}

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  textSize(14);

  if (bgSound) {
    soundPlayed = true;
    bgSound.play();
  }
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
  
}

function startBackgroundAudio() {
  if (started) return;

  if (typeof userStartAudio === 'function') {
    userStartAudio().then(() => {
      if (bgSound) {
        if (initialMuted) bgSound.setVolume(0); else bgSound.setVolume(desiredVol);
        if (!bgSound.isPlaying()) bgSound.loop();
      }
      started = true;
    }).catch(() => {
      if (getAudioContext && getAudioContext().state !== 'running') getAudioContext().resume();
      if (bgSound) {
        if (initialMuted) bgSound.setVolume(0); else bgSound.setVolume(desiredVol);
        if (!bgSound.isPlaying()) bgSound.loop();
      }
      started = true;
    });
  } else {
    if (getAudioContext && getAudioContext().state !== 'running') getAudioContext().resume();
    if (bgSound) {
      if (initialMuted) bgSound.setVolume(0); else bgSound.setVolume(desiredVol);
      if (!bgSound.isPlaying()) bgSound.loop();
    }
    started = true;
  }
}

function mousePressed() {
  // On first user gesture, try to start audio (unmute if desired)
  if (!started) {
    startBackgroundAudio();
    return;
  }

  // If background image is displayed, play a short beep
  if (showBgImage) {
    let osc = new p5.Oscillator('sine');
    osc.freq(440);
    osc.amp(0.5, 0.02);
    osc.start();
    setTimeout(() => {
      osc.amp(0, 0.05);
      osc.stop();
    }, 150);
  }
}