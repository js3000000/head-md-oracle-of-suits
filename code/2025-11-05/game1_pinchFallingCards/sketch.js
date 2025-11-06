// area where the video is drawn on the canvas (used to map normalized landmarks)
let videoDrawX = 0;
let videoDrawY = 0;
let videoDrawW = 0;
let videoDrawH = 0;

let videoAspect;
let videoStarted = false; // prevent double camera start

let gameStarted = false;
let handdetected = false;
let landmarks = null; // keep last known landmarks

let fireImg; // added: preload the fire image

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

  // --- Video webcam drawing ------------------------------------

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


      // draw the video
      image(videoElement, videoDrawX, videoDrawY, videoDrawW, videoDrawH);
    }


  }

  // background image
  image(bkgimage, 0, 0, width, height);
  // mask to darken the area outside the video
  noStroke();
  fill(0);
  rect(0, 0, videoDrawX, height);   // left
  rect(videoDrawX + videoDrawW, 0, width - (videoDrawX + videoDrawW), height); // right
  rect(videoDrawX, 0, videoDrawW, videoDrawY); // top
  rect(videoDrawX,videoDrawY + videoDrawH,videoDrawW,height - (videoDrawY + videoDrawH)); // bottom



  // fonction qui fait tomber des carrés du haut de l'écran 
  fallingCards();
  image(fireImg, videoDrawX, videoDrawY + videoDrawH - 200, videoDrawW, 300);



  // --- Hand landmarks drawing ------------------------------------
  if (detections) {
    for (let hand of detections.multiHandLandmarks) {

      drawIndex(hand);
      drawthumb(hand);
    }
  }

}

// preload function to load images
function preload() {
  fireImg = loadImage('./img/fire_template_1.png'); // adjust path as needed
  bkgimage = loadImage('./img/background0087.png'); // adjust path as needed

}