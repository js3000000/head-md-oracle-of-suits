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

function draw() {

  // clear the canvas
  background(128);

  if (isVideoReady()) {
    // show video frame
    image(videoElement, 0, 0);
  }

  // get detected faces
  let faces = getFaceLandmarks();

  // debug: show faces in console so you can see if detection runs
  console.log('faces', faces);

  // see blendshapes.txt for full list of possible blendshapes
  leftEyeBlink = getBlendshapeScore('eyeBlinkLeft');
  rightEyeBlink = getBlendshapeScore('eyeBlinkRight');
  jawOpen = getBlendshapeScore('jawOpen');
  leftEyebrow = getBlendshapeScore('browDownLeft');
  rightEyebrow = getBlendshapeScore('browDownRight');

  // draw features only if we have a face
  if (faces && faces.length > 0) {
    drawEyebrows(faces[0]);
    // optionally enable other features for debugging:
    // drawEyes();
    // drawMouth();
  } else {
    // draw a visible notice so you know the sketch is running but no face found
    fill(255, 0, 0);
    noStroke();
    textSize(24);
    text('No face detected yet. Give camera permission and move into view.', 10, 30);
  }

  // draw blendshape values
  drawBlendshapeScores();

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


function drawEyes() {

  // ordered rings (outer loop first) from the helper
  const leftEye = getFeatureRings('FACE_LANDMARKS_LEFT_EYE');
  const rightEye = getFeatureRings('FACE_LANDMARKS_RIGHT_EYE');
  const leftIris = getFeatureRings('FACE_LANDMARKS_LEFT_IRIS');
  const rightIris = getFeatureRings('FACE_LANDMARKS_RIGHT_IRIS');

  if (!leftEye || !rightEye) return;

  // --- outline the sockets (no fill) ---
  noFill();
  stroke(255, 255, 0);
  strokeWeight(1);

  // left eye outline
  beginShape();
  for (let p of leftEye[0]) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  // right eye outline
  beginShape();
  for (let p of rightEye[0]) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  // fill the irises only if the eyes aren’t blinking
  if (leftEyeBlink < 0.5) {
    noStroke();
    fill(0, 255, 0); // left
    beginShape();
    for (let p of leftIris[0]) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  if (rightEyeBlink < 0.5) {
    noStroke();
    fill(0, 0, 255); // right
    beginShape();
    for (let p of rightIris[0]) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}



function drawMouth() {

  let mouth = getFeatureRings('FACE_LANDMARKS_LIPS');
  // make sure we have mouth data
  if (!mouth) return;

  // set fill and stroke based on jawOpen value
  if (jawOpen > 0.5) {
    fill(0, 255, 255, 64);
    stroke(0, 255, 255);
  } else {
    fill(255, 255, 0, 64);
    stroke(255, 255, 0);
  }

  // there are two rings: outer lip and inner lip
  let outerLip = mouth[0];
  let innerLip = mouth[1];

  // draw outer lip
  beginShape();
  for (const p of outerLip) {
    vertex(p.x, p.y);
  }

  // draw inner lip as a hole
  beginContour();
  // we need to go backwards around the inner lip
  for (let j = innerLip.length - 1; j >= 0; j--) {
    const p = innerLip[j];
    vertex(p.x, p.y);
  }
  endContour();
  endShape(CLOSE);

  // if jaw is open
  if (jawOpen > 0.5) {
    // fuchsia fill
    fill(255, 0, 255);
  } else {
    // yellow fill
    fill(255, 255, 0);
  }

  // fill inner mouth
  beginShape();
  for (const p of innerLip) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

}

function drawEyebrows(face) {
  if (!face) return;

  // Left eyebrow (MediaPipe landmark indices)
  const leftEyebrowIdx = [70, 63, 105, 66, 107];
  const rightEyebrowIdx = [336, 296, 334, 293, 300];

  const leftEyebrow = leftEyebrowIdx.map((i) => face[i]);
  const rightEyebrow = rightEyebrowIdx.map((i) => face[i]);

  // safe distance calculation (guard missing landmarks)
  const has = (idx) => face[idx] && typeof face[idx].x === 'number';
  const leftHeight = has(159) && has(145) ? dist(face[159].x, face[159].y, face[145].x, face[145].y) : 0;
  const rightHeight = has(386) && has(374) ? dist(face[386].x, face[386].y, face[374].x, face[374].y) : 0;
  const eyebrowLift = (leftHeight + rightHeight) / 2.0;

  // Map to color intensity
  if (eyebrowLift > 0.05) {
    fill(255, 0, 0, 64);
    stroke(255, 0, 0);
  } else {
    fill(0, 255, 0, 64);
    stroke(0, 255, 0);
  }

  // Draw left eyebrow mirrored horizontally
  beginShape();
  for (const p of leftEyebrow) {
    if (!p) continue;
    const mx = width * (1 - p.x); // mirror X
    const my = p.y * height;
    vertex(mx, my);
  }
  endShape(CLOSE);

  // Draw right eyebrow mirrored horizontally
  beginShape();
  for (const p of rightEyebrow) {
    if (!p) continue;
    const mx = width * (1 - p.x); // mirror X
    const my = p.y * height;
    vertex(mx, my);
  }
  endShape(CLOSE);
}