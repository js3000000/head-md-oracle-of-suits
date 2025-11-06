// FUNCTIONS ------------------------------------------------------------------------------

let fingerCircleSize = 1;

function drawIndex(landmarks) {
  let mark = landmarks[FINGER_TIPS.index];
  fill(0, 255, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  const lx = mark.x * videoDrawW + videoDrawX;
  const ly = mark.y * videoDrawH + videoDrawY;
  circle(lx, ly, max(15, min(36, fingerCircleSize  * 0.05)));
}

function drawthumb(landmarks) {
  let mark = landmarks[FINGER_TIPS.thumb];
  fill(255, 0, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  const lx = mark.x * videoDrawW + videoDrawX;
  const ly = mark.y * videoDrawH + videoDrawY;
  circle(lx, ly, max(15, min(36, fingerCircleSize  * 0.05)));
}

function drawWrist(landmarks) {

  // dessiner un cercle à la position du poignet (landmark 0)
  let wrist = landmarks[0];
  const wx = wrist.x * videoDrawW + videoDrawX;
  const wy = wrist.y * videoDrawH + videoDrawY;
  fill(255, 255, 0);
  circle(wx, wy, 10);
}

function drawConnections(landmarks) {

  // set stroke color for connections
  stroke(0, 255, 0);

  // iterate through each connection
  for (let connection of HAND_CONNECTIONS) {
    // get the two landmarks to connect
    const a = landmarks[connection[0]];
    const b = landmarks[connection[1]];
    // skip if either landmark is missing
    if (!a || !b) continue;
    // landmarks are normalized [0..1], (x,y) with origin top-left
    let ax = a.x * videoDrawW + videoDrawX;
    let ay = a.y * videoDrawH + videoDrawY;
    let bx = b.x * videoDrawW + videoDrawX;
    let by = b.y * videoDrawH + videoDrawY;
    line(ax, ay, bx, by);
  }

}


/* function drawLandmarks(landmarks) {
  fill(255, 0, 0);
  noStroke();
  for (let mark of landmarks) {
    const lx = mark.x * videoDrawW + videoDrawX;
    const ly = mark.y * videoDrawH + videoDrawY;
    circle(lx, ly, 6);
  }

  // dessiner un cercle à la position du poignet (landmark 0)
  let wrist = landmarks[0];
  const wx = wrist.x * videoDrawW + videoDrawX;
  const wy = wrist.y * videoDrawH + videoDrawY;
  fill(255, 255, 0);
  circle(wx, wy, 10);
} */



