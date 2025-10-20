// ...existing code...
let sphereX, sphereY;
let sphereRadius = 50;
let dragging = false;
let dragOffsetX = 0, dragOffsetY = 0;

function setup() {
  createCanvas(400, 400, WEBGL); // Enable 3D
  // start sphere at canvas center (WEBGL origin)
  sphereX = 0;
  sphereY = 0;
}

function draw() {
  background(200);

  // lighting so the white sphere is visible
  ambientLight(80);
  directionalLight(255, 255, 255, 0, 0, -1);

  noStroke();
  specularMaterial(1); // white material that responds to lights

  // convert current mouse coords (top-left origin) to WEBGL coords (center origin)
  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;

  // if dragging, update sphere position to follow mouse while preserving initial grab offset
  if (dragging) {
    sphereX = mx - dragOffsetX;
    sphereY = my - dragOffsetY;
  }

  push();
  translate(sphereX, sphereY, 0); // move sphere
  sphere(sphereRadius);
  pop();
}

function mousePressed() {
  // convert mouse coords for hit test
  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;
  // start dragging if click is inside sphere radius (2D screen projection)
  if (dist(mx, my, sphereX, sphereY) <= sphereRadius) {
    dragging = true;
    // store offset so sphere doesn't jump when grabbed
    dragOffsetX = mx - sphereX;
    dragOffsetY = my - sphereY;
  }
}

function mouseReleased() {
  dragging = false;
}
// ...existing code...