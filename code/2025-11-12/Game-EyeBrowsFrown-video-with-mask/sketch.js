// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let leftEyebrow = 0.0;
let rightEyebrow = 0.0;

let videoPlaying = false;
let videoEnded = false;


let diamondMaskImage;
let endingImage; // <--- ajouté pour déclarer la variable d'image de fin

function setup() {
  // full window canvas
  createCanvas(windowWidth, windowHeight);
  // initialize MediaPipe
  setupFace();
  setupVideo();

  // Quand la vidéo est terminée
  // utiliser l'élément HTML sous-jacent pour capter l'événement ended


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


  diamondMaskImage = loadImage('./img/diamond_cache.png');
  endingImage = loadImage('./img/animation_ending_frame.png');
}



function draw() {
  // afficher soit la dernière image (endingImage) si videoEnded, soit la vidéo / frame initiale




  if (videoPlaying && !videoEnded) {
    // afficher la vidéo animée
    image(animationVideo, 0, 0, width, height);
    animationVideo.play();
    if (animationVideo.time() >= animationVideo.duration()) {
      videoPlaying = false;
      videoEnded = true;
    }
  } else {
    // afficher l'image fixe (frame initiale)
    animationVideo.pause();
    animationVideo.time(0);
    image(animationVideo, 0, 0, width, height);
  }

  if (isVideoReady()) {
    // show video frame
    //image(videoElement, 0, 0);
  }

  // get detected faces
  let faces = getFaceLandmarks();
  leftEyebrow = getBlendshapeScore('browDownLeft');
  rightEyebrow = getBlendshapeScore('browDownRight');

  // draw blendshape values
  //drawBlendshapeScores();

  // draw eyebrows
  /* if (faces && faces.length > 0) {
    drawEyebrows(faces[0]);
    // draw eyes
    leftEyeBlink = getBlendshapeScore('eyeBlinkLeft');
    rightEyeBlink = getBlendshapeScore('eyeBlinkRight');
    drawEyes();
  } */

  // n'autorise pas le redémarrage si la vidéo est déjà finie
  if (!videoEnded && leftEyebrow + rightEyebrow > 0.5) {
    videoPlaying = true;
  }

  // dessiner le diamond cache AU DESSUS de tout, même de l'image de fin
  if (diamondMaskImage) {
    image(diamondMaskImage, 0, 0, width, height);
  }
} // fin draw()

function drawBlendshapeScores() {
  fill(255);
  noStroke();
  textSize(16);
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