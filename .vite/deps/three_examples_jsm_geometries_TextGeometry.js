import {
  ExtrudeGeometry
} from "./chunk-BQEVJPUQ.js";

// node_modules/three/examples/jsm/geometries/TextGeometry.js
var TextGeometry = class extends ExtrudeGeometry {
  constructor(text, parameters = {}) {
    const font = parameters.font;
    if (font === void 0) {
      super();
    } else {
      const shapes = font.generateShapes(text, parameters.size);
      if (parameters.depth === void 0 && parameters.height !== void 0) {
        console.warn("THREE.TextGeometry: .height is now depreciated. Please use .depth instead");
      }
      parameters.depth = parameters.depth !== void 0 ? parameters.depth : parameters.height !== void 0 ? parameters.height : 50;
      if (parameters.bevelThickness === void 0) parameters.bevelThickness = 10;
      if (parameters.bevelSize === void 0) parameters.bevelSize = 8;
      if (parameters.bevelEnabled === void 0) parameters.bevelEnabled = false;
      super(shapes, parameters);
    }
    this.type = "TextGeometry";
  }
};
export {
  TextGeometry
};
//# sourceMappingURL=three_examples_jsm_geometries_TextGeometry.js.map
