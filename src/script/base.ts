import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { loadModel } from './model';
import { addCloud, loadLights, loadText, loadTexture } from './objects';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import 'plyr/dist/plyr.css';
import { BackgroundAudio } from './audio';
import { Menu } from './menu';
import { isSubpageOpen } from './utils';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//const videoPositions = [new THREE.Vector3(0, 0, 155), new THREE.Vector3(0, 10, 110), new THREE.Vector3(0, 0, 75)];
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
const videoA: any[] = [];
const modelA: any[] = [];
const clock = new THREE.Clock();
let textFont: Font;
let backgroundAudio: BackgroundAudio;
let isCanvasReady = false;
let portfolioContainer: HTMLDivElement;
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

function startExperience() {
  if (!isCanvasReady) return;

  if (loaderContainer && loaderimg && topLogo) {
    const logoRect = topLogo.getBoundingClientRect();
    const loaderRect = loaderimg.getBoundingClientRect();

    // Výpočet rozdielu medzi pozíciami
    const deltaX = logoRect.left - loaderRect.right - (isMobile ? -60 : 0);
    const deltaY = logoRect.top - loaderRect.bottom - (isMobile ? -100 : 80);

    loaderContainer.style.opacity = '0';
    loaderContainer.style.transition = 'transform 1.5s ease, opacity 1.5s ease';
    if (isMobile) {
      loaderContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.6)`;
    } else {
      loaderContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.4)`;
    }
  }

  if (startButton) {
    startButton.style.display = 'none';
  }

  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 1.5s ease';
  canvas.style.display = 'block';

  setTimeout(() => {
    canvas.style.opacity = '1';
  }, 500);

  setTimeout(() => {
    if (loaderContainer) {
      loaderContainer.style.display = 'none';
    }
    if (topLogo) {
      topLogo.style.opacity = '1';
    }
  }, 1500);

  init();
}

function start() {
  initMenu();

  if (startButton) {
    startButton.addEventListener('click', startExperience);
  } else {
    console.error('startButton_no');
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
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
      console.log('Loading complete!');
      isCanvasReady = true;
      startButton.style.display = 'block';
      if (loaderStatus) {
        loaderStatus.style.display = 'none';
      }
    },
    // onProgress callback
    (url, itemsLoaded, itemsTotal) => {
      if (loaderStatus) {
        loaderStatus.style.display = 'block';
        //loaderStatus.textContent = 'Loading: ' + ((itemsLoaded / itemsTotal) * 100).toFixed(2) + '%';
        loaderStatus.textContent = 'Dron sa pripravuje na svoj štart ... ';
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

function updateSize() {
  // Get the actual display size
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Uprav FOV kamery pre mobilné zariadenia (zväčší zorné pole = zmenší scénu)
  camera.fov = isMobile ? 110 : 75; // Väčší FOV = menšia scéna
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // Update renderers
  renderer.setSize(width, height, false);
  cssRenderer.setSize(width, height);

  // Set pixel ratio for better mobile display
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
}

function loadEvents() {
  // Handle window resize
  window.addEventListener('resize', updateSize);

  // Handle device orientation for mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(updateSize, 100);
  });

  window.addEventListener('wheel', (event) => {
    // Aplikuj speed len ak nie je otvorená žiadna subpage
    if (!isSubpageOpen()) {
      speed += event.deltaY * accelerationFactor;
    }
  });

  // Prevent default touch behaviors
  document.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
    },
    { passive: false },
  );

  // Prevent context menu (long press)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  canvas?.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
    },
    { passive: false },
  );

  // Allow navigation elements to work
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
  const TOUCH_SPEED = 0.001; // Znížená základná rýchlosť pre touch

  // Touch controls - only on canvas
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

      if (isMoving && !isSubpageOpen()) {
        if (deltaY > 0) {
          // Moving finger downward - go forward
          speed -= deltaY * TOUCH_SPEED;
        } else if (deltaY < 0) {
          // Moving finger upward - go backward
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

function loadResources() {
  loadLights(scene);

  //loadSun(scene, 20, 15, 50);

  const texture = loadTexture(loadingManager, 'textures/sunshine-clouds-min.jpg', 1350, 900, 500);
  scene.add(texture);

  const startPosition = new THREE.Vector3(0, 0, 200);

  createPath(scene, camera, startPosition);

  dron = loadModel(scene, camera, loadingManager, 'models/drone6.glb', 3, startPosition);
  modelA.push(dron);

  addCloud(scene, -5, 0, 190);
  addCloud(scene, -10, 0, 160);
  addCloud(scene, 30, 5, 140);
  addCloud(scene, 30, 0, 140);
  addCloud(scene, 20, 10, 120);
  addCloud(scene, 10, 0, 110);
  addCloud(scene, -20, 0, 100);
  addCloud(scene, -10, 10, 90);
  addCloud(scene, 30, 10, 80);
  addCloud(scene, 20, 5, 70);
  addCloud(scene, -10, -5, 60);
  addCloud(scene, 15, 0, 40);
  addCloud(scene, 10, 10, 20);
  addCloud(scene, -10, 0, 20);
  addCloud(scene, 0, 0, 20);
  addCloud(scene, -10, -5, 20);
  addCloud(scene, 5, 5, 20);

  //videoA.push(addVideo(scene, camera, videoPositions, 0, 'eLYS88I2dK0'));
  //videoA.push(addVideo(scene, camera, videoPositions, 1, 'eLYS88I2dK0'));
  //videoA.push(addVideo(scene, camera, videoPositions, 2, 'eLYS88I2dK0'));

  //dron = loadDron(scene, camera, 0, 0, 200);

  //videoA.push(addVideoLocal(scene, camera, videoPositions, 0, '/src/assets/videos/veterans1.mp4'));
  //videoA.push(addVideoLocal(scene, camera, videoPositions, 1, '/src/assets/videos/scandinavia.mov'));

  const loader = new FontLoader(loadingManager);
  //const text1 = createTroikaText(scene, camera, 'Viac než len obraz', new THREE.Vector3(5, 0, 150));
  //textA.push(text1);

  loader.load('font/Montserrat_Regular.json', function (font) {
    textFont = font;
    textA.push(loadText(scene, camera, textFont, 'Portfólio', 1, 0x00000, -7, 20, 30));
    textA.push(loadText(scene, camera, textFont, 'Každý Príbeh', 1, 0x00000, -9, 19, 60));
    textA.push(loadText(scene, camera, textFont, 'Každá Emócia', 1, 0x00000, 2, 19, 60));
    textA.push(loadText(scene, camera, textFont, 'Každý Detail', 1, 0x00000, -3, 17, 60));
    textA.push(loadText(scene, camera, textFont, 'si zaslúži byť zachytený tak', 1, 0x00000, -7, 13, 60));
    textA.push(loadText(scene, camera, textFont, 'ako ho cítite', 1, 0x00000, -2, 11, 60));
    textA.push(
      loadText(scene, camera, textFont, 'Videoprodukcia\npríbehy\nktoré Vás vtiahnu do deja', 1, 0x00000, -3, 7, 90),
    );
    textA.push(
      loadText(scene, camera, textFont, 'Fotografovanie momenty,\nktoré hovoria za vás', 1, 0x00000, -8, 15, 120),
    );
    textA.push(
      loadText(
        scene,
        camera,
        textFont,
        'Letecké zábery dronom\npohľad\nktorý mení perspektívu',
        1,
        0x00000,
        -10,
        5,
        150,
      ),
    );
    textA.push(loadText(scene, camera, textFont, 'Viac než len obraz\npocit, ktorý zostáva', 1, 0x00000, -3, 4, 180));
  });
}

function initAudio() {
  backgroundAudio = new BackgroundAudio();
  // Pridaj event listener na prvú interakciu
  const startAudioOnInteraction = () => {
    backgroundAudio.play();
    // Odstráň event listenery po prvom spustení
    ['click', 'touchstart', 'scroll', 'wheel'].forEach((event) => {
      document.removeEventListener(event, startAudioOnInteraction);
    });
  };

  // Pridaj event listenery pre prvú interakciu
  ['click', 'touchstart', 'scroll', 'wheel'].forEach((event) => {
    document.addEventListener(event, startAudioOnInteraction);
  });
}

async function createSubpageSection(
  subpageContainer: HTMLDivElement,
  component: string,
  closeId: string,
  menuId: string,
) {
  // Vytvor container pre portfolio

  subpageContainer.id = 'subpage-' + menuId;
  subpageContainer.classList.add('subpage-container');

  try {
    // Načítaj HTML obsah zo súboru
    const response = await fetch('pages/' + component + '.html');
    const html = await response.text();
    subpageContainer.innerHTML = html;
  } catch (error) {
    console.error('Nepodarilo sa načítať subpage: ' + component, error);
    subpageContainer.innerHTML = '<div>Nepodarilo sa načítať obsah</div>';
  }

  document.body.appendChild(subpageContainer);

  const closeOnClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!subpageContainer.contains(target) && !target.closest('#' + menuId + '')) {
      subpageContainer.style.transform = 'translateY(100%)';
      setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 500);
      //document.removeEventListener('click', closeOnClickOutside);
    }
  };

  // Pridaj event listener na zatváracie tlačidlo
  const closeBtn = document.getElementById(closeId);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      subpageContainer.style.transform = 'translateY(100%)';
      setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 500);
      document.removeEventListener('click', closeOnClickOutside);
    });
  }

  addSubPageListener(subpageContainer, menuId, closeOnClickOutside);

  return subpageContainer;
}

function addSubPageListener(container: HTMLDivElement, menuId: string, closeOnClickOutside: any) {
  // Pridaj event listener na portfolio link
  const sectionLink = document.querySelectorAll('#' + menuId + '');
  if (sectionLink) {
    sectionLink.forEach((sl) =>
      sl.addEventListener('click', (e) => {
        e.preventDefault();
        const allSubpages = document.querySelectorAll('.subpage-container');
        allSubpages.forEach((subpage) => {
          (subpage as HTMLElement).style.transform = 'translateY(100%)';
        });

        document.body.style.overflow = 'hidden';
        container.style.transform = 'translateY(0)';
        backgroundAudio.pause();
        document.addEventListener('click', closeOnClickOutside);
      }),
    );
  }
}

async function initMenu() {
  new Menu();

  // Vytvor portfolio sekciu
  portfolioContainer = document.createElement('div');
  await createSubpageSection(portfolioContainer, 'portfolio', 'closePortfolio', 'portfolio-button');
  // Vytvor klienti sekciu
  const klientiContainer = document.createElement('div');
  await createSubpageSection(klientiContainer, 'klienti', 'closeKlienti', 'klienti-button');
  // Vytvor about sekciu
  const aboutContainer = document.createElement('div');
  await createSubpageSection(aboutContainer, 'about', 'closeAbout', 'about-button');
}

function init() {
  loadEvents();
  animate();
  initAudio();
}

// Function to update the cube's position along the curve
function updatePosition() {
  // Update position on the curve based on speed
  positionOnCurve += speed / 100;

  // Clamp position to stay within the curve's bounds
  positionOnCurve = Math.max(0, Math.min(1, positionOnCurve));

  // Calculate new position based on the curve's path
  const newPosition = curve.getPointAt(positionOnCurve);
  dron.updatePosition(newPosition);
  speed *= dampingFactor;

  if (newPosition.z < 30 && portfolioContainer) {
    document.body.style.overflow = 'hidden';
    portfolioContainer.style.transform = 'translateY(0)';
    backgroundAudio.pause();
  }
}

function updateOpacity() {
  if (textA) {
    for (let i = 0; i < textA.length; i++) {
      textA[i].updateTextOpacity();
    }
  }
  if (videoA) {
    for (let i = 0; i < videoA.length; i++) {
      videoA[i].updateOpacity();
    }
  }
}

function updateModel() {
  for (let i = 0; i < modelA.length; i++) {
    if (modelA[i].getMixer()) {
      modelA[i].getMixer().update(clock.getDelta());
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  updatePosition();

  updateOpacity();

  updateModel();

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

function createPath(scene: THREE.Scene, camera: THREE.PerspectiveCamera, position: THREE.Vector3) {
  const points = [];
  for (let i = 20; i >= 0; i--) {
    //points.push(new THREE.Vector3(i % 3 == 0 ? 5 : 0, 0, i * 10));
  }

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

start();
