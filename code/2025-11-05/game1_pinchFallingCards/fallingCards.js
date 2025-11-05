function fallingCards() {

  // Créer un tableau pour stocker les cartes tombantes
  if (typeof fallingCards.cards === 'undefined') {
    fallingCards.cards = [];
  }

  // Ajouter une nouvelle carte tombante
  const card = {
    x: (random(videoDrawW) + videoDrawX),
    y: -70,
    speed: 3,
  };

  // ajouter un délai pour l'apparition des cartes
  if (frameCount % 20 === 0) {
    fallingCards.cards.push(card);
  }

  // Mettre à jour la position des cartes tombantes
  for (let i = fallingCards.cards.length - 1; i >= 0; --i) {
    const card = fallingCards.cards[i];
    card.y += card.speed;

    // Supprimer la carte si elle sort de l'écran
    if (card.y > height) {
      fallingCards.cards.splice(i, 1);
    }
  }
  // Dessiner les cartes tombantes
  for (const card of fallingCards.cards) {
    stroke(1);
    fill(255, 255, 255);
    rect(card.x, card.y, 50, 70); // Dessiner une carte rouge
    circle(card.x + 25, card.y + 35, 10); // Dessiner un cercle au centre de la carte
  }

  if (detections) {
    const landmarks = detections.multiHandLandmarks;
    if (landmarkSafe(landmarks)) {
      for (let hand of landmarks) {
        // index finger tip coordinates
        const indexTipX = hand[8].x * width;
        const indexTipY = hand[8].y * height;

        // thumb tip coordinates
        const thumbTipX = hand[4].x * width;
        const thumbTipY = hand[4].y * height;


        // check if the index is pinching the thumb
        const d = dist(indexTipX, indexTipY, thumbTipX, thumbTipY);
        if (d < 30) {
          //messageA = "pinching";
          textSize(32);
          fill(255, 0, 0);
          text('Pinching!', indexTipX + 10, indexTipY - 10);


        }
      }
    }
  }




}