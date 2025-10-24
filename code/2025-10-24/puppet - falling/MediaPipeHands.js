// MediaPipe Hands initialization
// MediaPipe Hands initialization
let hands;
let handCamera;  // Renamed from 'camera' to avoid conflict
let videoElement;
// Allow toggling hand control so gravity isn't overridden unintentionally
window.handControlEnabled = window.handControlEnabled || false;

async function initializeMediaPipe() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);

    handCamera = new Camera(videoElement, {
        onFrame: async () => {
            try {
                await hands.send({image: videoElement});
            } catch (error) {
                console.warn('Hand detection error:', error);
            }
        },
        width: 640,
        height: 480
    });

    try {
        await handCamera.start();
        console.log('Camera started successfully');
    } catch (error) {
        console.error('Camera start error:', error);
    }
}

function onResults(results) {
    // Only control the model with hands if explicitly enabled
    if (window.handControlEnabled && results.multiHandLandmarks && window.model) {
        for (const landmarks of results.multiHandLandmarks) {
            // You can use the landmarks here to control your puppet
            // Each landmark has x, y, z coordinates
            if (landmarks.length > 0) {
                // Example: Use the palm position (landmark 0) to control puppet position
                const palm = landmarks[0];
                // Map hand position to model position
                window.model.position.x = (palm.x - 0.5) * 400;
                window.model.position.y = (0.5 - palm.y) * 400;
            }
        }
    }
}