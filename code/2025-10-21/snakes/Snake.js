class Snake {
  constructor(x, y, length, speed) {
    this.segments = [];
    this.speed = speed;
    this.direction = createVector(1, 0); // initial direction to the right
    
    // Initialize segments at the same position
    for (let i = 0; i < length; i++) {
      this.segments.push(createVector(x - i * 20, y)); // spaced horizontally
    }
  }

  update() {
    // Move head forward
    let head = this.segments[0];
    let velocity = p5.Vector.mult(this.direction, this.speed);
    head.add(velocity);

    // Update each segment to follow the previous segment
    for (let i = 1; i < this.segments.length; i++) {
      let prev = this.segments[i - 1];
      let current = this.segments[i];

      // Vector from current to prev
      let dir = p5.Vector.sub(prev, current);
      let dist = dir.mag();

      // Keep segments about 20 pixels apart (segment length)
      if (dist > 20) {
        dir.setMag(dist - 20);
        current.add(dir);
      }
    }
  }

  setDirection(x, y) {
    // Change direction vector, normalize to unit vector
    this.direction.set(x, y);
    this.direction.normalize();
  }

  display() {
    noStroke();
    fill(50, 200, 100);
    for (let seg of this.segments) {
      ellipse(seg.x, seg.y, 5, 5);
    }
  }
}


