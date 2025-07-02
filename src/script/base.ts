import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { loadModel } from './model';
import { addRealisticCloud, createTroikaText, loadLights, loadTexture } from './objects';
import { BackgroundAudio } from './audio';
import { Menu } from './menu';
import { LanguageService } from '../i18n/languageService';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let positionOnCurve = 0;
let speed = 0;
let curve: THREE.CatmullRomCurve3;
const dampingFactor = 0.96;
const accelerationFactor = 0.1 * 0.0009;
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
let updateSun: () => void;
const canvas = document.getElementById('threeCanvas')!;
const loaderContainer = document.getElementById('loader');
const loaderSubtext = document.getElementById('loaderSubtext');
const loaderimg = document.getElementById('loaderImg');
const loaderStatus = document.getElementById('loaderStatus');
const startButton = document.getElementById('startButton');
const topLogo = document.getElementById('topLogo');

const pathPoint: number[][] = [
  [0, 0, 200],
  [0, 3, 190],
  [0, 6, 180],
  [0, 6, 170],
  [0, 3, 160],
  [0, 0, 150],
  [0, 0, 140],
  [0, -3, 130],
  [0, -6, 120],
  [0, -6, 110],
  [0, -6, 100],
  [0, -6, 90],
  [5, -3, 80],
  [3, 15, 70],
  [0, 15, 60],
  [0, 15, 50],
  [-3, 20, 40],
  [-3, 20, 30],
  [-5, 20, 20],
  [-5, 20, 10],
  [-1, 20, 0],
];

const cloudConfigs: [number, number, number, number, number, number, string][] = [
  // 🔹 Najväčšie (Z = -50 až 0)
  [-55, 20, -10, 100, 60, 0.9, 'cloud1.png'],
  [52, -18, 0, 120, 70, 1.0, 'cloud2.png'],
  [48, 25, -10, 66, 36, 0.8, 'cloud1.png'],
  [30, 20, 30, 64, 34, 0.7, 'cloud2.png'],
  [-36, -20, 50, 62, 32, 0.8, 'cloud1.png'],

  // 🟡 Stredná vzdialenosť (Z = 20–100)
  [35, 20, 60, 58, 30, 0.8, 'cloud2.png'],
  [-30, 10, 70, 56, 28, 0.7, 'cloud1.png'],
  [28, -12, 80, 54, 27, 0.8, 'cloud2.png'],
  [-22, -10, 90, 52, 26, 0.7, 'cloud1.png'],
  [20, 12, 100, 50, 25, 0.7, 'cloud2.png'],

  // 🔸 Vpredu – menšie (Z = 100–180)
  [-35, 18, 120, 46, 22, 0.8, 'cloud1.png'],
  [12, -8, 130, 44, 21, 0.7, 'cloud2.png'],
  [-24, 5, 140, 42, 20, 0.6, 'cloud1.png'],
  [22, -14, 150, 40, 18, 0.7, 'cloud2.png'],
  [-18, 16, 160, 38, 17, 0.9, 'cloud1.png'],
  [18, 10, 170, 36, 16, 0.7, 'cloud2.png'],
  [-28, -6, 180, 34, 15, 0.8, 'cloud1.png'],
  [23, -7, 185, 32, 14, 0.8, 'cloud2.png'],
  [-10, -12, 190, 30, 13, 0.7, 'cloud1.png'],

  // ➕ Nové doplnené
  [45, 18, 110, 48, 25, 0.8, 'cloud1.png'],
  [-30, -16, 115, 46, 24, 0.7, 'cloud2.png'],
  [50, 10, 125, 44, 22, 0.9, 'cloud1.png'],
  [-45, -20, 130, 42, 21, 0.8, 'cloud2.png'],
  [38, 12, 145, 40, 20, 0.8, 'cloud1.png'],
  [-36, -14, 150, 38, 19, 0.7, 'cloud2.png'],
  [48, 6, 160, 36, 18, 0.7, 'cloud1.png'],
  [-39, -8, 165, 34, 17, 0.8, 'cloud2.png'],
  [30, 15, 175, 32, 16, 0.9, 'cloud1.png'],
  [-42, -12, 185, 30, 15, 0.7, 'cloud2.png'],
  [-18, 7, 190, 20, 10, 0.9, 'cloud2.png']
];

// --- SCROLL TO PORTFOLIO TILE LOGIC ---
function scrollToPortfolioTile(targetId: string) {
  setTimeout(() => {
    const container = document.getElementById('subpage-portfolio-container');
    const tile = document.getElementById(targetId);
    if (container && tile) {
      // Scroll the grid container, not the whole page
      const gridContainer = container.querySelector('.subpage-grid-container');
      if (gridContainer) {
        const tileRect = tile.getBoundingClientRect();
        const gridRect = (gridContainer as HTMLElement).getBoundingClientRect();
        const scrollTop = (gridContainer as HTMLElement).scrollTop;
        // Calculate offset relative to grid container
        const offset = tileRect.top - gridRect.top + scrollTop - 12;
        (gridContainer as HTMLElement).scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      } else {
        // fallback: scroll into view
        tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, 0); // Wait for subpage animation to finish
}

// Add event listeners to service tiles
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[data-portfolio-target]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = (e.currentTarget as HTMLElement).getAttribute('data-portfolio-target');
      if (targetId) {
        // Wait for portfolio subpage to open, then scroll
        setTimeout(() => scrollToPortfolioTile(targetId), 10);
      }
    });
  });
});

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
  if (isDroneEnd && newPosition.z < 100) {
    return;
  }
  dron.updatePosition(newPosition);
  speed *= dampingFactor;

  if (newPosition.z < 100 && !isDroneEnd) {
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

function update3DText() {
  if (textA && textA.length > 0) {
    for (let i = 0; i < textA.length; i++) {
      textA[i].updateText();
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

  //if(updateSun) {
  //  updateSun();
  //}

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
   // scene.add(texture);
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
    for (const [x, y, z, scaleX, scaleY, opacity, texture] of cloudConfigs) {
      addRealisticCloud(scene, x, y, z, `textures/${texture}`, scaleX, scaleY, opacity);
    }
  };

  const loadText = () => {

  textA.push(
    createTroikaText(scene, camera, 'videoProduction', new THREE.Vector3(-3, 9, 180), isMobile, 10),
  );
  textA.push(
    createTroikaText(scene, camera, 'photography', new THREE.Vector3(-9, 3, 150), isMobile, 10),
  );
  textA.push(
    createTroikaText(scene, camera, 'droneShots', new THREE.Vector3(-7, -2, 120), isMobile, 10),
  );
  textA.push(
    createTroikaText(scene, camera, 'droneShots1', new THREE.Vector3(-7, -3, 120), isMobile, 10, undefined, isMobile ? 0.4 : 0.6),
  );


    textA.push(
      createTroikaText(scene, camera, 'scrollToBegin', new THREE.Vector3(isMobile ? -6 : -5.5, 3, 197), isMobile, 5, 13),
    );
    textA.push(
      createTroikaText(scene, camera, 'ads1', new THREE.Vector3(-3, -4, 197), isMobile, 5, 13),
    );
    textA.push(
      createTroikaText(scene, camera, 'adsS1', new THREE.Vector3(0, 3, 180), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'adsS2', new THREE.Vector3(-6.5, -3, 150), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'adsS3', new THREE.Vector3(-4, -9, 120), isMobile, 10),
    );
    /*
    textA.push(
      createTroikaText(scene, camera, 'ads2', new THREE.Vector3(1, 2, 183), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'ads3', new THREE.Vector3(0, 4, 168), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'ads4', new THREE.Vector3(-6, 5, 152), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'ads5', new THREE.Vector3(-5, 8, 132), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'ads6', new THREE.Vector3(-3, 12, 114), isMobile, 10),
    );
    textA.push(
      createTroikaText(scene, camera, 'ads7', new THREE.Vector3(-4, 8, 94), isMobile, 10),
    );
    /*
    textA.push(
      createTroikaText(scene, camera, 'ads', new THREE.Vector3(-8.5, -7, 193), isMobile, 10),
    );
    */
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
    //backgroundAudio.play();
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
  if(loaderSubtext) {
    loaderSubtext.style.display = 'none';
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
  langService.setLanguage(userLang.startsWith('sk') ? 'sk' : 'en', update3DText);

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
        loaderStatus.textContent = 'Pri načítaní stránky nastala chyba. Skúste refresh!';
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

(window as any).switchLanguage = (lang: 'sk' | 'en') => {
  const langService = LanguageService.getInstance();
  langService.setLanguage(lang, update3DText);
}

// Add hash to URL when menu button is clicked
['sluzby', 'portfolio', 'cennik', 'legislativa', 'about'].forEach(key => {
  const btn = document.getElementById(`${key}-button`);
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.hash = key;
    });
  }
});

// Otvorí podstránku podľa hash v URL
function openSubpageByHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) {
    // Ak hash je prázdny, zavri všetky podstránky
    document.querySelectorAll('.subpage-container').forEach((subpage) => {
      (subpage as HTMLElement).style.transform = 'translateY(100vh)';
    });
    document.body.style.overflow = 'auto';
    document.querySelectorAll('.menu-button').forEach(btn => btn.classList.remove('menu-button-active'));
    return;
  }
  const btn = document.getElementById(`${hash}-button`);
  if (btn) {
    (btn as HTMLElement).click();
  }
}

window.addEventListener('hashchange', openSubpageByHash);
document.addEventListener('DOMContentLoaded', openSubpageByHash);
