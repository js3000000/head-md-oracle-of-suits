let screenPos = pos3D.screenPosition();


function setup() {
  createCanvas(400, 400, WEBGL);
}

function draw() {
  background(200);

  let spherePos = createVector(0, 0, 0);
  let sphereRadius = 50;

  push();
  translate(spherePos.x, spherePos.y, spherePos.z);
  fill(150, 0, 150);
  sphere(sphereRadius);
  pop();

  if (isMouseTouchingSphere(spherePos, sphereRadius)) {
    fill(255, 0, 0);
    text("Touching Sphere!", -width / 2 + 10, -height / 2 + 20);
  }
}

function isMouseTouchingSphere(pos3D, radius) {
  // Use p5.Vector.screenPosition() method
  let screenPos = pos3D.screenPosition();

  let edge3D = createVector(pos3D.x + radius, pos3D.y, pos3D.z);
  let screenEdge = edge3D.screenPosition();

  let projectedRadius = dist(screenPos.x, screenPos.y, screenEdge.x, screenEdge.y);

  // Mouse position relative to canvas center (WEBGL)
  let mouseXRel = mouseX - width / 2;
  let mouseYRel = mouseY - height / 2;

  let d = dist(mouseXRel, mouseYRel, screenPos.x, screenPos.y);
  return d <= projectedRadius;
}
