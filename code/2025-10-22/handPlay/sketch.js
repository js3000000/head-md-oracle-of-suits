

function setup() {

  // full window canvas
  createCanvas(windowWidth, windowHeight);

  // initialize MediaPipe settings
  setupHands();
  // start camera using MediaPipeHands.js helper
  setupVideo();
  
 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  // clear the canvas
  background(255);

  // if the video connection is ready
  if (isVideoReady()) {
    // draw the capture image
    image(videoElement, 0, 0);
    displayWealth();
  }

  // use thicker lines for drawing hand connections
  strokeWeight(2);


  // make sure we have detections to draw
  if (detections) {

    // for each detected hand
    for (let hand of detections.multiHandLandmarks) {

      

      // draw the index finger
      drawIndex(hand);
      // draw the thumb finger
      drawThumb(hand);
      // draw fingertip points
      drawTips(hand);
      // draw connections
      drawConnections(hand);
      // draw all landmarks
      drawLandmarks(hand);

      //drawThumbMajorDistance(hand);

      makeSparkle(hand);

      

    } // end of hands loop

  } // end of if detections
  
} // end of draw


// only the index finger tip landmark
function drawIndex(landmarks) {

  // get the index fingertip landmark
  let mark = landmarks[FINGER_TIPS.index];

  noStroke();
  // set fill color for index fingertip
  fill(0, 255, 255);

  // adapt the coordinates (0..1) to video coordinates
  let x = mark.x * videoElement.width;
  let y = mark.y * videoElement.height;
  circle(x, y, 20);

}


// draw the thumb finger tip landmark
function drawThumb(landmarks) {

  // get the thumb fingertip landmark
  let mark = landmarks[FINGER_TIPS.thumb];

  noStroke();
  // set fill color for thumb fingertip
  fill(255, 255, 0);

  // adapt the coordinates (0..1) to video coordinates
  let x = mark.x * videoElement.width;
  let y = mark.y * videoElement.height;
  circle(x, y, 20);

}

function drawTips(landmarks) {

  noStroke();
  // set fill color for fingertips
  fill(0, 0, 255);

  // fingertip indices
  const tips = [4, 8, 12, 16, 20];

  for (let tipIndex of tips) {
    let mark = landmarks[tipIndex];
    // adapt the coordinates (0..1) to video coordinates
    let x = mark.x * videoElement.width;
    let y = mark.y * videoElement.height;
    circle(x, y, 10);
  }

}


function drawLandmarks(landmarks) {

  noStroke();
  // set fill color for landmarks
  fill(255, 0, 0);

  for (let mark of landmarks) {
    // adapt the coordinates (0..1) to video coordinates
    let x = mark.x * videoElement.width;
    let y = mark.y * videoElement.height;
    circle(x, y, 6);
  }

}


function drawConnections(landmarks) {

  // set stroke color for connections
  stroke(0, 255, 0);

  // iterate through each connection
  for (let connection of HAND_CONNECTIONS) {
    // get the two landmarks to connect
    const a = landmarks[connection[0]];
    const b = landmarks[connection[1]];
    // skip if either landmark is missing
    if (!a || !b) continue;
    // landmarks are normalized [0..1], (x,y) with origin top-left
    let ax = a.x * videoElement.width;
    let ay = a.y * videoElement.height;
    let bx = b.x * videoElement.width;
    let by = b.y * videoElement.height;
    //line(ax, ay, bx, by);
  }
}


function calculateThumbMajorDistance(landmarks) {
  // Get thumb tip and middle (major) finger tip landmarks
  const thumbTip = landmarks[FINGER_TIPS.thumb];
  const majorTip = landmarks[FINGER_TIPS.index];

  // Convert normalized [0..1] coordinates to video pixels
  const x1 = thumbTip.x * videoElement.width;
  const y1 = thumbTip.y * videoElement.height;
  const x2 = majorTip.x * videoElement.width;
  const y2 = majorTip.y * videoElement.height;

  // Compute the Euclidean distance
  const distance = dist(x1, y1, x2, y2);

/*   // Draw the distance as text, following the middle finger tip
  fill(0); // black text
  noStroke();
  textSize(16);
  textAlign(CENTER, BOTTOM);
  text(nf(distance, 1, 1) + ' px', x2, y2 - 10); */

  return distance;
}

let wealth = 0;

function displayWealth() {

    fill(0); // black text
    noStroke();
    textSize(50);
    textAlign(RIGHT, TOP);
    text(wealth, width - 20, 20);

}

function makeSparkle(landmarks) {
  let distance = calculateThumbMajorDistance(landmarks);
  console.log(distance);

  if (distance < 60.0) {
    // Get position of the index finger tip (same as 'major')
    const indexTip = landmarks[FINGER_TIPS.index];
    const x = indexTip.x * videoElement.width;
    const y = indexTip.y * videoElement.height;

    wealth += 10;

    // Add money to your wallet
    if (wealth > 1000) {
      circle(50, width/2, height/2);
    }

    // Draw the distance text above the index finger tip
    /* fill(0); // black text
    noStroke();
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(nf(distance, width/2, height/2); */
  }
}