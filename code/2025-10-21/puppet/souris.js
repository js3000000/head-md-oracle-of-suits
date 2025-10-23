import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { FBXLoader } from 'FBXLoader';

let scene, camera, renderer, controls;
let model, rightArmBone;
let mouseYNorm = 0.5; // Mouse Y position normalized (0 = top, 1 = bottom)

init();
loadFBX();
animate();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 150, 300);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 200, 100);
  scene.add(dirLight);

  // Mouse movement listener
  window.addEventListener('mousemove', (event) => {
    mouseYNorm = event.clientY / window.innerHeight;
  });

  // Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function loadFBX() {
  const loader = new FBXLoader();
  loader.load(
    'models/puppetA.fbx', // Replace with your model path
    (object) => {
      object.scale.set(1, 1, 1); // Adjust scale as needed
      scene.add(object);
      model = object;

      // Find the right arm bone — adjust name for your model
      rightArmBone =
        model.getObjectByName('RightArm') ||
        model.getObjectByName('upper_arm.R') ||
        model.getObjectByName('mixamorigRightArm') ||
        model.getObjectByName('Arm.R');

      if (!rightArmBone) {
        console.warn('Right arm bone not found. Check your FBX bone names.');
        // To debug, you can log bone names:
        model.traverse((child) => {
          if (child.isBone) console.log('Bone:', child.name);
        });
      }
    },
    undefined,
    (error) => {
      console.error('Error loading FBX model:', error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate the arm based on mouse Y
  if (rightArmBone) {
    const minAngle = -Math.PI / 4;
    const maxAngle = Math.PI / 4;
    const angle = minAngle + (1 - mouseYNorm) * (maxAngle - minAngle);
    rightArmBone.rotation.x = angle;
  }

  controls.update();
  renderer.render(scene, camera);
}