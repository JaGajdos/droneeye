import {
  Matrix4,
  Object3D,
  Quaternion,
  Vector3
} from "./chunk-BQEVJPUQ.js";

// node_modules/three/examples/jsm/renderers/CSS3DRenderer.js
var _position = new Vector3();
var _quaternion = new Quaternion();
var _scale = new Vector3();
var CSS3DObject = class extends Object3D {
  constructor(element = document.createElement("div")) {
    super();
    this.isCSS3DObject = true;
    this.element = element;
    this.element.style.position = "absolute";
    this.element.style.pointerEvents = "auto";
    this.element.style.userSelect = "none";
    this.element.setAttribute("draggable", false);
    this.addEventListener("removed", function() {
      this.traverse(function(object) {
        if (object.element instanceof Element && object.element.parentNode !== null) {
          object.element.parentNode.removeChild(object.element);
        }
      });
    });
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.element = source.element.cloneNode(true);
    return this;
  }
};
var CSS3DSprite = class extends CSS3DObject {
  constructor(element) {
    super(element);
    this.isCSS3DSprite = true;
    this.rotation2D = 0;
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.rotation2D = source.rotation2D;
    return this;
  }
};
var _matrix = new Matrix4();
var _matrix2 = new Matrix4();
var CSS3DRenderer = class {
  constructor(parameters = {}) {
    const _this = this;
    let _width, _height;
    let _widthHalf, _heightHalf;
    const cache = {
      camera: { style: "" },
      objects: /* @__PURE__ */ new WeakMap()
    };
    const domElement = parameters.element !== void 0 ? parameters.element : document.createElement("div");
    domElement.style.overflow = "hidden";
    this.domElement = domElement;
    const viewElement = document.createElement("div");
    viewElement.style.transformOrigin = "0 0";
    viewElement.style.pointerEvents = "none";
    domElement.appendChild(viewElement);
    const cameraElement = document.createElement("div");
    cameraElement.style.transformStyle = "preserve-3d";
    viewElement.appendChild(cameraElement);
    this.getSize = function() {
      return {
        width: _width,
        height: _height
      };
    };
    this.render = function(scene, camera) {
      const fov = camera.projectionMatrix.elements[5] * _heightHalf;
      if (camera.view && camera.view.enabled) {
        viewElement.style.transform = `translate( ${-camera.view.offsetX * (_width / camera.view.width)}px, ${-camera.view.offsetY * (_height / camera.view.height)}px )`;
        viewElement.style.transform += `scale( ${camera.view.fullWidth / camera.view.width}, ${camera.view.fullHeight / camera.view.height} )`;
      } else {
        viewElement.style.transform = "";
      }
      if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
      if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();
      let tx, ty;
      if (camera.isOrthographicCamera) {
        tx = -(camera.right + camera.left) / 2;
        ty = (camera.top + camera.bottom) / 2;
      }
      const scaleByViewOffset = camera.view && camera.view.enabled ? camera.view.height / camera.view.fullHeight : 1;
      const cameraCSSMatrix = camera.isOrthographicCamera ? `scale( ${scaleByViewOffset} )scale(` + fov + ")translate(" + epsilon(tx) + "px," + epsilon(ty) + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse) : `scale( ${scaleByViewOffset} )translateZ(` + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse);
      const perspective = camera.isPerspectiveCamera ? "perspective(" + fov + "px) " : "";
      const style = perspective + cameraCSSMatrix + "translate(" + _widthHalf + "px," + _heightHalf + "px)";
      if (cache.camera.style !== style) {
        cameraElement.style.transform = style;
        cache.camera.style = style;
      }
      renderObject(scene, scene, camera, cameraCSSMatrix);
    };
    this.setSize = function(width, height) {
      _width = width;
      _height = height;
      _widthHalf = _width / 2;
      _heightHalf = _height / 2;
      domElement.style.width = width + "px";
      domElement.style.height = height + "px";
      viewElement.style.width = width + "px";
      viewElement.style.height = height + "px";
      cameraElement.style.width = width + "px";
      cameraElement.style.height = height + "px";
    };
    function epsilon(value) {
      return Math.abs(value) < 1e-10 ? 0 : value;
    }
    function getCameraCSSMatrix(matrix) {
      const elements = matrix.elements;
      return "matrix3d(" + epsilon(elements[0]) + "," + epsilon(-elements[1]) + "," + epsilon(elements[2]) + "," + epsilon(elements[3]) + "," + epsilon(elements[4]) + "," + epsilon(-elements[5]) + "," + epsilon(elements[6]) + "," + epsilon(elements[7]) + "," + epsilon(elements[8]) + "," + epsilon(-elements[9]) + "," + epsilon(elements[10]) + "," + epsilon(elements[11]) + "," + epsilon(elements[12]) + "," + epsilon(-elements[13]) + "," + epsilon(elements[14]) + "," + epsilon(elements[15]) + ")";
    }
    function getObjectCSSMatrix(matrix) {
      const elements = matrix.elements;
      const matrix3d = "matrix3d(" + epsilon(elements[0]) + "," + epsilon(elements[1]) + "," + epsilon(elements[2]) + "," + epsilon(elements[3]) + "," + epsilon(-elements[4]) + "," + epsilon(-elements[5]) + "," + epsilon(-elements[6]) + "," + epsilon(-elements[7]) + "," + epsilon(elements[8]) + "," + epsilon(elements[9]) + "," + epsilon(elements[10]) + "," + epsilon(elements[11]) + "," + epsilon(elements[12]) + "," + epsilon(elements[13]) + "," + epsilon(elements[14]) + "," + epsilon(elements[15]) + ")";
      return "translate(-50%,-50%)" + matrix3d;
    }
    function renderObject(object, scene, camera, cameraCSSMatrix) {
      if (object.isCSS3DObject) {
        const visible = object.visible === true && object.layers.test(camera.layers) === true;
        object.element.style.display = visible === true ? "" : "none";
        if (visible === true) {
          object.onBeforeRender(_this, scene, camera);
          let style;
          if (object.isCSS3DSprite) {
            _matrix.copy(camera.matrixWorldInverse);
            _matrix.transpose();
            if (object.rotation2D !== 0) _matrix.multiply(_matrix2.makeRotationZ(object.rotation2D));
            object.matrixWorld.decompose(_position, _quaternion, _scale);
            _matrix.setPosition(_position);
            _matrix.scale(_scale);
            _matrix.elements[3] = 0;
            _matrix.elements[7] = 0;
            _matrix.elements[11] = 0;
            _matrix.elements[15] = 1;
            style = getObjectCSSMatrix(_matrix);
          } else {
            style = getObjectCSSMatrix(object.matrixWorld);
          }
          const element = object.element;
          const cachedObject = cache.objects.get(object);
          if (cachedObject === void 0 || cachedObject.style !== style) {
            element.style.transform = style;
            const objectData = { style };
            cache.objects.set(object, objectData);
          }
          if (element.parentNode !== cameraElement) {
            cameraElement.appendChild(element);
          }
          object.onAfterRender(_this, scene, camera);
        }
      }
      for (let i = 0, l = object.children.length; i < l; i++) {
        renderObject(object.children[i], scene, camera, cameraCSSMatrix);
      }
    }
  }
};
export {
  CSS3DObject,
  CSS3DRenderer,
  CSS3DSprite
};
//# sourceMappingURL=three_examples_jsm_renderers_CSS3DRenderer__js.js.map
