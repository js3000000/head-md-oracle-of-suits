function checkDistanceIndexThumb(hands) {
    // renvoie un tableau d'objets { hand, pinching, distance, index, thumb }
    const results = [];

    const handList = Array.isArray(hands) ? hands
        : (detections && detections.multiHandLandmarks) ? detections.multiHandLandmarks
        : null;

    if (!handList) return results;

    const THRESHOLD_PX = 30; // seuil en pixels (ajuster si besoin)

    for (let i = 0; i < handList.length; ++i) {
        const hand = handList[i];
        const indexTip = hand[FINGER_TIPS.index];
        const thumbTip = hand[FINGER_TIPS.thumb];

        if (!indexTip || !thumbTip) {
            results.push({ hand: i, pinching: false });
            continue;
        }

        // convertir coordonnées normalisées en coordonnées de canvas (zone vidéo dessinée)
        const ix = indexTip.x * videoDrawW + videoDrawX;
        const iy = indexTip.y * videoDrawH + videoDrawY;
        const tx = thumbTip.x * videoDrawW + videoDrawX;
        const ty = thumbTip.y * videoDrawH + videoDrawY;

        const d = dist(ix, iy, tx, ty);
        const pinching = d < THRESHOLD_PX;

        // remove expensive immediate drawing (enable only for debug)
        if (pinching && typeof window !== 'undefined' && window.DEBUG_PINCH_DRAW) {
            textSize(32);
            fill(255, 0, 0);
            text('Pinching!', ix + 10, iy - 10);
        }
        
        results.push({
            hand: i,
            pinching,
            distance: d,
            index: { x: ix, y: iy },
            thumb: { x: tx, y: ty }
        });
    }

    return results;
}

function pinchingPositions(hands) {
    const pinches = checkDistanceIndexThumb(hands);
    const positions = [];

    for (const pinch of pinches) {
        if (pinch.pinching) {
            positions.push({
                //hand: pinch.hand,
                index: pinch.index,
                thumb: pinch.thumb
            });
        }
    }

    return positions;
}