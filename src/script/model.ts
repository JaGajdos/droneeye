import { Group, LoadingManager, Scene } from 'three';
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
