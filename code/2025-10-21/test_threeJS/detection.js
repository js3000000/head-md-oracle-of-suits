// wristTracker.js
import { Pose } from 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js';

export async function startWristTracking(videoElement, canvasElement) {
  const ctx = canvasElement.getContext('2d');

  canvasElement.width = videoElement.width || 640;
  canvasElement.height = videoElement.height || 480;

  // Setup MediaPipe Pose
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults(onResults);

  // Handle pose results
  function onResults(results) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvasElement.width, 0);

    if (results.poseLandmarks) {
      const leftWrist = results.poseLandmarks[15];
      if (leftWrist.visibility > 0.5) {
        const x = leftWrist.x * canvasElement.width;
        const y = leftWrist.y * canvasElement.height;

        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'lime';
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Setup webcam stream
  async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: canvasElement.width, height: canvasElement.height, facingMode: 'user' },
      audio: false,
    });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(videoElement);
      };
    });
  }

  await setupCamera();
  videoElement.play();

  async function detectLoop() {
    await pose.send({ image: videoElement });
    requestAnimationFrame(detectLoop);
  }

  detectLoop();
}
