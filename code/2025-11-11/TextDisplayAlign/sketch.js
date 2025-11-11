function preload() {
  const localPath = 'assets/night-ghost/Night Ghost.ttf';
  const remoteRoboto = 'https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxP.ttf';

  // Try local first, fall back to remote Roboto if that fails (avoids parsing HTML 404 as font).
  font = loadFont(localPath, () => {
    console.log('Loaded local font:', localPath);
  }, () => {
    console.warn('Local font failed to load, falling back to remote Roboto.');
    font = loadFont(remoteRoboto, () => console.log('Loaded remote Roboto font'), (e) => console.error('Remote font failed', e));
  });
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textAlign(CENTER, CENTER); // centrer le texte
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  background(200);

  // --- Dessin de l'objet 3D ---
  push();
  // objet placé plus loin dans la scène
  translate(0, 0, -500);
  rotateY(frameCount * 0.01);
  normalMaterial();
  box(100);
  pop();

   // Draw overlay text using p5 on top of the Three canvas
  push();
  if (font) textFont(font);
  textSize(14);
  fill(0);
  // move to top-left
  //translate(-width/2 + 10, -height/2 + 20);

  text('Model Parts:', 0, 0);


  pop();
}
