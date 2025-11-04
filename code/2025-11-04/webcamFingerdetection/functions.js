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

function drawLandmarks(landmarks) {
  fill(255, 0, 0);
  noStroke();
  for (let mark of landmarks) {
    const lx = mark.x * videoDrawW + videoDrawX;
    const ly = mark.y * videoDrawH + videoDrawY;
    circle(lx, ly, 6);
  }
}