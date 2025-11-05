/* function checkDistanceIndexThumb(x1, y1, x2, y2) {
     // check if the index is pinching the thumb
        const d = dist(x1, y1, x2, y2);
        if (d < 30) {
          //messageA = "pinching";
          textSize(32);
          fill(255, 0, 0);
          text('Pinching!', x1 + 10, y1 - 10);
          return true;
        }
        return false;
}
 */

// fonction qui test si deux index se touchent
/* function checkDistanceIndexThumb(hands) {
    const THRESHOLD = 0.1; // seuil en coordonnées normalisées (ajuster si besoin)

    if (!hands) return false;

    // hands peut être multiHandLandmarks (array de mains) ou un seul tableau de 21 landmarks.
    // Si on a au moins deux mains, utiliser la 1ère et la 2ème.
    if (Array.isArray(hands) && hands.length >= 2 && Array.isArray(hands[0])) {
        const index1 = hands[0][FINGER_TIPS.index];
        if (!index1 || !index2) return false;

        const thumb1 = hands[0][FINGER_TIPS.thumb];
        if (!thumb1 || !thumb2) return false;

        // distance entre index1 et pouce1 en coordonnées normalisées (x,y)
        const dx1 = index1.x - thumb1.x;
 
        return d < THRESHOLD;
    }

    // pas assez de mains détectées -> false
    return false;
} */

function checkDistanceIndexThumb(hands) {
    if (detections) {
        for (let hand of detections.multiHandLandmarks) {
            let indexTip = hand[FINGER_TIPS.index];
            let thumbTip = hand[FINGER_TIPS.thumb];

            // calculate distance between index and thumb tips
            let d = dist(indexTip.x * videoElement.width, indexTip.y * videoElement.height,
                thumbTip.x * videoElement.width, thumbTip.y * videoElement.height);

            // if distance is small enough, consider it a pinch
            if (d < 60) {
                // messageA = "pinching";
                textSize(32);
                fill(255, 0, 0);
                text('Pinching!', indexTip.x * width + 10, indexTip.y * height - 10);
                return true;
            }
        }
    }
    
    return false;
}