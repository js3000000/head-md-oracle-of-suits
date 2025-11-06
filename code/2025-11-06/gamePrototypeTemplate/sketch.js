// VIDEO --------- area where the video is drawn on the canvas (used to map normalized landmarks)
let videoDrawX = 0;
let videoDrawY = 0;
let videoDrawW = 0;
let videoDrawH = 0;

let videoAspect;
let videoStarted = false; // prevent double camera start

// CAMERA ---------
let camZ = 0;

/* // ONBOARDING SCENE ---------
let robotModel;
let frames = [];
let framesReady = false;
let frameIndex = 0;
let playing = true;
const FRAMES_COUNT = 60; // nombre d'images à générer (tour complet)
const CAPTURE_WIDTH = 1200; // résolution de capture (peut réduire pour moins de mémoire)
const CAPTURE_HEIGHT = 800; */

// nouvelle variable pour contrôler l'échelle du modèle
let modelScale = 1.0;
let design;
let backgroundImage;
// élément slider DOM
let scaleSlider;


// GAME 1 ---------
let gameStarted = false;
let handdetected = false;
let landmarks = null; // keep last known landmarks


let envModel;

// Images + models for Game 1
let fireImg; // added: preload the fire image
let bkgimage;
let cardModel;
let cardTexture;


let cameraMain;


// preload function to load images
function preload() {


  // Onboarding scene images
  design = loadFont('Assets/Typo/ABCMaxiRoundEdu-Regular.otf');
  robotModel = loadModel('Assets/Head.obj', true);
  backgroundImage = loadImage('Assets/Robot_test.jpg');


  // Game 1: Falling Cards
  fireImg = loadImage('./img/fire_template_1.png'); // adjust path as needed
  bkgimage = loadImage('./img/background0087.png'); // adjust path as needed
  cardModel = loadModel('./img/Card.obj', true); // adjust path as needed
  cardTexture = loadImage('./img/IMG_4528.jpg'); // adjust path as needed

}


function setup() {

  // FOR GAME 1 ---------
  // use WEBGL to enable model()
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // create and position a camera that looks at the scene center
  cameraMain = createCamera();

  if (!videoStarted) {
    setupVideo();
    videoStarted = true;
  }

  setupHands();
}

function windowResized() {
  // keep WEBGL renderer when resizing and re-position camera
  resizeCanvas(windowWidth, windowHeight, WEBGL);
  if (cameraMain) {
    const camZ = (height / 2) / tan((PI * 60) / 360);
    cameraMain.setPosition(0, 0, camZ);
    cameraMain.lookAt(0, 0, 0);
  }
}

function draw() {

  background(0);

  // --- 2D overlay drawing (video, background image, HUD)
  // In WEBGL mode the origin is the canvas center; translate to top-left
  push();
  translate(-width / 2, -height / 2);

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


      // draw the video (non-mirrored)
      push();
      translate(videoDrawX + videoDrawW, videoDrawY); // move origin to the video's right-top
      scale(-1, 1); // flip horizontally to cancel mirror
      image(videoElement, 0, 0, videoDrawW, videoDrawH);
      pop();
    }

  }


  // Onboarding scene

  // set camera position
  camZ = 800;
  cameraMain.setPosition(0, 0, camZ);
  cameraMain.lookAt(0, 0, 0);

  // arrêter fonction onboarding après 3 secondes
  let currentTime = millis();
  const ONBOARDING_MS = 3000;

  if (currentTime < ONBOARDING_MS) {
    onboarding();
  } else {

    // afficher image de fond APRES l'onboarding

    // background image ajouter z
    image(bkgimage, 0, 0, width, height);

    // 2D overlays such as the fire image
    image(fireImg, videoDrawX, videoDrawY + videoDrawH - 200, videoDrawW, 300);
    // mask to darken the area outside the video
    noStroke();
    fill(0);
    // left
    rect(0, 0, videoDrawX, height);
    // right
    rect(videoDrawX + videoDrawW, 0, width - (videoDrawX + videoDrawW), height);
    // top
    rect(videoDrawX, 0, videoDrawW, videoDrawY);
    // bottom
    rect(
      videoDrawX,
      videoDrawY + videoDrawH,
      videoDrawW,
      height - (videoDrawY + videoDrawH)
    );

    pop(); // restore WEBGL center-origin for 3D drawing
    fallingCards();

  }

  pop();



  // Game 1: Falling Cards --------------------------------
  /* 
  // background image ajouter z
  //image(bkgimage, 0, 0, width, height);
 
  // 2D overlays such as the fire image
  image(fireImg, videoDrawX, videoDrawY + videoDrawH - 200, videoDrawW, 300);
  // mask to darken the area outside the video
  noStroke();
  fill(0);
  // left
  rect(0, 0, videoDrawX, height);
  // right
  rect(videoDrawX + videoDrawW, 0, width - (videoDrawX + videoDrawW), height);
  // top
  rect(videoDrawX, 0, videoDrawW, videoDrawY);
  // bottom
  rect(
    videoDrawX,
    videoDrawY + videoDrawH,
    videoDrawW,
    height - (videoDrawY + videoDrawH)
  );
 
  pop(); // restore WEBGL center-origin for 3D drawing
 
  // --- 3D drawing: falling cards (models) -------------------------
  fallingCards();
 
  // dessiner le feu AU DESSUS des modèles 3D
  push();
  translate(-width / 2, -height / 2);
  // désactiver le test de profondeur pour que le quad 2D ne soit pas masqué par le depth buffer
  if (typeof drawingContext !== 'undefined' && drawingContext) {
    drawingContext.disable(drawingContext.DEPTH_TEST);
  }
  image(fireImg, videoDrawX, videoDrawY + videoDrawH - 200, videoDrawW, 300);
  // réactiver le test de profondeur
  if (typeof drawingContext !== 'undefined' && drawingContext) {
    drawingContext.enable(drawingContext.DEPTH_TEST);
  }
  pop();
 
  // --- Hand landmarks drawing (as 2D overlays) -------------------
  if (detections) {
    push();
    translate(-width / 2, -height / 2);
    for (let hand of detections.multiHandLandmarks) {
 
      drawIndex(hand);
      drawthumb(hand);
    }
    pop();
  }*/
}