import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { Group, Mesh, MeshBasicMaterial, Scene, SphereGeometry } from 'three';
import * as THREE from 'three';
import { Text } from 'troika-three-text';

export function addCloud(scene: Scene, x: number, y: number, z: number) {
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
  text: string,
  position: THREE.Vector3,
  opacityKoef?: number,
  opacityZ?: number,
) {
  const myText = new Text();
  myText.text = text;
  myText.fontSize = 0.7;
  myText.font = 'font/Georgia.woff';
  myText.position.copy(position);
  myText.color = 0x000000;
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

  return { updateTextOpacity };
}
