// FUNCTIONS ------------------------------------------------------------------------------

let fingerCircleSize = 1;
// flip only the fingertip drawing horizontally inside the video rectangle
const FLIP_FINGERTIP_DRAW = true;

function drawIndex(landmarks) {
  let mark = landmarks[FINGER_TIPS.index];
  fill(0, 255, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  let lx = normXToPx(mark.x);
  const ly = mark.y * videoDrawH + videoDrawY;
  if (FLIP_FINGERTIP_DRAW) {
    lx = videoDrawX + videoDrawW - (lx - videoDrawX);
  }
  circle(lx, ly, max(15, min(36, fingerCircleSize  * 0.05)));
}

function drawthumb(landmarks) {
  let mark = landmarks[FINGER_TIPS.thumb];
  fill(255, 0, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  let lx = normXToPx(mark.x);
  const ly = mark.y * videoDrawH + videoDrawY;
  if (FLIP_FINGERTIP_DRAW) {
    lx = videoDrawX + videoDrawW - (lx - videoDrawX);
  }
  circle(lx, ly, max(15, min(36, fingerCircleSize  * 0.05)));
}

function drawWrist(landmarks) {

  // dessiner un cercle à la position du poignet (landmark 0)
  let wrist = landmarks[0];
  let wx = normXToPx(wrist.x);
  const wy = wrist.y * videoDrawH + videoDrawY;
  if (FLIP_FINGERTIP_DRAW) {
    wx = videoDrawX + videoDrawW - (wx - videoDrawX);
  }
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
    let ax = normXToPx(a.x);
    let ay = a.y * videoDrawH + videoDrawY;
    let bx = normXToPx(b.x);
    let by = b.y * videoDrawH + videoDrawY;
    line(ax, ay, bx, by);
  }

}


