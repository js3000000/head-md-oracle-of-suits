import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { World, Body, Box, Vec3, HingeConstraint, PointToPointConstraint } from 'cannon-es'; // ajout PointToPointConstraint

// --- Scène de base ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lumière ---
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// ajouter un background simple
scene.background = new THREE.Color(0xaaaaaa);

// --- Monde physique ---
const world = new World();
world.gravity.set(0, -9.82, 0);

// --- Floor (Three + Cannon) ---
const groundMesh = new THREE.Mesh(
  new THREE.BoxGeometry(10, 0.2, 10),
  new THREE.MeshStandardMaterial({ color: 0x666666 })
);
groundMesh.position.set(0, -1, 0);
scene.add(groundMesh);

const groundBody = new Body({
  mass: 0,
  position: new Vec3(0, -1, 0),
  shape: new Box(new Vec3(5, 0.1, 5))
});
world.addBody(groundBody);

// --- Chargement du modèle FBX ---
const loader = new FBXLoader();
let upperArmBone = null;
let forearmBone = null;
let upperBody = null;
let forearmBody = null;

// use an absolute path served by Vite (place file in project-root/public/models/)
const fbxUrl = '/models/your-model_2.fbx'; // <- place file in my-three-project/public/models/

async function loadFBX(url) {
  try {
    const resolved = new URL(url, window.location.href).href;
    console.log('Attempting to fetch FBX at:', resolved, 'page:', window.location.href);

    const res = await fetch(resolved);
    const contentType = res.headers.get('content-type') || '';
    console.log('FBX response:', res.status, res.statusText, 'content-type:', contentType);

    if (!res.ok) {
      console.error('Failed to fetch FBX:', res.status, res.statusText, resolved);
      return;
    }

    const arrayBuffer = await res.arrayBuffer();

    // quick header sniff
    const headerStr = new TextDecoder().decode(arrayBuffer.slice(0, 64));
    if (headerStr.startsWith('<') || contentType.includes('html')) {
      console.error('FBX fetch returned HTML (404 page or error). Check URL and server. Snippet:', headerStr.slice(0, 200));
      return;
    }

    let fbx;
    if (headerStr.indexOf('Kaydara FBX Binary') !== -1) {
      fbx = loader.parse(arrayBuffer, url);
    } else {
      const text = new TextDecoder().decode(arrayBuffer);
      if (text.trim().startsWith('<')) {
        console.error('FBX fetch returned HTML (server error). Snippet:', text.slice(0, 200));
        return;
      }
      fbx = loader.parse(text, url);
    }

    fbx.scale.set(0.01, 0.01, 0.01);
    scene.add(fbx);

    // find an arm bone and create a physics body at its world position
    fbx.traverse((obj) => {
      if (obj.isBone) {
        const name = obj.name.toLowerCase();
        if (!upperArmBone && (name.includes('upper') || name.includes('shoulder') || name.includes('arm') && name.includes('upper'))) {
          upperArmBone = obj;
        }
        // adapte selon le nom exact dans ton FBX : 'forearm', 'lowerarm', 'arm_lower'...
        if (!forearmBone && (name.includes('fore') || name.includes('lower') || name.includes('arm') && name.includes('lower'))) {
          forearmBone = obj;
        }
      }
    });

    if (upperArmBone && forearmBone) {
      // positions mondiales init
      const upPos = new THREE.Vector3(); upperArmBone.getWorldPosition(upPos);
      const frPos = new THREE.Vector3(); forearmBone.getWorldPosition(frPos);

      // orientations mondiales init
      const upQuat = new THREE.Quaternion(); upperArmBone.getWorldQuaternion(upQuat);
      const frQuat = new THREE.Quaternion(); forearmBone.getWorldQuaternion(frQuat);

      console.log('upperArmBone', upperArmBone.name, upPos, upQuat);
      console.log('forearmBone', forearmBone.name, frPos, frQuat);

      // tailles approximatives (à ajuster)
      const upperHalf = new Vec3(0.06, 0.2, 0.06);
      const foreHalf  = new Vec3(0.05, 0.25, 0.05);

      // créer bodies Cannon (donner une petite séparation pour éviter chevauchement initial)
      upperBody = new Body({
        mass: 0, // 0 = fixe (garder fixe si on veut que l'épaule reste en place)
        position: new Vec3(upPos.x, upPos.y, upPos.z),
        shape: new Box(upperHalf)
      });
      // appliquer l'orientation initiale
      upperBody.quaternion.set(upQuat.x, upQuat.y, upQuat.z, upQuat.w);

      forearmBody = new Body({
        mass: 1,
        position: new Vec3(frPos.x, frPos.y - 0.02, frPos.z), // léger offset pour éviter pénétration
        shape: new Box(foreHalf)
      });
      forearmBody.quaternion.set(frQuat.x, frQuat.y, frQuat.z, frQuat.w);

      world.addBody(upperBody);
      world.addBody(forearmBody);

      // position du "coude" (on prend la position mondiale de forearmBone)
      const elbowWorld = new THREE.Vector3(); forearmBone.getWorldPosition(elbowWorld);

      // pivots locaux approximatifs : pivot = elbowWorld - body.position
      const pivotA = new Vec3(elbowWorld.x - upperBody.position.x, elbowWorld.y - upperBody.position.y, elbowWorld.z - upperBody.position.z);
      const pivotB = new Vec3(elbowWorld.x - forearmBody.position.x, elbowWorld.y - forearmBody.position.y, elbowWorld.z - forearmBody.position.z);

      // axe de rotation du coude (essaye plusieurs axes si nécessaire)
      const axis = new Vec3(0, 0, 1);

      // OPTION A — remplacer le Hinge par un PointToPoint pour garder l'avant-bras accroché
      // const hinge = new HingeConstraint(upperBody, forearmBody, { ... });
      // world.addConstraint(hinge);

      const p2p = new PointToPointConstraint(upperBody, pivotA, forearmBody, pivotB);
      world.addConstraint(p2p);

      // s'assurer que le corps réagit à la gravité
      forearmBody.mass = forearmBody.mass || 1;
      forearmBody.wakeUp();
      forearmBody.allowSleep = false;

      // OPTION B — PointToPoint (joint type "ball" : attaché mais libre en rotation)
      // import { PointToPointConstraint } from 'cannon-es';
      // const p2p = new PointToPointConstraint(upperBody, pivotA, forearmBody, pivotB);
      // world.addConstraint(p2p);

      // OPTION C — LockConstraint (verrou complet, position + rotation)
      // import { LockConstraint } from 'cannon-es';
      // const lock = new LockConstraint(upperBody, forearmBody);
      // world.addConstraint(lock);

    } else {
      console.warn('Impossible de trouver upperArmBone ou forearmBone — vérifie les noms des os dans le FBX.');
    }
  } catch (err) {
    console.error('Error loading/parsing FBX:', err);
  }
}

loadFBX(fbxUrl);

// --- Boucle d’animation ---
const clock = new THREE.Clock();

// temp objects reused each frame
const tmpVec = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const parentWorldQuat = new THREE.Quaternion();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  world.step(1 / 60, delta, 3);

  // Synchroniser la position/rotation du bras 3D avec la physique
  if (upperArmBone && upperBody) {
    const w = upperBody.position;
    tmpVec.set(w.x, w.y, w.z);
    parent = upperArmBone.parent || scene;
    parent.worldToLocal(tmpVec);
    upperArmBone.position.copy(tmpVec);
    parent.getWorldQuaternion(parentWorldQuat);
    const q = new THREE.Quaternion(upperBody.quaternion.x, upperBody.quaternion.y, upperBody.quaternion.z, upperBody.quaternion.w);
    const inv = parentWorldQuat.clone().invert();
    upperArmBone.quaternion.copy(inv.multiply(q));
    upperArmBone.updateMatrixWorld(true);
  }
  if (forearmBone && forearmBody) {
    const w2 = forearmBody.position;
    tmpVec.set(w2.x, w2.y, w2.z);
    parent = forearmBone.parent || scene;
    parent.worldToLocal(tmpVec);
    forearmBone.position.copy(tmpVec);
    const q2 = new THREE.Quaternion(forearmBody.quaternion.x, forearmBody.quaternion.y, forearmBody.quaternion.z, forearmBody.quaternion.w);
    parent.getWorldQuaternion(parentWorldQuat);
    const inv2 = parentWorldQuat.clone().invert();
    forearmBone.quaternion.copy(inv2.multiply(q2));
    forearmBone.updateMatrixWorld(true);
  }

  renderer.render(scene, camera);
}

animate();
