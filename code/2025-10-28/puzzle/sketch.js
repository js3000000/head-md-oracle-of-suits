let pieceX;
let pieceY;

let pieceSize;
let dragging = false;

let offsetX = 0;
let offsetY = 0;

let fingerX;
let fingerY;
// area where the video is drawn on the canvas (used to map normalized landmarks)
let videoDrawX = 0;
let videoDrawY = 0;
let videoDrawW = 0;
let videoDrawH = 0;

// flag to place the piece once video area is known
let piecePlaced = false;

let videoAspect;
let videoStarted = false; // prevent double camera start

function setup() {
  // size the canvas to the container if present so page text remains visible
  const container = select('#canvas-container');
  let cw = windowWidth;
  let ch = windowHeight;
  if (container && container.elt) {
    // use the container's client size (fallback to window size)
    cw = container.elt.clientWidth || windowWidth;
    ch = container.elt.clientHeight || windowHeight;
  }
  const cnv = createCanvas(cw, ch);
  if (container) cnv.parent(container);
  pixelDensity(1); // normalize across browsers / displays

  // set piece size relative to canvas and ensure piece starts fully inside canvas
  pieceSize = min(width, height) * 0.18;
  // compute safe ranges for the piece center (use radius = pieceSize/2)
  const radius = pieceSize / 2;
  const minX = radius;
  const maxX = width - radius;
  const minY = radius;
  const maxY = height - radius;

  // if the canvas is smaller than the piece, fall back to centering the piece
  // Do not place the piece here — wait until we know the video draw rectangle
  // so the initial position will be inside the webcam framing. Use canvas
  // center as a safe temporary position and mark `piecePlaced = false`
  // so draw() will place it once the video area is available.
  pieceX = width / 2;
  pieceY = height / 2;
  piecePlaced = false;

  // start the video first, then initialize the hands code so only one camera request is made
  if (!videoStarted) {
      setupVideo();    // ensure this function starts the camera once
      videoStarted = true;
  }

  setupHands(); // should NOT call getUserMedia if setupVideo already started the camera

}

// fonction windowResized pour redimensionner le canvas
function windowResized() {
  // resize canvas to the container if present, otherwise to the window
  const container = select('#canvas-container');
  if (container && container.elt) {
    resizeCanvas(container.elt.clientWidth || windowWidth, container.elt.clientHeight || windowHeight);
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }

  // update pieceSize and force re-placement relative to video area
  pieceSize = min(width, height) * 0.18;
  // mark for re-placement (draw() will place the piece inside the video rectangle)
  piecePlaced = false;
}

function draw() {

  background(0);

  if (isVideoReady()) {
    // draw the video preserving aspect ratio (contain / letterbox inside canvas)
    // get the actual video intrinsic size when available
    const vw = (videoElement.elt && videoElement.elt.videoWidth) || videoElement.width || 0;
    const vh = (videoElement.elt && videoElement.elt.videoHeight) || videoElement.height || 0;

    // if the intrinsic size is not yet available, treat as not-ready so
    // placement waits for a real video rectangle
    if (vw <= 0 || vh <= 0) {
      videoDrawX = 0; videoDrawY = 0; videoDrawW = 0; videoDrawH = 0;
    } else {
      const canvasAR = width / height;
      const videoAR = vw / vh;

      if (videoAR > canvasAR) {
        // video is wider than canvas => fit by width
        videoDrawW = width;
        videoDrawH = width / videoAR;
        videoDrawX = 0;
        videoDrawY = (height - videoDrawH) / 2;
      } else {
        // video is taller than canvas => fit by height
        videoDrawH = height;
        videoDrawW = height * videoAR;
        videoDrawY = 0;
        videoDrawX = (width - videoDrawW) / 2;
      }

      // draw the video into the computed rectangle
      image(videoElement, videoDrawX, videoDrawY, videoDrawW, videoDrawH);
    }
  } else {
    // video not ready yet — leave draw rect empty so we don't place the piece
    videoDrawX = 0; videoDrawY = 0; videoDrawW = 0; videoDrawH = 0;
  }

    // place the piece inside the video area once we know where the video is drawn
    if (!piecePlaced && videoDrawW > 0 && videoDrawH > 0) {
      const radius = pieceSize / 2;
      const minX = videoDrawX + radius;
      const maxX = videoDrawX + videoDrawW - radius;
      const minY = videoDrawY + radius;
      const maxY = videoDrawY + videoDrawH - radius;

      if (maxX <= minX) {
        pieceX = videoDrawX + videoDrawW / 2;
      } else {
        pieceX = random(minX, maxX);
      }

      if (maxY <= minY) {
        pieceY = videoDrawY + videoDrawH / 2;
      } else {
        pieceY = random(minY, maxY);
      }

      piecePlaced = true;
    }

  noStroke();

  // Appeler la fonction pour dessiner un carré avec un trou circulaire au centre du canvas
  drawSquareWithHole(width / 2, height / 2, min(width, height) * 0.5, pieceSize);

  // Appeler la fonction pour dessiner une pièce de puzzle ronde à une position donnée
  drawPuzzlePiece(pieceX, pieceY, pieceSize);

  if (detections) {
    for (let hand of detections.multiHandLandmarks) {

      drawIndex(hand);

  let indexTip = hand[FINGER_TIPS.index];
  // landmarks are normalized [0..1] relative to the video frame - map them to the drawn video rectangle
  let fingerX = indexTip.x * videoDrawW + videoDrawX;
  let fingerY = indexTip.y * videoDrawH + videoDrawY;

  dragAndDropPuzzlePiece(fingerX, fingerY);

      if (isPuzzleSolved(60)) {
        break;
      }

    }
    snapPuzzlePieceToCenter();
  }
}


// Fonction qui dessine un carré avec un trou circulaire au centre, au centre du canvas
function drawSquareWithHole(x, y, size, holeSize) {
  push();
  translate(x, y);

  // Dessiner le carré
  fill(255, 100, 111);
  rectMode(CENTER);
  rect(0, 0, size, size);

  // Dessiner le trou circulaire
  fill(0);
  ellipse(0, 0, holeSize, holeSize);

  pop();
}

// Fonction qui dessine une pièce de puzzle ronde à une position donnée
function drawPuzzlePiece(x, y, size) {
  push();
  translate(x, y);

  // Dessiner la pièce de puzzle (simple cercle pour l'exemple)
  fill(255, 100, 111);
  stroke(0);
  ellipse(0, 0, size, size);

  pop();
}


// Fonction pour glisser déposer la pièce de puzzle avec la souris, on peut saisir la pièce n'importe où sur la pièce
function mousePressed() {
  // démarrer le drag si on clique n'importe où sur la pièce (distance au centre)
  let d = dist(mouseX, mouseY, pieceX, pieceY);
  if (d < pieceSize / 2) {
    dragging = true;
    offsetX = mouseX - pieceX;
    offsetY = mouseY - pieceY;
  }
}

function mouseDragged() {
  // si en train de drag, suivre la souris en conservant l'offset
  if (dragging) {
    pieceX = mouseX - offsetX;
    pieceY = mouseY - offsetY;
    // clamp inside the video draw area if available, otherwise canvas
    if (videoDrawW > 0 && videoDrawH > 0) {
      pieceX = constrain(pieceX, videoDrawX + pieceSize/2, videoDrawX + videoDrawW - pieceSize/2);
      pieceY = constrain(pieceY, videoDrawY + pieceSize/2, videoDrawY + videoDrawH - pieceSize/2);
    } else {
      pieceX = constrain(pieceX, pieceSize/2, width - pieceSize/2);
      pieceY = constrain(pieceY, pieceSize/2, height - pieceSize/2);
    }
  }
}

function mouseReleased() {
  dragging = false;
}

function drawIndex(landmarks) {
  let mark = landmarks[FINGER_TIPS.index];
  fill(0, 255, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  const lx = mark.x * videoDrawW + videoDrawX;
  const ly = mark.y * videoDrawH + videoDrawY;
  circle(lx, ly, max(15, min(36, pieceSize * 0.05)));
}

function drawLandmarks(landmarks) {
  fill(255, 0, 0);
  noStroke();
  for (let mark of landmarks) {
    const lx = mark.x * videoDrawW + videoDrawX;
    const ly = mark.y * videoDrawH + videoDrawY;
    circle(lx, ly, 6);
  }
}

function dragAndDropPuzzlePiece(fingerX, fingerY) {

  // If no finger data, do nothing
  if (fingerX == null || fingerY == null) {
    return;
  }

  // distance from finger to piece center
  let d = dist(fingerX, fingerY, pieceX, pieceY);

  // start dragging when finger is over the piece (center distance)
  if (!dragging) {
    if (d < pieceSize / 2) {
      dragging = true;
      // capture offset so the piece doesn't jump to the finger
      offsetX = fingerX - pieceX;
      offsetY = fingerY - pieceY;
    }
  } else {
    // update piece position while dragging using finger coordinates
    pieceX = fingerX - offsetX;
    pieceY = fingerY - offsetY;
    // clamp inside the video draw area if available, otherwise canvas
    if (videoDrawW > 0 && videoDrawH > 0) {
      pieceX = constrain(pieceX, videoDrawX + pieceSize/2, videoDrawX + videoDrawW - pieceSize/2);
      pieceY = constrain(pieceY, videoDrawY + pieceSize/2, videoDrawY + videoDrawH - pieceSize/2);
    } else {
      pieceX = constrain(pieceX, pieceSize/2, width - pieceSize/2);
      pieceY = constrain(pieceY, pieceSize/2, height - pieceSize/2);
    }
  }
}

// Fonction pour vérifier que la pièce de puzzle est bien placée au centre
function isPuzzleSolved(distanceThreshold = 20) {
  let centerX = width / 2;
  let centerY = height / 2;
  let d = dist(pieceX, pieceY, centerX, centerY);
  // considérer le puzzle comme résolu si la pièce est proche du centre
  return d < distanceThreshold;
}

// Fonction qui snap la pièce au centre si elle est proche selon une distance donnée
// améliorer l'effet de snap avec une animation de lerp

// Enlever
function snapPuzzlePieceToCenter() {
  if (isPuzzleSolved(60)) {
    pieceX = lerp(pieceX, width / 2, 0.9);
    pieceY = lerp(pieceY, height / 2, 0.9);
    dragging = false;

    // Afficher un message de succès
    fill(random(255), random(255), random(255));
    textSize(100);
    textAlign(CENTER, CENTER);
    

    text("Puzzle Solved!", width / 2, height / 4);

    // Fonction confettis tombent devant l'écran
    //drawConfetti();
  }
}

// Fonction qui fait tomber des confettis devant l'écran depuis le haut du canvas
function drawConfetti() {
  // Code pour dessiner des confettis tombants
  for (let i = 0; i < 100; i++) {
    fill(random(255), random(255), random(255));
    let x = random(width);
    let y = random(height);
    ellipse(x, y, 100, 100);
  }
}