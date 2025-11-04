
function portalPosition(landmarks) {
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

  return { x: px, y: py };
}

function calculateDistanceBetweenIndex(landmarks) {
  // besoin de deux mains avec au moins 9 landmarks (0..8)
  if (!landmarks || landmarks.length < 2) return 0;
  if (!landmarks[0] || !landmarks[1]) return 0;
  if (landmarks[0].length < 9 || landmarks[1].length < 9) return 0;

  const index1 = landmarks[0][8];
  const index2 = landmarks[1][8];

  return dist(index1.x, index1.y, index2.x, index2.y);
}

function drawPortal(landmarks) {
  // position du portail
  const portalPosXY = portalPosition(landmarks);
  if (!portalPosXY) return;

  // sécurité sur les landmarks
  if (!landmarks || landmarks.length < 2) return;
  if (!landmarks[0] || !landmarks[1]) return;
  if (landmarks[0].length < 9 || landmarks[1].length < 9) return;

  const INDEX_TIP = 8;
  const index1 = landmarks[0][INDEX_TIP];
  const index2 = landmarks[1][INDEX_TIP];

  // conversion en pixels
  const x1 = index1.x * videoDrawW + videoDrawX;
  const y1 = index1.y * videoDrawH + videoDrawY;
  const x2 = index2.x * videoDrawW + videoDrawX;
  const y2 = index2.y * videoDrawH + videoDrawY;

  // distance entre les deux index
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distPx = Math.sqrt(dx * dx + dy * dy);

  // paramètres visuels
  const minPortalSize = 50;
  const circleSizeInit = 50;

  // conversion distance → taille cible
  let targetSize = circleSizeInit + distPx * 0.5;
  targetSize = Math.max(minPortalSize, targetSize);

  // ---- MÉMOIRE DE LA TAILLE ET CROISSANCE AUTO ----
  if (typeof window !== 'undefined') {
    if (window._lastPortalSize === undefined) window._lastPortalSize = targetSize;
    if (window._autoGrow === undefined) window._autoGrow = false; // état : le portail s’agrandit tout seul ?

    // si la taille dépasse un seuil → activer croissance auto
    const growthThreshold = 100; // à ajuster selon ton rendu
    if (targetSize > growthThreshold && !window._autoGrow) {
      window._autoGrow = true;
    }

    // croissance naturelle du portail si activée
    if (window._autoGrow) {
      window._lastPortalSize += 20; // vitesse de croissance automatique
    } else {
      // sinon on suit la taille des doigts
      window._lastPortalSize = lerp(window._lastPortalSize, targetSize, 0.2);
    }

    targetSize = window._lastPortalSize;
  }

  // dessin du cercle
  push();
  noStroke();
  fill(0, 0, 255, 150);
  circle(portalPosXY.x, portalPosXY.y, targetSize);
  pop();
}
