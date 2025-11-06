let fireImg; // added: preload the fire image
let cameraMain;

let son;
let playButton;
let backgroundAudioStarted = false;
// ...existing code...
function preload() {
  fireImg = loadImage('./img/fire_template_1.png'); // adjust path as needed
  bkgimage = loadImage('./img/background0087.png'); // adjust path as needed
  cardModel = loadModel('./img/Card.obj', true); // adjust path as needed
  cardTexture = loadImage('./img/IMG_4528.jpg'); // adjust path as needed

  // Sons
  son = loadSound('./sound/fire.mp3');
}
// ...existing code...
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

    // try to start background audio as soon as we set up the video
    startBackgroundAudio();
  }

  setupHands();

}
// ...existing code...
function draw() {
  background(0);

  // try again if video wasn't ready earlier (some setups delay video)
  if (!backgroundAudioStarted && typeof isVideoReady === 'function' && isVideoReady()) {
    startBackgroundAudio();
  }



  // new: attempt to start the background audio, fallback to an "Activer le son" button if blocked by browser
  function startBackgroundAudio() {
    if (backgroundAudioStarted) return;
    if (!son) return;

    try {
      son.setLoop(true);
      son.setVolume(0.6);
      const p = son.play(); // p5.sound may not return a promise in all builds
      // mark as started optimistically; if play() throws or is blocked we'll handle in catch below
      backgroundAudioStarted = true;
      // if play() returns a promise, handle rejection (browser autoplay policy)
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          backgroundAudioStarted = false;
          showUnmuteButton();
        });
      }
    } catch (e) {
      backgroundAudioStarted = false;
      showUnmuteButton();
    }
  }

  function showUnmuteButton() {
    if (playButton) return;
    playButton = createButton('Activer le son');
    playButton.position(20, 20);
    playButton.style('z-index', '1000');
    playButton.mousePressed(async () => {
      // unlock audio context
      if (typeof userStartAudio === 'function') {
        await userStartAudio();
      } else if (getAudioContext && getAudioContext().resume) {
        await getAudioContext().resume();
      }
      if (son && !son.isPlaying()) {
        son.setLoop(true);
        son.setVolume(0.6);
        son.play();
      }
      backgroundAudioStarted = true;
      playButton.remove();
      playButton = null;
    })
  }
}