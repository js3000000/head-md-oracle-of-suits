function fallingCards() {
  // Créer un tableau pour stocker les cartes tombantes
  if (typeof fallingCards.cards === 'undefined') {
    fallingCards.cards = [];
  }

  // Ajouter une nouvelle carte tombante
  const card = {
    x: (random(videoDrawW) + videoDrawX),
    y: -70,
    speed: 2,
  };
  fallingCards.cards.push(card);

  // Mettre à jour la position des cartes tombantes
  for (let i = fallingCards.cards.length - 1; i >= 0; i--) {
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
}