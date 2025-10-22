// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

let scene, camera, renderer, controls;
let model, wristBone;
let trackedWristPosition = null;

init();
loadFBX();
animate();