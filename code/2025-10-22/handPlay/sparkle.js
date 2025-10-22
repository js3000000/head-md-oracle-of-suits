class Sparkle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.alpha = 255;
    this.size = random(3, 6);
    this.color = color(random(200, 255), random(200, 255), 255, this.alpha); // light pastel
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.95); // slight friction
    this.alpha -= 5;
    this.size *= 0.98;
  }

  isDead() {
    return this.alpha <= 0;
  }

  show() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}