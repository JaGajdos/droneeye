import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { loadDron, loadModel } from './model';
import { addCloud, addVideo, addVideoLocal, loadLights, loadSun, loadText, loadTexture } from './objects';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import 'plyr/dist/plyr.css';
import { BackgroundAudio } from './audio';
import { Menu } from './menu';
import { Text } from 'troika-three-text';

const videoPositions = [new THREE.Vector3(0, 0, 155), new THREE.Vector3(0, 10, 110), new THREE.Vector3(0, 0, 75)];
let positionOnCurve = 0;
let speed = 0;
let curve: THREE.CatmullRomCurve3;
const dampingFactor = 0.95;
const accelerationFactor = 0.1 * 0.01;
let loadingManager: THREE.LoadingManager;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let dron: any;
let canvas: HTMLElement;
let renderer: THREE.WebGLRenderer;
let cssRenderer: CSS3DRenderer;
const textA: any[] = [];
const videoA: any[] = [];
const modelA: any[] = [];
const clock = new THREE.Clock();
let textFont: Font;
let backgroundAudio: BackgroundAudio;

const pathPoint: number[][] = [
  [0, 0, 200],
  [3, 0, 190],
  [5, 0, 180],
  [3, 0, 170],
  [0, 3, 160],
  [-3, 3, 150],
  [-3, 3, 140],
  [-3, 10, 130],
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

function start() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

  canvas = document.getElementById('threeCanvas')!;
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
      document.getElementById('loader')!.style.display = 'none';
      document.getElementById('threeCanvas')!.style.display = 'block';
      init();
    },
    // onProgress callback
    (url, itemsLoaded, itemsTotal) => {
      const text = document.getElementById('loadingText');
      if (text) {
        text.textContent = 'Loading: ' + ((itemsLoaded / itemsTotal) * 100).toFixed(2) + '%';
      }
      console.log('Loading file.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    },
    // onError callback
    (url) => {
      const text = document.getElementById('loadingText');
      if (text) {
        text.textContent = 'Error loading';
      }
      console.log('There was an error loading');
    },
  );

  loadResources();
}

function updateSize() {
  // Get the actual display size
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Detekcia mobilného zariadenia
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
    speed += event.deltaY * accelerationFactor;
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

  const canvas = document.getElementById('threeCanvas');
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
  const dampingFactor = 0.95; // Faktor spomalenia (rovnaký ako pri wheel)

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

      if (isMoving) {
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

function create2DText(text: string, position: THREE.Vector3) {
  // Vytvor HTML element
  const textElement = document.createElement('div');
  textElement.textContent = text;
  textElement.style.fontSize = '0.5px';
  textElement.style.fontFamily = 'Arial, sans-serif';
  textElement.style.color = 'black';
  //textElement.style.padding = '10px';

  // Vytvor CSS3D objekt
  const textObject = new CSS3DObject(textElement);
  textObject.position.copy(position);

  return textObject;
}

function createTroikaText(text: string, position: THREE.Vector3) {
  const myText = new Text();
  myText.text = text;
  myText.fontSize = 2;
  myText.position.copy(position);
  myText.color = 0x000000;
  myText.sync();

  scene.add(myText);

  function updateTextOpacity() {
    if (myText) {
      (myText.material as any).opacity = Math.max(0, 1 - Math.abs(camera.position.z - 50 - myText.position.z) / 20);
    }
  }

  return { updateTextOpacity };
}

function loadResources() {
  loadLights(scene);

  //loadSun(scene, 20, 15, 50);

  const texture = loadTexture(loadingManager, 'src/assets/textures/sunshine-clouds-min.jpg', 1350, 900, 500);
  scene.add(texture);

  const startPosition = new THREE.Vector3(0, 0, 200);

  createPath(scene, camera, startPosition);

  dron = loadModel(scene, camera, loadingManager, 'src/assets/models/drone6.glb', 3, startPosition);
  modelA.push(dron);

  addCloud(scene, -5, 0, 190);
  addCloud(scene, -10, 0, 160);
  addCloud(scene, 40, 0, 140);
  addCloud(scene, 30, 0, 140);
  addCloud(scene, 20, 10, 120);
  addCloud(scene, 10, 0, 110);
  addCloud(scene, 40, 0, 100);
  addCloud(scene, 40, 0, 800);

  //videoA.push(addVideo(scene, camera, videoPositions, 0, 'eLYS88I2dK0'));
  //videoA.push(addVideo(scene, camera, videoPositions, 1, 'eLYS88I2dK0'));
  //videoA.push(addVideo(scene, camera, videoPositions, 2, 'eLYS88I2dK0'));

  //dron = loadDron(scene, camera, 0, 0, 200);

  //videoA.push(addVideoLocal(scene, camera, videoPositions, 0, '/src/assets/videos/veterans1.mp4'));
  //videoA.push(addVideoLocal(scene, camera, videoPositions, 1, '/src/assets/videos/scandinavia.mov'));

  const loader = new FontLoader(loadingManager);
  //const text = create2DText('Viac než len obraz', new THREE.Vector3(5, 0, 130));
  const text1 = createTroikaText('Viac než len obraz', new THREE.Vector3(5, 0, 150));
  const text2 = createTroikaText(
    'Letecké zábery dronom\npohľad, ktorý mení perspektívu',
    new THREE.Vector3(-5, 0, 110),
  );
  const text3 = createTroikaText('Videoprodukcia\npríbehy, ktoré Vás vtiahnu do deja', new THREE.Vector3(15, 0, 70));
  const text4 = createTroikaText('Fotografovanie\nmomenty, ktoré hovoria za vás', new THREE.Vector3(-15, 0, 30));
  textA.push(text1);
  textA.push(text2);
  textA.push(text3);
  textA.push(text4);

  /*
  loader.load('src/assets/font/Source Sans Pro_Regular.json', function (font) {
    textFont = font;
    textA.push(loadText(scene, camera, textFont, 'Vitajte', 1, -5, 0, 130));
    textA.push(loadText(scene, camera, textFont, 'Vitajte druhykrat', 1, 10, 0, 50));
    loadText(scene, camera, textFont, 'Viac než len obraz \n pocit, ktorý zostáva', 1, 5, 0, 190);
  });
  */
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

async function createSubpageSection(component: string, closeId: string) {
  // Vytvor container pre portfolio
  const subpageContainer = document.createElement('div');
  subpageContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(100%);
    transition: transform 0.5s ease-in-out;
    z-index: 1000;
    overflow-y: auto;
  `;

  try {
    // Načítaj HTML obsah zo súboru
    const response = await fetch('/src/components/' + component + '.html');
    const html = await response.text();
    subpageContainer.innerHTML = html;
  } catch (error) {
    console.error('Nepodarilo sa načítať subpage: ' + component, error);
    subpageContainer.innerHTML = '<div>Nepodarilo sa načítať obsah</div>';
  }

  document.body.appendChild(subpageContainer);

  // Pridaj event listener na zatváracie tlačidlo
  const closeBtn = document.getElementById(closeId);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      subpageContainer.style.transform = 'translateY(100%)';
      setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 500);
    });
  }

  return subpageContainer;
}

function addSubPageListener(container: HTMLDivElement, menuUrl: string) {
  // Pridaj event listener na portfolio link
  const sectionLink = document.querySelectorAll('a[href="' + menuUrl + '"]');
  if (sectionLink) {
    sectionLink.forEach((sl) =>
      sl.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.overflow = 'hidden';
        container.style.transform = 'translateY(0)';
      }),
    );
  }
}

async function initMenu() {
  new Menu();

  // Vytvor portfolio sekciu
  const portfolioSection = await createSubpageSection('portfolio', 'closePortfolio');
  addSubPageListener(portfolioSection, '#portfolio');

  // Vytvor klienti sekciu
  const klientiSection = await createSubpageSection('klienti', 'closeKlienti');
  addSubPageListener(klientiSection, '#klienti');

  // Vytvor about sekciu
  const aboutSection = await createSubpageSection('about', 'closeAbout');
  addSubPageListener(aboutSection, '#about');
}

function init() {
  loadEvents();
  animate();
  //initAudio();
  initMenu();
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
  scene.add(curveLine);

  // Position the camera
  camera.position.set(position.x, position.y + 2, position.z);
  camera.lookAt(position);
}

start();
