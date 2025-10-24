let model;
let scene, renderer, camera;
let parts = [];
let font; // p5 font for WEBGL text

// Physics properties
let lastTime = 0;
const gravity = new THREE.Vector3(0, -9.8, 0);
// Simple global physics state (fallback)
let velocity = new THREE.Vector3(0, 0, 0);
let isOnGround = false;

// Ragdoll physics
class PhysicsPoint {
  constructor(mesh, mass = 1.0, isFixed = false) {
    this.mesh = mesh;
    this.position = mesh.position.clone();
    this.lastPosition = this.position.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.mass = mass;
    this.isFixed = isFixed;
  }

  update(deltaTime) {
    if (this.isFixed) return;

    // Verlet integration
    const temp = this.position.clone();
    const acceleration = gravity.clone();
    const timeSquared = deltaTime * deltaTime;

    this.position.add(
      this.position.clone()
        .sub(this.lastPosition)
        .multiplyScalar(0.99) // damping
        .add(acceleration.multiplyScalar(timeSquared))
    );

    this.lastPosition.copy(temp);

    // Floor collision
    if (this.position.y < -200) {
      this.position.y = -200;
      const dampening = 0.5;
      this.velocity.y *= -dampening;
    }

    // Update mesh position
    this.mesh.position.copy(this.position);
  }
}

class DistanceConstraint {
  constructor(pointA, pointB, distance) {
    this.pointA = pointA;
    this.pointB = pointB;
    this.distance = distance;
  }

  solve() {
    const direction = this.pointB.position.clone().sub(this.pointA.position);
    const currentDistance = direction.length();
    const correction = direction.normalize().multiplyScalar(currentDistance - this.distance);
    
    if (!this.pointA.isFixed) {
      this.pointA.position.add(correction.multiplyScalar(0.5));
    }
    if (!this.pointB.isFixed) {
      this.pointB.position.sub(correction.multiplyScalar(0.5));
    }
  }
}

let physicsPoints = [];
let constraints = [];

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

async function setup() {
  try {
    // Initialize MediaPipe
    await initializeMediaPipe().catch(console.error);

    // Check for WebGL support
    if (!window.WebGLRenderingContext) {
      throw new Error('WebGL is not supported by your browser');
    }

    // Create p5 canvas first
    const p5canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    p5canvas.canvas.classList.add('p5-overlay');

    // Initialize Three.js with error handling
    scene = new THREE.Scene();
    
    // Create camera with safe defaults
    camera = new THREE.PerspectiveCamera(
      75, // field of view
      window.innerWidth / window.innerHeight, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );

    // Try to create renderer with fallback options
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: document.createElement('canvas'),
        precision: 'mediump',
        powerPreference: 'default'
      });
    } catch (e) {
      console.error('Failed to create WebGL renderer:', e);
      // Try again without antialias
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'default'
      });
    }

    // Set renderer properties
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    renderer.setSize(windowWidth, windowHeight);

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
    canvasEl.style.pointerEvents = 'none';

    // Set up camera position
    camera.position.z = 300;

  } catch (error) {
    console.error('Error during setup:', error);
    alert('Failed to initialize 3D graphics. Please check if your browser supports WebGL and try again.');
    noLoop();
    return;
  }

  // Basic lighting so FBX materials are visible
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(3, 10, 10);
  scene.add(dir);

  // Add floor
  const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    side: THREE.DoubleSide
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -200;
  scene.add(floor);

  // Initialize lastTime for physics timing
  lastTime = millis();

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
    // move the model so its center is at world origin and lifted up
    object.position.x -= center.x;
    object.position.y = 200;  // Start from height 200
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

// Helper function to check if Three.js is properly initialized
function isThreeJsReady() {
  return renderer && scene && camera && renderer.getContext();
}

function draw() {
  try {
    // Clear the p5 canvas so the Three renderer shows through
    clear();

    // Check if Three.js is properly initialized
    if (!isThreeJsReady()) {
      console.warn('Three.js not fully initialized yet');
      return;
    }

    // Render Three scene
    renderer.render(scene, camera);

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

    // Apply physics to model
    if (model) {
      const currentTime = millis();
      const deltaTimeInSeconds = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Apply gravity
      if (!isOnGround) {
        velocity.add(gravity.clone().multiplyScalar(deltaTimeInSeconds));
        const movement = velocity.clone().multiplyScalar(deltaTimeInSeconds);
        model.position.add(movement);
      }

      // Check for floor collision
      if (model.position.y < -200) {  // Floor is at y = -200
        model.position.y = -200;
        velocity.y = 0;
        isOnGround = true;
      }

      // Rotate model slowly for visibility
      model.rotation.y += 0.01;
    }
  } catch (error) {
    console.error('Error in draw:', error);
  }
}

function windowResized() {
  try {
    resizeCanvas(windowWidth, windowHeight);
    if (camera) {
      camera.aspect = windowWidth/windowHeight;
      camera.updateProjectionMatrix();
    }
    if (renderer && isThreeJsReady()) {
      renderer.setSize(windowWidth, windowHeight);
    }
  } catch (error) {
    console.error('Error in window resize:', error);
  }
}