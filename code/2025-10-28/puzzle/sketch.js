let pieceX;
let pieceY;
let pieceSize;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

function setup() {
  // resize canvas to windowWidth and windowHeight
  createCanvas(windowWidth, windowHeight);

  // Initialiser la position de la pièce de puzzle x random mais avec la pièce entière dans canvas
  pieceSize = 500;
  pieceX = random((width-2*pieceSize));
  pieceY = random((height-2*pieceSize));

}

function draw() {
  
  background(0);

  // Appeler la fonction pour dessiner un carré avec un trou circulaire au centre du canvas
  drawSquareWithHole(width / 2, height / 2, 1000, pieceSize);

  // Appeler la fonction pour dessiner une pièce de puzzle ronde à une position donnée
  drawPuzzlePiece(pieceX, pieceY, pieceSize);

  updatePiecePositionFromHand(mouseX, mouseY, mouseIsPressed);

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
    pieceY = mouseY - offsetY;
  }
}

function mouseReleased() {
  dragging = false;
}

// Fonction pour glisser déposer la pièce avec la détection Media Pipe Hands du fingertip index
// On peut saisir la pièce n'importe où sur la pièce
/* function updatePiecePositionFromHand(fingerX, fingerY, isPinching) {
  let d = dist(fingerX, fingerY, pieceX, pieceY);
  if (isPinching) {
    if (!dragging && d < pieceSize / 2) {
      dragging = true;
      offsetX = fingerX - pieceX;
      offsetY = fingerY - pieceY;
    }
    if (dragging) {
      pieceX = fingerX - offsetX;
      pieceY = fingerY - offsetY;
    }
  } else {
    dragging = false;
  }
} */

  
