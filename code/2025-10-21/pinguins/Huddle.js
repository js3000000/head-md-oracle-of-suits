class Huddle {
  constructor(n) {
    this.penguins = [];
    this.n = n;

    // Place penguins randomly, but no overlapping
    let attempts = 0;
    while (this.penguins.length < n && attempts < n * 100) {
      let x = random(width);
      let y = random(height);
      let size = random(15, 30);
      let newPenguin = new Penguin(x, y, size);

      // Check overlap with existing penguins
      let overlapping = false;
      for (let p of this.penguins) {
        if (newPenguin.isOverlapping(p)) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        this.penguins.push(newPenguin);
      }
      attempts++;
    }
  }
  
  display() {
    for (let p of this.penguins) {
      p.display();
    }
  }
  
  update(mouseX, mouseY) {
    for (let p of this.penguins) {
      p.moveTowards(mouseX, mouseY, 100, 2, this.penguins);
    }
  }
}
