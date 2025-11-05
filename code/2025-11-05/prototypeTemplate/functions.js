let circleSize = 20;

// FUNCTIONS ------------------------------------------------------------------------------
function drawIndex(landmarks) {
  let mark = landmarks[FINGER_TIPS.index];
  fill(0, 255, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  const lx = mark.x * videoDrawW + videoDrawX;
  const ly = mark.y * videoDrawH + videoDrawY;

  // dessine cercle au niveau de l'index de taille fixe en fonction de circleSize
  circle(lx, ly, max(15, min(36, windowHeight * 0.03)));

}

function drawThumb(landmarks) {
  let mark = landmarks[FINGER_TIPS.thumb];
  fill(255, 0, 255);
  noStroke();
  // map normalized landmarks to the drawn video rectangle
  const lx = mark.x * videoDrawW + videoDrawX;
  const ly = mark.y * videoDrawH + videoDrawY;
  circle(lx, ly, max(15, min(36, circleSize * 1)));
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