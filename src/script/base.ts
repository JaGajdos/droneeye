import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { loadModel } from './model';
import { addCloud, createTroikaText, loadLights, loadText, loadTexture } from './objects';
import { BackgroundAudio } from './audio';
import { Menu } from './menu';
import { LanguageService } from '../i18n/languageService';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let positionOnCurve = 0;
let speed = 0;
let curve: THREE.CatmullRomCurve3;
const dampingFactor = 0.95;
const accelerationFactor = 0.1 * 0.002;
let loadingManager: THREE.LoadingManager;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let dron: any;
let renderer: THREE.WebGLRenderer;
let cssRenderer: CSS3DRenderer;
const textA: any[] = [];
const modelA: any[] = [];
const clock = new THREE.Clock();
let backgroundAudio: BackgroundAudio;
let isCanvasReady = false;
let isDroneEnd = false;
let menu: Menu;
const canvas = document.getElementById('threeCanvas')!;
const loaderContainer = document.getElementById('loader');
const loaderimg = document.getElementById('loaderImg');
const loaderStatus = document.getElementById('loaderStatus');
const startButton = document.getElementById('startButton');
const topLogo = document.getElementById('topLogo');

const pathPoint: number[][] = [
  [0, 0, 200],
  [3, 0, 190],
  [5, 0, 180],
  [3, 0, 170],
  [0, 3, 160],
  [-3, 3, 150],
  [-3, 3, 140],
  [0, 10, 130],
  [0, 10, 120],
  [0, 10, 110],
  [0, 5, 100],
  [5, 5, 90],
  [5, 5, 80],
  [3, 15, 70],
  [0, 15, 60],
  [0, 15, 50],
  [-3, 20, 40],
  [-3, 20, 30],
  [-5, 20, 20],
  [-5, 20, 10],
  [-1, 20, 0],
];

const cloudBatch = [
  [-15, 0, 190],
  [-10, 0, 160],
  [30, 5, 140],
  [30, 0, 140],
  [20, 10, 120],
  [10, 0, 110],
  [-20, 0, 100],
  [-10, 10, 90],
  [30, 10, 80],
  [20, 5, 70],
  [-10, -5, 60],
  [15, 0, 40],
  [10, 10, 20],
  [-10, 0, 20],
  [0, 0, 20],
  [-10, -5, 20],
  [5, 5, 20],
];

function updateSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.fov = isMobile ? 80 : 75;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
  cssRenderer.setSize(width, height);

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
}

function updatePosition() {
  positionOnCurve += speed / 100;
  positionOnCurve = Math.max(0, Math.min(1, positionOnCurve));
  const newPosition = curve.getPointAt(positionOnCurve);
  dron.updatePosition(newPosition);
  speed *= dampingFactor;

  if (newPosition.z < 30 && !isDroneEnd) {
    isDroneEnd = true;
    document.getElementById('portfolio-button')?.click();
  }
}

function updateOpacity() {
  if (textA && textA.length > 0) {
    for (let i = 0; i < textA.length; i++) {
      textA[i].updateTextOpacity();
    }
  }
}

function updateModel() {
  if (modelA && modelA.length > 0) {
    for (let i = 0; i < modelA.length; i++) {
      if (modelA[i].getMixer()) {
        modelA[i].getMixer().update(clock.getDelta());
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);


  updatePosition();
  updateModel();
  updateOpacity();

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

function loadEvents() {
  window.addEventListener('resize', updateSize);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateSize, 100);
  });

  window.addEventListener('wheel', (event) => {
    if (!menu.isSubpageOpen) {
      speed += event.deltaY * accelerationFactor;
    }
  });

  document.addEventListener(
    'touchmove',
    (e) => {
      if (!menu.isSubpageOpen) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  canvas?.addEventListener(
    'touchmove',
    (e) => {
      if (!menu.isSubpageOpen) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  const navigationElements = document.querySelectorAll('nav a, .logo, .about-link');
  navigationElements.forEach((element) => {
    element.addEventListener(
      'touchstart',
      (e) => {
        e.stopPropagation();
      },
      { passive: true },
    );
  });

  let touchStartY = 0;
  let isMoving = false;
  const TOUCH_SPEED = 0.001;

  canvas?.addEventListener(
    'touchstart',
    (event) => {
      event.preventDefault();
      touchStartY = event.touches[0].clientY;
      isMoving = true;
    },
    { passive: false },
  );

  canvas?.addEventListener(
    'touchmove',
    (event) => {
      event.preventDefault();
      const currentY = event.touches[0].clientY;
      const deltaY = currentY - touchStartY;

      if (isMoving && !menu.isSubpageOpen) {
        if (deltaY > 0) {
          speed -= deltaY * TOUCH_SPEED;
        } else if (deltaY < 0) {
          speed -= deltaY * TOUCH_SPEED;
        }
      }

      touchStartY = currentY;
    },
    { passive: false },
  );

  canvas?.addEventListener(
    'touchend',
    (event) => {
      event.preventDefault();
      isMoving = false;
    },
    { passive: false },
  );

  canvas?.addEventListener(
    'touchcancel',
    (event) => {
      event.preventDefault();
      isMoving = false;
    },
    { passive: false },
  );
}

function createPath(scene: THREE.Scene, camera: THREE.PerspectiveCamera, position: THREE.Vector3) {
  const points = [];

  for (let i = 0; i < pathPoint.length; i++) {
    points.push(new THREE.Vector3(pathPoint[i][0], pathPoint[i][1], pathPoint[i][2]));
  }

  // Create the curve
  curve = new THREE.CatmullRomCurve3(points);
  curve.closed = false; // Close the loop

  // Create a line geometry to visualize the curve
  const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
  const curveMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Yellow color
  const curveLine = new THREE.Line(curveGeometry, curveMaterial);
  //scene.add(curveLine);

  // Position the camera
  camera.position.set(position.x, position.y + 2, position.z);
  camera.lookAt(position);
}

function loadResources() {
  // Split loading into smaller chunks
  const loadInitialResources = () => {
    loadLights(scene);
    const texture = loadTexture(loadingManager, 'textures/sunshine-clouds-min.jpg', 1350, 900, 500);
    scene.add(texture);
  };

  const loadPath = () => {
    const startPosition = new THREE.Vector3(0, 0, 200);
    createPath(scene, camera, startPosition);
  };

  const loadDrone = () => {
    const startPosition = new THREE.Vector3(0, 0, 200);
    dron = loadModel(scene, camera, loadingManager, 'models/drone6.glb', 3, startPosition);
    modelA.push(dron);
  };

  // Load clouds in smaller batches
  const loadCloudBatch = (startIdx: number, batchSize: number) => {
    const endIdx = Math.min(startIdx + batchSize, cloudBatch.length);

    for (let i = startIdx; i < endIdx; i++) {
      const [x, y, z] = cloudBatch[i];
      addCloud(scene, x, y, z);
    }

    // Load next batch if there are more clouds
    if (endIdx < cloudBatch.length) {
      requestAnimationFrame(() => loadCloudBatch(endIdx, batchSize));
    }
  };

  const loadText = () => {
    const langService = LanguageService.getInstance();
    textA.push(
      createTroikaText(scene, camera, langService.getMessage('scrollToBegin'), new THREE.Vector3(-4, 3, 197), 5, 13),
    );
    textA.push(
      createTroikaText(scene, camera, langService.getMessage('videoProduction'), new THREE.Vector3(-1, 4, 180), 10),
    );
    textA.push(
      createTroikaText(scene, camera, langService.getMessage('photography'), new THREE.Vector3(-7, 6, 150), 10),
    );
    textA.push(
      createTroikaText(scene, camera, langService.getMessage('droneShots'), new THREE.Vector3(-4, 14, 120), 10),
    );
  };

  // Chain the loading sequence
  requestAnimationFrame(() => {
    loadInitialResources();
    requestAnimationFrame(() => {
      loadPath();
      requestAnimationFrame(() => {
        loadDrone();
        requestAnimationFrame(() => {
          // Start loading clouds in batches of 5
          loadCloudBatch(0, 5);
          requestAnimationFrame(loadText);
        });
      });
    });
  });
}

function initAudio() {
  backgroundAudio = new BackgroundAudio();
  document.getElementById('startButton')?.addEventListener('click', () => {
    backgroundAudio.play();
  });
}

function init() {
  loadEvents();
  animate();
  initAudio();
}

function hideLoader() {
  if (loaderimg && topLogo) {
    const logoRect = topLogo.getBoundingClientRect();
    const loaderRect = loaderimg.getBoundingClientRect();

    // Výpočet rozdielu medzi pozíciami
    const deltaX = logoRect.left - loaderRect.right + loaderRect.width / (isMobile ? 1.3 : 1.8);
    const deltaY = logoRect.top - loaderRect.bottom + loaderRect.height / (isMobile ? 1.7 : 1.9);

    loaderimg.style.transition = 'transform 2s ease, opacity 2s ease';
    if (isMobile) {
      loaderimg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.6)`;
    } else {
      loaderimg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.30)`;
    }
  }
  setTimeout(() => {
    if (loaderContainer) {
      loaderContainer.style.display = 'none';
    }
    if (topLogo) {
      topLogo.style.opacity = '1';
    }
  }, 1000);
}

function startExperience() {
  if (!isCanvasReady) return;

  hideLoader();

  if (startButton) {
    startButton.style.display = 'none';
  }

  canvas.style.opacity = '0';
  canvas.style.display = 'block';
  canvas.style.transition = 'opacity 1s ease';

  setTimeout(() => {
    canvas.style.opacity = '1';
  }, 10);
}

function start() {
  const userLang = navigator.language;
  const langService = LanguageService.getInstance();
  langService.setLanguage(userLang.startsWith('sk') ? 'sk' : 'en');

  if (startButton) {
    startButton.addEventListener('click', startExperience);
  } else {
    console.error('startButton_no');
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.id = 'css3d-container';

  updateSize();

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(cssRenderer.domElement);

  loadingManager = new THREE.LoadingManager(
    // onLoad callback
    () => {
      init();
      isCanvasReady = true;
      console.log('Loading complete!');
      setTimeout(function () {
        startButton.style.display = 'block';
        if (loaderStatus) {
          loaderStatus.style.display = 'none';
        }
      }, 500);
    },
    // onProgress callback
    (url, itemsLoaded, itemsTotal) => {
      if (loaderStatus) {
        loaderStatus.style.display = 'block';
        //loaderStatus.textContent = 'Loading: ' + ((itemsLoaded / itemsTotal) * 100).toFixed(2) + '%';
        //loaderStatus.textContent = 'Dron sa pripravuje na svoj štart ... ';
      }
      console.log('Loading file.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    },
    // onError callback
    (url) => {
      if (loaderStatus) {
        loaderStatus.style.display = 'block';
        loaderStatus.textContent = 'Dronu sa nepodarilo vzlietnuť. Skúste refresh!';
      }
      console.error('There was an error loading');
    },
  );

  loadResources();
}

function initMenu() {
  menu = new Menu(backgroundAudio);
}

initMenu();
setTimeout(function () {
  start();
}, 500);

document.addEventListener('DOMContentLoaded', () => {
  LanguageService.getInstance();
});
