// fonction qui test si deux index se touchent
const THRESHOLD = 0.027;  // seuil en coordonnées normalisées (ajuster si besoin)

function checkDistanceIndex(hands) {


    if (!hands) return false;

    // hands peut être multiHandLandmarks (array de mains) ou un seul tableau de 21 landmarks.
    // Si on a au moins deux mains, utiliser la 1ère et la 2ème.
    if (Array.isArray(hands) && hands.length >= 2 && Array.isArray(hands[0])) {
        const index1 = hands[0][FINGER_TIPS.index];
        const index2 = hands[1][FINGER_TIPS.index];
        if (!index1 || !index2) return false;
        // distance en coordonnées normalisées (x,y)
        const dx = index1.x - index2.x;
        const dy = index1.y - index2.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        console.log("Distance between index fingers (normalized): " + d);
        return d < THRESHOLD;
    }

    // pas assez de mains détectées -> false
    return false;
}

// fonction qui test si deux pouces se touchent
function checkDistanceThumb(hands) {
    
    if (!hands) return false;
    if (Array.isArray(hands) && hands.length >= 2 && Array.isArray(hands[0])) {
        const thumb1 = hands[0][FINGER_TIPS.thumb];
        const thumb2 = hands[1][FINGER_TIPS.thumb];
        if (!thumb1 || !thumb2) return false;
        const dx = thumb1.x - thumb2.x;
        const dy = thumb1.y - thumb2.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < THRESHOLD;
    }
    return false;
}

function checkDistanceFingers(hands) {
    return checkDistanceIndex(hands) && checkDistanceThumb(hands);
}

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