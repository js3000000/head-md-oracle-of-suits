// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

let scene, camera, renderer, controls;
let model = null;
let trackedWristPosition = null;

init();
loadFBX();
animate();

function init() {
  // Scene setup
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 2.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 2, 3);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  setupMediaPipe();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function loadFBX() {
  const loader = new FBXLoader();
  loader.load('models/puppet.fbx', (fbx) => {
    model = fbx;
    model.scale.set(0.01, 0.01, 0.01); // Adjust scale if needed
    scene.add(model);
  });
}

// === Function: Get wrist position as THREE.Vector3 ===
function getWristPosition(results, width, height) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return null;
  }

  const wrist = results.multiHandLandmarks[0][0]; // Wrist landmark
  const aspect = width / height;

  const x = -((wrist.x - 0.5) * 2 * aspect); // Invert X
  const y = -(wrist.y - 0.5) * 2;
  const z = (wrist.z - 0.5) * 2; // Z is optional

  return new THREE.Vector3(x, y, z);
}

// === Setup MediaPipe Hands ===
function setupMediaPipe() {
  const videoElement = document.createElement('video');
  videoElement.style.display = 'none';
  document.body.appendChild(videoElement);

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults((results) => {
    const pos = getWristPosition(results, window.innerWidth, window.innerHeight);
    if (pos) trackedWristPosition = pos;
  });

  const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  cameraUtils.start();
}

// === Main animation loop ===
function animate() {
  requestAnimationFrame(animate);

  if (model && trackedWristPosition) {
    // Smoothly move character to wrist position
    model.position.lerp(trackedWristPosition, 0.2);
  }

  controls.update();
  renderer.render(scene, camera);
}