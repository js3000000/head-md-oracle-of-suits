let flowers = [];
let wealth = 0;
const NUM_FLOWERS = 5;

let lineSegment = {
  x1: 100,
  y1: 100,
  x2: 200,
  y2: 200,
  dragging: false,
  offsetX: 0,
  offsetY: 0
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupHands();   // Assumes you are using MediaPipe or similar
  setupVideo();   // Assumes videoElement is defined in your code

  // Spawn flowers with unique positions (optional, no longer used)
  const minDistance = 80;
  while (flowers.length < NUM_FLOWERS) {
    let newFlower = {
      x: random(500),
      y: random(500),
      radius: 30,
      picked: false
    };

    let valid = true;
    for (let f of flowers) {
      if (dist(newFlower.x, newFlower.y, f.x, f.y) < minDistance) {
        valid = false;
        break;
      }
    }

    if (valid) {
      flowers.push(newFlower);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  if (isVideoReady()) {
    image(videoElement, 0, 0);
  }

  strokeWeight(2);

  // Draw all unpicked flowers (optional, not interactive anymore)
  for (let flower of flowers) {
    if (!flower.picked) {
      drawFlower(flower);
    }
  }

  if (detections) {
    for (let hand of detections.multiHandLandmarks) {
      drawThumb(hand);
      drawMiddle(hand);
      handleLineDragging(hand);  // Replaces checkFlowersPickup
    }
  }

  drawLineSegment();
  displayWealth();
}

// Draw a single flower (still in code but inactive)
function drawFlower(flower) {
  fill(255, 100, 200);
  noStroke();
  circle(flower.x, flower.y, flower.radius * 2);
}

// OLD: Detect pinch to pick flowers (now unused)
// You can remove this if you want
function checkFlowersPickup(landmarks) {
  const thumbTip = landmarks[FINGER_TIPS.thumb];
  const middleTip = landmarks[FINGER_TIPS.middle];

  const x1 = thumbTip.x * videoElement.width;
  const y1 = thumbTip.y * videoElement.height;
  const x2 = middleTip.x * videoElement.width;
  const y2 = middleTip.y * videoElement.height;

  const pinchDistance = dist(x1, y1, x2, y2);
  const pinchX = (x1 + x2) / 2;
  const pinchY = (y1 + y2) / 2;

  if (pinchDistance < 40) {
    for (let flower of flowers) {
      if (!flower.picked) {
        let flowerDist = dist(pinchX, pinchY, flower.x, flower.y);
        if (flowerDist < flower.radius) {
          flower.picked = true;
          wealth += 1;
        }
      }
    }
  }
}

// Handle pinching to drag a line segment
function handleLineDragging(landmarks) {
  const thumbTip = landmarks[FINGER_TIPS.thumb];
  const middleTip = landmarks[FINGER_TIPS.middle];

  const x1 = thumbTip.x * videoElement.width;
  const y1 = thumbTip.y * videoElement.height;
  const x2 = middleTip.x * videoElement.width;
  const y2 = middleTip.y * videoElement.height;

  const pinchDistance = dist(x1, y1, x2, y2);
  const pinchX = (x1 + x2) / 2;
  const pinchY = (y1 + y2) / 2;

  const pinchThreshold = 40;

  // Distance to center of the line
  const lineCenterX = (lineSegment.x1 + lineSegment.x2) / 2;
  const lineCenterY = (lineSegment.y1 + lineSegment.y2) / 2;
  const distToLine = dist(pinchX, pinchY, lineCenterX, lineCenterY);

  if (pinchDistance < pinchThreshold) {
    if (!lineSegment.dragging && distToLine < 50) {
      // Start dragging
      lineSegment.dragging = true;
      lineSegment.offsetX = pinchX - lineCenterX;
      lineSegment.offsetY = pinchY - lineCenterY;
    }
    if (lineSegment.dragging) {
      // Move line based on pinch movement
      let dx = pinchX - lineSegment.offsetX - lineCenterX;
      let dy = pinchY - lineSegment.offsetY - lineCenterY;

      lineSegment.x1 += dx;
      lineSegment.y1 += dy;
      lineSegment.x2 += dx;
      lineSegment.y2 += dy;
    }
  } else {
    lineSegment.dragging = false;
  }
}

// Draw the movable line
function drawLineSegment() {
  stroke(0);
  strokeWeight(4);
  line(lineSegment.x1, lineSegment.y1, lineSegment.x2, lineSegment.y2);
}

// Draw circle on thumb tip
function drawThumb(landmarks) {
  let mark = landmarks[FINGER_TIPS.thumb];
  noStroke();
  fill(255, 255, 0);
  let x = mark.x * videoElement.width;
  let y = mark.y * videoElement.height;
  circle(x, y, 20);
}

// Draw circle on middle finger tip
function drawMiddle(landmarks) {
  let mark = landmarks[FINGER_TIPS.middle];
  noStroke();
  fill(0, 255, 255);
  let x = mark.x * videoElement.width;
  let y = mark.y * videoElement.height;
  circle(x, y, 20);
}

// Display wealth text (optional)
function displayWealth() {
  fill(0);
  noStroke();
  textSize(40);
  textAlign(RIGHT, TOP);
  text("Wealth: $" + wealth, width - 20, 20);
}
