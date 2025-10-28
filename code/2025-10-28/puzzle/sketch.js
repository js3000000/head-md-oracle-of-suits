let pieceX;
let pieceY;

let pieceSize;
let dragging = false;

let offsetX = 0;
let offsetY = 0;

let fingerX;
let fingerY;

let videoAspect;

function setup() {
  // resize canvas to windowWidth and windowHeight
  createCanvas(windowWidth, windowHeight);

  // Initialiser la position de la pièce de puzzle x random mais avec la pièce entière dans canvas
  pieceSize = 500;
  pieceX = random((width - 2 * pieceSize));
  pieceY = random((height - 2 * pieceSize));

  setupHands();
  setupVideo();

}

function draw() {

  background(0);

  if (isVideoReady()) {
    // Afficher la vidéo en fond avec la taille du canvas mais garder les proportions
    videoAspect = videoElement.width / videoElement.height;
    image(videoElement, 0, 0, width, videoAspect * height);
  }

  // Appeler la fonction pour dessiner un carré avec un trou circulaire au centre du canvas
  drawSquareWithHole(width / 2, height / 2, 1000, pieceSize);

  // Appeler la fonction pour dessiner une pièce de puzzle ronde à une position donnée
  drawPuzzlePiece(pieceX, pieceY, pieceSize);

  if (detections) {
    for (let hand of detections.multiHandLandmarks) {

      drawIndex(hand);


      // Mettre à jour la position de la pièce de puzzle en fonction de la position du tip de l'index
      let indexTip = hand[FINGER_TIPS.index];
      // landmarks are normalized [0..1] relative to the video frame - map them to the sketch canvas
      let fingerX = indexTip.x * width;
      let fingerY = indexTip.y * height;


      dragAndDropPuzzlePiece(fingerX, fingerY);

      if (isPuzzleSolved(40)) {
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
  fill(255);
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
  fill(255);
  ellipse(0, 0, size, size);

  pop();
}

// Fonction qui redimensionne le canvas lorsque la fenêtre est redimensionnée
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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
    pieceY = mouseY - offsetY * videoAspect;
  }
}

function mouseReleased() {
  dragging = false;
}

function drawIndex(landmarks) {
  let mark = landmarks[FINGER_TIPS.index];
  fill(0, 255, 255);
  noStroke();
  // draw index tip in canvas coordinates
  circle(mark.x * width, mark.y * height * videoAspect, 20);
}

function drawLandmarks(landmarks) {
  fill(255, 0, 0);
  noStroke();
  for (let mark of landmarks) {
    circle(mark.x * width, mark.y * height, 6);
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
function snapPuzzlePieceToCenter() {
  if (isPuzzleSolved()) {
    pieceX = width / 2;
    pieceY = height / 2;
    dragging = false;

    // Afficher un message de succès
    fill(random(255), random(255), random(255));
    textSize(500);
    textAlign(CENTER, CENTER);
    text("Puzzle Solved!", width / 2, height / 2);

    // Fonction confettis tombent devant l'écran
    drawConfetti();
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