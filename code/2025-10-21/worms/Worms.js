// a constant COLOR for the color function
const COLOR = '#3498db'; 


class Worm {
   
  // Constructor to initialize worm properties  
  constructor(x, y, angle, length, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = length;
    this.speed = speed;
    this.defaultColor = color(COLOR);
    this.collisionColor = color(255, 0, 0); // Red when colliding
    this.colliding = false;
  }

  

  // Update worm position based on its speed and angle
  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
  }

  // Display the worm on the canvas
  display() {

    let x2 = this.x + cos(this.angle) * this.length;
    let y2 = this.y + sin(this.angle) * this.length;

    stroke(this.colliding ? this.collisionColor : this.defaultColor);
    strokeWeight(3);
    line(this.x, this.y, x2, y2);
  }


  getLineCoords() {
    let x1 = this.x;
    let y1 = this.y;
    
    let x2 = this.x + cos(this.angle) * this.length;
    let y2 = this.y + sin(this.angle) * this.length;
    return [x1, y1, x2, y2];
  }

  intersects(other) {
    let [x1, y1, x2, y2] = this.getLineCoords();
    let [x3, y3, x4, y4] = other.getLineCoords();
    return lineIntersects(x1, y1, x2, y2, x3, y3, x4, y4);
  }


  // Reverse the worm's direction and change speed
  reverseDirection() {
    this.angle += PI; // Reverse direction by 180 degrees
    this.speed = this.speed * 1,2;

  }
}

// Line segment intersection check
function lineIntersects(x1, y1, x2, y2, x3, y3, x4, y4) {
  let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den === 0) return false;

  let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
