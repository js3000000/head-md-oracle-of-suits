let video;
let handpose;
let predictions = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("ml5 handpose loaded");
  });
  handpose.on("predict", (results) => {
    predictions = results;
  });
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  // draw keypoints from predictions
  for (let i = 0; i < predictions.length; i++) {
    const pred = predictions[i];
    for (let j = 0; j < pred.landmarks.length; j++) {
      const [x, y, z] = pred.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      circle(x, y, 8);
    }
  }

  fill(255);
  textSize(24);
  text("Hello, world + handpose", 10, height - 20);
}