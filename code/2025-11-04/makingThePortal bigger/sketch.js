// area where the video is drawn on the canvas (used to map normalized landmarks)
let videoDrawX = 0;
let videoDrawY = 0;
let videoDrawW = 0;
let videoDrawH = 0;

let videoAspect;
let videoStarted = false; // prevent double camera start

let portalActivated = false;
let handdetected = false;
let landmarks = null; // keep last known landmarks

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  if (!videoStarted) {
    setupVideo();
    videoStarted = true;
  }

  setupHands();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // --- Video Drawing ------------------------------------
  if (isVideoReady()) {
    const vw =
      (videoElement.elt && videoElement.elt.videoWidth) ||
      videoElement.width ||
      0;
    const vh =
      (videoElement.elt && videoElement.elt.videoHeight) ||
      videoElement.height ||
      0;

    if (vw <= 0 || vh <= 0) {
      videoDrawX = 0;
      videoDrawY = 0;
      videoDrawW = 0;
      videoDrawH = 0;
    } else {
      const canvasAR = width / height;
      const videoAR = vw / vh;

      if (videoAR > canvasAR) {
        videoDrawW = width;
        videoDrawH = width / videoAR;
        videoDrawX = 0;
        videoDrawY = (height - videoDrawH) / 2;
      } else {
        videoDrawH = height;
        videoDrawW = height * videoAR;
        videoDrawY = 0;
        videoDrawX = (width - videoDrawW) / 2;
      }

      image(videoElement, videoDrawX, videoDrawY, videoDrawW, videoDrawH);
    }
  }

  noStroke();

  // --- Hand Detection & Portal Activation ----------------
  if (detections || portalActivated) {
    handdetected = true;
    landmarks = detections.multiHandLandmarks;

    const fingersTouching = checkDistanceFingers(landmarks);

    /*    for (let hand of landmarks) {
         drawIndex(hand);
         drawthumb(hand);
         drawWrist(hand);
         drawConnections(hand);
       } */

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

    // Draw portal: if locked or auto-growing or activated, always draw from stored pos/size
    push();
    noStroke();
    fill(0, 0, 255, 150);
    circle(window._portalPos.x, window._portalPos.y, window._portalSize);
    pop();
  }
}

// helper: check landmark arrays are valid and contain index tip coords
function landmarkSafe(landmarks) {
  try {
    return (
      landmarks[0] && landmarks[1] &&
      landmarks[0].length > 8 && landmarks[1].length > 8 &&
      typeof landmarks[0][8].x === 'number' && typeof landmarks[0][8].y === 'number' &&
      typeof landmarks[1][8].x === 'number' && typeof landmarks[1][8].y === 'number'
    );
  } catch (e) {
    return false;
  }
}
