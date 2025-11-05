let my3DModel;
let overlay; // 2D graphics used as an overlay/mask
// portal dimensions (rounded rectangle)
let portalW = 300;
let portalH = 400;
let portalRadius = 30; // corner radius in pixels

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // create a 2D graphics buffer (P2D) to draw the semi-transparent mask with a rounded hole
  overlay = createGraphics(windowWidth, windowHeight, P2D);
}

// window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // recreate overlay at the new size
  overlay = createGraphics(windowWidth, windowHeight, P2D);
}

function draw() {



  background(0, 220, 0);

    // Draw a semi-transparent overlay with a circular hole using a 2D graphics buffer.
  // We can't use 2D canvas path APIs (drawingContext.*) in WEBGL mode reliably,
  // so use createGraphics(P2D) and then draw it as an image overlay.



  // Approcher la caméra du modèle 3D; wrap in push/pop to avoid affecting overlay positioning
  push();
  translate(0, 0, 700); // Ajustez cette valeur pour zoomer ou dézoomer
  // afficher .obj au centre de l'écran si chargé
  if (my3DModel) {
    normalMaterial();
    model(my3DModel);
  }
  pop();

  overlay.clear();
  overlay.noStroke();
  overlay.fill(0);
  overlay.rect(0, 0, overlay.width, overlay.height);
  // erase a rounded corner rectangle area to create the "portal" hole
  overlay.erase();
  const px = overlay.width / 2 - portalW / 2;
  const py = overlay.height / 2 - portalH / 2;
  overlay.rect(px, py, portalW, portalH, portalRadius);
  overlay.noErase();

  // Draw the overlay in screen space. In WEBGL mode the origin is at the center,
  // so offset by -width/2, -height/2.
  push();
  resetMatrix();
  image(overlay, -width / 2, -height / 2);
  pop();

}

function preload() {
  my3DModel = loadModel('./assets/Robot_test.obj', true);
}