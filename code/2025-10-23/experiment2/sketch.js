// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;

// pen/drawing state per face
const JAW_CLOSED_START = 0.35; // start drawing when jawOpen drops below this
const JAW_OPEN_STOP = 0.5;     // stop drawing when jawOpen rises above this (hysteresis)
const MIN_POINT_DIST = 2.0;    // minimum distance (px) to add a new point to the path
let penState = []; // indexed by faceIndex: { paths: [ [pts] ], current: [pts] }
let prevJaw = [];  // previous frame jawOpen per face (optional)

function ensurePen(i) {
  if (!penState[i]) penState[i] = { paths: [], current: null };
  if (prevJaw[i] === undefined) prevJaw[i] = 1.0;
}

function getCentroid(points) {
  if (!points || !points.length) return null;
  let sx = 0, sy = 0;
  for (const p of points) { sx += p.x; sy += p.y; }
  return { x: sx / points.length, y: sy / points.length };
}

function startPen(i, pos) {
  ensurePen(i);
  penState[i].current = [ pos ];
}

function addPenPoint(i, pos) {
  ensurePen(i);
  const s = penState[i];
  if (!s.current) return;
  const last = s.current[s.current.length - 1];
  // only add if moved a bit
  if (!last || dist(last.x, last.y, pos.x, pos.y) > MIN_POINT_DIST) s.current.push(pos);
}

function endPen(i) {
  ensurePen(i);
  const s = penState[i];
  if (s.current && s.current.length) s.paths.push(s.current);
  s.current = null;
}

function drawPens() {
  // draw finished paths
  stroke(255, 0, 0);
  strokeWeight(3);
  noFill();
  for (let i = 0; i < penState.length; i++) {
    const s = penState[i];
    if (!s) continue;
    for (const path of s.paths) {
      beginShape();
      for (const p of path) vertex(p.x, p.y);
      endShape();
    }
    // active path
    if (s.current && s.current.length) {
      stroke(255, 0, 0, 200);
      beginShape();
      for (const p of s.current) vertex(p.x, p.y);
      endShape();
      stroke(255, 0, 0);
    }
  }
}

function setup() {
  // full window canvas
  createCanvas(windowWidth, windowHeight);
  // initialize MediaPipe with selfie mode
  setupFace({ numFaces: 1, selfieMode: true });
  setupVideo(true, width, height); // enable selfie mode (mirrored) and set video size to match canvas
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function toCanvasPoint(p) {
  // landmarks are normalized (0..1). Mirror X for selfie mode so drawn landmarks match mirrored video.
  return { x: width - (p.x * width), y: p.y * height };
}

function drawLandmarks(landmarks) {
  if (!landmarks || !landmarks.length) return;
  noStroke();
  fill(0, 255, 255);
  for (const p of landmarks) {
    const cp = toCanvasPoint(p);
    ellipse(cp.x, cp.y, 4, 4);
  }
}

function draw() {

  // clear the canvas
  background(128);

  if (isVideoReady()) {
    // show video frame scaled to full canvas size
    image(videoElement, 0, 0, width, height);
  }

  // get detected faces
  let faces = getFaceLandmarks();

  // For multiple faces: loop over all detections and draw each one.
  if (faces && faces.length > 0) {
    for (let i = 0; i < faces.length; i++) {
      // per-face blendshape scores (pass face index to the helper)
      const leftEyeBlink = getBlendshapeScore('eyeBlinkLeft', i);
      const rightEyeBlink = getBlendshapeScore('eyeBlinkRight', i);
      const jawOpenScore = getBlendshapeScore('jawOpen', i);

      // draw landmarks (all points) for debugging / visual feedback
      drawLandmarks(faces[i]);

      // draw eyes and mouth visuals
      drawEyes(faces[i], i, leftEyeBlink, rightEyeBlink);
      drawMouth(faces[i], i, jawOpenScore);

      // choose a mouth centroid to drive the pen
      const mouthRings = getFeatureRings('FACE_LANDMARKS_LIPS', i);
      let mouthCentroid = null;
      if (mouthRings && mouthRings[0]) mouthCentroid = getCentroid(mouthRings[0]);

      if (mouthCentroid) {
        const scaledPos = toCanvasPoint(mouthCentroid);

        ensurePen(i);

        // Hysteresis: start drawing when jaw is closed below JAW_CLOSED_START,
        // stop when jaw opens above JAW_OPEN_STOP.
        const isClosed = jawOpenScore < JAW_CLOSED_START;
        const isOpened = jawOpenScore > JAW_OPEN_STOP;

        if (isClosed) {
          // start pen if not started
          if (!penState[i].current) startPen(i, scaledPos);
          addPenPoint(i, scaledPos);
        } else if (isOpened) {
          // stop pen if currently drawing
          if (penState[i].current) endPen(i);
        } else {
          // in-between: keep previous state (helps avoid flicker)
          if (penState[i].current) addPenPoint(i, scaledPos);
        }

        prevJaw[i] = jawOpenScore;

        // draw blendshape labels near the mouth for this face
        drawBlendshapeLabelsForFace(i, scaledPos.x + 12, scaledPos.y + 6);
      }
    }

    // draw faces count
    fill(255);
    noStroke();
    textSize(16);
    const faceCount = (faces && faces.length) ? faces.length : 0;
    text("Faces detected: " + faceCount, 10, height - 80);
  }

  // draw any pen strokes
  drawPens();

  // optional: draw blendshape values
  // drawBlendshapeScores();
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

  // left eye outline (flipped for selfie mode)
  beginShape();
  for (let p of leftEye[0]) {
    const cp = toCanvasPoint(p);
    vertex(cp.x, cp.y);
  }
  endShape(CLOSE);

  // right eye outline (flipped for selfie mode)
  beginShape();
  for (let p of rightEye[0]) {
    const cp = toCanvasPoint(p);
    vertex(cp.x, cp.y);
  }
  endShape(CLOSE);

  // fill the irises only if the eyes aren't blinking
  if (leftEyeBlinkScore < 0.5 && leftIris && leftIris[0]) {
    noStroke();
    fill(0, 255, 0); // left
    beginShape();
    for (let p of leftIris[0]) {
      const cp = toCanvasPoint(p);
      vertex(cp.x, cp.y);
    }
    endShape(CLOSE);
  }

  if (rightEyeBlinkScore < 0.5 && rightIris && rightIris[0]) {
    noStroke();
    fill(0, 0, 255); // right
    beginShape();
    for (let p of rightIris[0]) {
      const cp = toCanvasPoint(p);
      vertex(cp.x, cp.y);
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

  // draw outer lip (scaled + flipped)
  beginShape();
  for (const p of outerLip) {
    const cp = toCanvasPoint(p);
    vertex(cp.x, cp.y);
  }

  // draw inner lip as a hole (scaled + flipped)
  beginContour();
  for (let j = innerLip.length - 1; j >= 0; j--) {
    const p = innerLip[j];
    const cp = toCanvasPoint(p);
    vertex(cp.x, cp.y);
  }
  endContour();
  endShape(CLOSE);

  // if jaw is open
  if (jawOpenScore > 0.5) {
    fill(255, 0, 255);
  } else {
    fill(255, 255, 0);
  }

  // fill inner mouth
  beginShape();
  for (const p of innerLip) {
    const cp = toCanvasPoint(p);
    vertex(cp.x, cp.y);
  }
  endShape(CLOSE);

}

// draw numeric blendshape values for mouth-related shapes next to a face
function drawBlendshapeLabelsForFace(faceIndex, x, y) {
  const mouthBlendshapes = [
    'jawOpen',
    'mouthClose',
    'mouthFunnel',
    'mouthPucker',
    'mouthLeft',
    'mouthRight',
    'mouthSmileLeft',
    'mouthSmileRight',
    'mouthShrugUpper',
    'mouthShrugLower'
  ];

  push();
  textSize(12);
  fill(255);
  noStroke();

  let yy = y;
  for (const name of mouthBlendshapes) {
    const v = getBlendshapeScore(name, faceIndex);
    if (v === undefined || v === null || isNaN(v)) continue;
    // only show meaningful values to reduce clutter (tweak threshold as needed)
    const show = true; // set to (v > 0.01) if you want to hide near-zero values
    if (!show) continue;
    text(name + ': ' + v.toFixed(2), x, yy);
    yy += 14;
  }
  pop();
}