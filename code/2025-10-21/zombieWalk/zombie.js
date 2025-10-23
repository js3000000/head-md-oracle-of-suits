import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { FBXLoader } from 'FBXLoader';

let scene, camera, renderer, controls;
let zombie, mixer, walkAction;
let clock = new THREE.Clock();

const targetPosition = new THREE.Vector3();
const moveSpeed = 2.0;      // units per second
const rotateSpeed = 1.0;    // radians per second

init();
loadZombie();
animate();

function init() {
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color('skyblue');

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(- 10, 20, 10);
    scene.add(dirLight);

    // ground plane
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    ground.rotation.x = - Math.PI / 2;
    scene.add(ground);

    // mouse event
    window.addEventListener('mousemove', onMouseMove);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function onMouseMove(event) {
    // convert screen coords to NDC (Normalized Device Coordinates)
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1
    );

    // cast ray from camera
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        // find intersection point with ground plane (or first hit)
        targetPosition.copy(intersects[0].point);
        targetPosition.y = 0;  // keep on ground
    }
}

function loadZombie() {
    const loader = new FBXLoader();
    loader.load(
        'models/ZombieWalk.fbx',  // <-- replace with your zombie model path 
        (object) => {
            zombie = object;
            zombie.scale.set(0.1, 0.1, 0.1);  // adjust scale as needed
            scene.add(zombie);

            // assume animations present
            mixer = new THREE.AnimationMixer(zombie);

            if (object.animations && object.animations.length > 0) {
                // Remove position tracks (e.g., 'Hips.position') to avoid snapping
                object.animations[0].tracks = object.animations[0].tracks.filter(track => {
                    return !track.name.endsWith('.position');
                });

                mixer = new THREE.AnimationMixer(zombie);
                walkAction = mixer.clipAction(object.animations[0]);
                walkAction.play();
            }


            // initial target = current position
            targetPosition.copy(zombie.position);
        },
        undefined,
        (error) => {
            console.error('Error loading zombie model:', error);
        }
    );
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (zombie) {
        // move zombie toward targetPosition
        const pos = zombie.position;
        const dir = new THREE.Vector3().subVectors(targetPosition, pos);
        const dist = dir.length();

        if (dist > 0.1) {
            dir.normalize();
            // rotation: face direction
            const desiredRotY = Math.atan2(dir.x, dir.z);
            // slerp current rotation Y toward desiredRotY
            const currentY = zombie.rotation.y;
            let newY = THREE.MathUtils.lerp(currentY, desiredRotY, rotateSpeed * delta);
            zombie.rotation.y = newY;

            // move forward in local Z
            const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(zombie.quaternion);
            pos.add(forward.multiplyScalar(moveSpeed * delta));
        } else {
            // reached target: you could pause animation if you like
        }
    }

    controls.update();
    renderer.render(scene, camera);
}