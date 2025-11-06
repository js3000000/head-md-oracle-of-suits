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

let portalImg; // added: preload the portal image
let bkg;

// Mirror toggle: true => draw webcam mirrored (like a typical selfie view)
const MIRROR_VIDEO = true;

// helper: convert normalized landmark.x (0..1) to pixel x inside the drawn video rectangle
function normXToPx(normX) {
  // if MIRROR_VIDEO is true we flip the normalized x coordinate horizontally
  return videoDrawX + (MIRROR_VIDEO ? (1 - normX) * videoDrawW : normX * videoDrawW);
}

function preload() {
  // load the portal image once
  portalImg = loadImage('./img/portal_alpha.png');
  bkg = loadImage('./img/onboarding_bckground.jpg');

  robotModel = loadModel('./Assets/Head.obj', true);
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  if (!videoStarted) {
    setupVideo();
    videoStarted = true;
  }

  setupHands();

  // 🔁 Redirection automatique après 20 secondes
  /*  setTimeout(() => {
     window.location.href = "../game/index.html";
   }, 20000); */


}

function mousePressed() {
  window.location.href = "../game/index.html";
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
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


      // dessiner la video au centre de la fenêtre
      push();
      translate(-width / 2, -height / 2, 0);

      if (MIRROR_VIDEO) {
        // draw mirrored: translate to the right edge of the video rectangle then flip horizontally
        push();
        translate(videoDrawX + videoDrawW, videoDrawY);
        scale(-1, 1);
        image(videoElement, 0, 0, videoDrawW, videoDrawH);
        pop();
      } else {
        image(videoElement, videoDrawX, videoDrawY, videoDrawW, videoDrawH);
      }

      pop();
    }
  }

  // ajouter camera avec webgl et z depth et centrée
  push();
  translate(-width / 2, -height / 2, 0);
  // dessiner le background avec transparence
  tint(255, 200); // régler la transparence ici (0-255)
  image(bkg, 0, 0, width, height);

  pop();

/*   // drawrobot 3d model
  push();
  translate(width / 2, height / 2 + 100);
  scale(1);
  noStroke();
  ambientLight(150);
  directionalLight(255, 255, 255, 0, -1, 0);
  model(robotModel);
  pop(); */


  noStroke();

  // For 2D overlay drawing (fingertips, connections, portal) we need a top-left origin
  // because the canvas is created with WEBGL (center origin). Translate once so
  // the helper functions (which use pixel coords) can draw naturally.
  push();
  translate(-width / 2, -height / 2, 0);

  // --- Hand Detection & Portal Activation ----------------
  if (detections || portalActivated) {
    handdetected = true;
    landmarks = detections.multiHandLandmarks;

    const fingersTouching = checkDistanceFingers(landmarks);

    for (let hand of landmarks) {
      drawIndex(hand);
      drawThumb(hand);
      drawWrist(hand);
      drawConnections(hand);
    }

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

  // restore transform after 2D overlay drawing
  pop();

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

  // conversion en pixels (take mirror into account)
  const x1 = normXToPx(index1.x);
  const y1 = index1.y * videoDrawH + videoDrawY;
  const x2 = normXToPx(index2.x);
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


    // draw portal image using stored pos/size (centered)
    {
      const drawPos = (typeof window !== 'undefined' && window._portalPos) ? window._portalPos : (portalPosXY || { x: width / 2, y: height / 2 });
      const drawSize = (typeof window !== 'undefined' && window._portalSize) ? window._portalSize : 0;

      if (portalImg && drawSize > 0) {
        push();
        // translate to top-left origin so drawPos (in px) maps correctly in WEBGL mode
        translate(-width / 2, -height / 2, 0);

        // clip to webcam rectangle using WebGL scissor when in WEBGL renderer
        if (videoDrawW > 0 && videoDrawH > 0 && drawingContext && drawingContext.SCISSOR_TEST !== undefined) {
          const gl = drawingContext;
          gl.enable(gl.SCISSOR_TEST);
          // WebGL scissor uses bottom-left origin, p5 canvas uses top-left
          const sx = Math.round(videoDrawX);
          const sy = Math.round(height - (videoDrawY + videoDrawH));
          const sw = Math.round(videoDrawW);
          const sh = Math.round(videoDrawH);
          gl.scissor(sx, sy, sw, sh);

          imageMode(CENTER);
          noStroke();
          image(portalImg, drawPos.x, drawPos.y, drawSize, drawSize);

          gl.disable(gl.SCISSOR_TEST);
        } else {
          // fallback (2D renderer or no scissor support)
          imageMode(CENTER);
          noStroke();
          image(portalImg, drawPos.x, drawPos.y, drawSize, drawSize);
        }
        pop();
      }
    }

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