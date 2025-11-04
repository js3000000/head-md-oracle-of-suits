// fonction pour dessiner un cercle au croisement de la ligne formée entre les deux poignets et les doigts qui se touchent
function drawPortal(landmarks) {
  // besoin de deux mains avec au moins 9 landmarks (0..8) et 5 (thumb tip 4)
  if (!landmarks || landmarks.length < 2) return;
  if (!landmarks[0] || !landmarks[1]) return;
  if (landmarks[0].length < 9 || landmarks[1].length < 9) return;

  const WRIST = 0;
  const INDEX_TIP = 8; // tip de l'index (MediaPipe)
  const THUMB_TIP = 4; // tip du pouce (MediaPipe)

  const wrist1 = landmarks[0][WRIST];
  const wrist2 = landmarks[1][WRIST];

  const index1 = landmarks[0][INDEX_TIP];
  const index2 = landmarks[1][INDEX_TIP];
  const touchX = (index1.x + index2.x) / 2;
  const touchY = (index1.y + index2.y) / 2;

  const thumb1 = landmarks[0][THUMB_TIP];
  const thumb2 = landmarks[1][THUMB_TIP];
  const thumbX = (thumb1.x + thumb2.x) / 2;
  const thumbY = (thumb1.y + thumb2.y) / 2;

  // position x = milieu entre les poignets
  const portalX = (wrist1.x + wrist2.x) / 2;
  // position y = milieu entre le point milieu des index et le point milieu des pouces
  const portalY = (touchY + thumbY) / 2;

  // convertir coordonnées normalisées en pixels
  const px = portalX * videoDrawW + videoDrawX;
  const py = portalY * videoDrawH + videoDrawY;

  fill(0, 0, 255, 150);
  noStroke();
  circle(px, py, 50);
}