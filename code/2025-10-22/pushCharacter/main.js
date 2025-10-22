<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Three.js + MediaPipe Hands Push Cube</title>
  <style>
    body { margin:0; overflow:hidden; }
    video { display:none; } /* hide the raw video */
    canvas { position: absolute; top:0; left:0; }
  </style>
</head>
<body>
  <video id="webcam" autoplay playsinline width="640" height="480"></video>
  <canvas id="three-canvas"></canvas>

  <script type="module">
    import * as THREE from 'https://cdn.skypack.dev/three@0.153.0';
    import * as handPoseDetection from 'https://cdn.skypack.dev/@tensorflow-models/hand-pose-detection';
    import { Camera } from 'https://cdn.skypack.dev/@mediapipe/camera_utils';

    // --- Setup video + hand detector ---
    const video = document.getElementById('webcam');
    const constraints = { video: { width: 640, height: 480, facingMode: 'user' } };
    await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      video.srcObject = stream;
    });
    await new Promise(resolve => video.onloadedmetadata = resolve);

    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
      modelType: 'full'
    };
    const detector = await handPoseDetection.createDetector(model, detectorConfig);

    // --- Setup Three.js ---
    const canvas = document.getElementById('three-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 0, 0);

    // ground plane
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // cube to push
    const cubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0, 0.15, 0); // slightly above ground
    scene.add(cube);

    // lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 2, 3);
    scene.add(light);
    const amb = new THREE.AmbientLight(0x404040);
    scene.add(amb);

    // utility: convert normalized hand x, y to NDC (Normalized Device Coordinates) in Three.js
    function normalizedToNDC(x_norm, y_norm) {
      // x_norm, y_norm are hand model outputs in [0,1], origin top-left
      // convert so that (0,0) → NDC (-1, +1), (1,1) → (+1, -1)
      const x_ndc = x_norm * 2 - 1;
      const y_ndc = -(y_norm * 2 - 1);
      return { x: x_ndc, y: y_ndc };
    }

    // main loop
    async function animate() {
      // detect hands
      const hands = await detector.estimateHands(video, { flipHorizontal: true });
      if (hands.length > 0) {
        const h = hands[0];
        const keypoints = h.keypoints;  // 2D + z info
        // pick index finger tip: name "index_finger_tip"
        const kp = keypoints.find(pt => pt.name === 'index_finger_tip');
        if (kp) {
          // convert to NDC
          const nd = normalizedToNDC(kp.x / video.width, kp.y / video.height);
          // create a ray from camera through that pixel into world
          const vec = new THREE.Vector3(nd.x, nd.y, 0.5);
          vec.unproject(camera);
          const dir = vec.sub(camera.position).normalize();
          const ray = new THREE.Raycaster(camera.position, dir);
          // intersect with the plane (y=0 plane)
          const planeNormal = new THREE.Vector3(0, 1, 0);
          const planePoint = new THREE.Vector3(0, 0, 0);
          const denom = planeNormal.dot(ray.ray.direction);
          if (Math.abs(denom) > 1e-6) {
            const t = planePoint.clone().sub(ray.ray.origin).dot(planeNormal) / denom;
            if (t > 0) {
              const intersect = ray.ray.origin.clone().add(ray.ray.direction.clone().multiplyScalar(t));
              // now intersect is the 3D point on the ground plane beneath finger tip
              // check distance to cube
              const dist = intersect.distanceTo(cube.position);
              const threshold = 0.25;
              if (dist < threshold) {
                // simple push: move cube away slightly in ray direction
                const pushVec = dir.clone().multiplyScalar(0.03);
                cube.position.add(pushVec);
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

  </script>
</body>
</html>
