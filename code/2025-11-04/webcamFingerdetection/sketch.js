let offsetX = 0;
let offsetY = 0;

let fingerX;
let fingerY;
// area where the video is drawn on the canvas (used to map normalized landmarks)
let videoDrawX = 0;
let videoDrawY = 0;
let videoDrawW = 0;
let videoDrawH = 0;

// flag to place the piece once video area is known
let piecePlaced = false;

let videoAspect;
let videoStarted = false; // prevent double camera start

function setup() {

  // create canvas window size
  createCanvas(windowWidth, windowHeight);

  pixelDensity(1); // normalize across browsers / displays


  // start the video first, then initialize the hands code so only one camera request is made
  if (!videoStarted) {
    setupVideo();    // ensure this function starts the camera once
    videoStarted = true;
  }

  setupHands(); // should NOT call getUserMedia if setupVideo already started the camera

}

// fonction windowResized pour redimensionner le canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  background(0);

  // Video Drawing -----------------------------------------------

  if (isVideoReady()) {
    // draw the video preserving aspect ratio (contain / letterbox inside canvas)
    // get the actual video intrinsic size when available
    const vw = (videoElement.elt && videoElement.elt.videoWidth) || videoElement.width || 0;
    const vh = (videoElement.elt && videoElement.elt.videoHeight) || videoElement.height || 0;

    // if the intrinsic size is not yet available, treat as not-ready so
    // placement waits for a real video rectangle
    if (vw <= 0 || vh <= 0) {
      videoDrawX = 0; videoDrawY = 0; videoDrawW = 0; videoDrawH = 0;
    } else {
      const canvasAR = width / height;
      const videoAR = vw / vh;

      if (videoAR > canvasAR) {
        // video is wider than canvas => fit by width
        videoDrawW = width;
        videoDrawH = width / videoAR;
        videoDrawX = 0;
        videoDrawY = (height - videoDrawH) / 2;
      } else {
        // video is taller than canvas => fit by height
        videoDrawH = height;
        videoDrawW = height * videoAR;
        videoDrawY = 0;
        videoDrawX = (width - videoDrawW) / 2;
      }

      // draw the video into the computed rectangle
      image(videoElement, videoDrawX, videoDrawY, videoDrawW, videoDrawH);
    }
  } else {
    // video not ready yet — leave draw rect empty so we don't place the piece
    videoDrawX = 0; videoDrawY = 0; videoDrawW = 0; videoDrawH = 0;
  }

  noStroke();

  // Detections -----------------------------------------------

  if (detections) {
    for (let hand of detections.multiHandLandmarks) {

      drawIndex(hand);
      drawthumb(hand);

     /*  let indexTip = hand[FINGER_TIPS.index];
      // landmarks are normalized [0..1] relative to the video frame - map them to the drawn video rectangle
      let fingerX = indexTip.x * videoDrawW + videoDrawX;
      let fingerY = indexTip.y * videoDrawH + videoDrawY; */

    }
  }





  

}