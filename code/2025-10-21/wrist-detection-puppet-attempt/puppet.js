import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { FBXLoader } from 'FBXLoader';

import { init, loadFBX, animate } from './videoRenderer.js';


init();
loadFBX();
animate();
