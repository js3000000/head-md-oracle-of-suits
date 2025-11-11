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
let cameraMain;

// preload function to load images
function preload() {

  diamond_cache = loadImage('./img/diamond_cache.png'); // adjust path as needed
  fireImg = loadImage('./img/fire_template_1.png'); // adjust path as needed
  bkgimage = loadImage('./img/background0087.png'); // adjust path as needed
  cardModel = loadModel('./img/Card.obj', true); // adjust path as needed
  cardTexture = loadImage('./img/IMG_4528.jpg'); // adjust path as needed
}

function setup() {

  // use WEBGL to enable model()
  createCanvas(windowWidth, windowHeight, WEBGL);


  pixelDensity(1);

  // create and position a camera that looks at the scene center
  cameraMain = createCamera();
  //const camZ = (height / 2) / tan((PI * 60) / 360); // approximate default fov 60deg
  const camZ = 800;

  cameraMain.setPosition(0, 0, camZ);
  cameraMain.lookAt(0, 0, 0);

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

  // allow the user to orbit the scene with the mouse (drag) / touch
  // comment out if you don't want interactive camera control
  orbitControl();

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


      // draw the video
      image(videoElement, videoDrawX, videoDrawY, videoDrawW, videoDrawH);

    }

  }

  noStroke();

  // background image ajouter z
  image(bkgimage, 0, 0, width, height, 350);

  // 2D overlays such as the fire image
  image(fireImg, videoDrawX, videoDrawY + videoDrawH - 200, videoDrawW, 30);

  pop();

  // --- 3D drawing: falling cards (models) -------------------------
  fallingCards();

  // dessiner le feu AU DESSUS des modèles 3D
  push();
  translate(-width / 2, -height / 2);

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
  }

  // cache: conserver le ratio d'aspect mais hauteur = hauteur de la fenêtre
  push();
  translate(-width / 2, -height / 2);
  // conserver ratio d'aspect
  const aspectRatio = diamond_cache.width / diamond_cache.height;
  // set cache height to full window height and compute width from aspect ratio
  const cacheHeight = height;
  const cacheWidth = cacheHeight * aspectRatio;
  image(diamond_cache, 0, 0, cacheWidth, cacheHeight);
  pop();
}