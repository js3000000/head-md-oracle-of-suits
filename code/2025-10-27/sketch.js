function setup() {
  //Resize window to window size
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);

// Un texte au centre de l'écran fixe qui change de couleur quand on passe la souris dessus
  let txt = "Passez la souris ici!";
  let txtWidth = textWidth(txt);
  let txtHeight = textAscent() + textDescent();
  let x = (width - txtWidth) / 2;
  let y = (height + txtHeight) / 2;

  // Vérifier si la souris est sur le texte
  if (mouseX > x && mouseX < x + txtWidth && mouseY > y - txtHeight && mouseY < y) {
    fill(255, 0, 0); // Rouge si la souris est dessus
  } else {
    fill(0); // Noir sinon
  }

}
