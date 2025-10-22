let flowers = [];
let wealth = 0;
const NUM_FLOWERS = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupHands();
  setupVideo();

  // Spawn flowers with unique positions
  const minDistance = 80;

  while (flowers.length < NUM_FLOWERS) {
    let newFlower = {
      x: random(500),
      y: random(500),
      radius: 30,
      picked: false
    };

    // Ensure it's not too close to existing flowers
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

  // Draw all unpicked flowers
  for (let flower of flowers) {
    if (!flower.picked) {
      drawFlower(flower);
    }
  }

  if (detections) {
    for (let hand of detections.multiHandLandmarks) {
      drawThumb(hand);
      drawMiddle(hand);
      checkFlowersPickup(hand);
    }
  }

  displayWealth();
}

// Draw a single flower
function drawFlower(flower) {
  fill(255, 100, 200);
  noStroke();
  ellipse(flower.x, flower.y, flower.radius * 2);
}

// Check all flowers for pickup
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

function drawMiddle(landmarks) {
  let mark = landmarks[FINGER_TIPS.middle];
  noStroke();
  fill(0, 255, 255);
  let x = mark.x * videoElement.width;
  let y = mark.y * videoElement.height;
  circle(x, y, 20);
}

function drawThumb(landmarks) {
  let mark = landmarks[FINGER_TIPS.thumb];
  noStroke();
  fill(255, 255, 0);
  let x = mark.x * videoElement.width;
  let y = mark.y * videoElement.height;
  circle(x, y, 20);
}

function displayWealth() {
  fill(0);
  noStroke();
  textSize(40);
  textAlign(RIGHT, TOP);
  text("Wealth: $" + wealth, width - 20, 20);
}
