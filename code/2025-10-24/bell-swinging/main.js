import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

// set up scene, camera, renderer, background
const scene = new THREE.Scene();
// set background color
scene.background = new THREE.Color(0xfffff0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
// assure que le renderer efface avec la couleur souhaitée
renderer.setClearColor(0xfffff0, 1);
document.body.appendChild(renderer.domElement);


// Add sphere at origin
const geometry = new THREE.SphereGeometry(0.5, 32, 32);

// Replace simple scene placement with a pivoted suspension so the sphere can swing
const material = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.5, roughness: 0.4 });
const sphere = new THREE.Mesh(geometry, material);

// suspension measurements (keep these in sync with geometry used earlier)
const sphereRadius = 0.5;
const ropeHeight = 0.8;
const topOffset = 0.02; // small gap above rope for the hook
const pivotY = sphereRadius + ropeHeight + topOffset; // world-space Y of suspension point

// create pivot at suspension point
const pivot = new THREE.Object3D();
pivot.position.set(0, pivotY, 0);
scene.add(pivot);

// hook (visual) at pivot
const hookGeom = new THREE.SphereGeometry(0.025, 12, 12);
const hookMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
const hook = new THREE.Mesh(hookGeom, hookMat);
hook.position.set(0, 0, 0);
pivot.add(hook);

// place sphere relative to pivot so it hangs below
sphere.position.set(0, -pivotY, 0);
pivot.add(sphere);

// small visible dot at top of the sphere (child of sphere so it moves with it)
const topPointGeom = new THREE.SphereGeometry(0.03, 12, 12);
const topPointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const topPoint = new THREE.Mesh(topPointGeom, topPointMat);
topPoint.position.set(0, sphereRadius + 0.03, 0); // local to sphere
sphere.add(topPoint);

// rope as a child of pivot (centered halfway down)
const ropeGeom = new THREE.CylinderGeometry(0.01, 0.01, ropeHeight, 8);
const ropeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.1, roughness: 0.8 });
const rope = new THREE.Mesh(ropeGeom, ropeMat);
rope.position.set(0, -ropeHeight / 2, 0); // local to pivot
pivot.add(rope);

// lights needed for MeshStandardMaterial to show metal/roughness
renderer.useLegacyLights = true; // utilise le nouveau système de lights (physically‑correct)

const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
hemi.position.set(0, 1, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(5, 5, 5);
scene.add(dir);

// position camera so the sphere is visible
camera.position.z = 2;

// Pendulum physics state
let angle = 0; // rotation around Z relative to vertical
let angularVelocity = 0;
let angularAcceleration = 0;
const g = 9.81;
const length = pivotY; // distance from pivot to sphere center
const damping = 0.03; // friction
const impulseStrength = 6; // tuning for how strong a mouse "touch" pushes

// raycaster for pointer interaction
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// dragging state for "grab and throw"
let isDragging = false;
let dragPlane = null; // plane used to compute pointer world position
let lastSamples = []; // {t, angle} for release velocity calculation
const maxSamples = 6;
const releaseFactor = 1.5; // scale delta-angle/dt to angularVelocity on release
const maxReleaseVel = 10; // clamp for safety

// allow grab even if raycast misses: screen-space radius in pixels
const grabRadiusPx = 40;

// --- audio for bell while moving ---
let audioCtx = null;
let osc = null;
let filter = null;
let gainNode = null;
let isAudioStarted = false;
const soundThreshold = 0.01; // angularVelocity magnitude above which sound appears
const maxGain = 0.10; // master gain for safety
const baseFreq = 220; // base frequency for the "bell" (lower so highs are less piercing)

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);

    // low-pass filter to tame the high end
    filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300; // default cutoff
    filter.Q.value = 1;
    filter.connect(gainNode);

    osc = audioCtx.createOscillator();
    // use a smoother waveform for a less harsh timbre
    osc.type = 'square';
    osc.frequency.value = baseFreq;
    osc.connect(filter);
    osc.start();

    isAudioStarted = true;
}
// --- end audio setup ---

function getPointerWorldOnPlane(pointer, plane) {
    raycaster.setFromCamera(pointer, camera);
    const intersection = new THREE.Vector3();
    const ok = raycaster.ray.intersectPlane(plane, intersection);
    return ok ? intersection : null;
}

function startDrag(intersectPoint) {
    isDragging = true;
    // plane that faces the camera and goes through pivot — use camera direction
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, pivot.position);
    lastSamples.length = 0;
    const now = performance.now() / 1000;
    // record initial angle sample
    lastSamples.push({ t: now, angle: angle });
    // while dragging we zero angular velocity so physics won't fight
    angularVelocity = 0;
}

function updateDrag(pointer) {
    if (!isDragging || !dragPlane) return;
    const p = getPointerWorldOnPlane(pointer, dragPlane);
    if (!p) return;
    const dx = p.x - pivot.position.x;
    const dy = p.y - pivot.position.y;
    const newAngle = Math.atan2(dx, -dy);
    // set pivot directly (immediate follow)
    pivot.rotation.z = newAngle;
    angle = newAngle;
    // store sample for release velocity
    const now = performance.now() / 1000;
    lastSamples.push({ t: now, angle: newAngle });
    if (lastSamples.length > maxSamples) lastSamples.shift();
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    // compute velocity from last samples (linear regression-ish: use first and last)
    if (lastSamples.length >= 2) {
        const first = lastSamples[0];
        const last = lastSamples[lastSamples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
            let dv = last.angle - first.angle;
            // unwrap angle jump
            if (dv > Math.PI) dv -= Math.PI * 2;
            if (dv < -Math.PI) dv += Math.PI * 2;
            let vel = (dv / dt) * releaseFactor;
            // clamp
            vel = Math.max(-maxReleaseVel, Math.min(maxReleaseVel, vel));
            angularVelocity = vel;
        }
    }
    dragPlane = null;
    lastSamples.length = 0;
}

// helper: screen-space position (pixels) of a world point
function worldToScreenPixels(v3) {
    const p = v3.clone().project(camera);
    const x = (p.x + 1) / 2 * window.innerWidth;
    const y = (1 - p.y) / 2 * window.innerHeight;
    return new THREE.Vector2(x, y);
}

// pointer event handlers (modified to allow "near" grabs)
function onPointerDown(event) {
    // ensure audio context resumed on user gesture
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(sphere, true);

    if (intersects.length > 0) {
        // precise hit -> begin dragging with hit point
        startDrag(intersects[0].point);
        // prefer setting pointer capture on renderer.domElement
        renderer.domElement.setPointerCapture?.(event.pointerId);
        return;
    }

    // if no precise hit, check screen-space proximity to the sphere center
    const sphereWorldPos = new THREE.Vector3();
    sphere.getWorldPosition(sphereWorldPos);
    const screenPos = worldToScreenPixels(sphereWorldPos);
    const dx = screenPos.x - event.clientX;
    const dy = screenPos.y - event.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= grabRadiusPx) {
        // start dragging even if raycast missed (use plane intersection to follow pointer)
        startDrag(null);
        // make pivot/sphere follow immediately to avoid jump
        updateDrag(pointer);
        renderer.domElement.setPointerCapture?.(event.pointerId);
    }
}
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    if (isDragging) {
        updateDrag(pointer);
    }
}
function onPointerUp(event) {
    // release pointer capture if set
    renderer.domElement.releasePointerCapture?.(event.pointerId);
    if (isDragging) {
        endDrag();
    }
}

// attach listeners
window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerUp);

// animation loop with simple pendulum integration
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());

    // non-linear pendulum equation
    angularAcceleration = - (g / length) * Math.sin(angle) - damping * angularVelocity;
    angularVelocity += angularAcceleration * dt;
    angle += angularVelocity * dt;

    // apply rotation to pivot so the whole group swings
    pivot.rotation.z = angle;

    // optional sphere self-rotation for visual interest
    sphere.rotation.y += 0.01;

    // update sound based on motion (start audio lazily if needed)
    const speed = Math.abs(angularVelocity);
    if (audioCtx && isAudioStarted) {
        // map speed to gain (same as before)
        const targetGain = Math.min(maxGain, speed * 1.8);
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.02);

        // frequency mapping: much gentler slope and a hard cap to avoid very high pitches
        const maxFreqInc = 400; // maximum increase above baseFreq
        const freq = baseFreq + Math.min(maxFreqInc, speed * 150); // smaller multiplier
        osc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.03);

        // slightly open the lowpass filter with speed but keep a cap
        const maxCutoff = 2000;
        const cutoff = Math.min(maxCutoff, 800 + speed * 800);
        filter.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.05);

        if (speed < soundThreshold) {
            gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.12);
        }
    }

    renderer.render(scene, camera);
}
animate();

// handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});