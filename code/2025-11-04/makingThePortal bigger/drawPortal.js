
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
  // If there are landmarks, calculate the position normally
  let portalPosXY = null;
  if (landmarks && landmarks.length >= 2) {
    portalPosXY = portalPosition(landmarks);
  }

  // Initialize global memory variables
  if (typeof window !== 'undefined') {
    if (window._portalSize === undefined) window._portalSize = 50;      // starting size
    if (window._autoGrow === undefined) window._autoGrow = false;       // growth mode
    if (window._portalPos === undefined) window._portalPos = { x: width / 2, y: height / 2 }; // default center
  }

  // If we have valid hand landmarks, update position & size based on fingers
  if (landmarks && landmarks.length >= 2 && landmarks[0][8] && landmarks[1][8]) {
    const index1 = landmarks[0][8];
    const index2 = landmarks[1][8];

    const x1 = index1.x * videoDrawW + videoDrawX;
    const y1 = index1.y * videoDrawH + videoDrawY;
    const x2 = index2.x * videoDrawW + videoDrawX;
    const y2 = index2.y * videoDrawH + videoDrawY;

    const dx = x1 - x2;
    const dy = y1 - y2;
    const distPx = Math.sqrt(dx * dx + dy * dy);

    let targetSize = 50 + distPx * 0.5;
    targetSize = Math.max(50, targetSize);

    // Smoothly update current size
    window._portalSize = lerp(window._portalSize, targetSize, 0.2);

    // Update position while hands are detected
    if (!window._autoGrow) {
      if (portalPosXY) {
        window._portalPos = { x: portalPosXY.x, y: portalPosXY.y };
      }
    }

    // Activate auto-grow if size exceeds threshold
    const growthThreshold = 200;
    if (window._portalSize > growthThreshold) {
      window._autoGrow = true;
    }
  }

  // --- Auto-grow mode ---
  if (window._autoGrow) {
    window._portalSize += 2; // growth speed
  }

  // Draw the portal
  push();
  noStroke();
  fill(0, 0, 255, 150);
  circle(window._portalPos.x, window._portalPos.y, window._portalSize);
  pop();
}
