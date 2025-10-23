// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;

function setup() {
  // full window canvas
  createCanvas(windowWidth, windowHeight);
  // initialize MediaPipe
  // ask MediaPipe to detect up to 2 faces (pass an options object)
  setupFace({ numFaces: 2 });
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

  // see blendshapes.txt for full list of possible blendshapes
  //leftEyeBlink = getBlendshapeScore('eyeBlinkLeft');
  //rightEyeBlink = getBlendshapeScore('eyeBlinkRight');
  //jawOpen = getBlendshapeScore('jawOpen');

  // if we have at least one face
  // For multiple faces: loop over all detections and draw each one.
  if (faces && faces.length > 0) {
    for (let i = 0; i < faces.length; i++) {
      // per-face blendshape scores (pass face index to the helper)
      const leftEyeBlink = getBlendshapeScore('eyeBlinkLeft', i);
      const rightEyeBlink = getBlendshapeScore('eyeBlinkRight', i);
      const jawOpen = getBlendshapeScore('jawOpen', i);

      // draw eyes and mouth for this face index
      drawEyes(faces[i], i, leftEyeBlink, rightEyeBlink);
      drawMouth(faces[i], i, jawOpen);
    }
  }


  // draw faces.length (guard against faces being null/undefined)
  fill(255);
  noStroke();
  textSize(16);
  const faceCount = (faces && faces.length) ? faces.length : 0;
  text("Faces detected: " + faceCount, 10, height - 80);
  
  // draw blendshape values
  //drawBlendshapeScores();

}

function drawBlendshapeScores() {
  fill(255);
  noStroke();
  textSize(16);
  text("leftEyeBlink: " + leftEyeBlink.toFixed(2), 10, height - 60);
  text("rightEyeBlink: " + rightEyeBlink.toFixed(2), 10, height - 40);
  text("jawOpen: " + jawOpen.toFixed(2), 10, height - 20);
}


function drawEyes(faceLandmarks, faceIndex = 0, leftEyeBlinkScore = 0.0, rightEyeBlinkScore = 0.0) {

  // ordered rings (outer loop first) from the helper — pass faceIndex so helper returns per-face points
  const leftEye = getFeatureRings('FACE_LANDMARKS_LEFT_EYE', faceIndex);
  const rightEye = getFeatureRings('FACE_LANDMARKS_RIGHT_EYE', faceIndex);
  const leftIris = getFeatureRings('FACE_LANDMARKS_LEFT_IRIS', faceIndex);
  const rightIris = getFeatureRings('FACE_LANDMARKS_RIGHT_IRIS', faceIndex);

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
  if (leftEyeBlinkScore < 0.5 && leftIris && leftIris[0]) {
    noStroke();
    fill(0, 255, 0); // left
    beginShape();
    for (let p of leftIris[0]) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  if (rightEyeBlinkScore < 0.5 && rightIris && rightIris[0]) {
    noStroke();
    fill(0, 0, 255); // right
    beginShape();
    for (let p of rightIris[0]) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}



function drawMouth(faceLandmarks, faceIndex = 0, jawOpenScore = 0.0) {

  let mouth = getFeatureRings('FACE_LANDMARKS_LIPS', faceIndex);
  // make sure we have mouth data
  if (!mouth) return;

  // set fill and stroke based on jawOpen value
  if (jawOpenScore > 0.5) {
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
  if (jawOpenScore > 0.5) {
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