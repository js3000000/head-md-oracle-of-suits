// Génère une série d'images (image par image) du modèle 3D puis les affiche en boucle
// Placez votre OBJ dans ./assets/Environnement.obj et optionnellement une image ./assets/Robot_test.png

let robotModel;
let frames = [];
let framesReady = false;
let frameIndex = 0;
let playing = true;
const FRAMES_COUNT = 60; // nombre d'images à générer (tour complet)
const CAPTURE_WIDTH = 1200; // résolution de capture (peut réduire pour moins de mémoire)
const CAPTURE_HEIGHT = 800;

// nouvelle variable pour contrôler l'échelle du modèle
let modelScale = 1.0;
let design;
let backgroundImage;
// élément slider DOM
let scaleSlider;

function preload() {
  design = loadFont('Assets/Typo/ABCMaxiRoundEdu-Regular.otf');
  // p5 loadModel dans preload pour que le modèle soit disponible immédiatement en setup
  // Remplacez le chemin si nécessaire
  robotModel = loadModel('assets/Head.obj', true);
  // image optionnelle pour usage (non nécessaire ici)
  backgroundImage = loadImage('assets/Robot_test.jpg');
}

function setup() {
  // canvas 2D principal : nous afficherons les images capturées ici et superposerons le texte via HTML/CSS
  const holder = document.getElementById('sketch-holder');
  const w = windowWidth;
  const h = windowHeight;
  const cnv = createCanvas(w, h);
  cnv.parent('sketch-holder');

  // créer un rendu WEBGL offscreen pour générer les images "image par image"
  // taille de capture configurable (CAPTURE_WIDTH/HEIGHT)
  pg = createGraphics(CAPTURE_WIDTH, CAPTURE_HEIGHT, WEBGL);
  pg.noStroke();

  // UI slider pour redimensionner le modèle
  scaleSlider = createSlider(0.2, 3.0, 1.0, 0.01);
  scaleSlider.parent('sketch-holder');
  scaleSlider.style('position', 'absolute');
  scaleSlider.style('right', '24px');
  scaleSlider.style('bottom', '24px');
  scaleSlider.style('z-index', '20');
  scaleSlider.input(() => {
    modelScale = scaleSlider.value();
    // régénérer les frames avec la nouvelle échelle
    framesReady = false;
    document.getElementById('loading').style.display = 'block';
    // léger délai pour laisser le browser afficher le loading
    setTimeout(() => {
      generateFrames();
      framesReady = true;
      document.getElementById('loading').style.display = 'none';
    }, 50);
  });

  // générer les frames initiales
  generateFrames();

  // masquer indicateur de chargement si prêt
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = framesReady ? 'none' : 'block';

  // smooth default
  noSmooth();
  imageMode(CORNER);

  // clic pour play/pause
  canvas.addEventListener('click', () => { playing = !playing; });

  // option : démarrer au centre de la séquence
  frameIndex = 0;
}

// nouvelle fonction : génère les frames selon modelScale et remplit frames[]
function generateFrames() {
  frames = [];
  // s'assurer que robotModel est chargé
  if (!robotModel) {
    console.warn('robotModel non chargé');
    return;
  }

  for (let i = 0; i < FRAMES_COUNT; i++) {
    pg.push();

    // background (WEBGL a origine au centre)
    if (typeof backgroundImage !== 'undefined' && backgroundImage) {
      pg.push();
      pg.translate(-CAPTURE_WIDTH / 2, -CAPTURE_HEIGHT / 2);
      pg.image(backgroundImage, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
      pg.pop();
    } else {
      pg.background(14);
    }

    // lumières
    pg.ambientLight(160);
    pg.directionalLight(200, 255, 255, -0.5, -3, -0.5);
    pg.pointLight(20, 100, 255, -3000, -2000, 700);

    // appliquer l'échelle choisie
    pg.scale(modelScale);

    // rotation progressive
    const angle = (i / FRAMES_COUNT) * TWO_PI;
    pg.rotateY(angle);

    // dessiner le modèle
    pg.model(robotModel);

    pg.pop();

    // capture image de la scène offscreen
    const img = pg.get();
    frames.push(img);
  }

  framesReady = frames.length === FRAMES_COUNT;
  // cacher le loading si nécessaire
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = framesReady ? 'none' : 'block';
} // fin setup

// DRAW -----------------------------

function draw() {
  // dessiner l'image de fond sur le canvas principal (étirée pour couvrir)
  if (backgroundImage) {
    image(backgroundImage, 0, 0, width, height);
  } else {
    background(11);
  }

  if (!framesReady) {
    // affichage de fallback
    textFont(design);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('Génération des images du modèle…', width / 2, height / 2);
    return;
  }

  // afficher l'image courante en adaptant à la taille de l'écran (cover)
  const img = frames[frameIndex];
  // dessiner en cover : conserver le ratio et couvrir le canvas
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  let drawW = width;
  let drawH = height;
  let dx = 0;
  let dy = 0;
  if (imgRatio > canvasRatio) {
    // image plus large -> ajuster largeur
    drawH = height;
    drawW = imgRatio * drawH;
    dx = (width - drawW) / 2;
  } else {
    drawW = width;
    drawH = drawW / imgRatio;
    dy = (height - drawH) / 2;
  }
  image(img, dx, dy, drawW, drawH);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}