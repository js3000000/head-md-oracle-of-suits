// create a class called Planet
class Planet {
  // create an x, y position for the planet
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // create a random color for the planet 
    this.color = color(random(255), random(255), random(255));
  }

  // Class method to draw the planet
  draw() {
    this.x += random(-1, 1);
    this.y += random(-1, 1);

    // fill the planet with its color and draw it as a circle
    fill(this.color);

    noStroke();
    ellipse(this.x, this.y, 50, 50);
  }
}

let planets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(254);
}

function draw() {

  // draw all the planets in the planets array
  for (let planet of planets) {
    planet.draw();
  }
}

// when the mouse is pressed, create a new planet at the mouse position and add it to the planets array
function mousePressed() {
  let newPlanet = new Planet(mouseX, mouseY);
  planets.push(newPlanet);
}