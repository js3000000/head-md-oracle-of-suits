function setup() {

  createCanvas(windowWidth, windowHeight, WEBGL);
}

// window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  background(0, 220, 0);

  // Approcher la caméra du modèle 3D
  translate(0, 0, 700); // Ajustez cette valeur pour zoomer ou dézoomer
  // tourner camera
  rotateY(frameCount * 0.005);

  // afficher .obj au centre de l'écran
  normalMaterial();
  model(my3DModel); // Assurez-vous que my3DModel est chargé avec loadModel() dans preload()

  //ajouter lumière depuis la position de la caméra
  //pointLight(255, 255, 255, 0, 0, 700);

  // dessiner axes pour référence
  stroke(255, 0, 0); // Axe X en rouge
  line(0, 0, 0, 10, 0, 0);
  stroke(0, 255, 0); // Axe Y en vert
  line(0, 0, 0, 0, -10, 0);
  stroke(0, 0, 255); // Axe Z en bleu
  line(0, 0, 0, 0, 0, 10);

}


function preload() {
  my3DModel = loadModel('./assets/Robot_test.obj', true);
}