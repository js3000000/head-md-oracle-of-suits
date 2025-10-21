let video;
let model;            // tensorflow handpose model
let predictions = []; // array from model.estimateHands()

function setup() {
  createCanvas(400, 400);
  background(220);

  // start video
  video = createCapture(VIDEO, () => {
    console.log('video ready');
  });
  video.size(width, height);
  video.hide();

  // load handpose model (async)
  loadHandpose();
}

async function loadHandpose() {
  model = await handpose.load(); // from @tensorflow-models/handpose
  console.log('Handpose model ready');
  detectLoop(); // start continuous detection
}

// simple loop that avoids overlapping estimates
/*async function detectLoop() {
  if (!model || !video || !video.elt) return;
  try {
    const hands = await model.estimateHands(video.elt, true); // return landmarks in video pixels
    predictions = hands;
  } catch (err) {
    console.error('handpose error', err);
  }
  // schedule next detection (adjust interval if needed)
  setTimeout(detectLoop, 80);
}*/

function draw() {
  // draw webcam frame to canvas
  //image(video, 0, 0, width, height);

  // mapping from video pixel space -> canvas
  const vw = (video.width && video.width > 0) ? video.width : (video.elt && video.elt.videoWidth) || width;
  const vh = (video.height && video.height > 0) ? video.height : (video.elt && video.elt.videoHeight) || height;
  const sx = width / vw;
  const sy = height / vh;
  const mirror = true; // mirror so labels match what user sees

  // draw labels and markers for each detected hand
  textSize(14);
  noStroke();

  if (predictions.length > 0) {
    // show top-center indicator while any hand is present
    fill(0);
    textAlign(CENTER, TOP);
    textSize(24);
    text('hand', width / 2, 8);
  }

  for (let i = 0; i < predictions.length; i++) {
    const hand = predictions[i];
    if (!hand.landmarks || hand.landmarks.length === 0) continue;

    // use wrist landmark (index 0) for label position
    const [wx, wy] = hand.landmarks[0];
    const cx = mirror ? width - (wx * sx) : wx * sx;
    const cy = wy * sy;

    // draw small marker and label on the webcam frame
    fill(0, 255, 100, 200);
    circle(cx, cy, 10);

    fill(255, 0, 0);
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text('hand', cx, cy - 8);
  }
}