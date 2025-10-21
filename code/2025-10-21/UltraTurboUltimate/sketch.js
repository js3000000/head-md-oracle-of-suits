let x;
let y;

function setup() {
  createCanvas(windowWidth, windowHeight);
  x = width * 0,5;
  y = height * 0,5;
  //frameRate(50);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);
  stroke(10);
  x += random(-1,1);
  y += random(-1,1);


  // Create an ellipse with gradient on edges
    // radial gradient for the circle edges
    let r = 25; // half of the circle diameter (50)
    const ctx = drawingContext;
    const prevFill = ctx.fillStyle;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');      // transparent center
    grad.addColorStop(0.7, 'rgba(0, 150, 255, 0.35)');   // soft middle
    grad.addColorStop(1, 'rgba(0, 150, 255, 1)');        // strong edge

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = prevFill;



  

  //circle(x, y, 50);
  circle(x + random(-1, 1) + 100, y + random(-1, 1) + 100, 50);
  
}


function mousePressed() {
  x = mouseX;
  y = mouseY;
 
}