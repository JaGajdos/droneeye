import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, Scene, SphereGeometry } from 'three';
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { LanguageService } from '@/i18n/languageService';

function generateCloudTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 10,
    size / 2, size / 2, size / 2,
  );

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

const cloudTexture = generateCloudTexture();

export function addCloud(scene: Scene, x: number, y: number, z: number) {
  const cloudGroup = new Group();
  const particleCount = 80;

  for (let i = 0; i < particleCount; i++) {
    const material = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4 + Math.random() * 0.4,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    const width = 6 + Math.random() * 6;  // predtým 6–12
    const height = 3 + Math.random() * 3;   // predtým 3–6
    sprite.scale.set(width, height, 1);

    sprite.position.set(
      x + Math.random() * 10 - 5,
      y + Math.random() * 5,
      z + Math.random() * 10 - 5
    );

    cloudGroup.add(sprite);
  }

  scene.add(cloudGroup);
}

export function addRealisticCloud(
  scene: THREE.Scene,
  x: number,
  y: number,
  z: number,
  texturePath: string,
  scaleX: number = 30,
  scaleY: number = 20,
  opacity: number = 0.5
): void {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(texturePath, (texture) => {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scaleX, scaleY, 1);
    sprite.position.set(x, y, z);

    scene.add(sprite);
  });
}

const clock = new THREE.Clock();

function createSunLayerTexture(): CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );

  gradient.addColorStop(0.0, 'rgba(255, 255, 200, 1.0)');
  gradient.addColorStop(0.4, 'rgba(255, 245, 100, 0.6)');
  gradient.addColorStop(0.8, 'rgba(255, 225, 50, 0.3)');
  gradient.addColorStop(1.0, 'rgba(255, 210, 50, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Pridá slnko do scény a vráti animačnú funkciu
 */
export function addDetailedSun(scene: Scene, x: number, y: number, z: number): () => void {
  const sunGroup = new Group();
  const texture = createSunLayerTexture();

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sunSprite = new THREE.Sprite(material);
  sunSprite.scale.set(40, 40, 1); // veľkosť slnka
  sunSprite.position.set(x, y, z);
  sunGroup.add(sunSprite);

  scene.add(sunGroup);

  // Funkcia na pulzovanie
  return () => {
    const t = clock.getElapsedTime();
    const scale = 1 + Math.random()  * Math.sin(t * 3);
    sunSprite.scale.set(40 * scale, 40 * scale, 1);
  };
}

export function addCloudOld(scene: Scene, x: number, y: number, z: number) {
  // Add 3D cloud
  const cloudParticles = new Group();
  const particleCount = 200; // Adjust particle count as needed

  for (let i = 0; i < particleCount; i++) {
    const particle = new Mesh(
      new SphereGeometry(Math.random() * 1.2, 16, 16),
      new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: Math.random() * 0.6 }),
    );

    // Randomize particle positions within a range
    particle.position.set(
      x + Math.random() * 6, // X position
      y + Math.random() * 6, // Y position (adjust as needed)
      z + Math.random() * 6, // Z position
    );

    cloudParticles.add(particle);
  }

  scene.add(cloudParticles);
}

export function loadText(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  textFont: Font,
  text: string,
  fontSize: number,
  color: THREE.ColorRepresentation,
  x: number,
  y: number,
  z: number,
) {
  // Load font and create text

  let textMesh: THREE.Mesh;
  var textGeometry = new TextGeometry(text, {
    font: textFont,
    size: fontSize,
    depth: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  const textMaterial = new THREE.MeshPhongMaterial({ color: color, transparent: true, opacity: 1 });
  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(textMesh);

  textMesh.position.set(x, y, z);

  function updateTextOpacity() {
    if (textMesh) {
      (textMesh.material as any).opacity = Math.max(0, 1 - Math.abs(camera.position.z - 15 - textMesh.position.z) / 20);
    }
  }

  return { updateTextOpacity };
}

export function loadTexture(
  loadingManager: THREE.LoadingManager,
  path: string,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const skyTexture = textureLoader.load(path);

  // Create skybox
  const skyGeometry = new THREE.SphereGeometry(x, y, z);
  const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
  return new THREE.Mesh(skyGeometry, skyMaterial);
}

export function loadLights(scene: Scene) {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(0, 20, 200);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(-3, 10, 190);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);
}

export function createTroikaText(
  scene: Scene,
  camera: THREE.Camera,
  textKey: string,
  position: THREE.Vector3,
  isMobile: boolean,
  opacityKoef?: number,
  opacityZ?: number,
) {
  const langService = LanguageService.getInstance();
  const myText = new Text();
  myText.text = langService.getMessage(textKey).toUpperCase();
  myText.fontSize = isMobile ? 0.5 : 0.7;
  myText.font = 'font/georgiab.woff';
  myText.position.copy(position);
  myText.color = 0x000000;
  myText.textAlign = 'center';
  myText.sync();

  scene.add(myText);

  function updateTextOpacity() {
    if (myText) {
      (myText.material as any).opacity = Math.max(
        0,
        1 -
          Math.abs(camera.position.z - (opacityZ && opacityZ > 0 ? opacityZ : 15) - myText.position.z) /
            (opacityKoef && opacityKoef > 0 ? opacityKoef : 20),
      );
    }
  }

  function updateText() {
    const langService = LanguageService.getInstance();
    myText.text = langService.getMessage(textKey).toUpperCase();
    myText.sync();
  }

  return { updateTextOpacity, updateText };
}
