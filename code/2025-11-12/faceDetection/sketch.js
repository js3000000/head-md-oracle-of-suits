// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;

let frames = []; // tableau pour stocker les images
let totalFrames = 75; // nombre total de PNG
let currentFrame = 0;

let filename;
let bkg;
let lastFrameTime = 0;
let frameDelay = 10; // ms entre chaque frame (ajuster pour vitesse)

let portalOpen = false;
let facePresent = false;

// PRELOAD -----------------------------
function preload() {
  // charger chaque image de la séquence
  for (let i = 0; i < totalFrames; i++) {
    filename = './videos/portalAnimation/portalCache_v1/portalCache_' + nf(i, 5) + '.png';
    frames.push(loadImage(filename));
  }

  // image de fond
  bkg = loadImage('./img/museum.png');
}

// SETUP -------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  setupFace();
  setupVideo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// DRAW -------------------------------
function draw() {
  background(128);

  // récupération des visages détectés
  let faces = getFaceLandmarks();
  const hasFace = faces && faces.length > 0;

  // récupération des blendshapes
  leftEyeBlink = getBlendshapeScore('eyeBlinkLeft');
  rightEyeBlink = getBlendshapeScore('eyeBlinkRight');
  jawOpen = getBlendshapeScore('jawOpen');

  // ouverture/fermeture immédiate selon la présence d’un visage
  portalOpen = hasFace;

  // affichage des éléments du visage
  /*  if (hasFace) {
     drawEyes(faces[0]);
     drawMouth(faces[0]);
   } */

  // DESSIN DU PORTAIL ------------------
  push();
  imageMode(CENTER);
  const cx = width / 2;
  const cy = height / 2;

  const img = frames.length > 0 ? frames[currentFrame] : null;
  if (img) {
    background(60, 0, 0);

    // image du musée en fond
    if (bkg) {
      const scaleB = min(width / bkg.width, height / bkg.height);
      const bW = bkg.width * scaleB;
      const bH = bkg.height * scaleB;
      image(bkg, cx, cy, bW, bH);
    }

    // échelle d’affichage du portail
    const scaleFactor = min(width / img.width, height / img.height);
    const drawW = img.width * scaleFactor;
    const drawH = img.height * scaleFactor;

    // dessiner selon l’état du portail
    if (!portalOpen) {
      background(0, 0, 0);
      //image(img, cx, cy, drawW, drawH);
    } else {
      image(frames[currentFrame], cx, cy, drawW, drawH);
    }

    // avancer la frame
    if (frames.length > 0 && (millis() - lastFrameTime) >= frameDelay) {
      currentFrame = (currentFrame + 1) % frames.length;
      lastFrameTime = millis();
    }
    pop();

    // BARRES NOIRES ----------------------
    push();
    noStroke();
    fill(0);
    const bkgW = bkg ? bkg.width : width;
    const bkgH = bkg ? bkg.height : height;
    const bkgScale = min(width / bkgW, height / bkgH);
    const cx2 = width / 2;
    const cy2 = height / 2;
    const barWidth = ((width - (bkgW * bkgScale)) / 2) + 10;
    rectMode(CENTER);
    rect(barWidth / 2, cy2, barWidth, height); // gauche
    rect(width - barWidth / 2, cy2, barWidth, height); // droite

    const barHeight = ((height - (bkgH * bkgScale)) / 2) + 10;
    rect(cx2, barHeight / 2, width, barHeight); // haut
    rect(cx2, height - barHeight / 2, width, barHeight); // bas
    pop();

    //drawBlendshapeScores();
  }

  // DEBUG blendshapes -------------------
  function drawBlendshapeScores() {
    fill(255);
    noStroke();
    textSize(16);
    text("leftEyeBlink: " + leftEyeBlink.toFixed(2), 10, height - 60);
    text("rightEyeBlink: " + rightEyeBlink.toFixed(2), 10, height - 40);
    text("jawOpen: " + jawOpen.toFixed(2), 10, height - 20);
  }

  // YEUX -------------------------------
  function drawEyes() {
    const leftEye = getFeatureRings('FACE_LANDMARKS_LEFT_EYE');
    const rightEye = getFeatureRings('FACE_LANDMARKS_RIGHT_EYE');
    const leftIris = getFeatureRings('FACE_LANDMARKS_LEFT_IRIS');
    const rightIris = getFeatureRings('FACE_LANDMARKS_RIGHT_IRIS');

    if (!leftEye || !rightEye) return;

    noFill();
    stroke(255, 255, 0);
    strokeWeight(1);

    beginShape();
    for (let p of leftEye[0]) vertex(p.x, p.y);
    endShape(CLOSE);

    beginShape();
    for (let p of rightEye[0]) vertex(p.x, p.y);
    endShape(CLOSE);

    if (leftEyeBlink < 0.5) {
      noStroke();
      fill(0, 255, 0);
      beginShape();
      for (let p of leftIris[0]) vertex(p.x, p.y);
      endShape(CLOSE);
    }

    if (rightEyeBlink < 0.5) {
      noStroke();
      fill(0, 0, 255);
      beginShape();
      for (let p of rightIris[0]) vertex(p.x, p.y);
      endShape(CLOSE);
    }
  }

  // BOUCHE ------------------------------
  function drawMouth() {
    let mouth = getFeatureRings('FACE_LANDMARKS_LIPS');
    if (!mouth) return;

    if (jawOpen > 0.5) {
      fill(0, 255, 255, 64);
      stroke(0, 255, 255);
    } else {
      fill(255, 255, 0, 64);
      stroke(255, 255, 0);
    }

    let outerLip = mouth[0];
    let innerLip = mouth[1];

    beginShape();
    for (const p of outerLip) vertex(p.x, p.y);
    beginContour();
    for (let j = innerLip.length - 1; j >= 0; j--) {
      const p = innerLip[j];
      vertex(p.x, p.y);
    }
    endContour();
    endShape(CLOSE);

    fill(jawOpen > 0.5 ? color(255, 0, 255) : color(255, 255, 0));
    beginShape();
    for (const p of innerLip) vertex(p.x, p.y);
    endShape(CLOSE);
  }}