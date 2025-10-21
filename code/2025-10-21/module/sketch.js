let worms = [];

function setup() {
  createCanvas(800, 600);
  osc = new p5.Oscillator('sine');
  osc.freq(440);     // frequency in Hz (A4 note)
  osc.amp(0);        // start silent
  osc.start();
}


function playBeep() {
  playing = true;
  osc.amp(0.5, 0.05);        // fade in quickly
  setTimeout(() => {
    osc.amp(0, 0.5);         // fade out
    playing = false;
  }, 200);                   // beep length in ms
}

function draw() {
  background(0, 0, 0, 20);

  // Move all worms
  for (let worm of worms) {
    worm.update();
    worm.colliding = false; // Reset collision flag each frame
    
  }

  // Check for collisions and update flags
  for (let i = 0; i < worms.length; i++) {
    for (let j = i + 1; j < worms.length; j++) {
      if (worms[i].intersects(worms[j])) {
        worms[i].colliding = true;
        worms[j].colliding = true;
        playBeep();
        worms[i].reverseDirection();
        worms[j].reverseDirection();
    

      }
    }
  }

  // Draw all worms with color based on collision status
  for (let worm of worms) {
    worm.display();
  }
}

function mousePressed() {
  let length = random(30, 100);
  let angle = random(TWO_PI);
  let speed = random(1, 3);
  worms.push(new Worm(mouseX, mouseY, angle, length, speed));
}


