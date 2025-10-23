// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;

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

function draw() {

  // clear the canvas
  background(128);

  if (isVideoReady()) {
    image(videoElement, 0, 0);
  }

  // get detected faces
  let faces = getFaceLandmarks();

  // see blendshapes.txt for full list of possible blendshapes
  leftEyeBlink = getBlendshapeScore('eyeBlinkLeft');
  //console.log('Left Eye Blink: ' + leftEyeBlink);

  // Draw left eye blink status
  fill(255, 0, 0);
  rect(20, 20, leftEyeBlink * 200, 20);
  fill(255);
  textSize(16);
  text('Left Eye Blink ' + leftEyeBlink, 20, 15);

}