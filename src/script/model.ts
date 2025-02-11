import { BoxGeometry, Group, LoadingManager, Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export function loadModel(
  scene: Scene,
  camera: THREE.PerspectiveCamera,
  loadingManager: LoadingManager,
  path: string,
  scale: number,
  position: THREE.Vector3,
) {
  const loader = new GLTFLoader(loadingManager);
  let model: Group;
  let mixer: THREE.AnimationMixer;
  let skeleton;
  let idleAction, walkAction, runAction;
  let actions;
  loader.load(path, function (gltf) {
    model = gltf.scene;
    scene.add(model);

    model.scale.set(scale, scale, scale);
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(0, 0, 0);

    model.traverse(function (object) {
      if ((object as any).isMesh) object.castShadow = true;
    });

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    const animations = gltf.animations;

    mixer = new THREE.AnimationMixer(model);
    animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    idleAction = mixer.clipAction(animations[0]);
    walkAction = mixer.clipAction(animations[2]);
    runAction = mixer.clipAction(animations[1]);

    actions = [idleAction, walkAction, runAction];
  });

  function getMixer() {
    return mixer;
  }

  function updatePosition(newPosition: any) {
    const oldPosition = model.position;

    model.position.copy(newPosition);

    //propeller1.rotation.z += 0.1;
    // propeller2.rotation.z += 0.1;
    //propeller3.rotation.z += 0.1;
    //propeller4.rotation.z += 0.1;

    // Update the camera to follow the moving object
    const dronPosition = new THREE.Vector3(position.x, position.y, position.z);
    model.getWorldPosition(dronPosition);

    if (oldPosition.z != model.position.z) {
      const oldRotation = model.rotation;

      model.rotation.set(oldRotation.x, oldRotation.y, oldRotation.z * 1.1);
    }

    camera.position.set(dronPosition.x, dronPosition.y + 2, dronPosition.z + 10);
    camera.lookAt(dronPosition);
  }

  return { getMixer, skeleton, actions, updatePosition };
}

export function loadDron(scene: Scene, camera: THREE.PerspectiveCamera, x: number, y: number, z: number) {
  // Drone body
  const bodyGeometry = new BoxGeometry(1, 0.5, 2);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  scene.add(body);
  /*
  // Drone arms
  const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

  const arm1 = new THREE.Mesh(armGeometry, armMaterial);
  arm1.rotation.z = Math.PI / 2;
  arm1.position.set(body.position.x + 0, body.position.y + 0.25, body.position.z + 0.75);
  scene.add(arm1);

  const arm2 = arm1.clone();
  arm2.position.set(body.position.x + 0, body.position.y + 0.25, body.position.z - 0.75);
  scene.add(arm2);

  // Drone propellers
  const propellerGeometry = new THREE.BoxGeometry(0.1, 0.01, 0.5);
  const propellerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const propeller1 = new THREE.Mesh(propellerGeometry, propellerMaterial);
  propeller1.position.set(1, 0.25, 0.75);
  scene.add(propeller1);

  const propeller2 = propeller1.clone();
  propeller2.position.set(-1, 0.25, 0.75);
  scene.add(propeller2);

  const propeller3 = propeller1.clone();
  propeller3.position.set(1, 0.25, -0.75);
  scene.add(propeller3);

  const propeller4 = propeller1.clone();
  propeller4.position.set(-1, 0.25, -0.75);
  scene.add(propeller4);
*/
  function updatePosition(newPosition: any) {
    body.position.copy(newPosition);

    //propeller1.rotation.z += 0.1;
    // propeller2.rotation.z += 0.1;
    //propeller3.rotation.z += 0.1;
    //propeller4.rotation.z += 0.1;

    // Update the camera to follow the moving object
    const dronPosition = new THREE.Vector3(x, y, z);
    body.getWorldPosition(dronPosition);
    camera.position.set(dronPosition.x, dronPosition.y + 2, dronPosition.z + 10);
    camera.lookAt(dronPosition);
  }

  return { model: body, updatePosition };
}
