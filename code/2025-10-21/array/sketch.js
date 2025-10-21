// create an empty array to hold our circles
let values = [];

function setup() {

  // fitting the canvas to the window size
  createCanvas(windowWidth, windowHeight);

  //add 100 random values to the array
  for (let i = 0; i < 100; i++) {
    values.push(random(height));
  }
}

function draw() {
  background(220);


  // draw red pixels for each value in the array > 100 and blue pixels for each value <= 100
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 10) {
      stroke(255, 0, 0);
    } else {
      stroke(0, 0, 255);
    }
    line(i * (width / values.length), height, i * (width / values.length), height - values[i]);

  }

}
