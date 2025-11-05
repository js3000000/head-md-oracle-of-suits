function fallingCards() {
  // Créer un tableau pour stocker les cartes tombantes
  if (typeof fallingCards.cards === 'undefined') {
    fallingCards.cards = [];
  }

  // Ajouter une nouvelle carte tombante
  const card = {
    x: random(width),
    y: 0,
    speed: random(2, 5),
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
    fill(255, 0, 0);
    rect(card.x, card.y, 50, 70); // Dessiner une carte rouge
  }
}