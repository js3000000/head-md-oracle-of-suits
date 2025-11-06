function onboarding(detections) {

    // afficher image
    //image(backgroundImage, 0, 0, width, height);

    // --- robot au centre : isoler ses transformations
    push();                 // sauvegarde matrice courante (top-left)
    translate(width / 2, height / 2 + 50, 0);
    //scale( /* ...si besoin...*/ );
    //model(robotModel);
    pop();                  // restaure la matrice (=> plus d'effet sur la suite)

    // --- drawIndex : ici on est de retour à l'origine attendue
    if (
        detections &&
        detections.multiHandLandmarks &&
        detections.multiHandLandmarks.length > 0
    ) {
        // drawIndex suppose des coordonnées en top-left / vidéo ; ok maintenant

        if (checkDistanceFingers(detections.multiHandLandmarks)) {
            portalActivated = true;
            drawIndex(detections.multiHandLandmarks[0]);
            portalActivation(detections.multiHandLandmarks);
        }
    }
}