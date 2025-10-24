let model;
let scene, renderer, camera;
let parts = [];
let font; // p5 font for WEBGL text

// Preload a font so WEBGL text can be drawn without warnings.
// Place a font file at `assets/Roboto-Regular.ttf` or change localPath.
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
  // p5 overlay canvas (transparent) that will draw labels. Three will render behind it.
  const p5canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  // mark the canvas for CSS targeting
  p5canvas.canvas.classList.add('p5-overlay');

  // Initialize Three.js components
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);

  // Append Three renderer to the container behind the p5 canvas
  const container = document.getElementById('three-container') || document.body;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0px';
  renderer.domElement.style.left = '0px';
  renderer.domElement.style.zIndex = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  // Make sure p5 canvas overlays the Three canvas and is transparent
  const canvasEl = p5canvas.canvas;
  canvasEl.style.position = 'absolute';
  canvasEl.style.top = '0px';
  canvasEl.style.left = '0px';
  canvasEl.style.zIndex = '1';
  // keep pointer-events none so mouse will interact with Three if needed
  canvasEl.style.pointerEvents = 'none';

  // Set up camera position
  camera.position.z = 300;

  // Basic lighting so FBX materials are visible
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(3, 10, 10);
  scene.add(dir);

  // Create FBX loader
  const loader = new THREE.FBXLoader();

  // Load your FBX file - replace 'models/your-model.fbx' with your actual model path
  loader.load('models/your-model.fbx', function(object) {
    model = object;
    scene.add(object);

    // Center the model: compute bounding box, subtract center to move model origin to (0,0,0)
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    // move the model so its center is at world origin
    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    // Frame the model with the camera: use bounding sphere radius to place camera
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const radius = sphere.radius || Math.max(box.getSize(new THREE.Vector3()).length() * 0.5, 1);
    // place camera back and a bit up so the model is centered and visible
    camera.position.set(0, radius * 0.9, radius * 2.5);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Extract all parts and rig points
    object.traverse(function(child) {
      if (child.isMesh || child.isBone) {
        parts.push({
          name: child.name || '(no name)',
          type: child.isMesh ? 'Mesh' : 'Bone',
          // store world position; update later if model animates
          position: child.position.clone(),
          object: child
        });
      }
    });

    console.log('Model loaded successfully');
    console.log('Parts found:', parts);
  }, undefined, function(err){
    console.error('FBX load error:', err);
  });
}

function draw() {
  // Clear the p5 canvas so the Three renderer shows through
  clear();

  // Render Three scene
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  // Draw overlay text using p5 on top of the Three canvas
  push();
  if (font) textFont(font);
  textSize(14);
  fill(0);
  // move to top-left
  translate(-width/2 + 10, -height/2 + 20);

  let y = 0;
  text('Model Parts:', 0, y);
  y += 20;

  for (let part of parts) {
    // If the part has a world position (object) keep it updated
    if (part.object) {
      // get world position
      const wp = new THREE.Vector3();
      part.object.getWorldPosition(wp);
      part.position = wp;
    }
    const pos = part.position;
    const line = part.type + ': ' + part.name + ' (' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + pos.z.toFixed(2) + ')';
    text(line, 0, y);
    y += 18;
    if (y > height - 40) break;
  }
  pop();

  // Rotate model slowly for visibility
  if (model) model.rotation.y += 0.01;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (camera) {
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
  }
  if (renderer) {
    renderer.setSize(width, height);
  }

}