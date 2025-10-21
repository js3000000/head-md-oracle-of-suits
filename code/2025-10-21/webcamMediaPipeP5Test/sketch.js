let video;
let detector;
let hands = [];

async function setupDetector() {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'lite',
    maxHands: 1
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);
  console.log("Détecteur prêt");
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.style('transform', 'scaleX(-1)');
  video.hide();

  setupDetector();
}

async function detectHands() {
  if (!detector) return;
  hands = await detector.estimateHands(video.elt);
}

function drawFingertips(hand) {
  // Fingertip keypoint indices
  const fingertips = [8];
  for (const i of fingertips) {
    const kp = hand.keypoints[i];
    fill(255, 0, 0); // red color for fingertips
    noStroke();
    circle(kp.x, kp.y, 12); // bigger circle for fingertips
  }
}

function draw() {
  background(200);
  //image(video, 0, 0, width, height);
  push();
  translate(width, 0);
  scale(-1, 1);

  if (video.elt.readyState === 4 && video.elt.videoWidth > 0) {
    detectHands();
  }

  /*
  for (const hand of hands) {
    drawFingertips(hand);
  }*/

  /*
  // Draw a cercle that follows the fingertip
  if (hands.length > 0) {
    const fingertip = hands[0].keypoints[8]; // index finger tip
    fill(0, 255, 0); // green color for the circle
    noStroke();
    circle(fingertip.x, fingertip.y, 20); // bigger circle for fingertip
  }*/

  if (hands.length > 0) {
  const fingertip = hands[0].keypoints[8];
  fill(0, 255, 0);
  noStroke();
  circle(width / 2, height / 2, sqrt(fingertip.y^2 + fingertip.x^2) * 10);
}


  fill(255);
  textSize(24);
  text("Hello, monde + détection des doigts", 10, height - 20);
}
