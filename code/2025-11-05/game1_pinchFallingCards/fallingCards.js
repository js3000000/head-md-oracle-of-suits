function fallingCards() {

  // Créer un tableau pour stocker les cartes tombantes
  if (typeof fallingCards.cards === 'undefined') {
    fallingCards.cards = [];
  }
  // configurable limits (set window.MAX_CARDS from console to tune)
  const MAX_CARDS = (typeof window !== 'undefined' && window.MAX_CARDS) ? window.MAX_CARDS : 20; // limite le nombre de cartes actives

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
  // Dessiner les cartes tombantes (minimise changements d'état de style)
  stroke(1);
  fill(255, 255, 255);
  for (const card of fallingCards.cards) {
    rect(card.x, card.y, 50, 70);
    circle(card.x + 25, card.y + 35, 10);
  }

  if (detections) {
    // throttle processing pour réduire la charge quand il y a des mains
    if (typeof fallingCards._lastPinchProcessMs === 'undefined') fallingCards._lastPinchProcessMs = 0;
  const PINCH_PROCESS_INTERVAL_MS = (typeof window !== 'undefined' && window.PINCH_PROCESS_INTERVAL_MS) ? window.PINCH_PROCESS_INTERVAL_MS : 120; // ms, default 120ms ≈ 8.3Hz
    const now = millis();
    if (now - fallingCards._lastPinchProcessMs >= PINCH_PROCESS_INTERVAL_MS) {
      fallingCards._lastPinchProcessMs = now;

      // checkDistanceIndexThumb retourne un tableau d'objets par main
      const pinchResults = checkDistanceIndexThumb(detections.multiHandLandmarks);

      if (Array.isArray(pinchResults) && pinchResults.length > 0) {
        // réutiliser tableau pour éviter allocations répétées
        const pinchPoints = fallingCards._pinchPoints || (fallingCards._pinchPoints = []);
        pinchPoints.length = 0;
        for (const p of pinchResults) {
          if (p && p.pinching && p.index && p.thumb) {
            const px = (p.index.x + p.thumb.x) / 2;
            const py = (p.index.y + p.thumb.y) / 2;
            pinchPoints.push({ x: px, y: py });
          }
        }

        if (pinchPoints.length > 0) {
          const REMOVE_RADIUS = 50;
          const rr = REMOVE_RADIUS * REMOVE_RADIUS; // use squared distance to avoid sqrt
          // collecter index à supprimer pour minimiser les splice/GC
          const toRemove = new Set();
          for (let i = 0; i < fallingCards.cards.length; ++i) {
            const card = fallingCards.cards[i];
            const cx = card.x + 25;
            const cy = card.y + 35;
            for (const pp of pinchPoints) {
              const dx = cx - pp.x;
              const dy = cy - pp.y;
              if ((dx * dx + dy * dy) < rr) {
                toRemove.add(i);
                break;
              }
            }
          }

          if (toRemove.size > 0) {
            // reconstruire le tableau sans les éléments supprimés (une seule allocation)
            fallingCards.cards = fallingCards.cards.filter((_, idx) => !toRemove.has(idx));
          }
        }
      }
    }
  }
}