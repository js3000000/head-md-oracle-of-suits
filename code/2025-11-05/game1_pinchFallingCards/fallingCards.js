function fallingCards() {

  // Créer un tableau pour stocker les cartes tombantes
  if (typeof fallingCards.cards === 'undefined') {
    fallingCards.cards = [];
  }
  const MAX_CARDS = 30; // limite le nombre de cartes actives

  // ajouter un délai pour l'apparition des cartes (créer la carte seulement si on la spawn)
  if (frameCount % 20 === 0 && fallingCards.cards.length < MAX_CARDS) {
    const card = {
      x: (random(videoDrawW) + videoDrawX),
      y: -70,
      speed: 3,
    };
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
    // checkDistanceIndexThumb retourne un tableau d'objets par main
    const pinchResults = checkDistanceIndexThumb(detections.multiHandLandmarks);

    if (Array.isArray(pinchResults) && pinchResults.length > 0) {
      // construire la liste des points de pinch (milieu index/pouce) — les coordonnées
      // dans checkDistanceIndexThumb() sont déjà converties en coordonnées de dessin
      const pinchPoints = [];
      for (const p of pinchResults) {
        if (p && p.pinching && p.index && p.thumb) {
          const px = (p.index.x + p.thumb.x) / 2;
          const py = (p.index.y + p.thumb.y) / 2;
          pinchPoints.push({ x: px, y: py });
        }
      }

      if (pinchPoints.length > 0) {
        // supprimer les cartes proches de n'importe quel pinch
        const REMOVE_RADIUS = 50;
        for (let i = fallingCards.cards.length - 1; i >= 0; --i) {
          const card = fallingCards.cards[i];
          const cx = card.x + 25;
          const cy = card.y + 35;
          let removed = false;
          for (const pp of pinchPoints) {
            const d = dist(cx, cy, pp.x, pp.y);
            if (d < REMOVE_RADIUS) {
              fallingCards.cards.splice(i, 1);
              removed = true;
              break;
            }
          }
          // si déjà retirée, continuer la boucle (l'index est déjà décrémenté)
          if (removed) continue;
        }
      }
    }
  }
}