// fonction qui test si deux index se touchent
const THRESHOLD = 0.03;  // seuil en coordonnées normalisées (ajuster si besoin)

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