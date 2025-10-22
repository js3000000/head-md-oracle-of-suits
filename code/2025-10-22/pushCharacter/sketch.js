let handDetector;
let character3D;

function setup() {
  createCanvas(640, 480, WEBGL);
  handDetector = new HandDetector();
  character3D = new Character3D();
  handDetector.start();
}

function draw() {
  background(200);

  handDetector.update();
  character3D.update(handDetector.handData);
  character3D.display();
}