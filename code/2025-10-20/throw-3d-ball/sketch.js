let video;

let ball;

const GRAVITY = 0.9;
const DAMPING = 0.75;
const FRICTION = 0.995;

function setup() {
    createCanvas(640, 480, WEBGL);

    // createCapture returns a p5.Element; ensure it can play as a texture
    video = createCapture(VIDEO);
    video.size(640, 480);
    // prefer playsInline / muted to avoid autoplay blocks
    if (video.elt) {
      video.elt.muted = true;
      video.elt.setAttribute && video.elt.setAttribute('playsinline', '');
      // best-effort play
      try { video.elt.play && video.elt.play(); } catch(e) { /* ignore */ }
    }
    video.hide(); // hide default HTML video element

    ball = {
        pos: createVector(0, 0, 0),         // centered in WEBGL coords
        vel: createVector(0, 0, 0),
        r: 40,
        dragging: false,
        // store {p:Vector, t:millis()} for better velocity calc
        prevPositions: []
    };
}

function draw() {
    background(30);

    // Draw webcam as a textured plane behind the scene
    push();
    translate(0, 0, -800);
    // Flip vertically so webcam looks natural
    scale(1, -1, 1);
    noStroke();
    // Use the video element as a texture (p5 supports this)
    texture(video);
    plane(width, height);
    pop();

    // Lights for 3D sphere
    ambientLight(60);
    directionalLight(255, 255, 255, -0.5, -1, -0.5);
    pointLight(200, 200, 255, 200, -200, 300);

    // Update physics when not dragging
    if (!ball.dragging) {
        // scale gravity by frame time (use deltaTime provided by p5)
        const dtFactor = deltaTime / 16.66;
        ball.vel.y += GRAVITY * dtFactor;
        ball.vel.mult(FRICTION);
        ball.pos.add(ball.vel.copy().mult(dtFactor));

        // World bounds (centered coordinates)
        const halfW = width / 2;
        const halfH = height / 2;
        const zLimit = 600;

        // X walls
        if (ball.pos.x + ball.r > halfW) {
            ball.pos.x = halfW - ball.r;
            ball.vel.x *= -DAMPING;
        } else if (ball.pos.x - ball.r < -halfW) {
            ball.pos.x = -halfW + ball.r;
            ball.vel.x *= -DAMPING;
        }

        // Floor / ceiling
        if (ball.pos.y + ball.r > halfH) {
            ball.pos.y = halfH - ball.r;
            ball.vel.y *= -DAMPING;
            // small additional damping on X/Z on hit
            ball.vel.x *= 0.98;
            ball.vel.z *= 0.98;
        } else if (ball.pos.y - ball.r < -halfH) {
            ball.pos.y = -halfH + ball.r;
            ball.vel.y *= -DAMPING;
        }

        // Z bounds
        if (ball.pos.z + ball.r > zLimit) {
            ball.pos.z = zLimit - ball.r;
            ball.vel.z *= -DAMPING;
        } else if (ball.pos.z - ball.r < -zLimit) {
            ball.pos.z = -zLimit + ball.r;
            ball.vel.z *= -DAMPING;
        }
    }

    // Draw the sphere at ball.pos
    push();
    translate(ball.pos.x, ball.pos.y, ball.pos.z);
    specularMaterial(200);
    shininess(50);
    noStroke();
    sphere(ball.r, 48, 48);
    pop();

    // Optional: show a small cursor when dragging
    if (ball.dragging) {
        push();
        translate(ball.pos.x, ball.pos.y, ball.pos.z);
        noFill();
        stroke(255, 150);
        sphere(ball.r + 6, 12, 12);
        pop();
    }

    // Keep prevPositions capped (we store recent samples with timestamps)
    if (ball.prevPositions.length > 10) ball.prevPositions.shift();
}

// Convert mouse coords (top-left) to WEBGL-centered coords
function centeredMouse() {
    return createVector(mouseX - width / 2, mouseY - height / 2);
}

function mousePressed() {
    const m = centeredMouse();
    // pick up the ball if close enough (2D distance)
    if (p5.Vector.dist(createVector(ball.pos.x, ball.pos.y, 0), createVector(m.x, m.y, 0)) < ball.r * 1.2) {
        ball.dragging = true;
        ball.prevPositions = [];
        ball.prevPositions.push({ p: m.copy(), t: millis() });
        // stop current motion while holding
        ball.vel.set(0, 0, 0);
    }
}

function mouseDragged() {
    if (!ball.dragging) return;
    const m = centeredMouse();
    // Update ball position to follow mouse (map Y to some Z for depth feel)
    ball.pos.x = m.x;
    ball.pos.y = m.y;
    // map vertical mouse position to depth (drag up -> forward)
    ball.pos.z = map(m.y, -height / 2, height / 2, -300, 300);
    ball.prevPositions.push({ p: m.copy(), t: millis() });
    if (ball.prevPositions.length > 10) ball.prevPositions.shift();
}

function mouseReleased() {
    if (!ball.dragging) return;
    ball.dragging = false;

    // Compute velocity from recent positions using timestamps
    if (ball.prevPositions.length >= 2) {
        const first = ball.prevPositions[0];
        const last = ball.prevPositions[ball.prevPositions.length - 1];
        const dt = max(1, last.t - first.t); // ms, avoid zero

        // velocities in pixels per 16.66ms frame unit used elsewhere
        const dtFactor = 16.66 / dt;

        const dx = (last.p.x - first.p.x) * dtFactor;
        const dy = (last.p.y - first.p.y) * dtFactor;

        // forward/back velocity based on upward motion (negative dy -> forward)
        const dz = map(-dy, -20, 20, -6, 6);

        const speedMult = 1.5;
        ball.vel.x = dx * speedMult;
        ball.vel.y = dy * speedMult;
        ball.vel.z = dz * speedMult;
    } else {
        // small default pop
        ball.vel.y = -6;
    }
    ball.prevPositions = [];
}

// Touch support: forward mobile touch end to mouseReleased
function touchEnded() {
    // p5 will also call mouseReleased in many cases, but ensure it here
    mouseReleased();
}