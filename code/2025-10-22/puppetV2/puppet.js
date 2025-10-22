
// --- Setup MediaPipe Hands to track wrist ---
function setupMediaPipe(){
  const videoElement = document.createElement('video');
  videoElement.style.display = 'none';
  document.body.appendChild(videoElement);

  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(onResults);

  const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
  });
  cameraUtils.start();
}

// Callback for MediaPipe results:
function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const wrist = landmarks[0];

    const aspect = window.innerWidth / window.innerHeight;
    // Invert X if you want mirrored:
    const x3 = -((wrist.x - 0.5) * 2 * aspect);
    const y3 = -(wrist.y - 0.5) * 2;
    const z3 = (wrist.z - 0.5) * 2;  // optional use

    trackedWristPosition = new THREE.Vector3(x3, y3, z3);
  } else {
    trackedWristPosition = null;
  }
}

// --- Animate loop ---
function animate() {
  requestAnimationFrame( animate );

  if (wristBone && trackedWristPosition) {
    // Map the tracked position into the model's local space:
    const localPos = wristBone.parent.worldToLocal(trackedWristPosition.clone());
    wristBone.position.lerp(localPos, 0.2);
  }

  controls.update();
  renderer.render( scene, camera );
}
