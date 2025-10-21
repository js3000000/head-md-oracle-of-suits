class Penguin {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.size = size;
    this.boxSize = size; // square box around the triangle for simplicity
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    triangle(50, 5, 5, 5);
    pop();

    // Optional: draw bounding box for debugging
    // noFill();
    // stroke(255, 0, 0);
    // rect(this.pos.x - this.boxSize / 2, this.pos.y - this.boxSize / 2, this.boxSize, this.boxSize);
    // noStroke();
  }
  
  getBoundingBox() {
    return {
      left: this.pos.x - this.boxSize / 2,
      right: this.pos.x + this.boxSize / 2,
      top: this.pos.y - this.boxSize / 2,
      bottom: this.pos.y + this.boxSize / 2
    };
  }
  
  // Check if this penguin's bounding box overlaps with another's
  isOverlapping(other) {
    let a = this.getBoundingBox();
    let b = other.getBoundingBox();

    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }
  
  // Attempt to move towards target, but only if no collision after move
  moveTowards(targetX, targetY, maxDistance, speed, others) {
    let target = createVector(targetX, targetY);
    let dir = p5.Vector.sub(target, this.pos);
    let d = dir.mag();

    if (d < maxDistance) {
      dir.setMag(speed);
      let newPos = p5.Vector.add(this.pos, dir);

      // Create temporary penguin at new position to check collisions
      let tempPenguin = new Penguin(newPos.x, newPos.y, this.size);

      // Check collisions with all others
      for (let other of others) {
        if (other !== this && tempPenguin.isOverlapping(other)) {
          // Collision detected, don't move
          return;
        }
      }
      // No collision, apply move
      this.pos = newPos;
    }
  }
}
