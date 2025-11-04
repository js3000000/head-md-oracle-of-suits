let lineStart, lineEnd;
let isDragging = false;

// Threshold for detecting a pinch (in pixels)
const PINCH_THRESHOLD = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupHands();
  setupVideo();

  // Initial position of the draggable line
  lineStart = createVector(width / 2 - 100, height / 2);
  lineEnd = createVector(width / 2 + 100, height / 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  if (isVideoReady()) {
    image(videoElement, 0, 0);
  }

  strokeWeight(4);
  stroke(0);
  line(lineStart.x, lineStart.y, lineStart.x, lineEnd.y + 100);

;

  if (detections) {
    for (let hand of detections.multiHandLandmarks) {
      drawIndex(hand);
      drawThumb(hand);
      drawTips(hand);

      handlePinchInteraction(hand);
    }
  }
}

// ========== FINGER TRACKING VISUALIZATIONS ==========

function drawIndex(landmarks) {
  let mark = landmarks[FINGER_TIPS.index];
  fill(0, 255, 255);
  noStroke();
  circle(mark.x * videoElement.width, mark.y * videoElement.height, 20);
}

function drawThumb(landmarks) {
  let mark = landmarks[FINGER_TIPS.thumb];
  fill(255, 255, 0);
  noStroke();
  circle(mark.x * videoElement.width, mark.y * videoElement.height, 20);
}

function drawTips(landmarks) {
  fill(0, 0, 255);
  noStroke();
  const tips = [4, 8, 12, 16, 20];
  for (let i of tips) {
    let m = landmarks[i];
    circle(m.x * videoElement.width, m.y * videoElement.height, 10);
  }
}

function drawLandmarks(landmarks) {
  fill(255, 0, 0);
  noStroke();
  for (let mark of landmarks) {
    circle(mark.x * videoElement.width, mark.y * videoElement.height, 6);
  }
}

function drawConnections(landmarks) {
  stroke(0, 255, 0);
  for (let connection of HAND_CONNECTIONS) {
    const a = landmarks[connection[0]];
    const b = landmarks[connection[1]];
    if (!a || !b) continue;
    line(a.x * videoElement.width, a.y * videoElement.height,
         b.x * videoElement.width, b.y * videoElement.height);
  }
}

// ========== PINCH AND DRAG LOGIC ==========

function handlePinchInteraction(landmarks) {
  // Get thumb and index tip positions
  const thumb = landmarks[FINGER_TIPS.thumb];
  const index = landmarks[FINGER_TIPS.index];

  const x1 = thumb.x * videoElement.width;
  const y1 = thumb.y * videoElement.height;
  const x2 = index.x * videoElement.width;
  const y2 = index.y * videoElement.height;

  const pinchDist = dist(x1, y1, x2, y2);
  const pinchPos = createVector((x1 + x2) / 2, (y1 + y2) / 2);

  // Visualize pinch point
  fill(255, 0, 255);
  noStroke();

  if (pinchDist < PINCH_THRESHOLD) {
    // If we're pinching close to the line, start dragging
    if (!isDragging && isNearLine(pinchPos)) {
      isDragging = true;
    }

    // If already dragging, update the line position
    if (isDragging) {
      lineStart = createVector(x1, y1); // thumb
      lineEnd = createVector(x2, y2);   // index
    }

  } else {
    isDragging = false;
  }
}

// Check if pinch is near the line (within some threshold)
function isNearLine(p) {
  const d = distToSegment(p, lineStart, lineEnd);
  return d < 20;
}

// Helper: Distance from point P to segment AB
function distToSegment(p, v, w) {
  const l2 = p5.Vector.dist(v, w) ** 2;
  if (l2 === 0) return p5.Vector.dist(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = constrain(t, 0, 1);
  return p5.Vector.dist(p, createVector(
    v.x + t * (w.x - v.x),
    v.y + t * (w.y - v.y)
  ));
}
