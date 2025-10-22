let camera, scene, renderer;
let spheres = [];
let gravity = 0.01;
let fallingSpheres = [];

const video = document.getElementById('video');

// THREE.js setup
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({ alpha: true }); // transparent canvas
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 2).normalize();
scene.add(light);

// Sphere material
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Create spheres
function createSphere() {
  const geometry = new THREE.SphereGeometry(0,5, 100, 100);
  const sphere = new THREE.Mesh(geometry, sphereMaterial);
  scene.add(sphere);
  return sphere;
}

// Initialize spheres
for (let i = 0; i < 3; i++) {
  const sphere = createSphere();
  spheres.push({ mesh: sphere, offset: i * 0.15 - 0.15 });
}

camera.position.z = 4;

// Hand landmark point visualization
const landmarkMaterial = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.01 });
let landmarkPoints = new THREE.Points(new THREE.BufferGeometry(), landmarkMaterial);
scene.add(landmarkPoints);

// Hand detection
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.8
});

hands.onResults(onResults);

// Camera setup using MediaPipe helper
const mediapipeCamera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});
mediapipeCamera.start();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update falling spheres
  for (let sphere of fallingSpheres) {
    sphere.mesh.position.y -= gravity;
  }

  renderer.render(scene, camera);
}
animate();

// Convert landmark from normalized [0-1] to 3D space [-0.5, 0.5]
function to3D(lm) {
  const scale = 2.5; // ⬅️ Increase this value to make the hand larger
  return new THREE.Vector3(
    (lm.x - 0.5) * scale,
    -(lm.y - 0.5) * scale,
    -lm.z * scale
  );
}
let jointMeshes = [];

f

function drawHandJoints(landmarks) {
  // Create meshes if not yet created
  if (jointMeshes.length === 0) {
    const geometry = new THREE.SphereGeometry(0.015, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    for (let i = 0; i < landmarks.length; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      jointMeshes.push(mesh);
    }
  }

  // Update mesh positions with consistent scale and coordinates
  for (let i = 0; i < landmarks.length; i++) {
    const pos = to3D(landmarks[i]);
    jointMeshes[i].position.copy(pos);
  }
}

// Handling hand detection results
function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

  const landmarks = results.multiHandLandmarks[0];

  drawHandJoints(landmarks);

  // Update landmark points for visualization
  const positions = new Float32Array(landmarks.length * 3);
  for (let i = 0; i < landmarks.length; i++) {
    const v = to3D(landmarks[i]);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }

  landmarkPoints.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  landmarkPoints.geometry.attributes.position.needsUpdate = true;

  // Use wrist and palm center to define the hand direction vector
  const wrist = to3D(landmarks[0]);
  const center = to3D(landmarks[9]);
  const direction = new THREE.Vector3().subVectors(center, wrist).normalize();

  // Attach spheres along the hand direction at their offset positions
  for (let sphere of spheres) {
    if (sphere.falling) {
      // Sphere is falling, apply gravity
      sphere.mesh.position.y -= gravity;
      continue;
    }

    // Calculate the target position on the hand line
    const targetPos = wrist.clone().add(direction.clone().multiplyScalar(sphere.offset));
    sphere.mesh.position.copy(targetPos);

    // Check if sphere is still "on" the hand (within some threshold)
    const distFromWrist = sphere.offset;
    if (distFromWrist > 0.3 || distFromWrist < -0.3) {
      sphere.falling = true;
      fallingSpheres.push(sphere);
    } else {
      // Slowly move the offset forward so spheres move along the hand
      sphere.offset += 0.002;
    }
  }
}

// Animation loop update for falling spheres
function animate() {
  requestAnimationFrame(animate);

  // Update falling spheres (gravity applied already in onResults, but can keep here)
  for (let sphere of fallingSpheres) {
    sphere.mesh.position.y -= gravity;
  }

  renderer.render(scene, camera);
}
animate();
