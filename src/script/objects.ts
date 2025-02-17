import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Group, MathUtils, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector3 } from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import * as THREE from 'three';
import Plyr from 'plyr';
import { Text } from 'troika-three-text';

declare global {
  namespace YT {
    class Player {
      constructor(elementId: string | HTMLElement, options: PlayerOptions);
      cueVideoById(videoId: string): void;
      loadVideoById(videoId: string): void;
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      getPlayerState(): number;
      // Add other methods as needed
    }

    interface PlayerOptions {
      height?: string;
      width?: string;
      videoId?: string;
      events?: {
        onReady?: (event: OnReadyEvent) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
        // Add other event handlers as needed
      };
    }

    interface OnReadyEvent {
      target: Player;
    }

    interface OnStateChangeEvent {
      data: number;
      target: Player;
    }

    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }
  }
}

export {};

export function addVideoLocal(
  scene: Scene,
  camera: THREE.PerspectiveCamera,
  videoPositions: Vector3[],
  id: number,
  path: string,
) {
  const width = window.innerWidth * 0.75;
  const height = (width * 9) / 16; // Maintain 16:9 aspect ratio
  // Create container with video element
  const video = document.createElement('video');
  video.id = 'localVideo' + id;
  video.width = width;
  video.height = height;
  video.style.border = '0';
  video.loop = true;
  video.muted = true;
  video.playsInline = true; // Better mobile support

  // Add source with type
  const source = document.createElement('source');
  source.src = path; // Adjust path based on your project structure
  source.type = 'video/mp4';
  video.appendChild(source);

  // Add error handling
  video.onerror = (e) => {
    console.error('Error loading video:', video.error);
  };

  // Create container div
  const container = document.createElement('div');
  container.appendChild(video);
  container.style.cursor = 'pointer';

  // Create CSS3DObject and add it to scene
  const cssObject = new CSS3DObject(container);
  cssObject.position.copy(videoPositions[id]);
  cssObject.scale.set(0.04, 0.04, 0.04);
  //cssObject.rotation.y = MathUtils.degToRad(0);
  scene.add(cssObject);

  // Try to load and play the video
  video.load();

  function updateOpacity() {
    const opacityV = Math.max(0, 1 - Math.abs(camera.position.z - 25 - cssObject.position.z) / 15);
    if (opacityV > 0.5) {
      video.play();
    } else {
      video.pause();
    }
    container.style.opacity = opacityV.toString();
  }

  return { updateOpacity };
}

export function addVideo(
  scene: Scene,
  camera: THREE.PerspectiveCamera,
  videoPositions: Vector3[],
  id: number,
  videoId: string,
) {
  // Create an iframe element for the YouTube video
  const iframe = document.createElement('iframe');
  iframe.id = 'video' + id;
  iframe.src = 'https://www.youtube.com/embed/' + videoId + '?enablejsapi=1';
  iframe.width = '560';
  iframe.height = '315';
  iframe.style.border = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  // Create a CSS3DObject and add it to the scene
  //const container = document.getElementById('videoContainer');
  const cssObject = new CSS3DObject(iframe);
  //container.appendChild(iframe);
  cssObject.position.copy(videoPositions[id]);
  cssObject.scale.set(0.02, 0.02, 0.02); // Adjusted scale
  cssObject.rotation.y = MathUtils.degToRad(-45);
  scene.add(cssObject);

  // YouTube API setup
  let player = new YT.Player(iframe, {
    events: {
      onStateChange: onPlayerStateChange,
    },
  });

  // Event handler for YouTube player state change
  function onPlayerStateChange(event: any) {
    if (event.data === YT.PlayerState.PLAYING) {
      cssObject.scale.set(0.05, 0.05, 0.05);
      cssObject.rotation.y = MathUtils.degToRad(0);
    }
    if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      cssObject.scale.set(0.02, 0.02, 0.02);
      cssObject.rotation.y = MathUtils.degToRad(-45);
    }
  }

  function updateOpacity() {
    const opacityV = Math.max(0, 1 - Math.abs(camera.position.z - 25 - cssObject.position.z) / 15);
    iframe.style.opacity = opacityV.toString();
  }

  return { updateOpacity };
}

export function addCloud(scene: Scene, x: number, y: number, z: number) {
  // Add 3D cloud
  const cloudParticles = new Group();
  const particleCount = 100; // Adjust particle count as needed

  for (let i = 0; i < particleCount; i++) {
    const particle = new Mesh(
      new SphereGeometry(Math.random() * 1.2, 16, 16),
      new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: Math.random() * 0.6 }),
    );

    // Randomize particle positions within a range
    particle.position.set(
      x + Math.random() * 4, // X position
      y + Math.random() * 4, // Y position (adjust as needed)
      z + Math.random() * 4, // Z position
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

export function loadSun(scene: THREE.Scene, x: number, y: number, z: number) {
  const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(x, y, z);
  scene.add(sun);

  // Sunlight (PointLight)
  const sunLight = new THREE.PointLight(0xffff00, 2, 100);
  sunLight.position.set(x, y, z);
  scene.add(sunLight);

  // Rays (Cone Geometry)
  const rayCount = 16;
  const rayLength = 2;
  const rayGeometry = new THREE.ConeGeometry(0.1, rayLength, 32);
  const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const rays = new THREE.Group();

  for (let i = 0; i < rayCount; i++) {
    const ray = new THREE.Mesh(rayGeometry, rayMaterial);
    ray.position.set(Math.cos((i / rayCount) * Math.PI * 2), Math.sin((i / rayCount) * Math.PI * 2), 0);
    ray.lookAt(x, y, z);
    ray.translateZ(-rayLength / 2);
    rays.add(ray);
  }

  rays.scale.set(1.5, 1.5, 1.5);
  //scene.add(rays);

  // Glow Effect (Simple Shader Material)
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
    fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(1.0, 0.8, 0.0, 1.0) * intensity;
                }
            `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  const sunGlow = new THREE.Mesh(sunGeometry.clone(), glowMaterial);
  sunGlow.scale.multiplyScalar(1.2);
  sunGlow.position.set(x, y, z);
  scene.add(sunGlow);
}

export function createTroikaText(scene: Scene, camera: THREE.Camera, text: string, position: THREE.Vector3) {
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
