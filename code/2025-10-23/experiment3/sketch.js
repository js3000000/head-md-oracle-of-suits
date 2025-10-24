// Per-face blendshape cache (filled each frame)
// New clean multi-face sketch.js

// Per-face blendshape cache (filled each frame)
let blendshapeCache = []; // array of { leftEyeBlink, rightEyeBlink, jawOpen }

function setup() {
  createCanvas(windowWidth, windowHeight);
  // initialize MediaPipe (allow multiple faces)
  setupFace({ numFaces: 5 });
  setupVideo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(128);

  if (isVideoReady()) {
    image(videoElement, 0, 0);
  }

  const faces = getFaceLandmarks() || [];

  // update blendshape cache
  blendshapeCache = faces.map((f, i) => ({
    leftEyeBlink: getBlendshapeScore('eyeBlinkLeft', i),
    rightEyeBlink: getBlendshapeScore('eyeBlinkRight', i),
    jawOpen: getBlendshapeScore('jawOpen', i)
  }));

  // draw each face
  for (let i = 0; i < faces.length; i++) {
    drawEyes(i);
    drawMouth(i);
  }

  drawBlendshapeScores();
}

function drawBlendshapeScores() {
  fill(255);
  noStroke();
  textSize(16);

  const faces = getFaceLandmarks() || [];
  if (!faces.length) {
    text('No faces detected', 10, height - 20);
    return;
  }

  for (let i = 0; i < faces.length; i++) {
    const c = blendshapeCache[i] || {};
    const y = height - 20 - (faces.length - 1 - i) * 18;
    text('face ' + i + ': L:' + (c.leftEyeBlink || 0).toFixed(2) + ' R:' + (c.rightEyeBlink || 0).toFixed(2) + ' J:' + (c.jawOpen || 0).toFixed(2), 10, y);
  }
}

function drawEyes(faceIndex = 0) {
  const leftEye = getFeatureRings('FACE_LANDMARKS_LEFT_EYE', faceIndex);
  const rightEye = getFeatureRings('FACE_LANDMARKS_RIGHT_EYE', faceIndex);
  const leftIris = getFeatureRings('FACE_LANDMARKS_LEFT_IRIS', faceIndex);
  const rightIris = getFeatureRings('FACE_LANDMARKS_RIGHT_IRIS', faceIndex);

  if (!leftEye || !rightEye) return;

  const palette = [ [255,255,0], [0,255,0], [0,0,255], [255,0,255], [255,128,0] ];
  const col = palette[faceIndex % palette.length];

  noFill();
  stroke(col[0], col[1], col[2]);
  strokeWeight(1);

  beginShape();
  for (let p of leftEye[0]) vertex(p.x, p.y);
  endShape(CLOSE);

  beginShape();
  for (let p of rightEye[0]) vertex(p.x, p.y);
  endShape(CLOSE);

  const cache = blendshapeCache[faceIndex] || {};
  const leftEyeBlink = cache.leftEyeBlink != null ? cache.leftEyeBlink : getBlendshapeScore('eyeBlinkLeft', faceIndex);
  const rightEyeBlink = cache.rightEyeBlink != null ? cache.rightEyeBlink : getBlendshapeScore('eyeBlinkRight', faceIndex);

  if (leftIris && leftEyeBlink < 0.5) {
    noStroke(); fill(0,255,0);
    beginShape(); for (let p of leftIris[0]) vertex(p.x,p.y); endShape(CLOSE);
  }
  if (rightIris && rightEyeBlink < 0.5) {
    noStroke(); fill(0,0,255);
    beginShape(); for (let p of rightIris[0]) vertex(p.x,p.y); endShape(CLOSE);
  }
}

function drawMouth(faceIndex = 0) {
  const mouth = getFeatureRings('FACE_LANDMARKS_LIPS', faceIndex);
  if (!mouth) return;

  const cache = blendshapeCache[faceIndex] || {};
  const jawOpen = cache.jawOpen != null ? cache.jawOpen : getBlendshapeScore('jawOpen', faceIndex);

  const palette = [ [255,255,0], [0,255,0], [0,0,255], [255,0,255], [255,128,0] ];
  const col = palette[faceIndex % palette.length];

  if (jawOpen > 0.5) {
    fill(0,255,255,64); stroke(0,255,255);
  } else {
    fill(col[0],col[1],col[2],64); stroke(col[0],col[1],col[2]);
  }

  const outerLip = mouth[0];
  const innerLip = mouth[1];

  beginShape();
  for (const p of outerLip) vertex(p.x,p.y);
  beginContour();
  for (let j = innerLip.length-1; j >= 0; j--) vertex(innerLip[j].x, innerLip[j].y);
  endContour();
  endShape(CLOSE);

  if (jawOpen > 0.5) fill(255,0,255); else fill(col[0],col[1],col[2]);
  beginShape(); for (const p of innerLip) vertex(p.x,p.y); endShape(CLOSE);
}