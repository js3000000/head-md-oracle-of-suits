function portalActivation(detections) {
    // --- Hand Detection & Portal Activation ----------------

    // message de debug milieu de l'écran
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(32);
    text("Debug Message", width / 2, height / 2);

  if (portalActivated) {
    handdetected = true;
    landmarks = detections.multiHandLandmarks;

    const fingersTouching = checkDistanceFingers(landmarks);

    // activate the portal when fingers touch
    if (fingersTouching) {
      // text message
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text("Portal Activated", width / 2, height / 2);
      portalActivated = true;
    }
  }

  // --- Draw the portal even if no hands are visible -------
  if (portalActivated) {
    // PARAMETERS for auto-grow behavior (can be overridden on window)
    const AUTO_GROW_THRESHOLD = (typeof window !== 'undefined' && window.PORTAL_AUTO_GROW_THRESHOLD) || 200; // px
    const AUTO_GROW_RATE = (typeof window !== 'undefined' && window.PORTAL_AUTO_GROW_RATE) || 30; // px per frame
    const AUTO_GROW_TARGET = (typeof window !== 'undefined' && window.PORTAL_AUTO_GROW_TARGET) || Math.max(width, height) * 1.5; // target size to stop auto-growing

    // compute portal position if available
    let portalPosXY = portalPosition(landmarks);
    // ensure global storage exists
    if (typeof window !== 'undefined') {
      window._portalPos = window._portalPos || portalPosXY || { x: width / 2, y: height / 2 };
      window._portalSize = window._portalSize || 0;
      window._portalAutoGrowing = window._portalAutoGrowing || false;
      window._portalLocked = window._portalLocked || false;
    }

    // If landmarks available, compute finger distance and candidate size
    if (landmarks && landmarks.length >= 2 && landmarkSafe(landmarks)) {
      const INDEX_TIP = 8;
      const index1 = landmarks[0][INDEX_TIP];
      const index2 = landmarks[1][INDEX_TIP];

      // conversion en pixels
      const x1 = index1.x * videoDrawW + videoDrawX;
      const y1 = index1.y * videoDrawH + videoDrawY;
      const x2 = index2.x * videoDrawW + videoDrawX;
      const y2 = index2.y * videoDrawH + videoDrawY;

      const dx = x1 - x2;
      const dy = y1 - y2;
      const distPx = Math.sqrt(dx * dx + dy * dy);

      // base target size from finger distance
      const minPortalSize = 50;
      const circleSizeInit = 50;
      const candidateSize = Math.max(minPortalSize, circleSizeInit + distPx * 0.5);

      // if candidate exceeds threshold and auto-grow not started, start auto-grow and lock position
      if (!window._portalAutoGrowing && candidateSize >= AUTO_GROW_THRESHOLD) {
        window._portalAutoGrowing = true;
        window._portalPos = portalPosXY || window._portalPos;
        // initialize portal size from candidate (use last smaller value)
        window._portalSize = Math.max(window._portalSize, candidateSize);
      }

      // if not auto-growing and not locked, follow fingers
      if (!window._portalAutoGrowing && !window._portalLocked) {
        window._portalPos = portalPosXY || window._portalPos;
        window._portalSize = lerp(window._portalSize, candidateSize, 0.2);
      }
    }

    // Auto-grow logic: increment size per frame until target then lock
    if (window._portalAutoGrowing && !window._portalLocked) {
      window._portalSize = window._portalSize + AUTO_GROW_RATE;
      if (window._portalSize >= AUTO_GROW_TARGET) {
        window._portalSize = AUTO_GROW_TARGET;
        window._portalLocked = true;
        window._portalAutoGrowing = false;
      }
    }

    /*  // Draw portal: if locked or auto-growing or activated, always draw from stored pos/size
     push();
     noStroke();
     fill(0, 0, 255, 150);
     circle(window._portalPos.x, window._portalPos.y, window._portalSize);
     pop(); */

    // draw portal image using stored pos/size (centered)
    {
      const drawPos = (typeof window !== 'undefined' && window._portalPos) ? window._portalPos : (portalPosXY || { x: width / 2, y: height / 2 });
      const drawSize = (typeof window !== 'undefined' && window._portalSize) ? window._portalSize : 0;

      if (portalImg && drawSize > 0) {
        push();
        // clip to webcam rectangle so anything outside video area is hidden
        if (videoDrawW > 0 && videoDrawH > 0) {
          // use native canvas clipping (more reliable than p5.clip in some builds)
          drawingContext.save();
          drawingContext.beginPath();
          drawingContext.rect(videoDrawX, videoDrawY, videoDrawW, videoDrawH);
          drawingContext.clip();
        }
        imageMode(CENTER);
        noStroke();
        image(portalImg, drawPos.x, drawPos.y, drawSize, drawSize);
        if (videoDrawW > 0 && videoDrawH > 0) {
          drawingContext.restore();
        }
        pop();
      }
    }

  }
}