import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { FBXLoader } from 'FBXLoader';

let scene, camera, renderer, controls;
let model, rightArmBone;

let video, handsDetector;
let latestFingertipY = null;
let fingertipScreenPos = null;

let overlayCanvas, overlayCtx;

init();
loadFBX();
setupMediaPipeHands();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 150, 300);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 200, 100);
  scene.add(dirLight);

  // Create overlay 2D canvas for fingertip circle
  overlayCanvas = document.createElement('canvas');
  overlayCanvas.style.position = 'fixed';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.pointerEvents = 'none';
  overlayCanvas.width = window.innerWidth;
  overlayCanvas.height = window.innerHeight;
  document.body.appendChild(overlayCanvas);

  overlayCtx = overlayCanvas.getContext('2d');

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;
  });
}

function loadFBX() {
  const loader = new FBXLoader();
  loader.load(
    'models/your-model.fbx', // replace with your FBX file path
    (object) => {
      object.scale.set(0.1, 0.1, 0.1);
      scene.add(object);
      model = object;

      // Try common right arm bone names; adjust for your model if needed
      rightArmBone = model.getObjectByName('RightArm') 
                  || model.getObjectByName('upper_arm.R') 
                  || model.getObjectByName('Arm.R');

      if (!rightArmBone) {
        console.warn('Right arm bone not found. Check your model’s bone names.');
      }
    },
    undefined,
    (error) => {
      console.error('Error loading FBX:', error);
    }
  );
}

function setupMediaPipeHands() {
  video = document.createElement('video');
  video.style.display = 'none';
  document.body.appendChild(video);

  handsDetector = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  handsDetector.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  handsDetector.onResults(onResults);

  const cameraFeed = new Camera(video, {
    onFrame: async () => {
      await handsDetector.send({ image: video });
    },
    width: 640,
    height: 480
  });
  cameraFeed.start();
}

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const indexTip = results.multiHandLandmarks[0][8];
    latestFingertipY = indexTip.y;

    // Map normalized coords to window pixels
    fingertipScreenPos = {
      x: indexTip.x * window.innerWidth,
      y: indexTip.y * window.innerHeight
    };
  } else {
    latestFingertipY = null;
    fingertipScreenPos = null;
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Clear overlay canvas and draw fingertip circle
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (fingertipScreenPos) {
    overlayCtx.beginPath();
    overlayCtx.arc(fingertipScreenPos.x, fingertipScreenPos.y, 15, 0, 2 * Math.PI);
    overlayCtx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    overlayCtx.fill();
  }

  // Animate right arm bone rotation based on fingertip Y
  if (rightArmBone && latestFingertipY !== null) {
    const minAngle = -Math.PI / 4;
    const maxAngle = Math.PI / 4;
    const angle = minAngle + (1 - latestFingertipY) * (maxAngle - minAngle);
    rightArmBone.rotation.x = angle;
  }

  controls.update();
  renderer.render(scene, camera);
}