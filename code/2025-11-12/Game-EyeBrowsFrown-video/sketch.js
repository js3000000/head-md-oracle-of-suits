// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let leftEyebrow = 0.0;
let rightEyebrow = 0.0;

let videoPlaying = false;

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

// fonction preload pour background
let bgImage;
let animationVideo;
function preload() {
  // charger image de background

  animationVideo = createVideo('./videos/animation.mp4');
  animationVideo.hide();
}



function draw() {

  // clear the canvas
  //background(128);

  // mettre image en background selon path
  //image(bgImage, 0, 0, width, height);


  // mettre image video figée en background


  // afficher première frame de la vidéo seulement


  // Afficher soit l'image fixe soit la vidéo si elle joue
  if (videoPlaying) {
    // afficher la vidéo animée
    image(animationVideo, 0, 0, width, height);
    animationVideo.play();
  } else {
    // afficher l'image fixe (frame initiale)
    image(animationVideo, 0, 0, width, height);
    animationVideo.time(0);
    animationVideo.pause();
  }



  // update video frame
  //updateVideo();

  if (isVideoReady()) {
    // show video frame
    //image(videoElement, 0, 0);
  }

  // get detected faces
  let faces = getFaceLandmarks();

  // debug: show faces in console so you can see if detection runs
  console.log('faces', faces);

  // see blendshapes.txt for full list of possible blendshapes
  //leftEyeBlink = getBlendshapeScore('eyeBlinkLeft');
  //rightEyeBlink = getBlendshapeScore('eyeBlinkRight');
  //jawOpen = getBlendshapeScore('jawOpen');
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
    //text('No face detected yet. Give camera permission and move into view.', 10, 30);
  }


  // draw blendshape values
  drawBlendshapeScores();

  if (leftEyebrow + rightEyebrow > 0.5) {

    videoPlaying = true;
  }


}

image(bgImage, 0, 0, width, height);

function drawBlendshapeScores() {
  fill(255);
  noStroke();
  textSize(16);
  //text("leftEyeBlink: " + leftEyeBlink.toFixed(2), 10, height - 60);
  //text("rightEyeBlink: " + rightEyeBlink.toFixed(2), 10, height - 40);
  //text("jawOpen: " + jawOpen.toFixed(2), 10, height - 20);
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

function drawEyebrows(face) {
  if (!face) return;

  // Left eyebrow (MediaPipe landmark indices)
  const leftEyebrowIdx = [70, 63, 105, 66, 107];
  const rightEyebrowIdx = [336, 296, 334, 293, 300];

  // rename local arrays to avoid shadowing the global blendshape vars
  const leftBrowPts = leftEyebrowIdx.map((i) => face[i]);
  const rightBrowPts = rightEyebrowIdx.map((i) => face[i]);

  // safe distance calculation (guard missing landmarks)
  const has = (idx) => face[idx] && typeof face[idx].x === 'number';
  const leftHeight = has(159) && has(145) ? dist(face[159].x, face[159].y, face[145].x, face[145].y) : 0;
  const rightHeight = has(386) && has(374) ? dist(face[386].x, face[386].y, face[374].x, face[374].y) : 0;
  const eyebrowLift = (leftHeight + rightHeight) / 2.0;

  // read blendshape scores (guarding if undefined)
  const lbBlend = (typeof leftEyebrow === 'number') ? leftEyebrow : 0;
  const rbBlend = (typeof rightEyebrow === 'number') ? rightEyebrow : 0;

  // compute pixel offsets from blendshape (browDown positive -> move downward)
  const maxOffset = 60; // max pixels to move
  const leftOffset = lbBlend * maxOffset;
  const rightOffset = rbBlend * maxOffset;

  // Map to color intensity and stroke according to blendshape (more frown -> red / thicker)
  const avgBlend = (lbBlend + rbBlend) / 2;
  const red = lerp(0, 255, avgBlend);
  const green = lerp(255, 0, avgBlend);
  const alpha = lerp(64, 200, avgBlend);
  stroke(red, green, 0);
  strokeWeight(1 + avgBlend * 6);
  fill(red, green, 0, alpha);

  // Draw left eyebrow mirrored horizontally, applying blendshape vertical offset
  beginShape();
  for (const p of leftBrowPts) {
    if (!p) continue;
    const mx = width * (1 - p.x); // mirror X
    const my = p.y * height + leftOffset;
    vertex(mx, my);
  }
  endShape(CLOSE);

  // Draw right eyebrow mirrored horizontally, applying blendshape vertical offset
  beginShape();
  for (const p of rightBrowPts) {
    if (!p) continue;
    const mx = width * (1 - p.x); // mirror X
    const my = p.y * height + rightOffset;
    vertex(mx, my);
  }
  endShape(CLOSE);
}