// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;
let leftEyebrow = 0.0;
let rightEyebrow = 0.0;

function setup() {
  // full window canvas
  createCanvas(windowWidth, windowHeight);
  // initialize MediaPipe
  setupFace();
  setupVideo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

 function preload() {

    bgSound = loadSound('./sound/fire.mp3');
    // start at zero; we'll try to autoplay muted and let the user unmute later
  }


function draw() {

  // clear the canvas
  background(128);
  
   if (isVideoReady()) {
    // show video frame
    //image(videoElement, 0, 0);
  
  }

  // régler le volume à un niveau bas
  //bgSound.setVolume(0.1);
  bgSound.play();

  // draw blendshape values
  drawBlendshapeScores();

   if (bgSound) {
    bgSound.play();
  }

}

function drawBlendshapeScores() {
  fill(255);
  noStroke();
  textSize(16);
  text("leftEyeBlink: " + leftEyeBlink.toFixed(2), 10, height - 60);
  text("rightEyeBlink: " + rightEyeBlink.toFixed(2), 10, height - 40);
  text("jawOpen: " + jawOpen.toFixed(2), 10, height - 20);
  text("leftEyebrow: " + leftEyebrow.toFixed(2), 200, height - 60);
  text("rightEyebrow: " + rightEyebrow.toFixed(2), 200, height - 40);
}