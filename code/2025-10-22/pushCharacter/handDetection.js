class HandDetector {
  constructor() {
    this.handData = null;
    this.video = createCapture(VIDEO);
    this.video.size(640, 480);
    this.video.hide();

    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults(this.onResults.bind(this));

    this.camera = new Camera(this.video.elt, {
      onFrame: async () => {
        await this.hands.send({ image: this.video.elt });
      },
      width: 640,
      height: 480,
    });
  }

  start() {
    this.camera.start();
  }

  onResults(results) {
    this.handData = results.multiHandLandmarks?.[0] || null;
  }

  update() {
    // Optionally draw landmarks or debug here
  }
}
