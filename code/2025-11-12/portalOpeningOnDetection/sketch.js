let frames = []; // tableau pour stocker les images
let totalFrames = 75; // nombre total de PNG
let currentFrame = 0;

let filename
let bkg;
let lastFrameTime = 0;
let frameDelay = 10; // ms entre chaque frame (ajuster pour vitesse)

let portalOpen = false;
let facePresent = false;
let faceSeenAt = 0;
let faceLostAt = 0;
let openHold = 800; // ms de présence pour déclencher l'ouverture
let closeHold = 1200; // ms d'absence pour refermer
let prevPortalOpen = false; // pour détecter transitions

// PRELOAD -----------------------------

function preload() {
  // charger chaque image de la séquence
  for (let i = 0; i < totalFrames; i++) {
    filename = './videos/portalAnimation/portalCache_v1/portalCache_' + nf(i, 5) + '.png';
    frames.push(loadImage(filename));
  }

  // image ending
  bkg = loadImage('./img/museum.png');


} // fin preload


function setup() {
  createCanvas(windowWidth, windowHeight);

  // si un visage est détecté pendant 5 secondes, ouvrir le portail


  /*  // après une courte attente, commencer l'animation du portail
   setTimeout(() => {
     portalOpen = true;
   }, 1560); */

  setupFace();
  setupVideo();

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}




function draw() {

  let faces = getFaceLandmarks();

  // draw face
  drawEyes(faces[0]);

  // DETECTION: simple debounced state machine
  const now = millis();
  const hasFace = faces && faces.length > 0;

  if (hasFace) {
    // first time we see face, mark seenAt
    if (!facePresent) {
      facePresent = true;
      faceSeenAt = now;
    }
    // reset lost timestamp
    faceLostAt = 0;
  } else {
    if (facePresent) {
      facePresent = false;
      faceLostAt = now;
    }
  }

  // open when face present long enough
  if (!portalOpen && facePresent && (now - faceSeenAt) >= openHold) {
    portalOpen = true;
  }

  // close when face absent long enough
  if (portalOpen && !facePresent && faceLostAt > 0 && (now - faceLostAt) >= closeHold) {
    portalOpen = false;
  }

  // detect transitions to reset animation timing
  if (portalOpen !== prevPortalOpen) {
    if (portalOpen) {
      // just opened -> start animation from 0
      currentFrame = 0;
      lastFrameTime = now;
    } else {
      // just closed -> show the resting frame at the end
      currentFrame = frames.length > 0 ? frames.length - 1 : 0;
    }
    prevPortalOpen = portalOpen;
  }

/*   if (faces && faces.length > 0) {
    setTimeout(() => {
      portalOpen = true;
    }, 5000);
  } */

  // dessiner la frame courante centrée et redimensionnée pour tenir dans la fenêtre
  push();
  imageMode(CENTER);
  const cx = width / 2;
  const cy = height / 2;
  //const img = frames[currentFrame];

  // utiliser la frame courante si disponible
  const img = frames.length > 0 ? frames[currentFrame] : null;
  if (img) {
    // calcule un facteur d'échelle pour fitter l'image dans la fenêtre sans la déformer
    const scaleFactor = min(width / img.width, height / img.height);
    const drawW = img.width * scaleFactor;
    const drawH = img.height * scaleFactor;

    // image musée au fond (centrée)
    background(60, 0, 0);
    noStroke();
    if (bkg) {
      const scaleB = min(width / bkg.width, height / bkg.height);
      const bW = bkg.width * scaleB;
      const bH = bkg.height * scaleB;
      image(bkg, cx, cy, bW, bH);
    }


    // dessiner la frame courante


    if (!portalOpen) {
      image(img, cx, cy, drawW, drawH);
    } else {
      // si le portail est ouvert, afficher la frame de repos (dernière)
      image(frames[frames.length - 1], cx, cy, drawW, drawH);
    }

    // avancer la frame en fonction du tempo défini
    if (frames.length > 0 && (millis() - lastFrameTime) >= frameDelay) {
      currentFrame = (currentFrame + 1) % frames.length;
      lastFrameTime = millis();
    }

    // si pas de frames chargées, afficher le background pour éviter écran vide
    if (frames.length === 0 && bkg) {
      push();
      imageMode(CENTER);
      const scaleFactorBkg = min(width / bkg.width, height / bkg.height);
      image(bkg, cx, cy, bkg.width * scaleFactorBkg, bkg.height * scaleFactorBkg);
      pop();
    }

  }
  pop();


  // BARRES NOIRES -----------------------------

  push();
  noStroke();
  fill(0);
  // calculer de manière sûre la taille des barres même si bkg non défini
  const bkgW = bkg ? bkg.width : width;
  const bkgH = bkg ? bkg.height : height;
  const bkgScale = min(width / bkgW, height / bkgH);
  const barWidth = ((width - (bkgW * bkgScale)) / 2) + 10;
  rectMode(CENTER);
  // reposition for 2D canvas coordinates
  rect(barWidth / 2, cy, barWidth, height); // barre gauche
  rect(width - barWidth / 2, cy, barWidth, height); // barre droite
  pop();

  // ajouter barre noire en haut et en bas
  push();
  noStroke();
  fill(0);
  const barHeight = ((height - (bkgH * bkgScale)) / 2) + 10;
  rectMode(CENTER);
  rect(cx, barHeight / 2, width, barHeight); // barre haute
  rect(cx, height - barHeight / 2, width, barHeight); // barre basse
  pop();

} // fin de draw()

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