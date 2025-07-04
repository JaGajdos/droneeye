import {
  Box3,
  Color,
  DataTexture,
  DoubleSide,
  DynamicDrawUsage,
  FloatType,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RGBADepthPacking,
  RGBAFormat,
  ShaderChunk,
  Sphere,
  Texture,
  UniformsUtils,
  Vector2,
  Vector3,
  Vector4
} from "./chunk-BQEVJPUQ.js";

// node_modules/troika-worker-utils/dist/troika-worker-utils.esm.js
function workerBootstrap() {
  var modules = /* @__PURE__ */ Object.create(null);
  function registerModule(ref, callback) {
    var id = ref.id;
    var name = ref.name;
    var dependencies = ref.dependencies;
    if (dependencies === void 0) dependencies = [];
    var init = ref.init;
    if (init === void 0) init = function() {
    };
    var getTransferables = ref.getTransferables;
    if (getTransferables === void 0) getTransferables = null;
    if (modules[id]) {
      return;
    }
    try {
      dependencies = dependencies.map(function(dep) {
        if (dep && dep.isWorkerModule) {
          registerModule(dep, function(depResult) {
            if (depResult instanceof Error) {
              throw depResult;
            }
          });
          dep = modules[dep.id].value;
        }
        return dep;
      });
      init = rehydrate("<" + name + ">.init", init);
      if (getTransferables) {
        getTransferables = rehydrate("<" + name + ">.getTransferables", getTransferables);
      }
      var value = null;
      if (typeof init === "function") {
        value = init.apply(void 0, dependencies);
      } else {
        console.error("worker module init function failed to rehydrate");
      }
      modules[id] = {
        id,
        value,
        getTransferables
      };
      callback(value);
    } catch (err) {
      if (!(err && err.noLog)) {
        console.error(err);
      }
      callback(err);
    }
  }
  function callModule(ref, callback) {
    var ref$1;
    var id = ref.id;
    var args = ref.args;
    if (!modules[id] || typeof modules[id].value !== "function") {
      callback(new Error("Worker module " + id + ": not found or its 'init' did not return a function"));
    }
    try {
      var result = (ref$1 = modules[id]).value.apply(ref$1, args);
      if (result && typeof result.then === "function") {
        result.then(handleResult, function(rej) {
          return callback(rej instanceof Error ? rej : new Error("" + rej));
        });
      } else {
        handleResult(result);
      }
    } catch (err) {
      callback(err);
    }
    function handleResult(result2) {
      try {
        var tx = modules[id].getTransferables && modules[id].getTransferables(result2);
        if (!tx || !Array.isArray(tx) || !tx.length) {
          tx = void 0;
        }
        callback(result2, tx);
      } catch (err) {
        console.error(err);
        callback(err);
      }
    }
  }
  function rehydrate(name, str) {
    var result = void 0;
    self.troikaDefine = function(r) {
      return result = r;
    };
    var url = URL.createObjectURL(
      new Blob(
        ["/** " + name.replace(/\*/g, "") + " **/\n\ntroikaDefine(\n" + str + "\n)"],
        { type: "application/javascript" }
      )
    );
    try {
      importScripts(url);
    } catch (err) {
      console.error(err);
    }
    URL.revokeObjectURL(url);
    delete self.troikaDefine;
    return result;
  }
  self.addEventListener("message", function(e) {
    var ref = e.data;
    var messageId = ref.messageId;
    var action = ref.action;
    var data = ref.data;
    try {
      if (action === "registerModule") {
        registerModule(data, function(result) {
          if (result instanceof Error) {
            postMessage({
              messageId,
              success: false,
              error: result.message
            });
          } else {
            postMessage({
              messageId,
              success: true,
              result: { isCallable: typeof result === "function" }
            });
          }
        });
      }
      if (action === "callModule") {
        callModule(data, function(result, transferables) {
          if (result instanceof Error) {
            postMessage({
              messageId,
              success: false,
              error: result.message
            });
          } else {
            postMessage({
              messageId,
              success: true,
              result
            }, transferables || void 0);
          }
        });
      }
    } catch (err) {
      postMessage({
        messageId,
        success: false,
        error: err.stack
      });
    }
  });
}
function defineMainThreadModule(options) {
  var moduleFunc = function() {
    var args = [], len = arguments.length;
    while (len--) args[len] = arguments[len];
    return moduleFunc._getInitResult().then(function(initResult) {
      if (typeof initResult === "function") {
        return initResult.apply(void 0, args);
      } else {
        throw new Error("Worker module function was called but `init` did not return a callable function");
      }
    });
  };
  moduleFunc._getInitResult = function() {
    var dependencies = options.dependencies;
    var init = options.init;
    dependencies = Array.isArray(dependencies) ? dependencies.map(function(dep) {
      if (dep) {
        dep = dep.onMainThread || dep;
        if (dep._getInitResult) {
          dep = dep._getInitResult();
        }
      }
      return dep;
    }) : [];
    var initPromise = Promise.all(dependencies).then(function(deps) {
      return init.apply(null, deps);
    });
    moduleFunc._getInitResult = function() {
      return initPromise;
    };
    return initPromise;
  };
  return moduleFunc;
}
var supportsWorkers = function() {
  var supported = false;
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    try {
      var worker = new Worker(
        URL.createObjectURL(new Blob([""], { type: "application/javascript" }))
      );
      worker.terminate();
      supported = true;
    } catch (err) {
      if (typeof process !== "undefined" && false) ;
      else {
        console.log(
          "Troika createWorkerModule: web workers not allowed; falling back to main thread execution. Cause: [" + err.message + "]"
        );
      }
    }
  }
  supportsWorkers = function() {
    return supported;
  };
  return supported;
};
var _workerModuleId = 0;
var _messageId = 0;
var _allowInitAsString = false;
var workers = /* @__PURE__ */ Object.create(null);
var registeredModules = /* @__PURE__ */ Object.create(null);
var openRequests = /* @__PURE__ */ Object.create(null);
function defineWorkerModule(options) {
  if ((!options || typeof options.init !== "function") && !_allowInitAsString) {
    throw new Error("requires `options.init` function");
  }
  var dependencies = options.dependencies;
  var init = options.init;
  var getTransferables = options.getTransferables;
  var workerId = options.workerId;
  var onMainThread = defineMainThreadModule(options);
  if (workerId == null) {
    workerId = "#default";
  }
  var id = "workerModule" + ++_workerModuleId;
  var name = options.name || id;
  var registrationPromise = null;
  dependencies = dependencies && dependencies.map(function(dep) {
    if (typeof dep === "function" && !dep.workerModuleData) {
      _allowInitAsString = true;
      dep = defineWorkerModule({
        workerId,
        name: "<" + name + "> function dependency: " + dep.name,
        init: "function(){return (\n" + stringifyFunction(dep) + "\n)}"
      });
      _allowInitAsString = false;
    }
    if (dep && dep.workerModuleData) {
      dep = dep.workerModuleData;
    }
    return dep;
  });
  function moduleFunc() {
    var args = [], len = arguments.length;
    while (len--) args[len] = arguments[len];
    if (!supportsWorkers()) {
      return onMainThread.apply(void 0, args);
    }
    if (!registrationPromise) {
      registrationPromise = callWorker(workerId, "registerModule", moduleFunc.workerModuleData);
      var unregister = function() {
        registrationPromise = null;
        registeredModules[workerId].delete(unregister);
      };
      (registeredModules[workerId] || (registeredModules[workerId] = /* @__PURE__ */ new Set())).add(unregister);
    }
    return registrationPromise.then(function(ref) {
      var isCallable = ref.isCallable;
      if (isCallable) {
        return callWorker(workerId, "callModule", { id, args });
      } else {
        throw new Error("Worker module function was called but `init` did not return a callable function");
      }
    });
  }
  moduleFunc.workerModuleData = {
    isWorkerModule: true,
    id,
    name,
    dependencies,
    init: stringifyFunction(init),
    getTransferables: getTransferables && stringifyFunction(getTransferables)
  };
  moduleFunc.onMainThread = onMainThread;
  return moduleFunc;
}
function terminateWorker(workerId) {
  if (registeredModules[workerId]) {
    registeredModules[workerId].forEach(function(unregister) {
      unregister();
    });
  }
  if (workers[workerId]) {
    workers[workerId].terminate();
    delete workers[workerId];
  }
}
function stringifyFunction(fn) {
  var str = fn.toString();
  if (!/^function/.test(str) && /^\w+\s*\(/.test(str)) {
    str = "function " + str;
  }
  return str;
}
function getWorker(workerId) {
  var worker = workers[workerId];
  if (!worker) {
    var bootstrap = stringifyFunction(workerBootstrap);
    worker = workers[workerId] = new Worker(
      URL.createObjectURL(
        new Blob(
          ["/** Worker Module Bootstrap: " + workerId.replace(/\*/g, "") + " **/\n\n;(" + bootstrap + ")()"],
          { type: "application/javascript" }
        )
      )
    );
    worker.onmessage = function(e) {
      var response = e.data;
      var msgId = response.messageId;
      var callback = openRequests[msgId];
      if (!callback) {
        throw new Error("WorkerModule response with empty or unknown messageId");
      }
      delete openRequests[msgId];
      callback(response);
    };
  }
  return worker;
}
function callWorker(workerId, action, data) {
  return new Promise(function(resolve, reject) {
    var messageId = ++_messageId;
    openRequests[messageId] = function(response) {
      if (response.success) {
        resolve(response.result);
      } else {
        reject(new Error("Error in worker " + action + " call: " + response.error));
      }
    };
    getWorker(workerId).postMessage({
      messageId,
      action,
      data
    });
  });
}

// node_modules/webgl-sdf-generator/dist/webgl-sdf-generator.mjs
function SDFGenerator() {
  var exports = function(exports2) {
    function pointOnQuadraticBezier(x0, y0, x1, y1, x2, y2, t, pointOut) {
      var t2 = 1 - t;
      pointOut.x = t2 * t2 * x0 + 2 * t2 * t * x1 + t * t * x2;
      pointOut.y = t2 * t2 * y0 + 2 * t2 * t * y1 + t * t * y2;
    }
    function pointOnCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3, t, pointOut) {
      var t2 = 1 - t;
      pointOut.x = t2 * t2 * t2 * x0 + 3 * t2 * t2 * t * x1 + 3 * t2 * t * t * x2 + t * t * t * x3;
      pointOut.y = t2 * t2 * t2 * y0 + 3 * t2 * t2 * t * y1 + 3 * t2 * t * t * y2 + t * t * t * y3;
    }
    function forEachPathCommand(pathString, commandCallback) {
      var segmentRE = /([MLQCZ])([^MLQCZ]*)/g;
      var match, firstX, firstY, prevX, prevY;
      while (match = segmentRE.exec(pathString)) {
        var args = match[2].replace(/^\s*|\s*$/g, "").split(/[,\s]+/).map(function(v) {
          return parseFloat(v);
        });
        switch (match[1]) {
          case "M":
            prevX = firstX = args[0];
            prevY = firstY = args[1];
            break;
          case "L":
            if (args[0] !== prevX || args[1] !== prevY) {
              commandCallback("L", prevX, prevY, prevX = args[0], prevY = args[1]);
            }
            break;
          case "Q": {
            commandCallback("Q", prevX, prevY, prevX = args[2], prevY = args[3], args[0], args[1]);
            break;
          }
          case "C": {
            commandCallback("C", prevX, prevY, prevX = args[4], prevY = args[5], args[0], args[1], args[2], args[3]);
            break;
          }
          case "Z":
            if (prevX !== firstX || prevY !== firstY) {
              commandCallback("L", prevX, prevY, firstX, firstY);
            }
            break;
        }
      }
    }
    function pathToLineSegments(pathString, segmentCallback, curvePoints) {
      if (curvePoints === void 0) curvePoints = 16;
      var tempPoint = { x: 0, y: 0 };
      forEachPathCommand(pathString, function(command, startX, startY, endX, endY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y) {
        switch (command) {
          case "L":
            segmentCallback(startX, startY, endX, endY);
            break;
          case "Q": {
            var prevCurveX = startX;
            var prevCurveY = startY;
            for (var i = 1; i < curvePoints; i++) {
              pointOnQuadraticBezier(
                startX,
                startY,
                ctrl1X,
                ctrl1Y,
                endX,
                endY,
                i / (curvePoints - 1),
                tempPoint
              );
              segmentCallback(prevCurveX, prevCurveY, tempPoint.x, tempPoint.y);
              prevCurveX = tempPoint.x;
              prevCurveY = tempPoint.y;
            }
            break;
          }
          case "C": {
            var prevCurveX$1 = startX;
            var prevCurveY$1 = startY;
            for (var i$1 = 1; i$1 < curvePoints; i$1++) {
              pointOnCubicBezier(
                startX,
                startY,
                ctrl1X,
                ctrl1Y,
                ctrl2X,
                ctrl2Y,
                endX,
                endY,
                i$1 / (curvePoints - 1),
                tempPoint
              );
              segmentCallback(prevCurveX$1, prevCurveY$1, tempPoint.x, tempPoint.y);
              prevCurveX$1 = tempPoint.x;
              prevCurveY$1 = tempPoint.y;
            }
            break;
          }
        }
      });
    }
    var viewportQuadVertex = "precision highp float;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}";
    var copyTexFragment = "precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){gl_FragColor=texture2D(tex,vUV);}";
    var cache = /* @__PURE__ */ new WeakMap();
    var glContextParams = {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      antialias: false,
      depth: false
    };
    function withWebGLContext(glOrCanvas, callback) {
      var gl = glOrCanvas.getContext ? glOrCanvas.getContext("webgl", glContextParams) : glOrCanvas;
      var wrapper = cache.get(gl);
      if (!wrapper) {
        let getExtension = function(name) {
          var ext = extensions[name];
          if (!ext) {
            ext = extensions[name] = gl.getExtension(name);
            if (!ext) {
              throw new Error(name + " not supported");
            }
          }
          return ext;
        }, compileShader = function(src, type) {
          var shader = gl.createShader(type);
          gl.shaderSource(shader, src);
          gl.compileShader(shader);
          return shader;
        }, withProgram = function(name, vert, frag, func) {
          if (!programs[name]) {
            var attributes = {};
            var uniforms = {};
            var program = gl.createProgram();
            gl.attachShader(program, compileShader(vert, gl.VERTEX_SHADER));
            gl.attachShader(program, compileShader(frag, gl.FRAGMENT_SHADER));
            gl.linkProgram(program);
            programs[name] = {
              program,
              transaction: function transaction(func2) {
                gl.useProgram(program);
                func2({
                  setUniform: function setUniform(type, name2) {
                    var values = [], len = arguments.length - 2;
                    while (len-- > 0) values[len] = arguments[len + 2];
                    var uniformLoc = uniforms[name2] || (uniforms[name2] = gl.getUniformLocation(program, name2));
                    gl["uniform" + type].apply(gl, [uniformLoc].concat(values));
                  },
                  setAttribute: function setAttribute(name2, size, usage, instancingDivisor, data) {
                    var attr = attributes[name2];
                    if (!attr) {
                      attr = attributes[name2] = {
                        buf: gl.createBuffer(),
                        // TODO should we destroy our buffers?
                        loc: gl.getAttribLocation(program, name2),
                        data: null
                      };
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, attr.buf);
                    gl.vertexAttribPointer(attr.loc, size, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(attr.loc);
                    if (isWebGL2) {
                      gl.vertexAttribDivisor(attr.loc, instancingDivisor);
                    } else {
                      getExtension("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(attr.loc, instancingDivisor);
                    }
                    if (data !== attr.data) {
                      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
                      attr.data = data;
                    }
                  }
                });
              }
            };
          }
          programs[name].transaction(func);
        }, withTexture = function(name, func) {
          textureUnit++;
          try {
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            var texture = textures[name];
            if (!texture) {
              texture = textures[name] = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            gl.bindTexture(gl.TEXTURE_2D, texture);
            func(texture, textureUnit);
          } finally {
            textureUnit--;
          }
        }, withTextureFramebuffer = function(texture, textureUnit2, func) {
          var framebuffer = gl.createFramebuffer();
          framebufferStack.push(framebuffer);
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
          gl.activeTexture(gl.TEXTURE0 + textureUnit2);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
          try {
            func(framebuffer);
          } finally {
            gl.deleteFramebuffer(framebuffer);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferStack[--framebufferStack.length - 1] || null);
          }
        }, handleContextLoss = function() {
          extensions = {};
          programs = {};
          textures = {};
          textureUnit = -1;
          framebufferStack.length = 0;
        };
        var isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
        var extensions = {};
        var programs = {};
        var textures = {};
        var textureUnit = -1;
        var framebufferStack = [];
        gl.canvas.addEventListener("webglcontextlost", function(e) {
          handleContextLoss();
          e.preventDefault();
        }, false);
        cache.set(gl, wrapper = {
          gl,
          isWebGL2,
          getExtension,
          withProgram,
          withTexture,
          withTextureFramebuffer,
          handleContextLoss
        });
      }
      callback(wrapper);
    }
    function renderImageData(glOrCanvas, imageData, x, y, width, height, channels, framebuffer) {
      if (channels === void 0) channels = 15;
      if (framebuffer === void 0) framebuffer = null;
      withWebGLContext(glOrCanvas, function(ref) {
        var gl = ref.gl;
        var withProgram = ref.withProgram;
        var withTexture = ref.withTexture;
        withTexture("copy", function(tex, texUnit) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
          withProgram("copy", viewportQuadVertex, copyTexFragment, function(ref2) {
            var setUniform = ref2.setUniform;
            var setAttribute = ref2.setAttribute;
            setAttribute("aUV", 2, gl.STATIC_DRAW, 0, new Float32Array([0, 0, 2, 0, 0, 2]));
            setUniform("1i", "image", texUnit);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer || null);
            gl.disable(gl.BLEND);
            gl.colorMask(channels & 8, channels & 4, channels & 2, channels & 1);
            gl.viewport(x, y, width, height);
            gl.scissor(x, y, width, height);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
          });
        });
      });
    }
    function resizeWebGLCanvasWithoutClearing2(canvas, newWidth, newHeight) {
      var width = canvas.width;
      var height = canvas.height;
      withWebGLContext(canvas, function(ref) {
        var gl = ref.gl;
        var data = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        canvas.width = newWidth;
        canvas.height = newHeight;
        renderImageData(gl, data, 0, 0, width, height);
      });
    }
    var webglUtils = Object.freeze({
      __proto__: null,
      withWebGLContext,
      renderImageData,
      resizeWebGLCanvasWithoutClearing: resizeWebGLCanvasWithoutClearing2
    });
    function generate$2(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent) {
      if (sdfExponent === void 0) sdfExponent = 1;
      var textureData = new Uint8Array(sdfWidth * sdfHeight);
      var viewBoxWidth = viewBox[2] - viewBox[0];
      var viewBoxHeight = viewBox[3] - viewBox[1];
      var segments = [];
      pathToLineSegments(path, function(x1, y1, x2, y2) {
        segments.push({
          x1,
          y1,
          x2,
          y2,
          minX: Math.min(x1, x2),
          minY: Math.min(y1, y2),
          maxX: Math.max(x1, x2),
          maxY: Math.max(y1, y2)
        });
      });
      segments.sort(function(a, b) {
        return a.maxX - b.maxX;
      });
      for (var sdfX = 0; sdfX < sdfWidth; sdfX++) {
        for (var sdfY = 0; sdfY < sdfHeight; sdfY++) {
          var signedDist = findNearestSignedDistance(
            viewBox[0] + viewBoxWidth * (sdfX + 0.5) / sdfWidth,
            viewBox[1] + viewBoxHeight * (sdfY + 0.5) / sdfHeight
          );
          var alpha = Math.pow(1 - Math.abs(signedDist) / maxDistance, sdfExponent) / 2;
          if (signedDist < 0) {
            alpha = 1 - alpha;
          }
          alpha = Math.max(0, Math.min(255, Math.round(alpha * 255)));
          textureData[sdfY * sdfWidth + sdfX] = alpha;
        }
      }
      return textureData;
      function findNearestSignedDistance(x, y) {
        var closestDistSq = Infinity;
        var closestDist = Infinity;
        for (var i = segments.length; i--; ) {
          var seg = segments[i];
          if (seg.maxX + closestDist <= x) {
            break;
          }
          if (x + closestDist > seg.minX && y - closestDist < seg.maxY && y + closestDist > seg.minY) {
            var distSq = absSquareDistanceToLineSegment(x, y, seg.x1, seg.y1, seg.x2, seg.y2);
            if (distSq < closestDistSq) {
              closestDistSq = distSq;
              closestDist = Math.sqrt(closestDistSq);
            }
          }
        }
        if (isPointInPoly(x, y)) {
          closestDist = -closestDist;
        }
        return closestDist;
      }
      function isPointInPoly(x, y) {
        var winding = 0;
        for (var i = segments.length; i--; ) {
          var seg = segments[i];
          if (seg.maxX <= x) {
            break;
          }
          var intersects = seg.y1 > y !== seg.y2 > y && x < (seg.x2 - seg.x1) * (y - seg.y1) / (seg.y2 - seg.y1) + seg.x1;
          if (intersects) {
            winding += seg.y1 < seg.y2 ? 1 : -1;
          }
        }
        return winding !== 0;
      }
    }
    function generateIntoCanvas$2(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, canvas, x, y, channel) {
      if (sdfExponent === void 0) sdfExponent = 1;
      if (x === void 0) x = 0;
      if (y === void 0) y = 0;
      if (channel === void 0) channel = 0;
      generateIntoFramebuffer$1(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, canvas, null, x, y, channel);
    }
    function generateIntoFramebuffer$1(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, glOrCanvas, framebuffer, x, y, channel) {
      if (sdfExponent === void 0) sdfExponent = 1;
      if (x === void 0) x = 0;
      if (y === void 0) y = 0;
      if (channel === void 0) channel = 0;
      var data = generate$2(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent);
      var rgbaData = new Uint8Array(data.length * 4);
      for (var i = 0; i < data.length; i++) {
        rgbaData[i * 4 + channel] = data[i];
      }
      renderImageData(glOrCanvas, rgbaData, x, y, sdfWidth, sdfHeight, 1 << 3 - channel, framebuffer);
    }
    function absSquareDistanceToLineSegment(x, y, lineX0, lineY0, lineX1, lineY1) {
      var ldx = lineX1 - lineX0;
      var ldy = lineY1 - lineY0;
      var lengthSq = ldx * ldx + ldy * ldy;
      var t = lengthSq ? Math.max(0, Math.min(1, ((x - lineX0) * ldx + (y - lineY0) * ldy) / lengthSq)) : 0;
      var dx = x - (lineX0 + t * ldx);
      var dy = y - (lineY0 + t * ldy);
      return dx * dx + dy * dy;
    }
    var javascript = Object.freeze({
      __proto__: null,
      generate: generate$2,
      generateIntoCanvas: generateIntoCanvas$2,
      generateIntoFramebuffer: generateIntoFramebuffer$1
    });
    var mainVertex = "precision highp float;uniform vec4 uGlyphBounds;attribute vec2 aUV;attribute vec4 aLineSegment;varying vec4 vLineSegment;varying vec2 vGlyphXY;void main(){vLineSegment=aLineSegment;vGlyphXY=mix(uGlyphBounds.xy,uGlyphBounds.zw,aUV);gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}";
    var mainFragment = "precision highp float;uniform vec4 uGlyphBounds;uniform float uMaxDistance;uniform float uExponent;varying vec4 vLineSegment;varying vec2 vGlyphXY;float absDistToSegment(vec2 point,vec2 lineA,vec2 lineB){vec2 lineDir=lineB-lineA;float lenSq=dot(lineDir,lineDir);float t=lenSq==0.0 ? 0.0 : clamp(dot(point-lineA,lineDir)/lenSq,0.0,1.0);vec2 linePt=lineA+t*lineDir;return distance(point,linePt);}void main(){vec4 seg=vLineSegment;vec2 p=vGlyphXY;float dist=absDistToSegment(p,seg.xy,seg.zw);float val=pow(1.0-clamp(dist/uMaxDistance,0.0,1.0),uExponent)*0.5;bool crossing=(seg.y>p.y!=seg.w>p.y)&&(p.x<(seg.z-seg.x)*(p.y-seg.y)/(seg.w-seg.y)+seg.x);bool crossingUp=crossing&&vLineSegment.y<vLineSegment.w;gl_FragColor=vec4(crossingUp ? 1.0/255.0 : 0.0,crossing&&!crossingUp ? 1.0/255.0 : 0.0,0.0,val);}";
    var postFragment = "precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){vec4 color=texture2D(tex,vUV);bool inside=color.r!=color.g;float val=inside ? 1.0-color.a : color.a;gl_FragColor=vec4(val);}";
    var viewportUVs = new Float32Array([0, 0, 2, 0, 0, 2]);
    var implicitContext = null;
    var isTestingSupport = false;
    var NULL_OBJECT = {};
    var supportByCanvas = /* @__PURE__ */ new WeakMap();
    function validateSupport(glOrCanvas) {
      if (!isTestingSupport && !isSupported(glOrCanvas)) {
        throw new Error("WebGL generation not supported");
      }
    }
    function generate$1(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, glOrCanvas) {
      if (sdfExponent === void 0) sdfExponent = 1;
      if (glOrCanvas === void 0) glOrCanvas = null;
      if (!glOrCanvas) {
        glOrCanvas = implicitContext;
        if (!glOrCanvas) {
          var canvas = typeof OffscreenCanvas === "function" ? new OffscreenCanvas(1, 1) : typeof document !== "undefined" ? document.createElement("canvas") : null;
          if (!canvas) {
            throw new Error("OffscreenCanvas or DOM canvas not supported");
          }
          glOrCanvas = implicitContext = canvas.getContext("webgl", { depth: false });
        }
      }
      validateSupport(glOrCanvas);
      var rgbaData = new Uint8Array(sdfWidth * sdfHeight * 4);
      withWebGLContext(glOrCanvas, function(ref) {
        var gl = ref.gl;
        var withTexture = ref.withTexture;
        var withTextureFramebuffer = ref.withTextureFramebuffer;
        withTexture("readable", function(texture, textureUnit) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sdfWidth, sdfHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          withTextureFramebuffer(texture, textureUnit, function(framebuffer) {
            generateIntoFramebuffer(
              sdfWidth,
              sdfHeight,
              path,
              viewBox,
              maxDistance,
              sdfExponent,
              gl,
              framebuffer,
              0,
              0,
              0
              // red channel
            );
            gl.readPixels(0, 0, sdfWidth, sdfHeight, gl.RGBA, gl.UNSIGNED_BYTE, rgbaData);
          });
        });
      });
      var data = new Uint8Array(sdfWidth * sdfHeight);
      for (var i = 0, j = 0; i < rgbaData.length; i += 4) {
        data[j++] = rgbaData[i];
      }
      return data;
    }
    function generateIntoCanvas$1(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, canvas, x, y, channel) {
      if (sdfExponent === void 0) sdfExponent = 1;
      if (x === void 0) x = 0;
      if (y === void 0) y = 0;
      if (channel === void 0) channel = 0;
      generateIntoFramebuffer(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, canvas, null, x, y, channel);
    }
    function generateIntoFramebuffer(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, glOrCanvas, framebuffer, x, y, channel) {
      if (sdfExponent === void 0) sdfExponent = 1;
      if (x === void 0) x = 0;
      if (y === void 0) y = 0;
      if (channel === void 0) channel = 0;
      validateSupport(glOrCanvas);
      var lineSegmentCoords = [];
      pathToLineSegments(path, function(x1, y1, x2, y2) {
        lineSegmentCoords.push(x1, y1, x2, y2);
      });
      lineSegmentCoords = new Float32Array(lineSegmentCoords);
      withWebGLContext(glOrCanvas, function(ref) {
        var gl = ref.gl;
        var isWebGL2 = ref.isWebGL2;
        var getExtension = ref.getExtension;
        var withProgram = ref.withProgram;
        var withTexture = ref.withTexture;
        var withTextureFramebuffer = ref.withTextureFramebuffer;
        var handleContextLoss = ref.handleContextLoss;
        withTexture("rawDistances", function(intermediateTexture, intermediateTextureUnit) {
          if (sdfWidth !== intermediateTexture._lastWidth || sdfHeight !== intermediateTexture._lastHeight) {
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              intermediateTexture._lastWidth = sdfWidth,
              intermediateTexture._lastHeight = sdfHeight,
              0,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              null
            );
          }
          withProgram("main", mainVertex, mainFragment, function(ref2) {
            var setAttribute = ref2.setAttribute;
            var setUniform = ref2.setUniform;
            var instancingExtension = !isWebGL2 && getExtension("ANGLE_instanced_arrays");
            var blendMinMaxExtension = !isWebGL2 && getExtension("EXT_blend_minmax");
            setAttribute("aUV", 2, gl.STATIC_DRAW, 0, viewportUVs);
            setAttribute("aLineSegment", 4, gl.DYNAMIC_DRAW, 1, lineSegmentCoords);
            setUniform.apply(void 0, ["4f", "uGlyphBounds"].concat(viewBox));
            setUniform("1f", "uMaxDistance", maxDistance);
            setUniform("1f", "uExponent", sdfExponent);
            withTextureFramebuffer(intermediateTexture, intermediateTextureUnit, function(framebuffer2) {
              gl.enable(gl.BLEND);
              gl.colorMask(true, true, true, true);
              gl.viewport(0, 0, sdfWidth, sdfHeight);
              gl.scissor(0, 0, sdfWidth, sdfHeight);
              gl.blendFunc(gl.ONE, gl.ONE);
              gl.blendEquationSeparate(gl.FUNC_ADD, isWebGL2 ? gl.MAX : blendMinMaxExtension.MAX_EXT);
              gl.clear(gl.COLOR_BUFFER_BIT);
              if (isWebGL2) {
                gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, lineSegmentCoords.length / 4);
              } else {
                instancingExtension.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 3, lineSegmentCoords.length / 4);
              }
            });
          });
          withProgram("post", viewportQuadVertex, postFragment, function(program) {
            program.setAttribute("aUV", 2, gl.STATIC_DRAW, 0, viewportUVs);
            program.setUniform("1i", "tex", intermediateTextureUnit);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.disable(gl.BLEND);
            gl.colorMask(channel === 0, channel === 1, channel === 2, channel === 3);
            gl.viewport(x, y, sdfWidth, sdfHeight);
            gl.scissor(x, y, sdfWidth, sdfHeight);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
          });
        });
        if (gl.isContextLost()) {
          handleContextLoss();
          throw new Error("webgl context lost");
        }
      });
    }
    function isSupported(glOrCanvas) {
      var key = !glOrCanvas || glOrCanvas === implicitContext ? NULL_OBJECT : glOrCanvas.canvas || glOrCanvas;
      var supported = supportByCanvas.get(key);
      if (supported === void 0) {
        isTestingSupport = true;
        var failReason = null;
        try {
          var expectedResult = [
            97,
            106,
            97,
            61,
            99,
            137,
            118,
            80,
            80,
            118,
            137,
            99,
            61,
            97,
            106,
            97
          ];
          var testResult = generate$1(
            4,
            4,
            "M8,8L16,8L24,24L16,24Z",
            [0, 0, 32, 32],
            24,
            1,
            glOrCanvas
          );
          supported = testResult && expectedResult.length === testResult.length && testResult.every(function(val, i) {
            return val === expectedResult[i];
          });
          if (!supported) {
            failReason = "bad trial run results";
            console.info(expectedResult, testResult);
          }
        } catch (err) {
          supported = false;
          failReason = err.message;
        }
        if (failReason) {
          console.warn("WebGL SDF generation not supported:", failReason);
        }
        isTestingSupport = false;
        supportByCanvas.set(key, supported);
      }
      return supported;
    }
    var webgl = Object.freeze({
      __proto__: null,
      generate: generate$1,
      generateIntoCanvas: generateIntoCanvas$1,
      generateIntoFramebuffer,
      isSupported
    });
    function generate(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent) {
      if (maxDistance === void 0) maxDistance = Math.max(viewBox[2] - viewBox[0], viewBox[3] - viewBox[1]) / 2;
      if (sdfExponent === void 0) sdfExponent = 1;
      try {
        return generate$1.apply(webgl, arguments);
      } catch (e) {
        console.info("WebGL SDF generation failed, falling back to JS", e);
        return generate$2.apply(javascript, arguments);
      }
    }
    function generateIntoCanvas(sdfWidth, sdfHeight, path, viewBox, maxDistance, sdfExponent, canvas, x, y, channel) {
      if (maxDistance === void 0) maxDistance = Math.max(viewBox[2] - viewBox[0], viewBox[3] - viewBox[1]) / 2;
      if (sdfExponent === void 0) sdfExponent = 1;
      if (x === void 0) x = 0;
      if (y === void 0) y = 0;
      if (channel === void 0) channel = 0;
      try {
        return generateIntoCanvas$1.apply(webgl, arguments);
      } catch (e) {
        console.info("WebGL SDF generation failed, falling back to JS", e);
        return generateIntoCanvas$2.apply(javascript, arguments);
      }
    }
    exports2.forEachPathCommand = forEachPathCommand;
    exports2.generate = generate;
    exports2.generateIntoCanvas = generateIntoCanvas;
    exports2.javascript = javascript;
    exports2.pathToLineSegments = pathToLineSegments;
    exports2.webgl = webgl;
    exports2.webglUtils = webglUtils;
    Object.defineProperty(exports2, "__esModule", { value: true });
    return exports2;
  }({});
  return exports;
}

// node_modules/bidi-js/dist/bidi.mjs
function bidiFactory() {
  var bidi = function(exports) {
    var DATA = {
      "R": "13k,1a,2,3,3,2+1j,ch+16,a+1,5+2,2+n,5,a,4,6+16,4+3,h+1b,4mo,179q,2+9,2+11,2i9+7y,2+68,4,3+4,5+13,4+3,2+4k,3+29,8+cf,1t+7z,w+17,3+3m,1t+3z,16o1+5r,8+30,8+mc,29+1r,29+4v,75+73",
      "EN": "1c+9,3d+1,6,187+9,513,4+5,7+9,sf+j,175h+9,qw+q,161f+1d,4xt+a,25i+9",
      "ES": "17,2,6dp+1,f+1,av,16vr,mx+1,4o,2",
      "ET": "z+2,3h+3,b+1,ym,3e+1,2o,p4+1,8,6u,7c,g6,1wc,1n9+4,30+1b,2n,6d,qhx+1,h0m,a+1,49+2,63+1,4+1,6bb+3,12jj",
      "AN": "16o+5,2j+9,2+1,35,ed,1ff2+9,87+u",
      "CS": "18,2+1,b,2u,12k,55v,l,17v0,2,3,53,2+1,b",
      "B": "a,3,f+2,2v,690",
      "S": "9,2,k",
      "WS": "c,k,4f4,1vk+a,u,1j,335",
      "ON": "x+1,4+4,h+5,r+5,r+3,z,5+3,2+1,2+1,5,2+2,3+4,o,w,ci+1,8+d,3+d,6+8,2+g,39+1,9,6+1,2,33,b8,3+1,3c+1,7+1,5r,b,7h+3,sa+5,2,3i+6,jg+3,ur+9,2v,ij+1,9g+9,7+a,8m,4+1,49+x,14u,2+2,c+2,e+2,e+2,e+1,i+n,e+e,2+p,u+2,e+2,36+1,2+3,2+1,b,2+2,6+5,2,2,2,h+1,5+4,6+3,3+f,16+2,5+3l,3+81,1y+p,2+40,q+a,m+13,2r+ch,2+9e,75+hf,3+v,2+2w,6e+5,f+6,75+2a,1a+p,2+2g,d+5x,r+b,6+3,4+o,g,6+1,6+2,2k+1,4,2j,5h+z,1m+1,1e+f,t+2,1f+e,d+3,4o+3,2s+1,w,535+1r,h3l+1i,93+2,2s,b+1,3l+x,2v,4g+3,21+3,kz+1,g5v+1,5a,j+9,n+v,2,3,2+8,2+1,3+2,2,3,46+1,4+4,h+5,r+5,r+a,3h+2,4+6,b+4,78,1r+24,4+c,4,1hb,ey+6,103+j,16j+c,1ux+7,5+g,fsh,jdq+1t,4,57+2e,p1,1m,1m,1m,1m,4kt+1,7j+17,5+2r,d+e,3+e,2+e,2+10,m+4,w,1n+5,1q,4z+5,4b+rb,9+c,4+c,4+37,d+2g,8+b,l+b,5+1j,9+9,7+13,9+t,3+1,27+3c,2+29,2+3q,d+d,3+4,4+2,6+6,a+o,8+6,a+2,e+6,16+42,2+1i",
      "BN": "0+8,6+d,2s+5,2+p,e,4m9,1kt+2,2b+5,5+5,17q9+v,7k,6p+8,6+1,119d+3,440+7,96s+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+75,6p+2rz,1ben+1,1ekf+1,1ekf+1",
      "NSM": "lc+33,7o+6,7c+18,2,2+1,2+1,2,21+a,1d+k,h,2u+6,3+5,3+1,2+3,10,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,g+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+g,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,k1+w,2db+2,3y,2p+v,ff+3,30+1,n9x+3,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,r2,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+5,3+1,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2d+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,f0c+4,1o+6,t5,1s+3,2a,f5l+1,43t+2,i+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,gzhy+6n",
      "AL": "16w,3,2,e+1b,z+2,2+2s,g+1,8+1,b+m,2+t,s+2i,c+e,4h+f,1d+1e,1bwe+dp,3+3z,x+c,2+1,35+3y,2rm+z,5+7,b+5,dt+l,c+u,17nl+27,1t+27,4x+6n,3+d",
      "LRO": "6ct",
      "RLO": "6cu",
      "LRE": "6cq",
      "RLE": "6cr",
      "PDF": "6cs",
      "LRI": "6ee",
      "RLI": "6ef",
      "FSI": "6eg",
      "PDI": "6eh"
    };
    var TYPES = {};
    var TYPES_TO_NAMES = {};
    TYPES.L = 1;
    TYPES_TO_NAMES[1] = "L";
    Object.keys(DATA).forEach(function(type, i) {
      TYPES[type] = 1 << i + 1;
      TYPES_TO_NAMES[TYPES[type]] = type;
    });
    Object.freeze(TYPES);
    var ISOLATE_INIT_TYPES = TYPES.LRI | TYPES.RLI | TYPES.FSI;
    var STRONG_TYPES = TYPES.L | TYPES.R | TYPES.AL;
    var NEUTRAL_ISOLATE_TYPES = TYPES.B | TYPES.S | TYPES.WS | TYPES.ON | TYPES.FSI | TYPES.LRI | TYPES.RLI | TYPES.PDI;
    var BN_LIKE_TYPES = TYPES.BN | TYPES.RLE | TYPES.LRE | TYPES.RLO | TYPES.LRO | TYPES.PDF;
    var TRAILING_TYPES = TYPES.S | TYPES.WS | TYPES.B | ISOLATE_INIT_TYPES | TYPES.PDI | BN_LIKE_TYPES;
    var map = null;
    function parseData() {
      if (!map) {
        map = /* @__PURE__ */ new Map();
        var loop = function(type2) {
          if (DATA.hasOwnProperty(type2)) {
            var lastCode = 0;
            DATA[type2].split(",").forEach(function(range) {
              var ref = range.split("+");
              var skip = ref[0];
              var step = ref[1];
              skip = parseInt(skip, 36);
              step = step ? parseInt(step, 36) : 0;
              map.set(lastCode += skip, TYPES[type2]);
              for (var i = 0; i < step; i++) {
                map.set(++lastCode, TYPES[type2]);
              }
            });
          }
        };
        for (var type in DATA) loop(type);
      }
    }
    function getBidiCharType(char) {
      parseData();
      return map.get(char.codePointAt(0)) || TYPES.L;
    }
    function getBidiCharTypeName(char) {
      return TYPES_TO_NAMES[getBidiCharType(char)];
    }
    var data$1 = {
      "pairs": "14>1,1e>2,u>2,2wt>1,1>1,1ge>1,1wp>1,1j>1,f>1,hm>1,1>1,u>1,u6>1,1>1,+5,28>1,w>1,1>1,+3,b8>1,1>1,+3,1>3,-1>-1,3>1,1>1,+2,1s>1,1>1,x>1,th>1,1>1,+2,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,4q>1,1e>2,u>2,2>1,+1",
      "canonical": "6f1>-6dx,6dy>-6dx,6ec>-6ed,6ee>-6ed,6ww>2jj,-2ji>2jj,14r4>-1e7l,1e7m>-1e7l,1e7m>-1e5c,1e5d>-1e5b,1e5c>-14qx,14qy>-14qx,14vn>-1ecg,1ech>-1ecg,1edu>-1ecg,1eci>-1ecg,1eda>-1ecg,1eci>-1ecg,1eci>-168q,168r>-168q,168s>-14ye,14yf>-14ye"
    };
    function parseCharacterMap(encodedString, includeReverse) {
      var radix = 36;
      var lastCode = 0;
      var map2 = /* @__PURE__ */ new Map();
      var reverseMap = includeReverse && /* @__PURE__ */ new Map();
      var prevPair;
      encodedString.split(",").forEach(function visit(entry) {
        if (entry.indexOf("+") !== -1) {
          for (var i = +entry; i--; ) {
            visit(prevPair);
          }
        } else {
          prevPair = entry;
          var ref = entry.split(">");
          var a = ref[0];
          var b = ref[1];
          a = String.fromCodePoint(lastCode += parseInt(a, radix));
          b = String.fromCodePoint(lastCode += parseInt(b, radix));
          map2.set(a, b);
          includeReverse && reverseMap.set(b, a);
        }
      });
      return { map: map2, reverseMap };
    }
    var openToClose, closeToOpen, canonical;
    function parse$1() {
      if (!openToClose) {
        var ref = parseCharacterMap(data$1.pairs, true);
        var map2 = ref.map;
        var reverseMap = ref.reverseMap;
        openToClose = map2;
        closeToOpen = reverseMap;
        canonical = parseCharacterMap(data$1.canonical, false).map;
      }
    }
    function openingToClosingBracket(char) {
      parse$1();
      return openToClose.get(char) || null;
    }
    function closingToOpeningBracket(char) {
      parse$1();
      return closeToOpen.get(char) || null;
    }
    function getCanonicalBracket(char) {
      parse$1();
      return canonical.get(char) || null;
    }
    var TYPE_L = TYPES.L;
    var TYPE_R = TYPES.R;
    var TYPE_EN = TYPES.EN;
    var TYPE_ES = TYPES.ES;
    var TYPE_ET = TYPES.ET;
    var TYPE_AN = TYPES.AN;
    var TYPE_CS = TYPES.CS;
    var TYPE_B = TYPES.B;
    var TYPE_S = TYPES.S;
    var TYPE_ON = TYPES.ON;
    var TYPE_BN = TYPES.BN;
    var TYPE_NSM = TYPES.NSM;
    var TYPE_AL = TYPES.AL;
    var TYPE_LRO = TYPES.LRO;
    var TYPE_RLO = TYPES.RLO;
    var TYPE_LRE = TYPES.LRE;
    var TYPE_RLE = TYPES.RLE;
    var TYPE_PDF = TYPES.PDF;
    var TYPE_LRI = TYPES.LRI;
    var TYPE_RLI = TYPES.RLI;
    var TYPE_FSI = TYPES.FSI;
    var TYPE_PDI = TYPES.PDI;
    function getEmbeddingLevels(string, baseDirection) {
      var MAX_DEPTH = 125;
      var charTypes = new Uint32Array(string.length);
      for (var i = 0; i < string.length; i++) {
        charTypes[i] = getBidiCharType(string[i]);
      }
      var charTypeCounts = /* @__PURE__ */ new Map();
      function changeCharType(i2, type2) {
        var oldType = charTypes[i2];
        charTypes[i2] = type2;
        charTypeCounts.set(oldType, charTypeCounts.get(oldType) - 1);
        if (oldType & NEUTRAL_ISOLATE_TYPES) {
          charTypeCounts.set(NEUTRAL_ISOLATE_TYPES, charTypeCounts.get(NEUTRAL_ISOLATE_TYPES) - 1);
        }
        charTypeCounts.set(type2, (charTypeCounts.get(type2) || 0) + 1);
        if (type2 & NEUTRAL_ISOLATE_TYPES) {
          charTypeCounts.set(NEUTRAL_ISOLATE_TYPES, (charTypeCounts.get(NEUTRAL_ISOLATE_TYPES) || 0) + 1);
        }
      }
      var embedLevels = new Uint8Array(string.length);
      var isolationPairs = /* @__PURE__ */ new Map();
      var paragraphs = [];
      var paragraph = null;
      for (var i$1 = 0; i$1 < string.length; i$1++) {
        if (!paragraph) {
          paragraphs.push(paragraph = {
            start: i$1,
            end: string.length - 1,
            // 3.3.1 P2-P3: Determine the paragraph level
            level: baseDirection === "rtl" ? 1 : baseDirection === "ltr" ? 0 : determineAutoEmbedLevel(i$1, false)
          });
        }
        if (charTypes[i$1] & TYPE_B) {
          paragraph.end = i$1;
          paragraph = null;
        }
      }
      var FORMATTING_TYPES = TYPE_RLE | TYPE_LRE | TYPE_RLO | TYPE_LRO | ISOLATE_INIT_TYPES | TYPE_PDI | TYPE_PDF | TYPE_B;
      var nextEven = function(n) {
        return n + (n & 1 ? 1 : 2);
      };
      var nextOdd = function(n) {
        return n + (n & 1 ? 2 : 1);
      };
      for (var paraIdx = 0; paraIdx < paragraphs.length; paraIdx++) {
        paragraph = paragraphs[paraIdx];
        var statusStack = [{
          _level: paragraph.level,
          _override: 0,
          //0=neutral, 1=L, 2=R
          _isolate: 0
          //bool
        }];
        var stackTop = void 0;
        var overflowIsolateCount = 0;
        var overflowEmbeddingCount = 0;
        var validIsolateCount = 0;
        charTypeCounts.clear();
        for (var i$2 = paragraph.start; i$2 <= paragraph.end; i$2++) {
          var charType = charTypes[i$2];
          stackTop = statusStack[statusStack.length - 1];
          charTypeCounts.set(charType, (charTypeCounts.get(charType) || 0) + 1);
          if (charType & NEUTRAL_ISOLATE_TYPES) {
            charTypeCounts.set(NEUTRAL_ISOLATE_TYPES, (charTypeCounts.get(NEUTRAL_ISOLATE_TYPES) || 0) + 1);
          }
          if (charType & FORMATTING_TYPES) {
            if (charType & (TYPE_RLE | TYPE_LRE)) {
              embedLevels[i$2] = stackTop._level;
              var level = (charType === TYPE_RLE ? nextOdd : nextEven)(stackTop._level);
              if (level <= MAX_DEPTH && !overflowIsolateCount && !overflowEmbeddingCount) {
                statusStack.push({
                  _level: level,
                  _override: 0,
                  _isolate: 0
                });
              } else if (!overflowIsolateCount) {
                overflowEmbeddingCount++;
              }
            } else if (charType & (TYPE_RLO | TYPE_LRO)) {
              embedLevels[i$2] = stackTop._level;
              var level$1 = (charType === TYPE_RLO ? nextOdd : nextEven)(stackTop._level);
              if (level$1 <= MAX_DEPTH && !overflowIsolateCount && !overflowEmbeddingCount) {
                statusStack.push({
                  _level: level$1,
                  _override: charType & TYPE_RLO ? TYPE_R : TYPE_L,
                  _isolate: 0
                });
              } else if (!overflowIsolateCount) {
                overflowEmbeddingCount++;
              }
            } else if (charType & ISOLATE_INIT_TYPES) {
              if (charType & TYPE_FSI) {
                charType = determineAutoEmbedLevel(i$2 + 1, true) === 1 ? TYPE_RLI : TYPE_LRI;
              }
              embedLevels[i$2] = stackTop._level;
              if (stackTop._override) {
                changeCharType(i$2, stackTop._override);
              }
              var level$2 = (charType === TYPE_RLI ? nextOdd : nextEven)(stackTop._level);
              if (level$2 <= MAX_DEPTH && overflowIsolateCount === 0 && overflowEmbeddingCount === 0) {
                validIsolateCount++;
                statusStack.push({
                  _level: level$2,
                  _override: 0,
                  _isolate: 1,
                  _isolInitIndex: i$2
                });
              } else {
                overflowIsolateCount++;
              }
            } else if (charType & TYPE_PDI) {
              if (overflowIsolateCount > 0) {
                overflowIsolateCount--;
              } else if (validIsolateCount > 0) {
                overflowEmbeddingCount = 0;
                while (!statusStack[statusStack.length - 1]._isolate) {
                  statusStack.pop();
                }
                var isolInitIndex = statusStack[statusStack.length - 1]._isolInitIndex;
                if (isolInitIndex != null) {
                  isolationPairs.set(isolInitIndex, i$2);
                  isolationPairs.set(i$2, isolInitIndex);
                }
                statusStack.pop();
                validIsolateCount--;
              }
              stackTop = statusStack[statusStack.length - 1];
              embedLevels[i$2] = stackTop._level;
              if (stackTop._override) {
                changeCharType(i$2, stackTop._override);
              }
            } else if (charType & TYPE_PDF) {
              if (overflowIsolateCount === 0) {
                if (overflowEmbeddingCount > 0) {
                  overflowEmbeddingCount--;
                } else if (!stackTop._isolate && statusStack.length > 1) {
                  statusStack.pop();
                  stackTop = statusStack[statusStack.length - 1];
                }
              }
              embedLevels[i$2] = stackTop._level;
            } else if (charType & TYPE_B) {
              embedLevels[i$2] = paragraph.level;
            }
          } else {
            embedLevels[i$2] = stackTop._level;
            if (stackTop._override && charType !== TYPE_BN) {
              changeCharType(i$2, stackTop._override);
            }
          }
        }
        var levelRuns = [];
        var currentRun = null;
        for (var i$3 = paragraph.start; i$3 <= paragraph.end; i$3++) {
          var charType$1 = charTypes[i$3];
          if (!(charType$1 & BN_LIKE_TYPES)) {
            var lvl = embedLevels[i$3];
            var isIsolInit = charType$1 & ISOLATE_INIT_TYPES;
            var isPDI = charType$1 === TYPE_PDI;
            if (currentRun && lvl === currentRun._level) {
              currentRun._end = i$3;
              currentRun._endsWithIsolInit = isIsolInit;
            } else {
              levelRuns.push(currentRun = {
                _start: i$3,
                _end: i$3,
                _level: lvl,
                _startsWithPDI: isPDI,
                _endsWithIsolInit: isIsolInit
              });
            }
          }
        }
        var isolatingRunSeqs = [];
        for (var runIdx = 0; runIdx < levelRuns.length; runIdx++) {
          var run = levelRuns[runIdx];
          if (!run._startsWithPDI || run._startsWithPDI && !isolationPairs.has(run._start)) {
            var seqRuns = [currentRun = run];
            for (var pdiIndex = void 0; currentRun && currentRun._endsWithIsolInit && (pdiIndex = isolationPairs.get(currentRun._end)) != null; ) {
              for (var i$4 = runIdx + 1; i$4 < levelRuns.length; i$4++) {
                if (levelRuns[i$4]._start === pdiIndex) {
                  seqRuns.push(currentRun = levelRuns[i$4]);
                  break;
                }
              }
            }
            var seqIndices = [];
            for (var i$5 = 0; i$5 < seqRuns.length; i$5++) {
              var run$1 = seqRuns[i$5];
              for (var j = run$1._start; j <= run$1._end; j++) {
                seqIndices.push(j);
              }
            }
            var firstLevel = embedLevels[seqIndices[0]];
            var prevLevel = paragraph.level;
            for (var i$6 = seqIndices[0] - 1; i$6 >= 0; i$6--) {
              if (!(charTypes[i$6] & BN_LIKE_TYPES)) {
                prevLevel = embedLevels[i$6];
                break;
              }
            }
            var lastIndex = seqIndices[seqIndices.length - 1];
            var lastLevel = embedLevels[lastIndex];
            var nextLevel = paragraph.level;
            if (!(charTypes[lastIndex] & ISOLATE_INIT_TYPES)) {
              for (var i$7 = lastIndex + 1; i$7 <= paragraph.end; i$7++) {
                if (!(charTypes[i$7] & BN_LIKE_TYPES)) {
                  nextLevel = embedLevels[i$7];
                  break;
                }
              }
            }
            isolatingRunSeqs.push({
              _seqIndices: seqIndices,
              _sosType: Math.max(prevLevel, firstLevel) % 2 ? TYPE_R : TYPE_L,
              _eosType: Math.max(nextLevel, lastLevel) % 2 ? TYPE_R : TYPE_L
            });
          }
        }
        for (var seqIdx = 0; seqIdx < isolatingRunSeqs.length; seqIdx++) {
          var ref = isolatingRunSeqs[seqIdx];
          var seqIndices$1 = ref._seqIndices;
          var sosType = ref._sosType;
          var eosType = ref._eosType;
          var embedDirection = embedLevels[seqIndices$1[0]] & 1 ? TYPE_R : TYPE_L;
          if (charTypeCounts.get(TYPE_NSM)) {
            for (var si = 0; si < seqIndices$1.length; si++) {
              var i$8 = seqIndices$1[si];
              if (charTypes[i$8] & TYPE_NSM) {
                var prevType = sosType;
                for (var sj = si - 1; sj >= 0; sj--) {
                  if (!(charTypes[seqIndices$1[sj]] & BN_LIKE_TYPES)) {
                    prevType = charTypes[seqIndices$1[sj]];
                    break;
                  }
                }
                changeCharType(i$8, prevType & (ISOLATE_INIT_TYPES | TYPE_PDI) ? TYPE_ON : prevType);
              }
            }
          }
          if (charTypeCounts.get(TYPE_EN)) {
            for (var si$1 = 0; si$1 < seqIndices$1.length; si$1++) {
              var i$9 = seqIndices$1[si$1];
              if (charTypes[i$9] & TYPE_EN) {
                for (var sj$1 = si$1 - 1; sj$1 >= -1; sj$1--) {
                  var prevCharType = sj$1 === -1 ? sosType : charTypes[seqIndices$1[sj$1]];
                  if (prevCharType & STRONG_TYPES) {
                    if (prevCharType === TYPE_AL) {
                      changeCharType(i$9, TYPE_AN);
                    }
                    break;
                  }
                }
              }
            }
          }
          if (charTypeCounts.get(TYPE_AL)) {
            for (var si$2 = 0; si$2 < seqIndices$1.length; si$2++) {
              var i$10 = seqIndices$1[si$2];
              if (charTypes[i$10] & TYPE_AL) {
                changeCharType(i$10, TYPE_R);
              }
            }
          }
          if (charTypeCounts.get(TYPE_ES) || charTypeCounts.get(TYPE_CS)) {
            for (var si$3 = 1; si$3 < seqIndices$1.length - 1; si$3++) {
              var i$11 = seqIndices$1[si$3];
              if (charTypes[i$11] & (TYPE_ES | TYPE_CS)) {
                var prevType$1 = 0, nextType = 0;
                for (var sj$2 = si$3 - 1; sj$2 >= 0; sj$2--) {
                  prevType$1 = charTypes[seqIndices$1[sj$2]];
                  if (!(prevType$1 & BN_LIKE_TYPES)) {
                    break;
                  }
                }
                for (var sj$3 = si$3 + 1; sj$3 < seqIndices$1.length; sj$3++) {
                  nextType = charTypes[seqIndices$1[sj$3]];
                  if (!(nextType & BN_LIKE_TYPES)) {
                    break;
                  }
                }
                if (prevType$1 === nextType && (charTypes[i$11] === TYPE_ES ? prevType$1 === TYPE_EN : prevType$1 & (TYPE_EN | TYPE_AN))) {
                  changeCharType(i$11, prevType$1);
                }
              }
            }
          }
          if (charTypeCounts.get(TYPE_EN)) {
            for (var si$4 = 0; si$4 < seqIndices$1.length; si$4++) {
              var i$12 = seqIndices$1[si$4];
              if (charTypes[i$12] & TYPE_EN) {
                for (var sj$4 = si$4 - 1; sj$4 >= 0 && charTypes[seqIndices$1[sj$4]] & (TYPE_ET | BN_LIKE_TYPES); sj$4--) {
                  changeCharType(seqIndices$1[sj$4], TYPE_EN);
                }
                for (si$4++; si$4 < seqIndices$1.length && charTypes[seqIndices$1[si$4]] & (TYPE_ET | BN_LIKE_TYPES | TYPE_EN); si$4++) {
                  if (charTypes[seqIndices$1[si$4]] !== TYPE_EN) {
                    changeCharType(seqIndices$1[si$4], TYPE_EN);
                  }
                }
              }
            }
          }
          if (charTypeCounts.get(TYPE_ET) || charTypeCounts.get(TYPE_ES) || charTypeCounts.get(TYPE_CS)) {
            for (var si$5 = 0; si$5 < seqIndices$1.length; si$5++) {
              var i$13 = seqIndices$1[si$5];
              if (charTypes[i$13] & (TYPE_ET | TYPE_ES | TYPE_CS)) {
                changeCharType(i$13, TYPE_ON);
                for (var sj$5 = si$5 - 1; sj$5 >= 0 && charTypes[seqIndices$1[sj$5]] & BN_LIKE_TYPES; sj$5--) {
                  changeCharType(seqIndices$1[sj$5], TYPE_ON);
                }
                for (var sj$6 = si$5 + 1; sj$6 < seqIndices$1.length && charTypes[seqIndices$1[sj$6]] & BN_LIKE_TYPES; sj$6++) {
                  changeCharType(seqIndices$1[sj$6], TYPE_ON);
                }
              }
            }
          }
          if (charTypeCounts.get(TYPE_EN)) {
            for (var si$6 = 0, prevStrongType = sosType; si$6 < seqIndices$1.length; si$6++) {
              var i$14 = seqIndices$1[si$6];
              var type = charTypes[i$14];
              if (type & TYPE_EN) {
                if (prevStrongType === TYPE_L) {
                  changeCharType(i$14, TYPE_L);
                }
              } else if (type & STRONG_TYPES) {
                prevStrongType = type;
              }
            }
          }
          if (charTypeCounts.get(NEUTRAL_ISOLATE_TYPES)) {
            var R_TYPES_FOR_N_STEPS = TYPE_R | TYPE_EN | TYPE_AN;
            var STRONG_TYPES_FOR_N_STEPS = R_TYPES_FOR_N_STEPS | TYPE_L;
            var bracketPairs = [];
            {
              var openerStack = [];
              for (var si$7 = 0; si$7 < seqIndices$1.length; si$7++) {
                if (charTypes[seqIndices$1[si$7]] & NEUTRAL_ISOLATE_TYPES) {
                  var char = string[seqIndices$1[si$7]];
                  var oppositeBracket = void 0;
                  if (openingToClosingBracket(char) !== null) {
                    if (openerStack.length < 63) {
                      openerStack.push({ char, seqIndex: si$7 });
                    } else {
                      break;
                    }
                  } else if ((oppositeBracket = closingToOpeningBracket(char)) !== null) {
                    for (var stackIdx = openerStack.length - 1; stackIdx >= 0; stackIdx--) {
                      var stackChar = openerStack[stackIdx].char;
                      if (stackChar === oppositeBracket || stackChar === closingToOpeningBracket(getCanonicalBracket(char)) || openingToClosingBracket(getCanonicalBracket(stackChar)) === char) {
                        bracketPairs.push([openerStack[stackIdx].seqIndex, si$7]);
                        openerStack.length = stackIdx;
                        break;
                      }
                    }
                  }
                }
              }
              bracketPairs.sort(function(a, b) {
                return a[0] - b[0];
              });
            }
            for (var pairIdx = 0; pairIdx < bracketPairs.length; pairIdx++) {
              var ref$1 = bracketPairs[pairIdx];
              var openSeqIdx = ref$1[0];
              var closeSeqIdx = ref$1[1];
              var foundStrongType = false;
              var useStrongType = 0;
              for (var si$8 = openSeqIdx + 1; si$8 < closeSeqIdx; si$8++) {
                var i$15 = seqIndices$1[si$8];
                if (charTypes[i$15] & STRONG_TYPES_FOR_N_STEPS) {
                  foundStrongType = true;
                  var lr = charTypes[i$15] & R_TYPES_FOR_N_STEPS ? TYPE_R : TYPE_L;
                  if (lr === embedDirection) {
                    useStrongType = lr;
                    break;
                  }
                }
              }
              if (foundStrongType && !useStrongType) {
                useStrongType = sosType;
                for (var si$9 = openSeqIdx - 1; si$9 >= 0; si$9--) {
                  var i$16 = seqIndices$1[si$9];
                  if (charTypes[i$16] & STRONG_TYPES_FOR_N_STEPS) {
                    var lr$1 = charTypes[i$16] & R_TYPES_FOR_N_STEPS ? TYPE_R : TYPE_L;
                    if (lr$1 !== embedDirection) {
                      useStrongType = lr$1;
                    } else {
                      useStrongType = embedDirection;
                    }
                    break;
                  }
                }
              }
              if (useStrongType) {
                charTypes[seqIndices$1[openSeqIdx]] = charTypes[seqIndices$1[closeSeqIdx]] = useStrongType;
                if (useStrongType !== embedDirection) {
                  for (var si$10 = openSeqIdx + 1; si$10 < seqIndices$1.length; si$10++) {
                    if (!(charTypes[seqIndices$1[si$10]] & BN_LIKE_TYPES)) {
                      if (getBidiCharType(string[seqIndices$1[si$10]]) & TYPE_NSM) {
                        charTypes[seqIndices$1[si$10]] = useStrongType;
                      }
                      break;
                    }
                  }
                }
                if (useStrongType !== embedDirection) {
                  for (var si$11 = closeSeqIdx + 1; si$11 < seqIndices$1.length; si$11++) {
                    if (!(charTypes[seqIndices$1[si$11]] & BN_LIKE_TYPES)) {
                      if (getBidiCharType(string[seqIndices$1[si$11]]) & TYPE_NSM) {
                        charTypes[seqIndices$1[si$11]] = useStrongType;
                      }
                      break;
                    }
                  }
                }
              }
            }
            for (var si$12 = 0; si$12 < seqIndices$1.length; si$12++) {
              if (charTypes[seqIndices$1[si$12]] & NEUTRAL_ISOLATE_TYPES) {
                var niRunStart = si$12, niRunEnd = si$12;
                var prevType$2 = sosType;
                for (var si2 = si$12 - 1; si2 >= 0; si2--) {
                  if (charTypes[seqIndices$1[si2]] & BN_LIKE_TYPES) {
                    niRunStart = si2;
                  } else {
                    prevType$2 = charTypes[seqIndices$1[si2]] & R_TYPES_FOR_N_STEPS ? TYPE_R : TYPE_L;
                    break;
                  }
                }
                var nextType$1 = eosType;
                for (var si2$1 = si$12 + 1; si2$1 < seqIndices$1.length; si2$1++) {
                  if (charTypes[seqIndices$1[si2$1]] & (NEUTRAL_ISOLATE_TYPES | BN_LIKE_TYPES)) {
                    niRunEnd = si2$1;
                  } else {
                    nextType$1 = charTypes[seqIndices$1[si2$1]] & R_TYPES_FOR_N_STEPS ? TYPE_R : TYPE_L;
                    break;
                  }
                }
                for (var sj$7 = niRunStart; sj$7 <= niRunEnd; sj$7++) {
                  charTypes[seqIndices$1[sj$7]] = prevType$2 === nextType$1 ? prevType$2 : embedDirection;
                }
                si$12 = niRunEnd;
              }
            }
          }
        }
        for (var i$17 = paragraph.start; i$17 <= paragraph.end; i$17++) {
          var level$3 = embedLevels[i$17];
          var type$1 = charTypes[i$17];
          if (level$3 & 1) {
            if (type$1 & (TYPE_L | TYPE_EN | TYPE_AN)) {
              embedLevels[i$17]++;
            }
          } else {
            if (type$1 & TYPE_R) {
              embedLevels[i$17]++;
            } else if (type$1 & (TYPE_AN | TYPE_EN)) {
              embedLevels[i$17] += 2;
            }
          }
          if (type$1 & BN_LIKE_TYPES) {
            embedLevels[i$17] = i$17 === 0 ? paragraph.level : embedLevels[i$17 - 1];
          }
          if (i$17 === paragraph.end || getBidiCharType(string[i$17]) & (TYPE_S | TYPE_B)) {
            for (var j$1 = i$17; j$1 >= 0 && getBidiCharType(string[j$1]) & TRAILING_TYPES; j$1--) {
              embedLevels[j$1] = paragraph.level;
            }
          }
        }
      }
      return {
        levels: embedLevels,
        paragraphs
      };
      function determineAutoEmbedLevel(start, isFSI) {
        for (var i2 = start; i2 < string.length; i2++) {
          var charType2 = charTypes[i2];
          if (charType2 & (TYPE_R | TYPE_AL)) {
            return 1;
          }
          if (charType2 & (TYPE_B | TYPE_L) || isFSI && charType2 === TYPE_PDI) {
            return 0;
          }
          if (charType2 & ISOLATE_INIT_TYPES) {
            var pdi = indexOfMatchingPDI(i2);
            i2 = pdi === -1 ? string.length : pdi;
          }
        }
        return 0;
      }
      function indexOfMatchingPDI(isolateStart) {
        var isolationLevel = 1;
        for (var i2 = isolateStart + 1; i2 < string.length; i2++) {
          var charType2 = charTypes[i2];
          if (charType2 & TYPE_B) {
            break;
          }
          if (charType2 & TYPE_PDI) {
            if (--isolationLevel === 0) {
              return i2;
            }
          } else if (charType2 & ISOLATE_INIT_TYPES) {
            isolationLevel++;
          }
        }
        return -1;
      }
    }
    var data = "14>1,j>2,t>2,u>2,1a>g,2v3>1,1>1,1ge>1,1wd>1,b>1,1j>1,f>1,ai>3,-2>3,+1,8>1k0,-1jq>1y7,-1y6>1hf,-1he>1h6,-1h5>1ha,-1h8>1qi,-1pu>1,6>3u,-3s>7,6>1,1>1,f>1,1>1,+2,3>1,1>1,+13,4>1,1>1,6>1eo,-1ee>1,3>1mg,-1me>1mk,-1mj>1mi,-1mg>1mi,-1md>1,1>1,+2,1>10k,-103>1,1>1,4>1,5>1,1>1,+10,3>1,1>8,-7>8,+1,-6>7,+1,a>1,1>1,u>1,u6>1,1>1,+5,26>1,1>1,2>1,2>2,8>1,7>1,4>1,1>1,+5,b8>1,1>1,+3,1>3,-2>1,2>1,1>1,+2,c>1,3>1,1>1,+2,h>1,3>1,a>1,1>1,2>1,3>1,1>1,d>1,f>1,3>1,1a>1,1>1,6>1,7>1,13>1,k>1,1>1,+19,4>1,1>1,+2,2>1,1>1,+18,m>1,a>1,1>1,lk>1,1>1,4>1,2>1,f>1,3>1,1>1,+3,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,6>1,4j>1,j>2,t>2,u>2,2>1,+1";
    var mirrorMap;
    function parse() {
      if (!mirrorMap) {
        var ref = parseCharacterMap(data, true);
        var map2 = ref.map;
        var reverseMap = ref.reverseMap;
        reverseMap.forEach(function(value, key) {
          map2.set(key, value);
        });
        mirrorMap = map2;
      }
    }
    function getMirroredCharacter(char) {
      parse();
      return mirrorMap.get(char) || null;
    }
    function getMirroredCharactersMap(string, embeddingLevels, start, end) {
      var strLen = string.length;
      start = Math.max(0, start == null ? 0 : +start);
      end = Math.min(strLen - 1, end == null ? strLen - 1 : +end);
      var map2 = /* @__PURE__ */ new Map();
      for (var i = start; i <= end; i++) {
        if (embeddingLevels[i] & 1) {
          var mirror = getMirroredCharacter(string[i]);
          if (mirror !== null) {
            map2.set(i, mirror);
          }
        }
      }
      return map2;
    }
    function getReorderSegments(string, embeddingLevelsResult, start, end) {
      var strLen = string.length;
      start = Math.max(0, start == null ? 0 : +start);
      end = Math.min(strLen - 1, end == null ? strLen - 1 : +end);
      var segments = [];
      embeddingLevelsResult.paragraphs.forEach(function(paragraph) {
        var lineStart = Math.max(start, paragraph.start);
        var lineEnd = Math.min(end, paragraph.end);
        if (lineStart < lineEnd) {
          var lineLevels = embeddingLevelsResult.levels.slice(lineStart, lineEnd + 1);
          for (var i = lineEnd; i >= lineStart && getBidiCharType(string[i]) & TRAILING_TYPES; i--) {
            lineLevels[i] = paragraph.level;
          }
          var maxLevel = paragraph.level;
          var minOddLevel = Infinity;
          for (var i$1 = 0; i$1 < lineLevels.length; i$1++) {
            var level = lineLevels[i$1];
            if (level > maxLevel) {
              maxLevel = level;
            }
            if (level < minOddLevel) {
              minOddLevel = level | 1;
            }
          }
          for (var lvl = maxLevel; lvl >= minOddLevel; lvl--) {
            for (var i$2 = 0; i$2 < lineLevels.length; i$2++) {
              if (lineLevels[i$2] >= lvl) {
                var segStart = i$2;
                while (i$2 + 1 < lineLevels.length && lineLevels[i$2 + 1] >= lvl) {
                  i$2++;
                }
                if (i$2 > segStart) {
                  segments.push([segStart + lineStart, i$2 + lineStart]);
                }
              }
            }
          }
        }
      });
      return segments;
    }
    function getReorderedString(string, embedLevelsResult, start, end) {
      var indices = getReorderedIndices(string, embedLevelsResult, start, end);
      var chars = [].concat(string);
      indices.forEach(function(charIndex, i) {
        chars[i] = (embedLevelsResult.levels[charIndex] & 1 ? getMirroredCharacter(string[charIndex]) : null) || string[charIndex];
      });
      return chars.join("");
    }
    function getReorderedIndices(string, embedLevelsResult, start, end) {
      var segments = getReorderSegments(string, embedLevelsResult, start, end);
      var indices = [];
      for (var i = 0; i < string.length; i++) {
        indices[i] = i;
      }
      segments.forEach(function(ref) {
        var start2 = ref[0];
        var end2 = ref[1];
        var slice = indices.slice(start2, end2 + 1);
        for (var i2 = slice.length; i2--; ) {
          indices[end2 - i2] = slice[i2];
        }
      });
      return indices;
    }
    exports.closingToOpeningBracket = closingToOpeningBracket;
    exports.getBidiCharType = getBidiCharType;
    exports.getBidiCharTypeName = getBidiCharTypeName;
    exports.getCanonicalBracket = getCanonicalBracket;
    exports.getEmbeddingLevels = getEmbeddingLevels;
    exports.getMirroredCharacter = getMirroredCharacter;
    exports.getMirroredCharactersMap = getMirroredCharactersMap;
    exports.getReorderSegments = getReorderSegments;
    exports.getReorderedIndices = getReorderedIndices;
    exports.getReorderedString = getReorderedString;
    exports.openingToClosingBracket = openingToClosingBracket;
    Object.defineProperty(exports, "__esModule", { value: true });
    return exports;
  }({});
  return bidi;
}
var bidi_default = bidiFactory;

// node_modules/troika-three-utils/dist/troika-three-utils.esm.js
var voidMainRegExp = /\bvoid\s+main\s*\(\s*\)\s*{/g;
function expandShaderIncludes(source) {
  const pattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function replace(match, include) {
    let chunk = ShaderChunk[include];
    return chunk ? expandShaderIncludes(chunk) : match;
  }
  return source.replace(pattern, replace);
}
var _lut = [];
for (let i = 0; i < 256; i++) {
  _lut[i] = (i < 16 ? "0" : "") + i.toString(16);
}
function generateUUID() {
  const d0 = Math.random() * 4294967295 | 0;
  const d1 = Math.random() * 4294967295 | 0;
  const d2 = Math.random() * 4294967295 | 0;
  const d3 = Math.random() * 4294967295 | 0;
  const uuid = _lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255];
  return uuid.toUpperCase();
}
var assign = Object.assign || function() {
  let target = arguments[0];
  for (let i = 1, len = arguments.length; i < len; i++) {
    let source = arguments[i];
    if (source) {
      for (let prop in source) {
        if (Object.prototype.hasOwnProperty.call(source, prop)) {
          target[prop] = source[prop];
        }
      }
    }
  }
  return target;
};
var epoch = Date.now();
var CONSTRUCTOR_CACHE = /* @__PURE__ */ new WeakMap();
var SHADER_UPGRADE_CACHE = /* @__PURE__ */ new Map();
var materialInstanceId = 1e10;
function createDerivedMaterial(baseMaterial, options) {
  const optionsKey = getKeyForOptions(options);
  let ctorsByDerivation = CONSTRUCTOR_CACHE.get(baseMaterial);
  if (!ctorsByDerivation) {
    CONSTRUCTOR_CACHE.set(baseMaterial, ctorsByDerivation = /* @__PURE__ */ Object.create(null));
  }
  if (ctorsByDerivation[optionsKey]) {
    return new ctorsByDerivation[optionsKey]();
  }
  const privateBeforeCompileProp = `_onBeforeCompile${optionsKey}`;
  const onBeforeCompile = function(shaderInfo, renderer) {
    baseMaterial.onBeforeCompile.call(this, shaderInfo, renderer);
    const cacheKey = this.customProgramCacheKey() + "|" + shaderInfo.vertexShader + "|" + shaderInfo.fragmentShader;
    let upgradedShaders = SHADER_UPGRADE_CACHE[cacheKey];
    if (!upgradedShaders) {
      const upgraded = upgradeShaders(this, shaderInfo, options, optionsKey);
      upgradedShaders = SHADER_UPGRADE_CACHE[cacheKey] = upgraded;
    }
    shaderInfo.vertexShader = upgradedShaders.vertexShader;
    shaderInfo.fragmentShader = upgradedShaders.fragmentShader;
    assign(shaderInfo.uniforms, this.uniforms);
    if (options.timeUniform) {
      shaderInfo.uniforms[options.timeUniform] = {
        get value() {
          return Date.now() - epoch;
        }
      };
    }
    if (this[privateBeforeCompileProp]) {
      this[privateBeforeCompileProp](shaderInfo);
    }
  };
  const DerivedMaterial = function DerivedMaterial2() {
    return derive(options.chained ? baseMaterial : baseMaterial.clone());
  };
  const derive = function(base) {
    const derived = Object.create(base, descriptor);
    Object.defineProperty(derived, "baseMaterial", { value: baseMaterial });
    Object.defineProperty(derived, "id", { value: materialInstanceId++ });
    derived.uuid = generateUUID();
    derived.uniforms = assign({}, base.uniforms, options.uniforms);
    derived.defines = assign({}, base.defines, options.defines);
    derived.defines[`TROIKA_DERIVED_MATERIAL_${optionsKey}`] = "";
    derived.extensions = assign({}, base.extensions, options.extensions);
    derived._listeners = void 0;
    return derived;
  };
  const descriptor = {
    constructor: { value: DerivedMaterial },
    isDerivedMaterial: { value: true },
    type: {
      get: () => baseMaterial.type,
      set: (value) => {
        baseMaterial.type = value;
      }
    },
    isDerivedFrom: {
      writable: true,
      configurable: true,
      value: function(testMaterial) {
        const base = this.baseMaterial;
        return testMaterial === base || base.isDerivedMaterial && base.isDerivedFrom(testMaterial) || false;
      }
    },
    customProgramCacheKey: {
      writable: true,
      configurable: true,
      value: function() {
        return baseMaterial.customProgramCacheKey() + "|" + optionsKey;
      }
    },
    onBeforeCompile: {
      get() {
        return onBeforeCompile;
      },
      set(fn) {
        this[privateBeforeCompileProp] = fn;
      }
    },
    copy: {
      writable: true,
      configurable: true,
      value: function(source) {
        baseMaterial.copy.call(this, source);
        if (!baseMaterial.isShaderMaterial && !baseMaterial.isDerivedMaterial) {
          assign(this.extensions, source.extensions);
          assign(this.defines, source.defines);
          assign(this.uniforms, UniformsUtils.clone(source.uniforms));
        }
        return this;
      }
    },
    clone: {
      writable: true,
      configurable: true,
      value: function() {
        const newBase = new baseMaterial.constructor();
        return derive(newBase).copy(this);
      }
    },
    /**
     * Utility to get a MeshDepthMaterial that will honor this derived material's vertex
     * transformations and discarded fragments.
     */
    getDepthMaterial: {
      writable: true,
      configurable: true,
      value: function() {
        let depthMaterial = this._depthMaterial;
        if (!depthMaterial) {
          depthMaterial = this._depthMaterial = createDerivedMaterial(
            baseMaterial.isDerivedMaterial ? baseMaterial.getDepthMaterial() : new MeshDepthMaterial({ depthPacking: RGBADepthPacking }),
            options
          );
          depthMaterial.defines.IS_DEPTH_MATERIAL = "";
          depthMaterial.uniforms = this.uniforms;
        }
        return depthMaterial;
      }
    },
    /**
     * Utility to get a MeshDistanceMaterial that will honor this derived material's vertex
     * transformations and discarded fragments.
     */
    getDistanceMaterial: {
      writable: true,
      configurable: true,
      value: function() {
        let distanceMaterial = this._distanceMaterial;
        if (!distanceMaterial) {
          distanceMaterial = this._distanceMaterial = createDerivedMaterial(
            baseMaterial.isDerivedMaterial ? baseMaterial.getDistanceMaterial() : new MeshDistanceMaterial(),
            options
          );
          distanceMaterial.defines.IS_DISTANCE_MATERIAL = "";
          distanceMaterial.uniforms = this.uniforms;
        }
        return distanceMaterial;
      }
    },
    dispose: {
      writable: true,
      configurable: true,
      value() {
        const { _depthMaterial, _distanceMaterial } = this;
        if (_depthMaterial) _depthMaterial.dispose();
        if (_distanceMaterial) _distanceMaterial.dispose();
        baseMaterial.dispose.call(this);
      }
    }
  };
  ctorsByDerivation[optionsKey] = DerivedMaterial;
  return new DerivedMaterial();
}
function upgradeShaders(material, { vertexShader, fragmentShader }, options, key) {
  let {
    vertexDefs,
    vertexMainIntro,
    vertexMainOutro,
    vertexTransform,
    fragmentDefs,
    fragmentMainIntro,
    fragmentMainOutro,
    fragmentColorTransform,
    customRewriter,
    timeUniform
  } = options;
  vertexDefs = vertexDefs || "";
  vertexMainIntro = vertexMainIntro || "";
  vertexMainOutro = vertexMainOutro || "";
  fragmentDefs = fragmentDefs || "";
  fragmentMainIntro = fragmentMainIntro || "";
  fragmentMainOutro = fragmentMainOutro || "";
  if (vertexTransform || customRewriter) {
    vertexShader = expandShaderIncludes(vertexShader);
  }
  if (fragmentColorTransform || customRewriter) {
    fragmentShader = fragmentShader.replace(
      /^[ \t]*#include <((?:tonemapping|encodings|colorspace|fog|premultiplied_alpha|dithering)_fragment)>/gm,
      "\n//!BEGIN_POST_CHUNK $1\n$&\n//!END_POST_CHUNK\n"
    );
    fragmentShader = expandShaderIncludes(fragmentShader);
  }
  if (customRewriter) {
    let res = customRewriter({ vertexShader, fragmentShader });
    vertexShader = res.vertexShader;
    fragmentShader = res.fragmentShader;
  }
  if (fragmentColorTransform) {
    let postChunks = [];
    fragmentShader = fragmentShader.replace(
      /^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,
      // [^]+? = non-greedy match of any chars including newlines
      (match) => {
        postChunks.push(match);
        return "";
      }
    );
    fragmentMainOutro = `${fragmentColorTransform}
${postChunks.join("\n")}
${fragmentMainOutro}`;
  }
  if (timeUniform) {
    const code = `
uniform float ${timeUniform};
`;
    vertexDefs = code + vertexDefs;
    fragmentDefs = code + fragmentDefs;
  }
  if (vertexTransform) {
    vertexShader = `vec3 troika_position_${key};
vec3 troika_normal_${key};
vec2 troika_uv_${key};
${vertexShader}
`;
    vertexDefs = `${vertexDefs}
void troikaVertexTransform${key}(inout vec3 position, inout vec3 normal, inout vec2 uv) {
  ${vertexTransform}
}
`;
    vertexMainIntro = `
troika_position_${key} = vec3(position);
troika_normal_${key} = vec3(normal);
troika_uv_${key} = vec2(uv);
troikaVertexTransform${key}(troika_position_${key}, troika_normal_${key}, troika_uv_${key});
${vertexMainIntro}
`;
    vertexShader = vertexShader.replace(/\b(position|normal|uv)\b/g, (match, match1, index, fullStr) => {
      return /\battribute\s+vec[23]\s+$/.test(fullStr.substr(0, index)) ? match1 : `troika_${match1}_${key}`;
    });
    if (!(material.map && material.map.channel > 0)) {
      vertexShader = vertexShader.replace(/\bMAP_UV\b/g, `troika_uv_${key}`);
    }
  }
  vertexShader = injectIntoShaderCode(vertexShader, key, vertexDefs, vertexMainIntro, vertexMainOutro);
  fragmentShader = injectIntoShaderCode(fragmentShader, key, fragmentDefs, fragmentMainIntro, fragmentMainOutro);
  return {
    vertexShader,
    fragmentShader
  };
}
function injectIntoShaderCode(shaderCode, id, defs, intro, outro) {
  if (intro || outro || defs) {
    shaderCode = shaderCode.replace(
      voidMainRegExp,
      `
${defs}
void troikaOrigMain${id}() {`
    );
    shaderCode += `
void main() {
  ${intro}
  troikaOrigMain${id}();
  ${outro}
}`;
  }
  return shaderCode;
}
function optionsJsonReplacer(key, value) {
  return key === "uniforms" ? void 0 : typeof value === "function" ? value.toString() : value;
}
var _idCtr = 0;
var optionsHashesToIds = /* @__PURE__ */ new Map();
function getKeyForOptions(options) {
  const optionsHash = JSON.stringify(options, optionsJsonReplacer);
  let id = optionsHashesToIds.get(optionsHash);
  if (id == null) {
    optionsHashesToIds.set(optionsHash, id = ++_idCtr);
  }
  return id;
}
var defaultBaseMaterial = new MeshStandardMaterial({ color: 16777215, side: DoubleSide });

// node_modules/troika-three-text/dist/troika-three-text.esm.js
function typrFactory() {
  return "undefined" == typeof window && (self.window = self), function(r) {
    var e = { parse: function(r2) {
      var t2 = e._bin, a2 = new Uint8Array(r2);
      if ("ttcf" == t2.readASCII(a2, 0, 4)) {
        var n = 4;
        t2.readUshort(a2, n), n += 2, t2.readUshort(a2, n), n += 2;
        var o = t2.readUint(a2, n);
        n += 4;
        for (var s = [], i = 0; i < o; i++) {
          var h = t2.readUint(a2, n);
          n += 4, s.push(e._readFont(a2, h));
        }
        return s;
      }
      return [e._readFont(a2, 0)];
    }, _readFont: function(r2, t2) {
      var a2 = e._bin, n = t2;
      a2.readFixed(r2, t2), t2 += 4;
      var o = a2.readUshort(r2, t2);
      t2 += 2, a2.readUshort(r2, t2), t2 += 2, a2.readUshort(r2, t2), t2 += 2, a2.readUshort(r2, t2), t2 += 2;
      for (var s = ["cmap", "head", "hhea", "maxp", "hmtx", "name", "OS/2", "post", "loca", "glyf", "kern", "CFF ", "GDEF", "GPOS", "GSUB", "SVG "], i = { _data: r2, _offset: n }, h = {}, d = 0; d < o; d++) {
        var f = a2.readASCII(r2, t2, 4);
        t2 += 4, a2.readUint(r2, t2), t2 += 4;
        var u = a2.readUint(r2, t2);
        t2 += 4;
        var l = a2.readUint(r2, t2);
        t2 += 4, h[f] = { offset: u, length: l };
      }
      for (d = 0; d < s.length; d++) {
        var v = s[d];
        h[v] && (i[v.trim()] = e[v.trim()].parse(r2, h[v].offset, h[v].length, i));
      }
      return i;
    }, _tabOffset: function(r2, t2, a2) {
      for (var n = e._bin, o = n.readUshort(r2, a2 + 4), s = a2 + 12, i = 0; i < o; i++) {
        var h = n.readASCII(r2, s, 4);
        s += 4, n.readUint(r2, s), s += 4;
        var d = n.readUint(r2, s);
        if (s += 4, n.readUint(r2, s), s += 4, h == t2) return d;
      }
      return 0;
    } };
    e._bin = { readFixed: function(r2, e2) {
      return (r2[e2] << 8 | r2[e2 + 1]) + (r2[e2 + 2] << 8 | r2[e2 + 3]) / 65540;
    }, readF2dot14: function(r2, t2) {
      return e._bin.readShort(r2, t2) / 16384;
    }, readInt: function(r2, t2) {
      return e._bin._view(r2).getInt32(t2);
    }, readInt8: function(r2, t2) {
      return e._bin._view(r2).getInt8(t2);
    }, readShort: function(r2, t2) {
      return e._bin._view(r2).getInt16(t2);
    }, readUshort: function(r2, t2) {
      return e._bin._view(r2).getUint16(t2);
    }, readUshorts: function(r2, t2, a2) {
      for (var n = [], o = 0; o < a2; o++) n.push(e._bin.readUshort(r2, t2 + 2 * o));
      return n;
    }, readUint: function(r2, t2) {
      return e._bin._view(r2).getUint32(t2);
    }, readUint64: function(r2, t2) {
      return 4294967296 * e._bin.readUint(r2, t2) + e._bin.readUint(r2, t2 + 4);
    }, readASCII: function(r2, e2, t2) {
      for (var a2 = "", n = 0; n < t2; n++) a2 += String.fromCharCode(r2[e2 + n]);
      return a2;
    }, readUnicode: function(r2, e2, t2) {
      for (var a2 = "", n = 0; n < t2; n++) {
        var o = r2[e2++] << 8 | r2[e2++];
        a2 += String.fromCharCode(o);
      }
      return a2;
    }, _tdec: "undefined" != typeof window && window.TextDecoder ? new window.TextDecoder() : null, readUTF8: function(r2, t2, a2) {
      var n = e._bin._tdec;
      return n && 0 == t2 && a2 == r2.length ? n.decode(r2) : e._bin.readASCII(r2, t2, a2);
    }, readBytes: function(r2, e2, t2) {
      for (var a2 = [], n = 0; n < t2; n++) a2.push(r2[e2 + n]);
      return a2;
    }, readASCIIArray: function(r2, e2, t2) {
      for (var a2 = [], n = 0; n < t2; n++) a2.push(String.fromCharCode(r2[e2 + n]));
      return a2;
    }, _view: function(r2) {
      return r2._dataView || (r2._dataView = r2.buffer ? new DataView(r2.buffer, r2.byteOffset, r2.byteLength) : new DataView(new Uint8Array(r2).buffer));
    } }, e._lctf = {}, e._lctf.parse = function(r2, t2, a2, n, o) {
      var s = e._bin, i = {}, h = t2;
      s.readFixed(r2, t2), t2 += 4;
      var d = s.readUshort(r2, t2);
      t2 += 2;
      var f = s.readUshort(r2, t2);
      t2 += 2;
      var u = s.readUshort(r2, t2);
      return t2 += 2, i.scriptList = e._lctf.readScriptList(r2, h + d), i.featureList = e._lctf.readFeatureList(r2, h + f), i.lookupList = e._lctf.readLookupList(r2, h + u, o), i;
    }, e._lctf.readLookupList = function(r2, t2, a2) {
      var n = e._bin, o = t2, s = [], i = n.readUshort(r2, t2);
      t2 += 2;
      for (var h = 0; h < i; h++) {
        var d = n.readUshort(r2, t2);
        t2 += 2;
        var f = e._lctf.readLookupTable(r2, o + d, a2);
        s.push(f);
      }
      return s;
    }, e._lctf.readLookupTable = function(r2, t2, a2) {
      var n = e._bin, o = t2, s = { tabs: [] };
      s.ltype = n.readUshort(r2, t2), t2 += 2, s.flag = n.readUshort(r2, t2), t2 += 2;
      var i = n.readUshort(r2, t2);
      t2 += 2;
      for (var h = s.ltype, d = 0; d < i; d++) {
        var f = n.readUshort(r2, t2);
        t2 += 2;
        var u = a2(r2, h, o + f, s);
        s.tabs.push(u);
      }
      return s;
    }, e._lctf.numOfOnes = function(r2) {
      for (var e2 = 0, t2 = 0; t2 < 32; t2++) 0 != (r2 >>> t2 & 1) && e2++;
      return e2;
    }, e._lctf.readClassDef = function(r2, t2) {
      var a2 = e._bin, n = [], o = a2.readUshort(r2, t2);
      if (t2 += 2, 1 == o) {
        var s = a2.readUshort(r2, t2);
        t2 += 2;
        var i = a2.readUshort(r2, t2);
        t2 += 2;
        for (var h = 0; h < i; h++) n.push(s + h), n.push(s + h), n.push(a2.readUshort(r2, t2)), t2 += 2;
      }
      if (2 == o) {
        var d = a2.readUshort(r2, t2);
        t2 += 2;
        for (h = 0; h < d; h++) n.push(a2.readUshort(r2, t2)), t2 += 2, n.push(a2.readUshort(r2, t2)), t2 += 2, n.push(a2.readUshort(r2, t2)), t2 += 2;
      }
      return n;
    }, e._lctf.getInterval = function(r2, e2) {
      for (var t2 = 0; t2 < r2.length; t2 += 3) {
        var a2 = r2[t2], n = r2[t2 + 1];
        if (r2[t2 + 2], a2 <= e2 && e2 <= n) return t2;
      }
      return -1;
    }, e._lctf.readCoverage = function(r2, t2) {
      var a2 = e._bin, n = {};
      n.fmt = a2.readUshort(r2, t2), t2 += 2;
      var o = a2.readUshort(r2, t2);
      return t2 += 2, 1 == n.fmt && (n.tab = a2.readUshorts(r2, t2, o)), 2 == n.fmt && (n.tab = a2.readUshorts(r2, t2, 3 * o)), n;
    }, e._lctf.coverageIndex = function(r2, t2) {
      var a2 = r2.tab;
      if (1 == r2.fmt) return a2.indexOf(t2);
      if (2 == r2.fmt) {
        var n = e._lctf.getInterval(a2, t2);
        if (-1 != n) return a2[n + 2] + (t2 - a2[n]);
      }
      return -1;
    }, e._lctf.readFeatureList = function(r2, t2) {
      var a2 = e._bin, n = t2, o = [], s = a2.readUshort(r2, t2);
      t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = a2.readASCII(r2, t2, 4);
        t2 += 4;
        var d = a2.readUshort(r2, t2);
        t2 += 2;
        var f = e._lctf.readFeatureTable(r2, n + d);
        f.tag = h.trim(), o.push(f);
      }
      return o;
    }, e._lctf.readFeatureTable = function(r2, t2) {
      var a2 = e._bin, n = t2, o = {}, s = a2.readUshort(r2, t2);
      t2 += 2, s > 0 && (o.featureParams = n + s);
      var i = a2.readUshort(r2, t2);
      t2 += 2, o.tab = [];
      for (var h = 0; h < i; h++) o.tab.push(a2.readUshort(r2, t2 + 2 * h));
      return o;
    }, e._lctf.readScriptList = function(r2, t2) {
      var a2 = e._bin, n = t2, o = {}, s = a2.readUshort(r2, t2);
      t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = a2.readASCII(r2, t2, 4);
        t2 += 4;
        var d = a2.readUshort(r2, t2);
        t2 += 2, o[h.trim()] = e._lctf.readScriptTable(r2, n + d);
      }
      return o;
    }, e._lctf.readScriptTable = function(r2, t2) {
      var a2 = e._bin, n = t2, o = {}, s = a2.readUshort(r2, t2);
      t2 += 2, s > 0 && (o.default = e._lctf.readLangSysTable(r2, n + s));
      var i = a2.readUshort(r2, t2);
      t2 += 2;
      for (var h = 0; h < i; h++) {
        var d = a2.readASCII(r2, t2, 4);
        t2 += 4;
        var f = a2.readUshort(r2, t2);
        t2 += 2, o[d.trim()] = e._lctf.readLangSysTable(r2, n + f);
      }
      return o;
    }, e._lctf.readLangSysTable = function(r2, t2) {
      var a2 = e._bin, n = {};
      a2.readUshort(r2, t2), t2 += 2, n.reqFeature = a2.readUshort(r2, t2), t2 += 2;
      var o = a2.readUshort(r2, t2);
      return t2 += 2, n.features = a2.readUshorts(r2, t2, o), n;
    }, e.CFF = {}, e.CFF.parse = function(r2, t2, a2) {
      var n = e._bin;
      (r2 = new Uint8Array(r2.buffer, t2, a2))[t2 = 0], r2[++t2], r2[++t2], r2[++t2], t2++;
      var o = [];
      t2 = e.CFF.readIndex(r2, t2, o);
      for (var s = [], i = 0; i < o.length - 1; i++) s.push(n.readASCII(r2, t2 + o[i], o[i + 1] - o[i]));
      t2 += o[o.length - 1];
      var h = [];
      t2 = e.CFF.readIndex(r2, t2, h);
      var d = [];
      for (i = 0; i < h.length - 1; i++) d.push(e.CFF.readDict(r2, t2 + h[i], t2 + h[i + 1]));
      t2 += h[h.length - 1];
      var f = d[0], u = [];
      t2 = e.CFF.readIndex(r2, t2, u);
      var l = [];
      for (i = 0; i < u.length - 1; i++) l.push(n.readASCII(r2, t2 + u[i], u[i + 1] - u[i]));
      if (t2 += u[u.length - 1], e.CFF.readSubrs(r2, t2, f), f.CharStrings) {
        t2 = f.CharStrings;
        u = [];
        t2 = e.CFF.readIndex(r2, t2, u);
        var v = [];
        for (i = 0; i < u.length - 1; i++) v.push(n.readBytes(r2, t2 + u[i], u[i + 1] - u[i]));
        f.CharStrings = v;
      }
      if (f.ROS) {
        t2 = f.FDArray;
        var c = [];
        t2 = e.CFF.readIndex(r2, t2, c), f.FDArray = [];
        for (i = 0; i < c.length - 1; i++) {
          var p = e.CFF.readDict(r2, t2 + c[i], t2 + c[i + 1]);
          e.CFF._readFDict(r2, p, l), f.FDArray.push(p);
        }
        t2 += c[c.length - 1], t2 = f.FDSelect, f.FDSelect = [];
        var U = r2[t2];
        if (t2++, 3 != U) throw U;
        var g = n.readUshort(r2, t2);
        t2 += 2;
        for (i = 0; i < g + 1; i++) f.FDSelect.push(n.readUshort(r2, t2), r2[t2 + 2]), t2 += 3;
      }
      return f.Encoding && (f.Encoding = e.CFF.readEncoding(r2, f.Encoding, f.CharStrings.length)), f.charset && (f.charset = e.CFF.readCharset(r2, f.charset, f.CharStrings.length)), e.CFF._readFDict(r2, f, l), f;
    }, e.CFF._readFDict = function(r2, t2, a2) {
      var n;
      for (var o in t2.Private && (n = t2.Private[1], t2.Private = e.CFF.readDict(r2, n, n + t2.Private[0]), t2.Private.Subrs && e.CFF.readSubrs(r2, n + t2.Private.Subrs, t2.Private)), t2) -1 != ["FamilyName", "FontName", "FullName", "Notice", "version", "Copyright"].indexOf(o) && (t2[o] = a2[t2[o] - 426 + 35]);
    }, e.CFF.readSubrs = function(r2, t2, a2) {
      var n = e._bin, o = [];
      t2 = e.CFF.readIndex(r2, t2, o);
      var s, i = o.length;
      s = i < 1240 ? 107 : i < 33900 ? 1131 : 32768, a2.Bias = s, a2.Subrs = [];
      for (var h = 0; h < o.length - 1; h++) a2.Subrs.push(n.readBytes(r2, t2 + o[h], o[h + 1] - o[h]));
    }, e.CFF.tableSE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 0, 111, 112, 113, 114, 0, 115, 116, 117, 118, 119, 120, 121, 122, 0, 123, 0, 124, 125, 126, 127, 128, 129, 130, 131, 0, 132, 133, 0, 134, 135, 136, 137, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 0, 139, 0, 0, 0, 0, 140, 141, 142, 143, 0, 0, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 146, 147, 148, 149, 0, 0, 0, 0], e.CFF.glyphByUnicode = function(r2, e2) {
      for (var t2 = 0; t2 < r2.charset.length; t2++) if (r2.charset[t2] == e2) return t2;
      return -1;
    }, e.CFF.glyphBySE = function(r2, t2) {
      return t2 < 0 || t2 > 255 ? -1 : e.CFF.glyphByUnicode(r2, e.CFF.tableSE[t2]);
    }, e.CFF.readEncoding = function(r2, t2, a2) {
      e._bin;
      var n = [".notdef"], o = r2[t2];
      if (t2++, 0 != o) throw "error: unknown encoding format: " + o;
      var s = r2[t2];
      t2++;
      for (var i = 0; i < s; i++) n.push(r2[t2 + i]);
      return n;
    }, e.CFF.readCharset = function(r2, t2, a2) {
      var n = e._bin, o = [".notdef"], s = r2[t2];
      if (t2++, 0 == s) for (var i = 0; i < a2; i++) {
        var h = n.readUshort(r2, t2);
        t2 += 2, o.push(h);
      }
      else {
        if (1 != s && 2 != s) throw "error: format: " + s;
        for (; o.length < a2; ) {
          h = n.readUshort(r2, t2);
          t2 += 2;
          var d = 0;
          1 == s ? (d = r2[t2], t2++) : (d = n.readUshort(r2, t2), t2 += 2);
          for (i = 0; i <= d; i++) o.push(h), h++;
        }
      }
      return o;
    }, e.CFF.readIndex = function(r2, t2, a2) {
      var n = e._bin, o = n.readUshort(r2, t2) + 1, s = r2[t2 += 2];
      if (t2++, 1 == s) for (var i = 0; i < o; i++) a2.push(r2[t2 + i]);
      else if (2 == s) for (i = 0; i < o; i++) a2.push(n.readUshort(r2, t2 + 2 * i));
      else if (3 == s) for (i = 0; i < o; i++) a2.push(16777215 & n.readUint(r2, t2 + 3 * i - 1));
      else if (1 != o) throw "unsupported offset size: " + s + ", count: " + o;
      return (t2 += o * s) - 1;
    }, e.CFF.getCharString = function(r2, t2, a2) {
      var n = e._bin, o = r2[t2], s = r2[t2 + 1];
      r2[t2 + 2], r2[t2 + 3], r2[t2 + 4];
      var i = 1, h = null, d = null;
      o <= 20 && (h = o, i = 1), 12 == o && (h = 100 * o + s, i = 2), 21 <= o && o <= 27 && (h = o, i = 1), 28 == o && (d = n.readShort(r2, t2 + 1), i = 3), 29 <= o && o <= 31 && (h = o, i = 1), 32 <= o && o <= 246 && (d = o - 139, i = 1), 247 <= o && o <= 250 && (d = 256 * (o - 247) + s + 108, i = 2), 251 <= o && o <= 254 && (d = 256 * -(o - 251) - s - 108, i = 2), 255 == o && (d = n.readInt(r2, t2 + 1) / 65535, i = 5), a2.val = null != d ? d : "o" + h, a2.size = i;
    }, e.CFF.readCharString = function(r2, t2, a2) {
      for (var n = t2 + a2, o = e._bin, s = []; t2 < n; ) {
        var i = r2[t2], h = r2[t2 + 1];
        r2[t2 + 2], r2[t2 + 3], r2[t2 + 4];
        var d = 1, f = null, u = null;
        i <= 20 && (f = i, d = 1), 12 == i && (f = 100 * i + h, d = 2), 19 != i && 20 != i || (f = i, d = 2), 21 <= i && i <= 27 && (f = i, d = 1), 28 == i && (u = o.readShort(r2, t2 + 1), d = 3), 29 <= i && i <= 31 && (f = i, d = 1), 32 <= i && i <= 246 && (u = i - 139, d = 1), 247 <= i && i <= 250 && (u = 256 * (i - 247) + h + 108, d = 2), 251 <= i && i <= 254 && (u = 256 * -(i - 251) - h - 108, d = 2), 255 == i && (u = o.readInt(r2, t2 + 1) / 65535, d = 5), s.push(null != u ? u : "o" + f), t2 += d;
      }
      return s;
    }, e.CFF.readDict = function(r2, t2, a2) {
      for (var n = e._bin, o = {}, s = []; t2 < a2; ) {
        var i = r2[t2], h = r2[t2 + 1];
        r2[t2 + 2], r2[t2 + 3], r2[t2 + 4];
        var d = 1, f = null, u = null;
        if (28 == i && (u = n.readShort(r2, t2 + 1), d = 3), 29 == i && (u = n.readInt(r2, t2 + 1), d = 5), 32 <= i && i <= 246 && (u = i - 139, d = 1), 247 <= i && i <= 250 && (u = 256 * (i - 247) + h + 108, d = 2), 251 <= i && i <= 254 && (u = 256 * -(i - 251) - h - 108, d = 2), 255 == i) throw u = n.readInt(r2, t2 + 1) / 65535, d = 5, "unknown number";
        if (30 == i) {
          var l = [];
          for (d = 1; ; ) {
            var v = r2[t2 + d];
            d++;
            var c = v >> 4, p = 15 & v;
            if (15 != c && l.push(c), 15 != p && l.push(p), 15 == p) break;
          }
          for (var U = "", g = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"], S = 0; S < l.length; S++) U += g[l[S]];
          u = parseFloat(U);
        }
        if (i <= 21) {
          if (f = ["version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues", "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs", "defaultWidthX", "nominalWidthX"][i], d = 1, 12 == i) f = ["Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale", "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", 0, 0, "LanguageGroup", "ExpansionFactor", "initialRandomSeed", "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", 0, 0, 0, 0, 0, 0, "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName"][h], d = 2;
        }
        null != f ? (o[f] = 1 == s.length ? s[0] : s, s = []) : s.push(u), t2 += d;
      }
      return o;
    }, e.cmap = {}, e.cmap.parse = function(r2, t2, a2) {
      r2 = new Uint8Array(r2.buffer, t2, a2), t2 = 0;
      var n = e._bin, o = {};
      n.readUshort(r2, t2), t2 += 2;
      var s = n.readUshort(r2, t2);
      t2 += 2;
      var i = [];
      o.tables = [];
      for (var h = 0; h < s; h++) {
        var d = n.readUshort(r2, t2);
        t2 += 2;
        var f = n.readUshort(r2, t2);
        t2 += 2;
        var u = n.readUint(r2, t2);
        t2 += 4;
        var l = "p" + d + "e" + f, v = i.indexOf(u);
        if (-1 == v) {
          var c;
          v = o.tables.length, i.push(u);
          var p = n.readUshort(r2, u);
          0 == p ? c = e.cmap.parse0(r2, u) : 4 == p ? c = e.cmap.parse4(r2, u) : 6 == p ? c = e.cmap.parse6(r2, u) : 12 == p ? c = e.cmap.parse12(r2, u) : console.debug("unknown format: " + p, d, f, u), o.tables.push(c);
        }
        if (null != o[l]) throw "multiple tables for one platform+encoding";
        o[l] = v;
      }
      return o;
    }, e.cmap.parse0 = function(r2, t2) {
      var a2 = e._bin, n = {};
      n.format = a2.readUshort(r2, t2), t2 += 2;
      var o = a2.readUshort(r2, t2);
      t2 += 2, a2.readUshort(r2, t2), t2 += 2, n.map = [];
      for (var s = 0; s < o - 6; s++) n.map.push(r2[t2 + s]);
      return n;
    }, e.cmap.parse4 = function(r2, t2) {
      var a2 = e._bin, n = t2, o = {};
      o.format = a2.readUshort(r2, t2), t2 += 2;
      var s = a2.readUshort(r2, t2);
      t2 += 2, a2.readUshort(r2, t2), t2 += 2;
      var i = a2.readUshort(r2, t2);
      t2 += 2;
      var h = i / 2;
      o.searchRange = a2.readUshort(r2, t2), t2 += 2, o.entrySelector = a2.readUshort(r2, t2), t2 += 2, o.rangeShift = a2.readUshort(r2, t2), t2 += 2, o.endCount = a2.readUshorts(r2, t2, h), t2 += 2 * h, t2 += 2, o.startCount = a2.readUshorts(r2, t2, h), t2 += 2 * h, o.idDelta = [];
      for (var d = 0; d < h; d++) o.idDelta.push(a2.readShort(r2, t2)), t2 += 2;
      for (o.idRangeOffset = a2.readUshorts(r2, t2, h), t2 += 2 * h, o.glyphIdArray = []; t2 < n + s; ) o.glyphIdArray.push(a2.readUshort(r2, t2)), t2 += 2;
      return o;
    }, e.cmap.parse6 = function(r2, t2) {
      var a2 = e._bin, n = {};
      n.format = a2.readUshort(r2, t2), t2 += 2, a2.readUshort(r2, t2), t2 += 2, a2.readUshort(r2, t2), t2 += 2, n.firstCode = a2.readUshort(r2, t2), t2 += 2;
      var o = a2.readUshort(r2, t2);
      t2 += 2, n.glyphIdArray = [];
      for (var s = 0; s < o; s++) n.glyphIdArray.push(a2.readUshort(r2, t2)), t2 += 2;
      return n;
    }, e.cmap.parse12 = function(r2, t2) {
      var a2 = e._bin, n = {};
      n.format = a2.readUshort(r2, t2), t2 += 2, t2 += 2, a2.readUint(r2, t2), t2 += 4, a2.readUint(r2, t2), t2 += 4;
      var o = a2.readUint(r2, t2);
      t2 += 4, n.groups = [];
      for (var s = 0; s < o; s++) {
        var i = t2 + 12 * s, h = a2.readUint(r2, i + 0), d = a2.readUint(r2, i + 4), f = a2.readUint(r2, i + 8);
        n.groups.push([h, d, f]);
      }
      return n;
    }, e.glyf = {}, e.glyf.parse = function(r2, e2, t2, a2) {
      for (var n = [], o = 0; o < a2.maxp.numGlyphs; o++) n.push(null);
      return n;
    }, e.glyf._parseGlyf = function(r2, t2) {
      var a2 = e._bin, n = r2._data, o = e._tabOffset(n, "glyf", r2._offset) + r2.loca[t2];
      if (r2.loca[t2] == r2.loca[t2 + 1]) return null;
      var s = {};
      if (s.noc = a2.readShort(n, o), o += 2, s.xMin = a2.readShort(n, o), o += 2, s.yMin = a2.readShort(n, o), o += 2, s.xMax = a2.readShort(n, o), o += 2, s.yMax = a2.readShort(n, o), o += 2, s.xMin >= s.xMax || s.yMin >= s.yMax) return null;
      if (s.noc > 0) {
        s.endPts = [];
        for (var i = 0; i < s.noc; i++) s.endPts.push(a2.readUshort(n, o)), o += 2;
        var h = a2.readUshort(n, o);
        if (o += 2, n.length - o < h) return null;
        s.instructions = a2.readBytes(n, o, h), o += h;
        var d = s.endPts[s.noc - 1] + 1;
        s.flags = [];
        for (i = 0; i < d; i++) {
          var f = n[o];
          if (o++, s.flags.push(f), 0 != (8 & f)) {
            var u = n[o];
            o++;
            for (var l = 0; l < u; l++) s.flags.push(f), i++;
          }
        }
        s.xs = [];
        for (i = 0; i < d; i++) {
          var v = 0 != (2 & s.flags[i]), c = 0 != (16 & s.flags[i]);
          v ? (s.xs.push(c ? n[o] : -n[o]), o++) : c ? s.xs.push(0) : (s.xs.push(a2.readShort(n, o)), o += 2);
        }
        s.ys = [];
        for (i = 0; i < d; i++) {
          v = 0 != (4 & s.flags[i]), c = 0 != (32 & s.flags[i]);
          v ? (s.ys.push(c ? n[o] : -n[o]), o++) : c ? s.ys.push(0) : (s.ys.push(a2.readShort(n, o)), o += 2);
        }
        var p = 0, U = 0;
        for (i = 0; i < d; i++) p += s.xs[i], U += s.ys[i], s.xs[i] = p, s.ys[i] = U;
      } else {
        var g;
        s.parts = [];
        do {
          g = a2.readUshort(n, o), o += 2;
          var S = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
          if (s.parts.push(S), S.glyphIndex = a2.readUshort(n, o), o += 2, 1 & g) {
            var m = a2.readShort(n, o);
            o += 2;
            var b = a2.readShort(n, o);
            o += 2;
          } else {
            m = a2.readInt8(n, o);
            o++;
            b = a2.readInt8(n, o);
            o++;
          }
          2 & g ? (S.m.tx = m, S.m.ty = b) : (S.p1 = m, S.p2 = b), 8 & g ? (S.m.a = S.m.d = a2.readF2dot14(n, o), o += 2) : 64 & g ? (S.m.a = a2.readF2dot14(n, o), o += 2, S.m.d = a2.readF2dot14(n, o), o += 2) : 128 & g && (S.m.a = a2.readF2dot14(n, o), o += 2, S.m.b = a2.readF2dot14(n, o), o += 2, S.m.c = a2.readF2dot14(n, o), o += 2, S.m.d = a2.readF2dot14(n, o), o += 2);
        } while (32 & g);
        if (256 & g) {
          var y = a2.readUshort(n, o);
          o += 2, s.instr = [];
          for (i = 0; i < y; i++) s.instr.push(n[o]), o++;
        }
      }
      return s;
    }, e.GDEF = {}, e.GDEF.parse = function(r2, t2, a2, n) {
      var o = t2;
      t2 += 4;
      var s = e._bin.readUshort(r2, t2);
      return { glyphClassDef: 0 === s ? null : e._lctf.readClassDef(r2, o + s) };
    }, e.GPOS = {}, e.GPOS.parse = function(r2, t2, a2, n) {
      return e._lctf.parse(r2, t2, a2, n, e.GPOS.subt);
    }, e.GPOS.subt = function(r2, t2, a2, n) {
      var o = e._bin, s = a2, i = {};
      if (i.fmt = o.readUshort(r2, a2), a2 += 2, 1 == t2 || 2 == t2 || 3 == t2 || 7 == t2 || 8 == t2 && i.fmt <= 2) {
        var h = o.readUshort(r2, a2);
        a2 += 2, i.coverage = e._lctf.readCoverage(r2, h + s);
      }
      if (1 == t2 && 1 == i.fmt) {
        var d = o.readUshort(r2, a2);
        a2 += 2, 0 != d && (i.pos = e.GPOS.readValueRecord(r2, a2, d));
      } else if (2 == t2 && i.fmt >= 1 && i.fmt <= 2) {
        d = o.readUshort(r2, a2);
        a2 += 2;
        var f = o.readUshort(r2, a2);
        a2 += 2;
        var u = e._lctf.numOfOnes(d), l = e._lctf.numOfOnes(f);
        if (1 == i.fmt) {
          i.pairsets = [];
          var v = o.readUshort(r2, a2);
          a2 += 2;
          for (var c = 0; c < v; c++) {
            var p = s + o.readUshort(r2, a2);
            a2 += 2;
            var U = o.readUshort(r2, p);
            p += 2;
            for (var g = [], S = 0; S < U; S++) {
              var m = o.readUshort(r2, p);
              p += 2, 0 != d && (P = e.GPOS.readValueRecord(r2, p, d), p += 2 * u), 0 != f && (x = e.GPOS.readValueRecord(r2, p, f), p += 2 * l), g.push({ gid2: m, val1: P, val2: x });
            }
            i.pairsets.push(g);
          }
        }
        if (2 == i.fmt) {
          var b = o.readUshort(r2, a2);
          a2 += 2;
          var y = o.readUshort(r2, a2);
          a2 += 2;
          var F = o.readUshort(r2, a2);
          a2 += 2;
          var C = o.readUshort(r2, a2);
          a2 += 2, i.classDef1 = e._lctf.readClassDef(r2, s + b), i.classDef2 = e._lctf.readClassDef(r2, s + y), i.matrix = [];
          for (c = 0; c < F; c++) {
            var _ = [];
            for (S = 0; S < C; S++) {
              var P = null, x = null;
              0 != d && (P = e.GPOS.readValueRecord(r2, a2, d), a2 += 2 * u), 0 != f && (x = e.GPOS.readValueRecord(r2, a2, f), a2 += 2 * l), _.push({ val1: P, val2: x });
            }
            i.matrix.push(_);
          }
        }
      } else if (4 == t2 && 1 == i.fmt) i.markCoverage = e._lctf.readCoverage(r2, o.readUshort(r2, a2) + s), i.baseCoverage = e._lctf.readCoverage(r2, o.readUshort(r2, a2 + 2) + s), i.markClassCount = o.readUshort(r2, a2 + 4), i.markArray = e.GPOS.readMarkArray(r2, o.readUshort(r2, a2 + 6) + s), i.baseArray = e.GPOS.readBaseArray(r2, o.readUshort(r2, a2 + 8) + s, i.markClassCount);
      else if (6 == t2 && 1 == i.fmt) i.mark1Coverage = e._lctf.readCoverage(r2, o.readUshort(r2, a2) + s), i.mark2Coverage = e._lctf.readCoverage(r2, o.readUshort(r2, a2 + 2) + s), i.markClassCount = o.readUshort(r2, a2 + 4), i.mark1Array = e.GPOS.readMarkArray(r2, o.readUshort(r2, a2 + 6) + s), i.mark2Array = e.GPOS.readBaseArray(r2, o.readUshort(r2, a2 + 8) + s, i.markClassCount);
      else {
        if (9 == t2 && 1 == i.fmt) {
          var I = o.readUshort(r2, a2);
          a2 += 2;
          var w = o.readUint(r2, a2);
          if (a2 += 4, 9 == n.ltype) n.ltype = I;
          else if (n.ltype != I) throw "invalid extension substitution";
          return e.GPOS.subt(r2, n.ltype, s + w);
        }
        console.debug("unsupported GPOS table LookupType", t2, "format", i.fmt);
      }
      return i;
    }, e.GPOS.readValueRecord = function(r2, t2, a2) {
      var n = e._bin, o = [];
      return o.push(1 & a2 ? n.readShort(r2, t2) : 0), t2 += 1 & a2 ? 2 : 0, o.push(2 & a2 ? n.readShort(r2, t2) : 0), t2 += 2 & a2 ? 2 : 0, o.push(4 & a2 ? n.readShort(r2, t2) : 0), t2 += 4 & a2 ? 2 : 0, o.push(8 & a2 ? n.readShort(r2, t2) : 0), t2 += 8 & a2 ? 2 : 0, o;
    }, e.GPOS.readBaseArray = function(r2, t2, a2) {
      var n = e._bin, o = [], s = t2, i = n.readUshort(r2, t2);
      t2 += 2;
      for (var h = 0; h < i; h++) {
        for (var d = [], f = 0; f < a2; f++) d.push(e.GPOS.readAnchorRecord(r2, s + n.readUshort(r2, t2))), t2 += 2;
        o.push(d);
      }
      return o;
    }, e.GPOS.readMarkArray = function(r2, t2) {
      var a2 = e._bin, n = [], o = t2, s = a2.readUshort(r2, t2);
      t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = e.GPOS.readAnchorRecord(r2, a2.readUshort(r2, t2 + 2) + o);
        h.markClass = a2.readUshort(r2, t2), n.push(h), t2 += 4;
      }
      return n;
    }, e.GPOS.readAnchorRecord = function(r2, t2) {
      var a2 = e._bin, n = {};
      return n.fmt = a2.readUshort(r2, t2), n.x = a2.readShort(r2, t2 + 2), n.y = a2.readShort(r2, t2 + 4), n;
    }, e.GSUB = {}, e.GSUB.parse = function(r2, t2, a2, n) {
      return e._lctf.parse(r2, t2, a2, n, e.GSUB.subt);
    }, e.GSUB.subt = function(r2, t2, a2, n) {
      var o = e._bin, s = a2, i = {};
      if (i.fmt = o.readUshort(r2, a2), a2 += 2, 1 != t2 && 2 != t2 && 4 != t2 && 5 != t2 && 6 != t2) return null;
      if (1 == t2 || 2 == t2 || 4 == t2 || 5 == t2 && i.fmt <= 2 || 6 == t2 && i.fmt <= 2) {
        var h = o.readUshort(r2, a2);
        a2 += 2, i.coverage = e._lctf.readCoverage(r2, s + h);
      }
      if (1 == t2 && i.fmt >= 1 && i.fmt <= 2) {
        if (1 == i.fmt) i.delta = o.readShort(r2, a2), a2 += 2;
        else if (2 == i.fmt) {
          var d = o.readUshort(r2, a2);
          a2 += 2, i.newg = o.readUshorts(r2, a2, d), a2 += 2 * i.newg.length;
        }
      } else if (2 == t2 && 1 == i.fmt) {
        d = o.readUshort(r2, a2);
        a2 += 2, i.seqs = [];
        for (var f = 0; f < d; f++) {
          var u = o.readUshort(r2, a2) + s;
          a2 += 2;
          var l = o.readUshort(r2, u);
          i.seqs.push(o.readUshorts(r2, u + 2, l));
        }
      } else if (4 == t2) {
        i.vals = [];
        d = o.readUshort(r2, a2);
        a2 += 2;
        for (f = 0; f < d; f++) {
          var v = o.readUshort(r2, a2);
          a2 += 2, i.vals.push(e.GSUB.readLigatureSet(r2, s + v));
        }
      } else if (5 == t2 && 2 == i.fmt) {
        if (2 == i.fmt) {
          var c = o.readUshort(r2, a2);
          a2 += 2, i.cDef = e._lctf.readClassDef(r2, s + c), i.scset = [];
          var p = o.readUshort(r2, a2);
          a2 += 2;
          for (f = 0; f < p; f++) {
            var U = o.readUshort(r2, a2);
            a2 += 2, i.scset.push(0 == U ? null : e.GSUB.readSubClassSet(r2, s + U));
          }
        }
      } else if (6 == t2 && 3 == i.fmt) {
        if (3 == i.fmt) {
          for (f = 0; f < 3; f++) {
            d = o.readUshort(r2, a2);
            a2 += 2;
            for (var g = [], S = 0; S < d; S++) g.push(e._lctf.readCoverage(r2, s + o.readUshort(r2, a2 + 2 * S)));
            a2 += 2 * d, 0 == f && (i.backCvg = g), 1 == f && (i.inptCvg = g), 2 == f && (i.ahedCvg = g);
          }
          d = o.readUshort(r2, a2);
          a2 += 2, i.lookupRec = e.GSUB.readSubstLookupRecords(r2, a2, d);
        }
      } else {
        if (7 == t2 && 1 == i.fmt) {
          var m = o.readUshort(r2, a2);
          a2 += 2;
          var b = o.readUint(r2, a2);
          if (a2 += 4, 9 == n.ltype) n.ltype = m;
          else if (n.ltype != m) throw "invalid extension substitution";
          return e.GSUB.subt(r2, n.ltype, s + b);
        }
        console.debug("unsupported GSUB table LookupType", t2, "format", i.fmt);
      }
      return i;
    }, e.GSUB.readSubClassSet = function(r2, t2) {
      var a2 = e._bin.readUshort, n = t2, o = [], s = a2(r2, t2);
      t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = a2(r2, t2);
        t2 += 2, o.push(e.GSUB.readSubClassRule(r2, n + h));
      }
      return o;
    }, e.GSUB.readSubClassRule = function(r2, t2) {
      var a2 = e._bin.readUshort, n = {}, o = a2(r2, t2), s = a2(r2, t2 += 2);
      t2 += 2, n.input = [];
      for (var i = 0; i < o - 1; i++) n.input.push(a2(r2, t2)), t2 += 2;
      return n.substLookupRecords = e.GSUB.readSubstLookupRecords(r2, t2, s), n;
    }, e.GSUB.readSubstLookupRecords = function(r2, t2, a2) {
      for (var n = e._bin.readUshort, o = [], s = 0; s < a2; s++) o.push(n(r2, t2), n(r2, t2 + 2)), t2 += 4;
      return o;
    }, e.GSUB.readChainSubClassSet = function(r2, t2) {
      var a2 = e._bin, n = t2, o = [], s = a2.readUshort(r2, t2);
      t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = a2.readUshort(r2, t2);
        t2 += 2, o.push(e.GSUB.readChainSubClassRule(r2, n + h));
      }
      return o;
    }, e.GSUB.readChainSubClassRule = function(r2, t2) {
      for (var a2 = e._bin, n = {}, o = ["backtrack", "input", "lookahead"], s = 0; s < o.length; s++) {
        var i = a2.readUshort(r2, t2);
        t2 += 2, 1 == s && i--, n[o[s]] = a2.readUshorts(r2, t2, i), t2 += 2 * n[o[s]].length;
      }
      i = a2.readUshort(r2, t2);
      return t2 += 2, n.subst = a2.readUshorts(r2, t2, 2 * i), t2 += 2 * n.subst.length, n;
    }, e.GSUB.readLigatureSet = function(r2, t2) {
      var a2 = e._bin, n = t2, o = [], s = a2.readUshort(r2, t2);
      t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = a2.readUshort(r2, t2);
        t2 += 2, o.push(e.GSUB.readLigature(r2, n + h));
      }
      return o;
    }, e.GSUB.readLigature = function(r2, t2) {
      var a2 = e._bin, n = { chain: [] };
      n.nglyph = a2.readUshort(r2, t2), t2 += 2;
      var o = a2.readUshort(r2, t2);
      t2 += 2;
      for (var s = 0; s < o - 1; s++) n.chain.push(a2.readUshort(r2, t2)), t2 += 2;
      return n;
    }, e.head = {}, e.head.parse = function(r2, t2, a2) {
      var n = e._bin, o = {};
      return n.readFixed(r2, t2), t2 += 4, o.fontRevision = n.readFixed(r2, t2), t2 += 4, n.readUint(r2, t2), t2 += 4, n.readUint(r2, t2), t2 += 4, o.flags = n.readUshort(r2, t2), t2 += 2, o.unitsPerEm = n.readUshort(r2, t2), t2 += 2, o.created = n.readUint64(r2, t2), t2 += 8, o.modified = n.readUint64(r2, t2), t2 += 8, o.xMin = n.readShort(r2, t2), t2 += 2, o.yMin = n.readShort(r2, t2), t2 += 2, o.xMax = n.readShort(r2, t2), t2 += 2, o.yMax = n.readShort(r2, t2), t2 += 2, o.macStyle = n.readUshort(r2, t2), t2 += 2, o.lowestRecPPEM = n.readUshort(r2, t2), t2 += 2, o.fontDirectionHint = n.readShort(r2, t2), t2 += 2, o.indexToLocFormat = n.readShort(r2, t2), t2 += 2, o.glyphDataFormat = n.readShort(r2, t2), t2 += 2, o;
    }, e.hhea = {}, e.hhea.parse = function(r2, t2, a2) {
      var n = e._bin, o = {};
      return n.readFixed(r2, t2), t2 += 4, o.ascender = n.readShort(r2, t2), t2 += 2, o.descender = n.readShort(r2, t2), t2 += 2, o.lineGap = n.readShort(r2, t2), t2 += 2, o.advanceWidthMax = n.readUshort(r2, t2), t2 += 2, o.minLeftSideBearing = n.readShort(r2, t2), t2 += 2, o.minRightSideBearing = n.readShort(r2, t2), t2 += 2, o.xMaxExtent = n.readShort(r2, t2), t2 += 2, o.caretSlopeRise = n.readShort(r2, t2), t2 += 2, o.caretSlopeRun = n.readShort(r2, t2), t2 += 2, o.caretOffset = n.readShort(r2, t2), t2 += 2, t2 += 8, o.metricDataFormat = n.readShort(r2, t2), t2 += 2, o.numberOfHMetrics = n.readUshort(r2, t2), t2 += 2, o;
    }, e.hmtx = {}, e.hmtx.parse = function(r2, t2, a2, n) {
      for (var o = e._bin, s = { aWidth: [], lsBearing: [] }, i = 0, h = 0, d = 0; d < n.maxp.numGlyphs; d++) d < n.hhea.numberOfHMetrics && (i = o.readUshort(r2, t2), t2 += 2, h = o.readShort(r2, t2), t2 += 2), s.aWidth.push(i), s.lsBearing.push(h);
      return s;
    }, e.kern = {}, e.kern.parse = function(r2, t2, a2, n) {
      var o = e._bin, s = o.readUshort(r2, t2);
      if (t2 += 2, 1 == s) return e.kern.parseV1(r2, t2 - 2, a2, n);
      var i = o.readUshort(r2, t2);
      t2 += 2;
      for (var h = { glyph1: [], rval: [] }, d = 0; d < i; d++) {
        t2 += 2;
        a2 = o.readUshort(r2, t2);
        t2 += 2;
        var f = o.readUshort(r2, t2);
        t2 += 2;
        var u = f >>> 8;
        if (0 != (u &= 15)) throw "unknown kern table format: " + u;
        t2 = e.kern.readFormat0(r2, t2, h);
      }
      return h;
    }, e.kern.parseV1 = function(r2, t2, a2, n) {
      var o = e._bin;
      o.readFixed(r2, t2), t2 += 4;
      var s = o.readUint(r2, t2);
      t2 += 4;
      for (var i = { glyph1: [], rval: [] }, h = 0; h < s; h++) {
        o.readUint(r2, t2), t2 += 4;
        var d = o.readUshort(r2, t2);
        t2 += 2, o.readUshort(r2, t2), t2 += 2;
        var f = d >>> 8;
        if (0 != (f &= 15)) throw "unknown kern table format: " + f;
        t2 = e.kern.readFormat0(r2, t2, i);
      }
      return i;
    }, e.kern.readFormat0 = function(r2, t2, a2) {
      var n = e._bin, o = -1, s = n.readUshort(r2, t2);
      t2 += 2, n.readUshort(r2, t2), t2 += 2, n.readUshort(r2, t2), t2 += 2, n.readUshort(r2, t2), t2 += 2;
      for (var i = 0; i < s; i++) {
        var h = n.readUshort(r2, t2);
        t2 += 2;
        var d = n.readUshort(r2, t2);
        t2 += 2;
        var f = n.readShort(r2, t2);
        t2 += 2, h != o && (a2.glyph1.push(h), a2.rval.push({ glyph2: [], vals: [] }));
        var u = a2.rval[a2.rval.length - 1];
        u.glyph2.push(d), u.vals.push(f), o = h;
      }
      return t2;
    }, e.loca = {}, e.loca.parse = function(r2, t2, a2, n) {
      var o = e._bin, s = [], i = n.head.indexToLocFormat, h = n.maxp.numGlyphs + 1;
      if (0 == i) for (var d = 0; d < h; d++) s.push(o.readUshort(r2, t2 + (d << 1)) << 1);
      if (1 == i) for (d = 0; d < h; d++) s.push(o.readUint(r2, t2 + (d << 2)));
      return s;
    }, e.maxp = {}, e.maxp.parse = function(r2, t2, a2) {
      var n = e._bin, o = {}, s = n.readUint(r2, t2);
      return t2 += 4, o.numGlyphs = n.readUshort(r2, t2), t2 += 2, 65536 == s && (o.maxPoints = n.readUshort(r2, t2), t2 += 2, o.maxContours = n.readUshort(r2, t2), t2 += 2, o.maxCompositePoints = n.readUshort(r2, t2), t2 += 2, o.maxCompositeContours = n.readUshort(r2, t2), t2 += 2, o.maxZones = n.readUshort(r2, t2), t2 += 2, o.maxTwilightPoints = n.readUshort(r2, t2), t2 += 2, o.maxStorage = n.readUshort(r2, t2), t2 += 2, o.maxFunctionDefs = n.readUshort(r2, t2), t2 += 2, o.maxInstructionDefs = n.readUshort(r2, t2), t2 += 2, o.maxStackElements = n.readUshort(r2, t2), t2 += 2, o.maxSizeOfInstructions = n.readUshort(r2, t2), t2 += 2, o.maxComponentElements = n.readUshort(r2, t2), t2 += 2, o.maxComponentDepth = n.readUshort(r2, t2), t2 += 2), o;
    }, e.name = {}, e.name.parse = function(r2, t2, a2) {
      var n = e._bin, o = {};
      n.readUshort(r2, t2), t2 += 2;
      var s = n.readUshort(r2, t2);
      t2 += 2, n.readUshort(r2, t2);
      for (var i, h = ["copyright", "fontFamily", "fontSubfamily", "ID", "fullName", "version", "postScriptName", "trademark", "manufacturer", "designer", "description", "urlVendor", "urlDesigner", "licence", "licenceURL", "---", "typoFamilyName", "typoSubfamilyName", "compatibleFull", "sampleText", "postScriptCID", "wwsFamilyName", "wwsSubfamilyName", "lightPalette", "darkPalette"], d = t2 += 2, f = 0; f < s; f++) {
        var u = n.readUshort(r2, t2);
        t2 += 2;
        var l = n.readUshort(r2, t2);
        t2 += 2;
        var v = n.readUshort(r2, t2);
        t2 += 2;
        var c = n.readUshort(r2, t2);
        t2 += 2;
        var p = n.readUshort(r2, t2);
        t2 += 2;
        var U = n.readUshort(r2, t2);
        t2 += 2;
        var g, S = h[c], m = d + 12 * s + U;
        if (0 == u) g = n.readUnicode(r2, m, p / 2);
        else if (3 == u && 0 == l) g = n.readUnicode(r2, m, p / 2);
        else if (0 == l) g = n.readASCII(r2, m, p);
        else if (1 == l) g = n.readUnicode(r2, m, p / 2);
        else if (3 == l) g = n.readUnicode(r2, m, p / 2);
        else {
          if (1 != u) throw "unknown encoding " + l + ", platformID: " + u;
          g = n.readASCII(r2, m, p), console.debug("reading unknown MAC encoding " + l + " as ASCII");
        }
        var b = "p" + u + "," + v.toString(16);
        null == o[b] && (o[b] = {}), o[b][void 0 !== S ? S : c] = g, o[b]._lang = v;
      }
      for (var y in o) if (null != o[y].postScriptName && 1033 == o[y]._lang) return o[y];
      for (var y in o) if (null != o[y].postScriptName && 0 == o[y]._lang) return o[y];
      for (var y in o) if (null != o[y].postScriptName && 3084 == o[y]._lang) return o[y];
      for (var y in o) if (null != o[y].postScriptName) return o[y];
      for (var y in o) {
        i = y;
        break;
      }
      return console.debug("returning name table with languageID " + o[i]._lang), o[i];
    }, e["OS/2"] = {}, e["OS/2"].parse = function(r2, t2, a2) {
      var n = e._bin.readUshort(r2, t2);
      t2 += 2;
      var o = {};
      if (0 == n) e["OS/2"].version0(r2, t2, o);
      else if (1 == n) e["OS/2"].version1(r2, t2, o);
      else if (2 == n || 3 == n || 4 == n) e["OS/2"].version2(r2, t2, o);
      else {
        if (5 != n) throw "unknown OS/2 table version: " + n;
        e["OS/2"].version5(r2, t2, o);
      }
      return o;
    }, e["OS/2"].version0 = function(r2, t2, a2) {
      var n = e._bin;
      return a2.xAvgCharWidth = n.readShort(r2, t2), t2 += 2, a2.usWeightClass = n.readUshort(r2, t2), t2 += 2, a2.usWidthClass = n.readUshort(r2, t2), t2 += 2, a2.fsType = n.readUshort(r2, t2), t2 += 2, a2.ySubscriptXSize = n.readShort(r2, t2), t2 += 2, a2.ySubscriptYSize = n.readShort(r2, t2), t2 += 2, a2.ySubscriptXOffset = n.readShort(r2, t2), t2 += 2, a2.ySubscriptYOffset = n.readShort(r2, t2), t2 += 2, a2.ySuperscriptXSize = n.readShort(r2, t2), t2 += 2, a2.ySuperscriptYSize = n.readShort(r2, t2), t2 += 2, a2.ySuperscriptXOffset = n.readShort(r2, t2), t2 += 2, a2.ySuperscriptYOffset = n.readShort(r2, t2), t2 += 2, a2.yStrikeoutSize = n.readShort(r2, t2), t2 += 2, a2.yStrikeoutPosition = n.readShort(r2, t2), t2 += 2, a2.sFamilyClass = n.readShort(r2, t2), t2 += 2, a2.panose = n.readBytes(r2, t2, 10), t2 += 10, a2.ulUnicodeRange1 = n.readUint(r2, t2), t2 += 4, a2.ulUnicodeRange2 = n.readUint(r2, t2), t2 += 4, a2.ulUnicodeRange3 = n.readUint(r2, t2), t2 += 4, a2.ulUnicodeRange4 = n.readUint(r2, t2), t2 += 4, a2.achVendID = [n.readInt8(r2, t2), n.readInt8(r2, t2 + 1), n.readInt8(r2, t2 + 2), n.readInt8(r2, t2 + 3)], t2 += 4, a2.fsSelection = n.readUshort(r2, t2), t2 += 2, a2.usFirstCharIndex = n.readUshort(r2, t2), t2 += 2, a2.usLastCharIndex = n.readUshort(r2, t2), t2 += 2, a2.sTypoAscender = n.readShort(r2, t2), t2 += 2, a2.sTypoDescender = n.readShort(r2, t2), t2 += 2, a2.sTypoLineGap = n.readShort(r2, t2), t2 += 2, a2.usWinAscent = n.readUshort(r2, t2), t2 += 2, a2.usWinDescent = n.readUshort(r2, t2), t2 += 2;
    }, e["OS/2"].version1 = function(r2, t2, a2) {
      var n = e._bin;
      return t2 = e["OS/2"].version0(r2, t2, a2), a2.ulCodePageRange1 = n.readUint(r2, t2), t2 += 4, a2.ulCodePageRange2 = n.readUint(r2, t2), t2 += 4;
    }, e["OS/2"].version2 = function(r2, t2, a2) {
      var n = e._bin;
      return t2 = e["OS/2"].version1(r2, t2, a2), a2.sxHeight = n.readShort(r2, t2), t2 += 2, a2.sCapHeight = n.readShort(r2, t2), t2 += 2, a2.usDefault = n.readUshort(r2, t2), t2 += 2, a2.usBreak = n.readUshort(r2, t2), t2 += 2, a2.usMaxContext = n.readUshort(r2, t2), t2 += 2;
    }, e["OS/2"].version5 = function(r2, t2, a2) {
      var n = e._bin;
      return t2 = e["OS/2"].version2(r2, t2, a2), a2.usLowerOpticalPointSize = n.readUshort(r2, t2), t2 += 2, a2.usUpperOpticalPointSize = n.readUshort(r2, t2), t2 += 2;
    }, e.post = {}, e.post.parse = function(r2, t2, a2) {
      var n = e._bin, o = {};
      return o.version = n.readFixed(r2, t2), t2 += 4, o.italicAngle = n.readFixed(r2, t2), t2 += 4, o.underlinePosition = n.readShort(r2, t2), t2 += 2, o.underlineThickness = n.readShort(r2, t2), t2 += 2, o;
    }, null == e && (e = {}), null == e.U && (e.U = {}), e.U.codeToGlyph = function(r2, e2) {
      var t2 = r2.cmap, a2 = -1;
      if (null != t2.p0e4 ? a2 = t2.p0e4 : null != t2.p3e1 ? a2 = t2.p3e1 : null != t2.p1e0 ? a2 = t2.p1e0 : null != t2.p0e3 && (a2 = t2.p0e3), -1 == a2) throw "no familiar platform and encoding!";
      var n = t2.tables[a2];
      if (0 == n.format) return e2 >= n.map.length ? 0 : n.map[e2];
      if (4 == n.format) {
        for (var o = -1, s = 0; s < n.endCount.length; s++) if (e2 <= n.endCount[s]) {
          o = s;
          break;
        }
        if (-1 == o) return 0;
        if (n.startCount[o] > e2) return 0;
        return 65535 & (0 != n.idRangeOffset[o] ? n.glyphIdArray[e2 - n.startCount[o] + (n.idRangeOffset[o] >> 1) - (n.idRangeOffset.length - o)] : e2 + n.idDelta[o]);
      }
      if (12 == n.format) {
        if (e2 > n.groups[n.groups.length - 1][1]) return 0;
        for (s = 0; s < n.groups.length; s++) {
          var i = n.groups[s];
          if (i[0] <= e2 && e2 <= i[1]) return i[2] + (e2 - i[0]);
        }
        return 0;
      }
      throw "unknown cmap table format " + n.format;
    }, e.U.glyphToPath = function(r2, t2) {
      var a2 = { cmds: [], crds: [] };
      if (r2.SVG && r2.SVG.entries[t2]) {
        var n = r2.SVG.entries[t2];
        return null == n ? a2 : ("string" == typeof n && (n = e.SVG.toPath(n), r2.SVG.entries[t2] = n), n);
      }
      if (r2.CFF) {
        var o = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: false, width: r2.CFF.Private ? r2.CFF.Private.defaultWidthX : 0, open: false }, s = r2.CFF, i = r2.CFF.Private;
        if (s.ROS) {
          for (var h = 0; s.FDSelect[h + 2] <= t2; ) h += 2;
          i = s.FDArray[s.FDSelect[h + 1]].Private;
        }
        e.U._drawCFF(r2.CFF.CharStrings[t2], o, s, i, a2);
      } else r2.glyf && e.U._drawGlyf(t2, r2, a2);
      return a2;
    }, e.U._drawGlyf = function(r2, t2, a2) {
      var n = t2.glyf[r2];
      null == n && (n = t2.glyf[r2] = e.glyf._parseGlyf(t2, r2)), null != n && (n.noc > -1 ? e.U._simpleGlyph(n, a2) : e.U._compoGlyph(n, t2, a2));
    }, e.U._simpleGlyph = function(r2, t2) {
      for (var a2 = 0; a2 < r2.noc; a2++) {
        for (var n = 0 == a2 ? 0 : r2.endPts[a2 - 1] + 1, o = r2.endPts[a2], s = n; s <= o; s++) {
          var i = s == n ? o : s - 1, h = s == o ? n : s + 1, d = 1 & r2.flags[s], f = 1 & r2.flags[i], u = 1 & r2.flags[h], l = r2.xs[s], v = r2.ys[s];
          if (s == n) if (d) {
            if (!f) {
              e.U.P.moveTo(t2, l, v);
              continue;
            }
            e.U.P.moveTo(t2, r2.xs[i], r2.ys[i]);
          } else f ? e.U.P.moveTo(t2, r2.xs[i], r2.ys[i]) : e.U.P.moveTo(t2, (r2.xs[i] + l) / 2, (r2.ys[i] + v) / 2);
          d ? f && e.U.P.lineTo(t2, l, v) : u ? e.U.P.qcurveTo(t2, l, v, r2.xs[h], r2.ys[h]) : e.U.P.qcurveTo(t2, l, v, (l + r2.xs[h]) / 2, (v + r2.ys[h]) / 2);
        }
        e.U.P.closePath(t2);
      }
    }, e.U._compoGlyph = function(r2, t2, a2) {
      for (var n = 0; n < r2.parts.length; n++) {
        var o = { cmds: [], crds: [] }, s = r2.parts[n];
        e.U._drawGlyf(s.glyphIndex, t2, o);
        for (var i = s.m, h = 0; h < o.crds.length; h += 2) {
          var d = o.crds[h], f = o.crds[h + 1];
          a2.crds.push(d * i.a + f * i.b + i.tx), a2.crds.push(d * i.c + f * i.d + i.ty);
        }
        for (h = 0; h < o.cmds.length; h++) a2.cmds.push(o.cmds[h]);
      }
    }, e.U._getGlyphClass = function(r2, t2) {
      var a2 = e._lctf.getInterval(t2, r2);
      return -1 == a2 ? 0 : t2[a2 + 2];
    }, e.U._applySubs = function(r2, t2, a2, n) {
      for (var o = r2.length - t2 - 1, s = 0; s < a2.tabs.length; s++) if (null != a2.tabs[s]) {
        var i, h = a2.tabs[s];
        if (!h.coverage || -1 != (i = e._lctf.coverageIndex(h.coverage, r2[t2]))) {
          if (1 == a2.ltype) r2[t2], 1 == h.fmt ? r2[t2] = r2[t2] + h.delta : r2[t2] = h.newg[i];
          else if (4 == a2.ltype) for (var d = h.vals[i], f = 0; f < d.length; f++) {
            var u = d[f], l = u.chain.length;
            if (!(l > o)) {
              for (var v = true, c = 0, p = 0; p < l; p++) {
                for (; -1 == r2[t2 + c + (1 + p)]; ) c++;
                u.chain[p] != r2[t2 + c + (1 + p)] && (v = false);
              }
              if (v) {
                r2[t2] = u.nglyph;
                for (p = 0; p < l + c; p++) r2[t2 + p + 1] = -1;
                break;
              }
            }
          }
          else if (5 == a2.ltype && 2 == h.fmt) for (var U = e._lctf.getInterval(h.cDef, r2[t2]), g = h.cDef[U + 2], S = h.scset[g], m = 0; m < S.length; m++) {
            var b = S[m], y = b.input;
            if (!(y.length > o)) {
              for (v = true, p = 0; p < y.length; p++) {
                var F = e._lctf.getInterval(h.cDef, r2[t2 + 1 + p]);
                if (-1 == U && h.cDef[F + 2] != y[p]) {
                  v = false;
                  break;
                }
              }
              if (v) {
                var C = b.substLookupRecords;
                for (f = 0; f < C.length; f += 2) C[f], C[f + 1];
              }
            }
          }
          else if (6 == a2.ltype && 3 == h.fmt) {
            if (!e.U._glsCovered(r2, h.backCvg, t2 - h.backCvg.length)) continue;
            if (!e.U._glsCovered(r2, h.inptCvg, t2)) continue;
            if (!e.U._glsCovered(r2, h.ahedCvg, t2 + h.inptCvg.length)) continue;
            var _ = h.lookupRec;
            for (m = 0; m < _.length; m += 2) {
              U = _[m];
              var P = n[_[m + 1]];
              e.U._applySubs(r2, t2 + U, P, n);
            }
          }
        }
      }
    }, e.U._glsCovered = function(r2, t2, a2) {
      for (var n = 0; n < t2.length; n++) {
        if (-1 == e._lctf.coverageIndex(t2[n], r2[a2 + n])) return false;
      }
      return true;
    }, e.U.glyphsToPath = function(r2, t2, a2) {
      for (var n = { cmds: [], crds: [] }, o = 0, s = 0; s < t2.length; s++) {
        var i = t2[s];
        if (-1 != i) {
          for (var h = s < t2.length - 1 && -1 != t2[s + 1] ? t2[s + 1] : 0, d = e.U.glyphToPath(r2, i), f = 0; f < d.crds.length; f += 2) n.crds.push(d.crds[f] + o), n.crds.push(d.crds[f + 1]);
          a2 && n.cmds.push(a2);
          for (f = 0; f < d.cmds.length; f++) n.cmds.push(d.cmds[f]);
          a2 && n.cmds.push("X"), o += r2.hmtx.aWidth[i], s < t2.length - 1 && (o += e.U.getPairAdjustment(r2, i, h));
        }
      }
      return n;
    }, e.U.P = {}, e.U.P.moveTo = function(r2, e2, t2) {
      r2.cmds.push("M"), r2.crds.push(e2, t2);
    }, e.U.P.lineTo = function(r2, e2, t2) {
      r2.cmds.push("L"), r2.crds.push(e2, t2);
    }, e.U.P.curveTo = function(r2, e2, t2, a2, n, o, s) {
      r2.cmds.push("C"), r2.crds.push(e2, t2, a2, n, o, s);
    }, e.U.P.qcurveTo = function(r2, e2, t2, a2, n) {
      r2.cmds.push("Q"), r2.crds.push(e2, t2, a2, n);
    }, e.U.P.closePath = function(r2) {
      r2.cmds.push("Z");
    }, e.U._drawCFF = function(r2, t2, a2, n, o) {
      for (var s = t2.stack, i = t2.nStems, h = t2.haveWidth, d = t2.width, f = t2.open, u = 0, l = t2.x, v = t2.y, c = 0, p = 0, U = 0, g = 0, S = 0, m = 0, b = 0, y = 0, F = 0, C = 0, _ = { val: 0, size: 0 }; u < r2.length; ) {
        e.CFF.getCharString(r2, u, _);
        var P = _.val;
        if (u += _.size, "o1" == P || "o18" == P) s.length % 2 != 0 && !h && (d = s.shift() + n.nominalWidthX), i += s.length >> 1, s.length = 0, h = true;
        else if ("o3" == P || "o23" == P) {
          s.length % 2 != 0 && !h && (d = s.shift() + n.nominalWidthX), i += s.length >> 1, s.length = 0, h = true;
        } else if ("o4" == P) s.length > 1 && !h && (d = s.shift() + n.nominalWidthX, h = true), f && e.U.P.closePath(o), v += s.pop(), e.U.P.moveTo(o, l, v), f = true;
        else if ("o5" == P) for (; s.length > 0; ) l += s.shift(), v += s.shift(), e.U.P.lineTo(o, l, v);
        else if ("o6" == P || "o7" == P) for (var x = s.length, I = "o6" == P, w = 0; w < x; w++) {
          var k = s.shift();
          I ? l += k : v += k, I = !I, e.U.P.lineTo(o, l, v);
        }
        else if ("o8" == P || "o24" == P) {
          x = s.length;
          for (var G = 0; G + 6 <= x; ) c = l + s.shift(), p = v + s.shift(), U = c + s.shift(), g = p + s.shift(), l = U + s.shift(), v = g + s.shift(), e.U.P.curveTo(o, c, p, U, g, l, v), G += 6;
          "o24" == P && (l += s.shift(), v += s.shift(), e.U.P.lineTo(o, l, v));
        } else {
          if ("o11" == P) break;
          if ("o1234" == P || "o1235" == P || "o1236" == P || "o1237" == P) "o1234" == P && (p = v, U = (c = l + s.shift()) + s.shift(), C = g = p + s.shift(), m = g, y = v, l = (b = (S = (F = U + s.shift()) + s.shift()) + s.shift()) + s.shift(), e.U.P.curveTo(o, c, p, U, g, F, C), e.U.P.curveTo(o, S, m, b, y, l, v)), "o1235" == P && (c = l + s.shift(), p = v + s.shift(), U = c + s.shift(), g = p + s.shift(), F = U + s.shift(), C = g + s.shift(), S = F + s.shift(), m = C + s.shift(), b = S + s.shift(), y = m + s.shift(), l = b + s.shift(), v = y + s.shift(), s.shift(), e.U.P.curveTo(o, c, p, U, g, F, C), e.U.P.curveTo(o, S, m, b, y, l, v)), "o1236" == P && (c = l + s.shift(), p = v + s.shift(), U = c + s.shift(), C = g = p + s.shift(), m = g, b = (S = (F = U + s.shift()) + s.shift()) + s.shift(), y = m + s.shift(), l = b + s.shift(), e.U.P.curveTo(o, c, p, U, g, F, C), e.U.P.curveTo(o, S, m, b, y, l, v)), "o1237" == P && (c = l + s.shift(), p = v + s.shift(), U = c + s.shift(), g = p + s.shift(), F = U + s.shift(), C = g + s.shift(), S = F + s.shift(), m = C + s.shift(), b = S + s.shift(), y = m + s.shift(), Math.abs(b - l) > Math.abs(y - v) ? l = b + s.shift() : v = y + s.shift(), e.U.P.curveTo(o, c, p, U, g, F, C), e.U.P.curveTo(o, S, m, b, y, l, v));
          else if ("o14" == P) {
            if (s.length > 0 && !h && (d = s.shift() + a2.nominalWidthX, h = true), 4 == s.length) {
              var O = s.shift(), T = s.shift(), D = s.shift(), B = s.shift(), A = e.CFF.glyphBySE(a2, D), R = e.CFF.glyphBySE(a2, B);
              e.U._drawCFF(a2.CharStrings[A], t2, a2, n, o), t2.x = O, t2.y = T, e.U._drawCFF(a2.CharStrings[R], t2, a2, n, o);
            }
            f && (e.U.P.closePath(o), f = false);
          } else if ("o19" == P || "o20" == P) {
            s.length % 2 != 0 && !h && (d = s.shift() + n.nominalWidthX), i += s.length >> 1, s.length = 0, h = true, u += i + 7 >> 3;
          } else if ("o21" == P) s.length > 2 && !h && (d = s.shift() + n.nominalWidthX, h = true), v += s.pop(), l += s.pop(), f && e.U.P.closePath(o), e.U.P.moveTo(o, l, v), f = true;
          else if ("o22" == P) s.length > 1 && !h && (d = s.shift() + n.nominalWidthX, h = true), l += s.pop(), f && e.U.P.closePath(o), e.U.P.moveTo(o, l, v), f = true;
          else if ("o25" == P) {
            for (; s.length > 6; ) l += s.shift(), v += s.shift(), e.U.P.lineTo(o, l, v);
            c = l + s.shift(), p = v + s.shift(), U = c + s.shift(), g = p + s.shift(), l = U + s.shift(), v = g + s.shift(), e.U.P.curveTo(o, c, p, U, g, l, v);
          } else if ("o26" == P) for (s.length % 2 && (l += s.shift()); s.length > 0; ) c = l, p = v + s.shift(), l = U = c + s.shift(), v = (g = p + s.shift()) + s.shift(), e.U.P.curveTo(o, c, p, U, g, l, v);
          else if ("o27" == P) for (s.length % 2 && (v += s.shift()); s.length > 0; ) p = v, U = (c = l + s.shift()) + s.shift(), g = p + s.shift(), l = U + s.shift(), v = g, e.U.P.curveTo(o, c, p, U, g, l, v);
          else if ("o10" == P || "o29" == P) {
            var L = "o10" == P ? n : a2;
            if (0 == s.length) console.debug("error: empty stack");
            else {
              var W = s.pop(), M = L.Subrs[W + L.Bias];
              t2.x = l, t2.y = v, t2.nStems = i, t2.haveWidth = h, t2.width = d, t2.open = f, e.U._drawCFF(M, t2, a2, n, o), l = t2.x, v = t2.y, i = t2.nStems, h = t2.haveWidth, d = t2.width, f = t2.open;
            }
          } else if ("o30" == P || "o31" == P) {
            var V = s.length, E = (G = 0, "o31" == P);
            for (G += V - (x = -3 & V); G < x; ) E ? (p = v, U = (c = l + s.shift()) + s.shift(), v = (g = p + s.shift()) + s.shift(), x - G == 5 ? (l = U + s.shift(), G++) : l = U, E = false) : (c = l, p = v + s.shift(), U = c + s.shift(), g = p + s.shift(), l = U + s.shift(), x - G == 5 ? (v = g + s.shift(), G++) : v = g, E = true), e.U.P.curveTo(o, c, p, U, g, l, v), G += 4;
          } else {
            if ("o" == (P + "").charAt(0)) throw console.debug("Unknown operation: " + P, r2), P;
            s.push(P);
          }
        }
      }
      t2.x = l, t2.y = v, t2.nStems = i, t2.haveWidth = h, t2.width = d, t2.open = f;
    };
    var t = e, a = { Typr: t };
    return r.Typr = t, r.default = a, Object.defineProperty(r, "__esModule", { value: true }), r;
  }({}).Typr;
}
function woff2otfFactory() {
  return function(r) {
    var e = Uint8Array, n = Uint16Array, t = Uint32Array, a = new e([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]), i = new e([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]), o = new e([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), f = function(r2, e2) {
      for (var a2 = new n(31), i2 = 0; i2 < 31; ++i2) a2[i2] = e2 += 1 << r2[i2 - 1];
      var o2 = new t(a2[30]);
      for (i2 = 1; i2 < 30; ++i2) for (var f2 = a2[i2]; f2 < a2[i2 + 1]; ++f2) o2[f2] = f2 - a2[i2] << 5 | i2;
      return [a2, o2];
    }, u = f(a, 2), v = u[0], s = u[1];
    v[28] = 258, s[258] = 28;
    for (var l = f(i, 0)[0], c = new n(32768), g = 0; g < 32768; ++g) {
      var h = (43690 & g) >>> 1 | (21845 & g) << 1;
      h = (61680 & (h = (52428 & h) >>> 2 | (13107 & h) << 2)) >>> 4 | (3855 & h) << 4, c[g] = ((65280 & h) >>> 8 | (255 & h) << 8) >>> 1;
    }
    var w = function(r2, e2, t2) {
      for (var a2 = r2.length, i2 = 0, o2 = new n(e2); i2 < a2; ++i2) ++o2[r2[i2] - 1];
      var f2, u2 = new n(e2);
      for (i2 = 0; i2 < e2; ++i2) u2[i2] = u2[i2 - 1] + o2[i2 - 1] << 1;
      if (t2) {
        f2 = new n(1 << e2);
        var v2 = 15 - e2;
        for (i2 = 0; i2 < a2; ++i2) if (r2[i2]) for (var s2 = i2 << 4 | r2[i2], l2 = e2 - r2[i2], g2 = u2[r2[i2] - 1]++ << l2, h2 = g2 | (1 << l2) - 1; g2 <= h2; ++g2) f2[c[g2] >>> v2] = s2;
      } else for (f2 = new n(a2), i2 = 0; i2 < a2; ++i2) r2[i2] && (f2[i2] = c[u2[r2[i2] - 1]++] >>> 15 - r2[i2]);
      return f2;
    }, d = new e(288);
    for (g = 0; g < 144; ++g) d[g] = 8;
    for (g = 144; g < 256; ++g) d[g] = 9;
    for (g = 256; g < 280; ++g) d[g] = 7;
    for (g = 280; g < 288; ++g) d[g] = 8;
    var m = new e(32);
    for (g = 0; g < 32; ++g) m[g] = 5;
    var b = w(d, 9, 1), p = w(m, 5, 1), y = function(r2) {
      for (var e2 = r2[0], n2 = 1; n2 < r2.length; ++n2) r2[n2] > e2 && (e2 = r2[n2]);
      return e2;
    }, L = function(r2, e2, n2) {
      var t2 = e2 / 8 | 0;
      return (r2[t2] | r2[t2 + 1] << 8) >> (7 & e2) & n2;
    }, U = function(r2, e2) {
      var n2 = e2 / 8 | 0;
      return (r2[n2] | r2[n2 + 1] << 8 | r2[n2 + 2] << 16) >> (7 & e2);
    }, k = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler", , "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"], T = function(r2, e2, n2) {
      var t2 = new Error(e2 || k[r2]);
      if (t2.code = r2, Error.captureStackTrace && Error.captureStackTrace(t2, T), !n2) throw t2;
      return t2;
    }, O = function(r2, f2, u2) {
      var s2 = r2.length;
      if (!s2 || u2 && !u2.l && s2 < 5) return f2 || new e(0);
      var c2 = !f2 || u2, g2 = !u2 || u2.i;
      u2 || (u2 = {}), f2 || (f2 = new e(3 * s2));
      var h2, d2 = function(r3) {
        var n2 = f2.length;
        if (r3 > n2) {
          var t2 = new e(Math.max(2 * n2, r3));
          t2.set(f2), f2 = t2;
        }
      }, m2 = u2.f || 0, k2 = u2.p || 0, O2 = u2.b || 0, A2 = u2.l, x2 = u2.d, E = u2.m, D = u2.n, M = 8 * s2;
      do {
        if (!A2) {
          u2.f = m2 = L(r2, k2, 1);
          var S = L(r2, k2 + 1, 3);
          if (k2 += 3, !S) {
            var V = r2[(I = ((h2 = k2) / 8 | 0) + (7 & h2 && 1) + 4) - 4] | r2[I - 3] << 8, _ = I + V;
            if (_ > s2) {
              g2 && T(0);
              break;
            }
            c2 && d2(O2 + V), f2.set(r2.subarray(I, _), O2), u2.b = O2 += V, u2.p = k2 = 8 * _;
            continue;
          }
          if (1 == S) A2 = b, x2 = p, E = 9, D = 5;
          else if (2 == S) {
            var j = L(r2, k2, 31) + 257, z = L(r2, k2 + 10, 15) + 4, C = j + L(r2, k2 + 5, 31) + 1;
            k2 += 14;
            for (var F = new e(C), P = new e(19), q = 0; q < z; ++q) P[o[q]] = L(r2, k2 + 3 * q, 7);
            k2 += 3 * z;
            var B = y(P), G = (1 << B) - 1, H = w(P, B, 1);
            for (q = 0; q < C; ) {
              var I, J = H[L(r2, k2, G)];
              if (k2 += 15 & J, (I = J >>> 4) < 16) F[q++] = I;
              else {
                var K = 0, N = 0;
                for (16 == I ? (N = 3 + L(r2, k2, 3), k2 += 2, K = F[q - 1]) : 17 == I ? (N = 3 + L(r2, k2, 7), k2 += 3) : 18 == I && (N = 11 + L(r2, k2, 127), k2 += 7); N--; ) F[q++] = K;
              }
            }
            var Q = F.subarray(0, j), R = F.subarray(j);
            E = y(Q), D = y(R), A2 = w(Q, E, 1), x2 = w(R, D, 1);
          } else T(1);
          if (k2 > M) {
            g2 && T(0);
            break;
          }
        }
        c2 && d2(O2 + 131072);
        for (var W = (1 << E) - 1, X = (1 << D) - 1, Y = k2; ; Y = k2) {
          var Z = (K = A2[U(r2, k2) & W]) >>> 4;
          if ((k2 += 15 & K) > M) {
            g2 && T(0);
            break;
          }
          if (K || T(2), Z < 256) f2[O2++] = Z;
          else {
            if (256 == Z) {
              Y = k2, A2 = null;
              break;
            }
            var $ = Z - 254;
            if (Z > 264) {
              var rr = a[q = Z - 257];
              $ = L(r2, k2, (1 << rr) - 1) + v[q], k2 += rr;
            }
            var er = x2[U(r2, k2) & X], nr = er >>> 4;
            er || T(3), k2 += 15 & er;
            R = l[nr];
            if (nr > 3) {
              rr = i[nr];
              R += U(r2, k2) & (1 << rr) - 1, k2 += rr;
            }
            if (k2 > M) {
              g2 && T(0);
              break;
            }
            c2 && d2(O2 + 131072);
            for (var tr = O2 + $; O2 < tr; O2 += 4) f2[O2] = f2[O2 - R], f2[O2 + 1] = f2[O2 + 1 - R], f2[O2 + 2] = f2[O2 + 2 - R], f2[O2 + 3] = f2[O2 + 3 - R];
            O2 = tr;
          }
        }
        u2.l = A2, u2.p = Y, u2.b = O2, A2 && (m2 = 1, u2.m = E, u2.d = x2, u2.n = D);
      } while (!m2);
      return O2 == f2.length ? f2 : function(r3, a2, i2) {
        (null == a2 || a2 < 0) && (a2 = 0), (null == i2 || i2 > r3.length) && (i2 = r3.length);
        var o2 = new (r3 instanceof n ? n : r3 instanceof t ? t : e)(i2 - a2);
        return o2.set(r3.subarray(a2, i2)), o2;
      }(f2, 0, O2);
    }, A = new e(0);
    var x = "undefined" != typeof TextDecoder && new TextDecoder();
    try {
      x.decode(A, { stream: true }), 1;
    } catch (r2) {
    }
    return r.convert_streams = function(r2) {
      var e2 = new DataView(r2), n2 = 0;
      function t2() {
        var r3 = e2.getUint16(n2);
        return n2 += 2, r3;
      }
      function a2() {
        var r3 = e2.getUint32(n2);
        return n2 += 4, r3;
      }
      function i2(r3) {
        m2.setUint16(b2, r3), b2 += 2;
      }
      function o2(r3) {
        m2.setUint32(b2, r3), b2 += 4;
      }
      for (var f2 = { signature: a2(), flavor: a2(), length: a2(), numTables: t2(), reserved: t2(), totalSfntSize: a2(), majorVersion: t2(), minorVersion: t2(), metaOffset: a2(), metaLength: a2(), metaOrigLength: a2(), privOffset: a2(), privLength: a2() }, u2 = 0; Math.pow(2, u2) <= f2.numTables; ) u2++;
      u2--;
      for (var v2 = 16 * Math.pow(2, u2), s2 = 16 * f2.numTables - v2, l2 = 12, c2 = [], g2 = 0; g2 < f2.numTables; g2++) c2.push({ tag: a2(), offset: a2(), compLength: a2(), origLength: a2(), origChecksum: a2() }), l2 += 16;
      var h2, w2 = new Uint8Array(12 + 16 * c2.length + c2.reduce(function(r3, e3) {
        return r3 + e3.origLength + 4;
      }, 0)), d2 = w2.buffer, m2 = new DataView(d2), b2 = 0;
      return o2(f2.flavor), i2(f2.numTables), i2(v2), i2(u2), i2(s2), c2.forEach(function(r3) {
        o2(r3.tag), o2(r3.origChecksum), o2(l2), o2(r3.origLength), r3.outOffset = l2, (l2 += r3.origLength) % 4 != 0 && (l2 += 4 - l2 % 4);
      }), c2.forEach(function(e3) {
        var n3, t3 = r2.slice(e3.offset, e3.offset + e3.compLength);
        if (e3.compLength != e3.origLength) {
          var a3 = new Uint8Array(e3.origLength);
          n3 = new Uint8Array(t3, 2), O(n3, a3);
        } else a3 = new Uint8Array(t3);
        w2.set(a3, e3.outOffset);
        var i3 = 0;
        (l2 = e3.outOffset + e3.origLength) % 4 != 0 && (i3 = 4 - l2 % 4), w2.set(new Uint8Array(i3).buffer, e3.outOffset + e3.origLength), h2 = l2 + i3;
      }), d2.slice(0, h2);
    }, Object.defineProperty(r, "__esModule", { value: true }), r;
  }({}).convert_streams;
}
function parserFactory(Typr, woff2otf) {
  const cmdArgLengths = {
    M: 2,
    L: 2,
    Q: 4,
    C: 6,
    Z: 0
  };
  const joiningTypeRawData = { "C": "18g,ca,368,1kz", "D": "17k,6,2,2+4,5+c,2+6,2+1,10+1,9+f,j+11,2+1,a,2,2+1,15+2,3,j+2,6+3,2+8,2,2,2+1,w+a,4+e,3+3,2,3+2,3+5,23+w,2f+4,3,2+9,2,b,2+3,3,1k+9,6+1,3+1,2+2,2+d,30g,p+y,1,1+1g,f+x,2,sd2+1d,jf3+4,f+3,2+4,2+2,b+3,42,2,4+2,2+1,2,3,t+1,9f+w,2,el+2,2+g,d+2,2l,2+1,5,3+1,2+1,2,3,6,16wm+1v", "R": "17m+3,2,2,6+3,m,15+2,2+2,h+h,13,3+8,2,2,3+1,2,p+1,x,5+4,5,a,2,2,3,u,c+2,g+1,5,2+1,4+1,5j,6+1,2,b,2+2,f,2+1,1s+2,2,3+1,7,1ez0,2,2+1,4+4,b,4,3,b,42,2+2,4,3,2+1,2,o+3,ae,ep,x,2o+2,3+1,3,5+1,6", "L": "x9u,jff,a,fd,jv", "T": "4t,gj+33,7o+4,1+1,7c+18,2,2+1,2+1,2,21+a,2,1b+k,h,2u+6,3+5,3+1,2+3,y,2,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,3,7,6+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+d,1,1+1,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,ek,3+1,r+4,1e+4,6+5,2p+c,1+3,1,1+2,1+b,2db+2,3y,2p+v,ff+3,30+1,n9x,1+2,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,5s,6y+2,ea,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+9,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2,2b+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,470+8,at4+4,1o+6,t5,1s+3,2a,f5l+1,2+3,43o+2,a+7,1+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,1,gzau,v+2n,3l+6n" };
  const JT_LEFT = 1, JT_RIGHT = 2, JT_DUAL = 4, JT_TRANSPARENT = 8, JT_JOIN_CAUSING = 16, JT_NON_JOINING = 32;
  let joiningTypeMap;
  function getCharJoiningType(ch) {
    if (!joiningTypeMap) {
      const m = {
        R: JT_RIGHT,
        L: JT_LEFT,
        D: JT_DUAL,
        C: JT_JOIN_CAUSING,
        U: JT_NON_JOINING,
        T: JT_TRANSPARENT
      };
      joiningTypeMap = /* @__PURE__ */ new Map();
      for (let type in joiningTypeRawData) {
        let lastCode = 0;
        joiningTypeRawData[type].split(",").forEach((range) => {
          let [skip, step] = range.split("+");
          skip = parseInt(skip, 36);
          step = step ? parseInt(step, 36) : 0;
          joiningTypeMap.set(lastCode += skip, m[type]);
          for (let i = step; i--; ) {
            joiningTypeMap.set(++lastCode, m[type]);
          }
        });
      }
    }
    return joiningTypeMap.get(ch) || JT_NON_JOINING;
  }
  const ISOL = 1, INIT = 2, FINA = 3, MEDI = 4;
  const formsToFeatures = [null, "isol", "init", "fina", "medi"];
  function detectJoiningForms(str) {
    const joiningForms = new Uint8Array(str.length);
    let prevJoiningType = JT_NON_JOINING;
    let prevForm = ISOL;
    let prevIndex = -1;
    for (let i = 0; i < str.length; i++) {
      const code = str.codePointAt(i);
      let joiningType = getCharJoiningType(code) | 0;
      let form = ISOL;
      if (joiningType & JT_TRANSPARENT) {
        continue;
      }
      if (prevJoiningType & (JT_LEFT | JT_DUAL | JT_JOIN_CAUSING)) {
        if (joiningType & (JT_RIGHT | JT_DUAL | JT_JOIN_CAUSING)) {
          form = FINA;
          if (prevForm === ISOL || prevForm === FINA) {
            joiningForms[prevIndex]++;
          }
        } else if (joiningType & (JT_LEFT | JT_NON_JOINING)) {
          if (prevForm === INIT || prevForm === MEDI) {
            joiningForms[prevIndex]--;
          }
        }
      } else if (prevJoiningType & (JT_RIGHT | JT_NON_JOINING)) {
        if (prevForm === INIT || prevForm === MEDI) {
          joiningForms[prevIndex]--;
        }
      }
      prevForm = joiningForms[i] = form;
      prevJoiningType = joiningType;
      prevIndex = i;
      if (code > 65535) i++;
    }
    return joiningForms;
  }
  function stringToGlyphs(font, str) {
    const glyphIds = [];
    for (let i = 0; i < str.length; i++) {
      const cc = str.codePointAt(i);
      if (cc > 65535) i++;
      glyphIds.push(Typr.U.codeToGlyph(font, cc));
    }
    const gsub = font["GSUB"];
    if (gsub) {
      const { lookupList, featureList } = gsub;
      let joiningForms;
      const supportedFeatures = /^(rlig|liga|mset|isol|init|fina|medi|half|pres|blws|ccmp)$/;
      const usedLookups = [];
      featureList.forEach((feature) => {
        if (supportedFeatures.test(feature.tag)) {
          for (let ti = 0; ti < feature.tab.length; ti++) {
            if (usedLookups[feature.tab[ti]]) continue;
            usedLookups[feature.tab[ti]] = true;
            const tab = lookupList[feature.tab[ti]];
            const isJoiningFeature = /^(isol|init|fina|medi)$/.test(feature.tag);
            if (isJoiningFeature && !joiningForms) {
              joiningForms = detectJoiningForms(str);
            }
            for (let ci = 0; ci < glyphIds.length; ci++) {
              if (!joiningForms || !isJoiningFeature || formsToFeatures[joiningForms[ci]] === feature.tag) {
                Typr.U._applySubs(glyphIds, ci, tab, lookupList);
              }
            }
          }
        }
      });
    }
    return glyphIds;
  }
  function calcGlyphPositions(font, glyphIds) {
    const positions = new Int16Array(glyphIds.length * 3);
    let glyphIndex = 0;
    for (; glyphIndex < glyphIds.length; glyphIndex++) {
      const glyphId = glyphIds[glyphIndex];
      if (glyphId === -1) continue;
      positions[glyphIndex * 3 + 2] = font.hmtx.aWidth[glyphId];
      const gpos = font.GPOS;
      if (gpos) {
        const llist = gpos.lookupList;
        for (let i = 0; i < llist.length; i++) {
          const lookup = llist[i];
          for (let j = 0; j < lookup.tabs.length; j++) {
            const tab = lookup.tabs[j];
            if (lookup.ltype === 1) {
              const ind = Typr._lctf.coverageIndex(tab.coverage, glyphId);
              if (ind !== -1 && tab.pos) {
                applyValueRecord(tab.pos, glyphIndex);
                break;
              }
            } else if (lookup.ltype === 2) {
              let adj = null;
              let prevGlyphIndex = getPrevGlyphIndex();
              if (prevGlyphIndex !== -1) {
                const coverageIndex = Typr._lctf.coverageIndex(tab.coverage, glyphIds[prevGlyphIndex]);
                if (coverageIndex !== -1) {
                  if (tab.fmt === 1) {
                    const right = tab.pairsets[coverageIndex];
                    for (let k = 0; k < right.length; k++) {
                      if (right[k].gid2 === glyphId) adj = right[k];
                    }
                  } else if (tab.fmt === 2) {
                    const c1 = Typr.U._getGlyphClass(glyphIds[prevGlyphIndex], tab.classDef1);
                    const c2 = Typr.U._getGlyphClass(glyphId, tab.classDef2);
                    adj = tab.matrix[c1][c2];
                  }
                  if (adj) {
                    if (adj.val1) applyValueRecord(adj.val1, prevGlyphIndex);
                    if (adj.val2) applyValueRecord(adj.val2, glyphIndex);
                    break;
                  }
                }
              }
            } else if (lookup.ltype === 4) {
              const markArrIndex = Typr._lctf.coverageIndex(tab.markCoverage, glyphId);
              if (markArrIndex !== -1) {
                const baseGlyphIndex = getPrevGlyphIndex(isBaseGlyph);
                const baseArrIndex = baseGlyphIndex === -1 ? -1 : Typr._lctf.coverageIndex(tab.baseCoverage, glyphIds[baseGlyphIndex]);
                if (baseArrIndex !== -1) {
                  const markRecord = tab.markArray[markArrIndex];
                  const baseAnchor = tab.baseArray[baseArrIndex][markRecord.markClass];
                  positions[glyphIndex * 3] = baseAnchor.x - markRecord.x + positions[baseGlyphIndex * 3] - positions[baseGlyphIndex * 3 + 2];
                  positions[glyphIndex * 3 + 1] = baseAnchor.y - markRecord.y + positions[baseGlyphIndex * 3 + 1];
                  break;
                }
              }
            } else if (lookup.ltype === 6) {
              const mark1ArrIndex = Typr._lctf.coverageIndex(tab.mark1Coverage, glyphId);
              if (mark1ArrIndex !== -1) {
                const prevGlyphIndex = getPrevGlyphIndex();
                if (prevGlyphIndex !== -1) {
                  const prevGlyphId = glyphIds[prevGlyphIndex];
                  if (getGlyphClass(font, prevGlyphId) === 3) {
                    const mark2ArrIndex = Typr._lctf.coverageIndex(tab.mark2Coverage, prevGlyphId);
                    if (mark2ArrIndex !== -1) {
                      const mark1Record = tab.mark1Array[mark1ArrIndex];
                      const mark2Anchor = tab.mark2Array[mark2ArrIndex][mark1Record.markClass];
                      positions[glyphIndex * 3] = mark2Anchor.x - mark1Record.x + positions[prevGlyphIndex * 3] - positions[prevGlyphIndex * 3 + 2];
                      positions[glyphIndex * 3 + 1] = mark2Anchor.y - mark1Record.y + positions[prevGlyphIndex * 3 + 1];
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      } else if (font.kern && !font.cff) {
        const prevGlyphIndex = getPrevGlyphIndex();
        if (prevGlyphIndex !== -1) {
          const ind1 = font.kern.glyph1.indexOf(glyphIds[prevGlyphIndex]);
          if (ind1 !== -1) {
            const ind2 = font.kern.rval[ind1].glyph2.indexOf(glyphId);
            if (ind2 !== -1) {
              positions[prevGlyphIndex * 3 + 2] += font.kern.rval[ind1].vals[ind2];
            }
          }
        }
      }
    }
    return positions;
    function getPrevGlyphIndex(filter) {
      for (let i = glyphIndex - 1; i >= 0; i--) {
        if (glyphIds[i] !== -1 && (!filter || filter(glyphIds[i]))) {
          return i;
        }
      }
      return -1;
    }
    function isBaseGlyph(glyphId) {
      return getGlyphClass(font, glyphId) === 1;
    }
    function applyValueRecord(source, gi) {
      for (let i = 0; i < 3; i++) {
        positions[gi * 3 + i] += source[i] || 0;
      }
    }
  }
  function getGlyphClass(font, glyphId) {
    const classDef = font.GDEF && font.GDEF.glyphClassDef;
    return classDef ? Typr.U._getGlyphClass(glyphId, classDef) : 0;
  }
  function firstNum(...args) {
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === "number") {
        return args[i];
      }
    }
  }
  function wrapFontObj(typrFont) {
    const glyphMap = /* @__PURE__ */ Object.create(null);
    const os2 = typrFont["OS/2"];
    const hhea = typrFont.hhea;
    const unitsPerEm = typrFont.head.unitsPerEm;
    const ascender = firstNum(os2 && os2.sTypoAscender, hhea && hhea.ascender, unitsPerEm);
    const fontObj = {
      unitsPerEm,
      ascender,
      descender: firstNum(os2 && os2.sTypoDescender, hhea && hhea.descender, 0),
      capHeight: firstNum(os2 && os2.sCapHeight, ascender),
      xHeight: firstNum(os2 && os2.sxHeight, ascender),
      lineGap: firstNum(os2 && os2.sTypoLineGap, hhea && hhea.lineGap),
      supportsCodePoint(code) {
        return Typr.U.codeToGlyph(typrFont, code) > 0;
      },
      forEachGlyph(text, fontSize, letterSpacing, callback) {
        let penX = 0;
        const fontScale = 1 / fontObj.unitsPerEm * fontSize;
        const glyphIds = stringToGlyphs(typrFont, text);
        let charIndex = 0;
        const positions = calcGlyphPositions(typrFont, glyphIds);
        glyphIds.forEach((glyphId, i) => {
          if (glyphId !== -1) {
            let glyphObj = glyphMap[glyphId];
            if (!glyphObj) {
              const { cmds, crds } = Typr.U.glyphToPath(typrFont, glyphId);
              let path = "";
              let crdsIdx = 0;
              for (let i2 = 0, len = cmds.length; i2 < len; i2++) {
                const numArgs = cmdArgLengths[cmds[i2]];
                path += cmds[i2];
                for (let j = 1; j <= numArgs; j++) {
                  path += (j > 1 ? "," : "") + crds[crdsIdx++];
                }
              }
              let xMin, yMin, xMax, yMax;
              if (crds.length) {
                xMin = yMin = Infinity;
                xMax = yMax = -Infinity;
                for (let i2 = 0, len = crds.length; i2 < len; i2 += 2) {
                  let x = crds[i2];
                  let y = crds[i2 + 1];
                  if (x < xMin) xMin = x;
                  if (y < yMin) yMin = y;
                  if (x > xMax) xMax = x;
                  if (y > yMax) yMax = y;
                }
              } else {
                xMin = xMax = yMin = yMax = 0;
              }
              glyphObj = glyphMap[glyphId] = {
                index: glyphId,
                advanceWidth: typrFont.hmtx.aWidth[glyphId],
                xMin,
                yMin,
                xMax,
                yMax,
                path
              };
            }
            callback.call(
              null,
              glyphObj,
              penX + positions[i * 3] * fontScale,
              positions[i * 3 + 1] * fontScale,
              charIndex
            );
            penX += positions[i * 3 + 2] * fontScale;
            if (letterSpacing) {
              penX += letterSpacing * fontSize;
            }
          }
          charIndex += text.codePointAt(charIndex) > 65535 ? 2 : 1;
        });
        return penX;
      }
    };
    return fontObj;
  }
  return function parse(buffer) {
    const peek = new Uint8Array(buffer, 0, 4);
    const tag = Typr._bin.readASCII(peek, 0, 4);
    if (tag === "wOFF") {
      buffer = woff2otf(buffer);
    } else if (tag === "wOF2") {
      throw new Error("woff2 fonts not supported");
    }
    return wrapFontObj(Typr.parse(buffer)[0]);
  };
}
var workerModule = defineWorkerModule({
  name: "Typr Font Parser",
  dependencies: [typrFactory, woff2otfFactory, parserFactory],
  init(typrFactory2, woff2otfFactory2, parserFactory2) {
    const Typr = typrFactory2();
    const woff2otf = woff2otfFactory2();
    return parserFactory2(Typr, woff2otf);
  }
});
function unicodeFontResolverClientFactory() {
  return function(t) {
    var n = function() {
      this.buckets = /* @__PURE__ */ new Map();
    };
    n.prototype.add = function(t2) {
      var n2 = t2 >> 5;
      this.buckets.set(n2, (this.buckets.get(n2) || 0) | 1 << (31 & t2));
    }, n.prototype.has = function(t2) {
      var n2 = this.buckets.get(t2 >> 5);
      return void 0 !== n2 && 0 != (n2 & 1 << (31 & t2));
    }, n.prototype.serialize = function() {
      var t2 = [];
      return this.buckets.forEach(function(n2, r2) {
        t2.push((+r2).toString(36) + ":" + n2.toString(36));
      }), t2.join(",");
    }, n.prototype.deserialize = function(t2) {
      var n2 = this;
      this.buckets.clear(), t2.split(",").forEach(function(t3) {
        var r2 = t3.split(":");
        n2.buckets.set(parseInt(r2[0], 36), parseInt(r2[1], 36));
      });
    };
    var r = Math.pow(2, 8), e = r - 1, o = ~e;
    function a(t2) {
      var n2 = function(t3) {
        return t3 & o;
      }(t2).toString(16), e2 = function(t3) {
        return (t3 & o) + r - 1;
      }(t2).toString(16);
      return "codepoint-index/plane" + (t2 >> 16) + "/" + n2 + "-" + e2 + ".json";
    }
    function i(t2, n2) {
      var r2 = t2 & e, o2 = n2.codePointAt(r2 / 6 | 0);
      return 0 != ((o2 = (o2 || 48) - 48) & 1 << r2 % 6);
    }
    function u(t2, n2) {
      var r2;
      (r2 = t2, r2.replace(/U\+/gi, "").replace(/^,+|,+$/g, "").split(/,+/).map(function(t3) {
        return t3.split("-").map(function(t4) {
          return parseInt(t4.trim(), 16);
        });
      })).forEach(function(t3) {
        var r3 = t3[0], e2 = t3[1];
        void 0 === e2 && (e2 = r3), n2(r3, e2);
      });
    }
    function c(t2, n2) {
      u(t2, function(t3, r2) {
        for (var e2 = t3; e2 <= r2; e2++) n2(e2);
      });
    }
    var s = {}, f = {}, l = /* @__PURE__ */ new WeakMap(), v = "https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data";
    function d(t2) {
      var r2 = l.get(t2);
      return r2 || (r2 = new n(), c(t2.ranges, function(t3) {
        return r2.add(t3);
      }), l.set(t2, r2)), r2;
    }
    var h, p = /* @__PURE__ */ new Map();
    function g(t2, n2, r2) {
      return t2[n2] ? n2 : t2[r2] ? r2 : function(t3) {
        for (var n3 in t3) return n3;
      }(t2);
    }
    function w(t2, n2) {
      var r2 = n2;
      if (!t2.includes(r2)) {
        r2 = 1 / 0;
        for (var e2 = 0; e2 < t2.length; e2++) Math.abs(t2[e2] - n2) < Math.abs(r2 - n2) && (r2 = t2[e2]);
      }
      return r2;
    }
    function k(t2) {
      return h || (h = /* @__PURE__ */ new Set(), c("9-D,20,85,A0,1680,2000-200A,2028-202F,205F,3000", function(t3) {
        h.add(t3);
      })), h.has(t2);
    }
    return t.CodePointSet = n, t.clearCache = function() {
      s = {}, f = {};
    }, t.getFontsForString = function(t2, n2) {
      void 0 === n2 && (n2 = {});
      var r2, e2 = n2.lang;
      void 0 === e2 && (e2 = new RegExp("\\p{Script=Hangul}", "u").test(r2 = t2) ? "ko" : new RegExp("\\p{Script=Hiragana}|\\p{Script=Katakana}", "u").test(r2) ? "ja" : "en");
      var o2 = n2.category;
      void 0 === o2 && (o2 = "sans-serif");
      var u2 = n2.style;
      void 0 === u2 && (u2 = "normal");
      var c2 = n2.weight;
      void 0 === c2 && (c2 = 400);
      var l2 = (n2.dataUrl || v).replace(/\/$/g, ""), h2 = /* @__PURE__ */ new Map(), y = new Uint8Array(t2.length), b = {}, m = {}, A = new Array(t2.length), S = /* @__PURE__ */ new Map(), j = false;
      function M(t3) {
        var n3 = p.get(t3);
        return n3 || (n3 = fetch(l2 + "/" + t3).then(function(t4) {
          if (!t4.ok) throw new Error(t4.statusText);
          return t4.json().then(function(t5) {
            if (!Array.isArray(t5) || 1 !== t5[0]) throw new Error("Incorrect schema version; need 1, got " + t5[0]);
            return t5[1];
          });
        }).catch(function(n4) {
          if (l2 !== v) return j || (console.error('unicode-font-resolver: Failed loading from dataUrl "' + l2 + '", trying default CDN. ' + n4.message), j = true), l2 = v, p.delete(t3), M(t3);
          throw n4;
        }), p.set(t3, n3)), n3;
      }
      for (var P = function(n3) {
        var r3 = t2.codePointAt(n3), e3 = a(r3);
        A[n3] = e3, s[e3] || S.has(e3) || S.set(e3, M(e3).then(function(t3) {
          s[e3] = t3;
        })), r3 > 65535 && (n3++, E = n3);
      }, E = 0; E < t2.length; E++) P(E);
      return Promise.all(S.values()).then(function() {
        S.clear();
        for (var n3 = function(n4) {
          var o3 = t2.codePointAt(n4), a2 = null, u3 = s[A[n4]], c3 = void 0;
          for (var l3 in u3) {
            var v2 = m[l3];
            if (void 0 === v2 && (v2 = m[l3] = new RegExp(l3).test(e2 || "en")), v2) {
              for (var d2 in c3 = l3, u3[l3]) if (i(o3, u3[l3][d2])) {
                a2 = d2;
                break;
              }
              break;
            }
          }
          if (!a2) {
            t: for (var h3 in u3) if (h3 !== c3) {
              for (var p2 in u3[h3]) if (i(o3, u3[h3][p2])) {
                a2 = p2;
                break t;
              }
            }
          }
          a2 || (console.debug("No font coverage for U+" + o3.toString(16)), a2 = "latin"), A[n4] = a2, f[a2] || S.has(a2) || S.set(a2, M("font-meta/" + a2 + ".json").then(function(t3) {
            f[a2] = t3;
          })), o3 > 65535 && (n4++, r3 = n4);
        }, r3 = 0; r3 < t2.length; r3++) n3(r3);
        return Promise.all(S.values());
      }).then(function() {
        for (var n3, r3 = null, e3 = 0; e3 < t2.length; e3++) {
          var a2 = t2.codePointAt(e3);
          if (r3 && (k(a2) || d(r3).has(a2))) y[e3] = y[e3 - 1];
          else {
            r3 = f[A[e3]];
            var i2 = b[r3.id];
            if (!i2) {
              var s2 = r3.typeforms, v2 = g(s2, o2, "sans-serif"), p2 = g(s2[v2], u2, "normal"), m2 = w(null === (n3 = s2[v2]) || void 0 === n3 ? void 0 : n3[p2], c2);
              i2 = b[r3.id] = l2 + "/font-files/" + r3.id + "/" + v2 + "." + p2 + "." + m2 + ".woff";
            }
            var S2 = h2.get(i2);
            null == S2 && (S2 = h2.size, h2.set(i2, S2)), y[e3] = S2;
          }
          a2 > 65535 && (e3++, y[e3] = y[e3 - 1]);
        }
        return { fontUrls: Array.from(h2.keys()), chars: y };
      });
    }, Object.defineProperty(t, "__esModule", { value: true }), t;
  }({});
}
function createFontResolver(fontParser, unicodeFontResolverClient) {
  const parsedFonts = /* @__PURE__ */ Object.create(null);
  const loadingFonts = /* @__PURE__ */ Object.create(null);
  function doLoadFont(url, callback) {
    const onError = (err) => {
      console.error(`Failure loading font ${url}`, err);
    };
    try {
      const request = new XMLHttpRequest();
      request.open("get", url, true);
      request.responseType = "arraybuffer";
      request.onload = function() {
        if (request.status >= 400) {
          onError(new Error(request.statusText));
        } else if (request.status > 0) {
          try {
            const fontObj = fontParser(request.response);
            fontObj.src = url;
            callback(fontObj);
          } catch (e) {
            onError(e);
          }
        }
      };
      request.onerror = onError;
      request.send();
    } catch (err) {
      onError(err);
    }
  }
  function loadFont(fontUrl, callback) {
    let font = parsedFonts[fontUrl];
    if (font) {
      callback(font);
    } else if (loadingFonts[fontUrl]) {
      loadingFonts[fontUrl].push(callback);
    } else {
      loadingFonts[fontUrl] = [callback];
      doLoadFont(fontUrl, (fontObj) => {
        fontObj.src = fontUrl;
        parsedFonts[fontUrl] = fontObj;
        loadingFonts[fontUrl].forEach((cb) => cb(fontObj));
        delete loadingFonts[fontUrl];
      });
    }
  }
  return function(text, callback, {
    lang,
    fonts: userFonts = [],
    style = "normal",
    weight = "normal",
    unicodeFontsURL
  } = {}) {
    const charResolutions = new Uint8Array(text.length);
    const fontResolutions = [];
    if (!text.length) {
      allDone();
    }
    const fontIndices = /* @__PURE__ */ new Map();
    const fallbackRanges = [];
    if (style !== "italic") style = "normal";
    if (typeof weight !== "number") {
      weight = weight === "bold" ? 700 : 400;
    }
    if (userFonts && !Array.isArray(userFonts)) {
      userFonts = [userFonts];
    }
    userFonts = userFonts.slice().filter((def) => !def.lang || def.lang.test(lang)).reverse();
    if (userFonts.length) {
      const UNKNOWN = 0;
      const RESOLVED = 1;
      const NEEDS_FALLBACK = 2;
      let prevCharResult = UNKNOWN;
      (function resolveUserFonts(startIndex = 0) {
        for (let i = startIndex, iLen = text.length; i < iLen; i++) {
          const codePoint = text.codePointAt(i);
          if (prevCharResult === RESOLVED && fontResolutions[charResolutions[i - 1]].supportsCodePoint(codePoint) || i > 0 && /\s/.test(text[i])) {
            charResolutions[i] = charResolutions[i - 1];
            if (prevCharResult === NEEDS_FALLBACK) {
              fallbackRanges[fallbackRanges.length - 1][1] = i;
            }
          } else {
            for (let j = charResolutions[i], jLen = userFonts.length; j <= jLen; j++) {
              if (j === jLen) {
                const range = prevCharResult === NEEDS_FALLBACK ? fallbackRanges[fallbackRanges.length - 1] : fallbackRanges[fallbackRanges.length] = [i, i];
                range[1] = i;
                prevCharResult = NEEDS_FALLBACK;
              } else {
                charResolutions[i] = j;
                const { src, unicodeRange } = userFonts[j];
                if (!unicodeRange || isCodeInRanges(codePoint, unicodeRange)) {
                  const fontObj = parsedFonts[src];
                  if (!fontObj) {
                    loadFont(src, () => {
                      resolveUserFonts(i);
                    });
                    return;
                  }
                  if (fontObj.supportsCodePoint(codePoint)) {
                    let fontIndex = fontIndices.get(fontObj);
                    if (typeof fontIndex !== "number") {
                      fontIndex = fontResolutions.length;
                      fontResolutions.push(fontObj);
                      fontIndices.set(fontObj, fontIndex);
                    }
                    charResolutions[i] = fontIndex;
                    prevCharResult = RESOLVED;
                    break;
                  }
                }
              }
            }
          }
          if (codePoint > 65535 && i + 1 < iLen) {
            charResolutions[i + 1] = charResolutions[i];
            i++;
            if (prevCharResult === NEEDS_FALLBACK) {
              fallbackRanges[fallbackRanges.length - 1][1] = i;
            }
          }
        }
        resolveFallbacks();
      })();
    } else {
      fallbackRanges.push([0, text.length - 1]);
      resolveFallbacks();
    }
    function resolveFallbacks() {
      if (fallbackRanges.length) {
        const fallbackString = fallbackRanges.map((range) => text.substring(range[0], range[1] + 1)).join("\n");
        unicodeFontResolverClient.getFontsForString(fallbackString, {
          lang: lang || void 0,
          style,
          weight,
          dataUrl: unicodeFontsURL
        }).then(({ fontUrls, chars }) => {
          const fontIndexOffset = fontResolutions.length;
          let charIdx = 0;
          fallbackRanges.forEach((range) => {
            for (let i = 0, endIdx = range[1] - range[0]; i <= endIdx; i++) {
              charResolutions[range[0] + i] = chars[charIdx++] + fontIndexOffset;
            }
            charIdx++;
          });
          let loadedCount = 0;
          fontUrls.forEach((url, i) => {
            loadFont(url, (fontObj) => {
              fontResolutions[i + fontIndexOffset] = fontObj;
              if (++loadedCount === fontUrls.length) {
                allDone();
              }
            });
          });
        });
      } else {
        allDone();
      }
    }
    function allDone() {
      callback({
        chars: charResolutions,
        fonts: fontResolutions
      });
    }
    function isCodeInRanges(code, ranges) {
      for (let k = 0; k < ranges.length; k++) {
        const [start, end = start] = ranges[k];
        if (start <= code && code <= end) {
          return true;
        }
      }
      return false;
    }
  };
}
var fontResolverWorkerModule = defineWorkerModule({
  name: "FontResolver",
  dependencies: [
    createFontResolver,
    workerModule,
    unicodeFontResolverClientFactory
  ],
  init(createFontResolver2, fontParser, unicodeFontResolverClientFactory2) {
    return createFontResolver2(fontParser, unicodeFontResolverClientFactory2());
  }
});
function createTypesetter(resolveFonts, bidi) {
  const INF = Infinity;
  const DEFAULT_IGNORABLE_CHARS = /[\u00AD\u034F\u061C\u115F-\u1160\u17B4-\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]/;
  const lineBreakingWhiteSpace = `[^\\S\\u00A0]`;
  const BREAK_AFTER_CHARS = new RegExp(`${lineBreakingWhiteSpace}|[\\-\\u007C\\u00AD\\u2010\\u2012-\\u2014\\u2027\\u2056\\u2E17\\u2E40]`);
  function calculateFontRuns({ text, lang, fonts, style, weight, preResolvedFonts, unicodeFontsURL }, onDone) {
    const onResolved = ({ chars, fonts: parsedFonts }) => {
      let curRun, prevVal;
      const runs = [];
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] !== prevVal) {
          prevVal = chars[i];
          runs.push(curRun = { start: i, end: i, fontObj: parsedFonts[chars[i]] });
        } else {
          curRun.end = i;
        }
      }
      onDone(runs);
    };
    if (preResolvedFonts) {
      onResolved(preResolvedFonts);
    } else {
      resolveFonts(
        text,
        onResolved,
        { lang, fonts, style, weight, unicodeFontsURL }
      );
    }
  }
  function typeset({
    text = "",
    font,
    lang,
    sdfGlyphSize = 64,
    fontSize = 400,
    fontWeight = 1,
    fontStyle = "normal",
    letterSpacing = 0,
    lineHeight = "normal",
    maxWidth = INF,
    direction,
    textAlign = "left",
    textIndent = 0,
    whiteSpace = "normal",
    overflowWrap = "normal",
    anchorX = 0,
    anchorY = 0,
    metricsOnly = false,
    unicodeFontsURL,
    preResolvedFonts = null,
    includeCaretPositions = false,
    chunkedBoundsSize = 8192,
    colorRanges = null
  }, callback) {
    const mainStart = now2();
    const timings = { fontLoad: 0, typesetting: 0 };
    if (text.indexOf("\r") > -1) {
      console.info("Typesetter: got text with \\r chars; normalizing to \\n");
      text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }
    fontSize = +fontSize;
    letterSpacing = +letterSpacing;
    maxWidth = +maxWidth;
    lineHeight = lineHeight || "normal";
    textIndent = +textIndent;
    calculateFontRuns({
      text,
      lang,
      style: fontStyle,
      weight: fontWeight,
      fonts: typeof font === "string" ? [{ src: font }] : font,
      unicodeFontsURL,
      preResolvedFonts
    }, (runs) => {
      timings.fontLoad = now2() - mainStart;
      const hasMaxWidth = isFinite(maxWidth);
      let glyphIds = null;
      let glyphFontIndices = null;
      let glyphPositions = null;
      let glyphData = null;
      let glyphColors = null;
      let caretPositions = null;
      let visibleBounds = null;
      let chunkedBounds = null;
      let maxLineWidth = 0;
      let renderableGlyphCount = 0;
      let canWrap = whiteSpace !== "nowrap";
      const metricsByFont = /* @__PURE__ */ new Map();
      const typesetStart = now2();
      let lineXOffset = textIndent;
      let prevRunEndX = 0;
      let currentLine = new TextLine();
      const lines = [currentLine];
      runs.forEach((run) => {
        const { fontObj } = run;
        const { ascender, descender, unitsPerEm, lineGap, capHeight, xHeight } = fontObj;
        let fontData2 = metricsByFont.get(fontObj);
        if (!fontData2) {
          const fontSizeMult2 = fontSize / unitsPerEm;
          const calcLineHeight = lineHeight === "normal" ? (ascender - descender + lineGap) * fontSizeMult2 : lineHeight * fontSize;
          const halfLeading = (calcLineHeight - (ascender - descender) * fontSizeMult2) / 2;
          const caretHeight = Math.min(calcLineHeight, (ascender - descender) * fontSizeMult2);
          const caretTop = (ascender + descender) / 2 * fontSizeMult2 + caretHeight / 2;
          fontData2 = {
            index: metricsByFont.size,
            src: fontObj.src,
            fontObj,
            fontSizeMult: fontSizeMult2,
            unitsPerEm,
            ascender: ascender * fontSizeMult2,
            descender: descender * fontSizeMult2,
            capHeight: capHeight * fontSizeMult2,
            xHeight: xHeight * fontSizeMult2,
            lineHeight: calcLineHeight,
            baseline: -halfLeading - ascender * fontSizeMult2,
            // baseline offset from top of line height
            // cap: -halfLeading - capHeight * fontSizeMult, // cap from top of line height
            // ex: -halfLeading - xHeight * fontSizeMult, // ex from top of line height
            caretTop,
            caretBottom: caretTop - caretHeight
          };
          metricsByFont.set(fontObj, fontData2);
        }
        const { fontSizeMult } = fontData2;
        const runText = text.slice(run.start, run.end + 1);
        let prevGlyphX, prevGlyphObj;
        fontObj.forEachGlyph(runText, fontSize, letterSpacing, (glyphObj, glyphX, glyphY, charIndex) => {
          glyphX += prevRunEndX;
          charIndex += run.start;
          prevGlyphX = glyphX;
          prevGlyphObj = glyphObj;
          const char = text.charAt(charIndex);
          const glyphWidth = glyphObj.advanceWidth * fontSizeMult;
          const curLineCount = currentLine.count;
          let nextLine;
          if (!("isEmpty" in glyphObj)) {
            glyphObj.isWhitespace = !!char && new RegExp(lineBreakingWhiteSpace).test(char);
            glyphObj.canBreakAfter = !!char && BREAK_AFTER_CHARS.test(char);
            glyphObj.isEmpty = glyphObj.xMin === glyphObj.xMax || glyphObj.yMin === glyphObj.yMax || DEFAULT_IGNORABLE_CHARS.test(char);
          }
          if (!glyphObj.isWhitespace && !glyphObj.isEmpty) {
            renderableGlyphCount++;
          }
          if (canWrap && hasMaxWidth && !glyphObj.isWhitespace && glyphX + glyphWidth + lineXOffset > maxWidth && curLineCount) {
            if (currentLine.glyphAt(curLineCount - 1).glyphObj.canBreakAfter) {
              nextLine = new TextLine();
              lineXOffset = -glyphX;
            } else {
              for (let i = curLineCount; i--; ) {
                if (i === 0 && overflowWrap === "break-word") {
                  nextLine = new TextLine();
                  lineXOffset = -glyphX;
                  break;
                } else if (currentLine.glyphAt(i).glyphObj.canBreakAfter) {
                  nextLine = currentLine.splitAt(i + 1);
                  const adjustX = nextLine.glyphAt(0).x;
                  lineXOffset -= adjustX;
                  for (let j = nextLine.count; j--; ) {
                    nextLine.glyphAt(j).x -= adjustX;
                  }
                  break;
                }
              }
            }
            if (nextLine) {
              currentLine.isSoftWrapped = true;
              currentLine = nextLine;
              lines.push(currentLine);
              maxLineWidth = maxWidth;
            }
          }
          let fly = currentLine.glyphAt(currentLine.count);
          fly.glyphObj = glyphObj;
          fly.x = glyphX + lineXOffset;
          fly.y = glyphY;
          fly.width = glyphWidth;
          fly.charIndex = charIndex;
          fly.fontData = fontData2;
          if (char === "\n") {
            currentLine = new TextLine();
            lines.push(currentLine);
            lineXOffset = -(glyphX + glyphWidth + letterSpacing * fontSize) + textIndent;
          }
        });
        prevRunEndX = prevGlyphX + prevGlyphObj.advanceWidth * fontSizeMult + letterSpacing * fontSize;
      });
      let totalHeight = 0;
      lines.forEach((line) => {
        let isTrailingWhitespace = true;
        for (let i = line.count; i--; ) {
          const glyphInfo = line.glyphAt(i);
          if (isTrailingWhitespace && !glyphInfo.glyphObj.isWhitespace) {
            line.width = glyphInfo.x + glyphInfo.width;
            if (line.width > maxLineWidth) {
              maxLineWidth = line.width;
            }
            isTrailingWhitespace = false;
          }
          let { lineHeight: lineHeight2, capHeight, xHeight, baseline } = glyphInfo.fontData;
          if (lineHeight2 > line.lineHeight) line.lineHeight = lineHeight2;
          const baselineDiff = baseline - line.baseline;
          if (baselineDiff < 0) {
            line.baseline += baselineDiff;
            line.cap += baselineDiff;
            line.ex += baselineDiff;
          }
          line.cap = Math.max(line.cap, line.baseline + capHeight);
          line.ex = Math.max(line.ex, line.baseline + xHeight);
        }
        line.baseline -= totalHeight;
        line.cap -= totalHeight;
        line.ex -= totalHeight;
        totalHeight += line.lineHeight;
      });
      let anchorXOffset = 0;
      let anchorYOffset = 0;
      if (anchorX) {
        if (typeof anchorX === "number") {
          anchorXOffset = -anchorX;
        } else if (typeof anchorX === "string") {
          anchorXOffset = -maxLineWidth * (anchorX === "left" ? 0 : anchorX === "center" ? 0.5 : anchorX === "right" ? 1 : parsePercent(anchorX));
        }
      }
      if (anchorY) {
        if (typeof anchorY === "number") {
          anchorYOffset = -anchorY;
        } else if (typeof anchorY === "string") {
          anchorYOffset = anchorY === "top" ? 0 : anchorY === "top-baseline" ? -lines[0].baseline : anchorY === "top-cap" ? -lines[0].cap : anchorY === "top-ex" ? -lines[0].ex : anchorY === "middle" ? totalHeight / 2 : anchorY === "bottom" ? totalHeight : anchorY === "bottom-baseline" ? -lines[lines.length - 1].baseline : parsePercent(anchorY) * totalHeight;
        }
      }
      if (!metricsOnly) {
        const bidiLevelsResult = bidi.getEmbeddingLevels(text, direction);
        glyphIds = new Uint16Array(renderableGlyphCount);
        glyphFontIndices = new Uint8Array(renderableGlyphCount);
        glyphPositions = new Float32Array(renderableGlyphCount * 2);
        glyphData = {};
        visibleBounds = [INF, INF, -INF, -INF];
        chunkedBounds = [];
        if (includeCaretPositions) {
          caretPositions = new Float32Array(text.length * 4);
        }
        if (colorRanges) {
          glyphColors = new Uint8Array(renderableGlyphCount * 3);
        }
        let renderableGlyphIndex = 0;
        let prevCharIndex = -1;
        let colorCharIndex = -1;
        let chunk;
        let currentColor;
        lines.forEach((line, lineIndex) => {
          let { count: lineGlyphCount, width: lineWidth } = line;
          if (lineGlyphCount > 0) {
            let trailingWhitespaceCount = 0;
            for (let i = lineGlyphCount; i-- && line.glyphAt(i).glyphObj.isWhitespace; ) {
              trailingWhitespaceCount++;
            }
            let lineXOffset2 = 0;
            let justifyAdjust = 0;
            if (textAlign === "center") {
              lineXOffset2 = (maxLineWidth - lineWidth) / 2;
            } else if (textAlign === "right") {
              lineXOffset2 = maxLineWidth - lineWidth;
            } else if (textAlign === "justify" && line.isSoftWrapped) {
              let whitespaceCount = 0;
              for (let i = lineGlyphCount - trailingWhitespaceCount; i--; ) {
                if (line.glyphAt(i).glyphObj.isWhitespace) {
                  whitespaceCount++;
                }
              }
              justifyAdjust = (maxLineWidth - lineWidth) / whitespaceCount;
            }
            if (justifyAdjust || lineXOffset2) {
              let justifyOffset = 0;
              for (let i = 0; i < lineGlyphCount; i++) {
                let glyphInfo = line.glyphAt(i);
                const glyphObj2 = glyphInfo.glyphObj;
                glyphInfo.x += lineXOffset2 + justifyOffset;
                if (justifyAdjust !== 0 && glyphObj2.isWhitespace && i < lineGlyphCount - trailingWhitespaceCount) {
                  justifyOffset += justifyAdjust;
                  glyphInfo.width += justifyAdjust;
                }
              }
            }
            const flips = bidi.getReorderSegments(
              text,
              bidiLevelsResult,
              line.glyphAt(0).charIndex,
              line.glyphAt(line.count - 1).charIndex
            );
            for (let fi = 0; fi < flips.length; fi++) {
              const [start, end] = flips[fi];
              let left = Infinity, right = -Infinity;
              for (let i = 0; i < lineGlyphCount; i++) {
                if (line.glyphAt(i).charIndex >= start) {
                  let startInLine = i, endInLine = i;
                  for (; endInLine < lineGlyphCount; endInLine++) {
                    let info = line.glyphAt(endInLine);
                    if (info.charIndex > end) {
                      break;
                    }
                    if (endInLine < lineGlyphCount - trailingWhitespaceCount) {
                      left = Math.min(left, info.x);
                      right = Math.max(right, info.x + info.width);
                    }
                  }
                  for (let j = startInLine; j < endInLine; j++) {
                    const glyphInfo = line.glyphAt(j);
                    glyphInfo.x = right - (glyphInfo.x + glyphInfo.width - left);
                  }
                  break;
                }
              }
            }
            let glyphObj;
            const setGlyphObj = (g) => glyphObj = g;
            for (let i = 0; i < lineGlyphCount; i++) {
              const glyphInfo = line.glyphAt(i);
              glyphObj = glyphInfo.glyphObj;
              const glyphId = glyphObj.index;
              const rtl = bidiLevelsResult.levels[glyphInfo.charIndex] & 1;
              if (rtl) {
                const mirrored = bidi.getMirroredCharacter(text[glyphInfo.charIndex]);
                if (mirrored) {
                  glyphInfo.fontData.fontObj.forEachGlyph(mirrored, 0, 0, setGlyphObj);
                }
              }
              if (includeCaretPositions) {
                const { charIndex, fontData: fontData2 } = glyphInfo;
                const caretLeft = glyphInfo.x + anchorXOffset;
                const caretRight = glyphInfo.x + glyphInfo.width + anchorXOffset;
                caretPositions[charIndex * 4] = rtl ? caretRight : caretLeft;
                caretPositions[charIndex * 4 + 1] = rtl ? caretLeft : caretRight;
                caretPositions[charIndex * 4 + 2] = line.baseline + fontData2.caretBottom + anchorYOffset;
                caretPositions[charIndex * 4 + 3] = line.baseline + fontData2.caretTop + anchorYOffset;
                const ligCount = charIndex - prevCharIndex;
                if (ligCount > 1) {
                  fillLigatureCaretPositions(caretPositions, prevCharIndex, ligCount);
                }
                prevCharIndex = charIndex;
              }
              if (colorRanges) {
                const { charIndex } = glyphInfo;
                while (charIndex > colorCharIndex) {
                  colorCharIndex++;
                  if (colorRanges.hasOwnProperty(colorCharIndex)) {
                    currentColor = colorRanges[colorCharIndex];
                  }
                }
              }
              if (!glyphObj.isWhitespace && !glyphObj.isEmpty) {
                const idx = renderableGlyphIndex++;
                const { fontSizeMult, src: fontSrc, index: fontIndex } = glyphInfo.fontData;
                const fontGlyphData = glyphData[fontSrc] || (glyphData[fontSrc] = {});
                if (!fontGlyphData[glyphId]) {
                  fontGlyphData[glyphId] = {
                    path: glyphObj.path,
                    pathBounds: [glyphObj.xMin, glyphObj.yMin, glyphObj.xMax, glyphObj.yMax]
                  };
                }
                const glyphX = glyphInfo.x + anchorXOffset;
                const glyphY = glyphInfo.y + line.baseline + anchorYOffset;
                glyphPositions[idx * 2] = glyphX;
                glyphPositions[idx * 2 + 1] = glyphY;
                const visX0 = glyphX + glyphObj.xMin * fontSizeMult;
                const visY0 = glyphY + glyphObj.yMin * fontSizeMult;
                const visX1 = glyphX + glyphObj.xMax * fontSizeMult;
                const visY1 = glyphY + glyphObj.yMax * fontSizeMult;
                if (visX0 < visibleBounds[0]) visibleBounds[0] = visX0;
                if (visY0 < visibleBounds[1]) visibleBounds[1] = visY0;
                if (visX1 > visibleBounds[2]) visibleBounds[2] = visX1;
                if (visY1 > visibleBounds[3]) visibleBounds[3] = visY1;
                if (idx % chunkedBoundsSize === 0) {
                  chunk = { start: idx, end: idx, rect: [INF, INF, -INF, -INF] };
                  chunkedBounds.push(chunk);
                }
                chunk.end++;
                const chunkRect = chunk.rect;
                if (visX0 < chunkRect[0]) chunkRect[0] = visX0;
                if (visY0 < chunkRect[1]) chunkRect[1] = visY0;
                if (visX1 > chunkRect[2]) chunkRect[2] = visX1;
                if (visY1 > chunkRect[3]) chunkRect[3] = visY1;
                glyphIds[idx] = glyphId;
                glyphFontIndices[idx] = fontIndex;
                if (colorRanges) {
                  const start = idx * 3;
                  glyphColors[start] = currentColor >> 16 & 255;
                  glyphColors[start + 1] = currentColor >> 8 & 255;
                  glyphColors[start + 2] = currentColor & 255;
                }
              }
            }
          }
        });
        if (caretPositions) {
          const ligCount = text.length - prevCharIndex;
          if (ligCount > 1) {
            fillLigatureCaretPositions(caretPositions, prevCharIndex, ligCount);
          }
        }
      }
      const fontData = [];
      metricsByFont.forEach(({ index, src, unitsPerEm, ascender, descender, lineHeight: lineHeight2, capHeight, xHeight }) => {
        fontData[index] = { src, unitsPerEm, ascender, descender, lineHeight: lineHeight2, capHeight, xHeight };
      });
      timings.typesetting = now2() - typesetStart;
      callback({
        glyphIds,
        //id for each glyph, specific to that glyph's font
        glyphFontIndices,
        //index into fontData for each glyph
        glyphPositions,
        //x,y of each glyph's origin in layout
        glyphData,
        //dict holding data about each glyph appearing in the text
        fontData,
        //data about each font used in the text
        caretPositions,
        //startX,endX,bottomY caret positions for each char
        // caretHeight, //height of cursor from bottom to top - todo per glyph?
        glyphColors,
        //color for each glyph, if color ranges supplied
        chunkedBounds,
        //total rects per (n=chunkedBoundsSize) consecutive glyphs
        fontSize,
        //calculated em height
        topBaseline: anchorYOffset + lines[0].baseline,
        //y coordinate of the top line's baseline
        blockBounds: [
          //bounds for the whole block of text, including vertical padding for lineHeight
          anchorXOffset,
          anchorYOffset - totalHeight,
          anchorXOffset + maxLineWidth,
          anchorYOffset
        ],
        visibleBounds,
        //total bounds of visible text paths, may be larger or smaller than blockBounds
        timings
      });
    });
  }
  function measure(args, callback) {
    typeset({ ...args, metricsOnly: true }, (result) => {
      const [x0, y0, x1, y1] = result.blockBounds;
      callback({
        width: x1 - x0,
        height: y1 - y0
      });
    });
  }
  function parsePercent(str) {
    let match = str.match(/^([\d.]+)%$/);
    let pct = match ? parseFloat(match[1]) : NaN;
    return isNaN(pct) ? 0 : pct / 100;
  }
  function fillLigatureCaretPositions(caretPositions, ligStartIndex, ligCount) {
    const ligStartX = caretPositions[ligStartIndex * 4];
    const ligEndX = caretPositions[ligStartIndex * 4 + 1];
    const ligBottom = caretPositions[ligStartIndex * 4 + 2];
    const ligTop = caretPositions[ligStartIndex * 4 + 3];
    const guessedAdvanceX = (ligEndX - ligStartX) / ligCount;
    for (let i = 0; i < ligCount; i++) {
      const startIndex = (ligStartIndex + i) * 4;
      caretPositions[startIndex] = ligStartX + guessedAdvanceX * i;
      caretPositions[startIndex + 1] = ligStartX + guessedAdvanceX * (i + 1);
      caretPositions[startIndex + 2] = ligBottom;
      caretPositions[startIndex + 3] = ligTop;
    }
  }
  function now2() {
    return (self.performance || Date).now();
  }
  function TextLine() {
    this.data = [];
  }
  const textLineProps = ["glyphObj", "x", "y", "width", "charIndex", "fontData"];
  TextLine.prototype = {
    width: 0,
    lineHeight: 0,
    baseline: 0,
    cap: 0,
    ex: 0,
    isSoftWrapped: false,
    get count() {
      return Math.ceil(this.data.length / textLineProps.length);
    },
    glyphAt(i) {
      let fly = TextLine.flyweight;
      fly.data = this.data;
      fly.index = i;
      return fly;
    },
    splitAt(i) {
      let newLine = new TextLine();
      newLine.data = this.data.splice(i * textLineProps.length);
      return newLine;
    }
  };
  TextLine.flyweight = textLineProps.reduce((obj, prop, i, all) => {
    Object.defineProperty(obj, prop, {
      get() {
        return this.data[this.index * textLineProps.length + i];
      },
      set(val) {
        this.data[this.index * textLineProps.length + i] = val;
      }
    });
    return obj;
  }, { data: null, index: 0 });
  return {
    typeset,
    measure
  };
}
var now = () => (self.performance || Date).now();
var mainThreadGenerator = SDFGenerator();
var warned;
function generateSDF(width, height, path, viewBox, distance, exponent, canvas, x, y, channel, useWebGL = true) {
  if (!useWebGL) {
    return generateSDF_JS_Worker(width, height, path, viewBox, distance, exponent, canvas, x, y, channel);
  }
  return generateSDF_GL(width, height, path, viewBox, distance, exponent, canvas, x, y, channel).then(
    null,
    (err) => {
      if (!warned) {
        console.warn(`WebGL SDF generation failed, falling back to JS`, err);
        warned = true;
      }
      return generateSDF_JS_Worker(width, height, path, viewBox, distance, exponent, canvas, x, y, channel);
    }
  );
}
var queue = [];
var chunkTimeBudget = 5;
var timer = 0;
function nextChunk() {
  const start = now();
  while (queue.length && now() - start < chunkTimeBudget) {
    queue.shift()();
  }
  timer = queue.length ? setTimeout(nextChunk, 0) : 0;
}
var generateSDF_GL = (...args) => {
  return new Promise((resolve, reject) => {
    queue.push(() => {
      const start = now();
      try {
        mainThreadGenerator.webgl.generateIntoCanvas(...args);
        resolve({ timing: now() - start });
      } catch (err) {
        reject(err);
      }
    });
    if (!timer) {
      timer = setTimeout(nextChunk, 0);
    }
  });
};
var threadCount = 4;
var idleTimeout = 2e3;
var threads = {};
var callNum = 0;
function generateSDF_JS_Worker(width, height, path, viewBox, distance, exponent, canvas, x, y, channel) {
  const workerId = "TroikaTextSDFGenerator_JS_" + callNum++ % threadCount;
  let thread = threads[workerId];
  if (!thread) {
    thread = threads[workerId] = {
      workerModule: defineWorkerModule({
        name: workerId,
        workerId,
        dependencies: [
          SDFGenerator,
          now
        ],
        init(_createSDFGenerator, now2) {
          const generate = _createSDFGenerator().javascript.generate;
          return function(...args) {
            const start = now2();
            const textureData = generate(...args);
            return {
              textureData,
              timing: now2() - start
            };
          };
        },
        getTransferables(result) {
          return [result.textureData.buffer];
        }
      }),
      requests: 0,
      idleTimer: null
    };
  }
  thread.requests++;
  clearTimeout(thread.idleTimer);
  return thread.workerModule(width, height, path, viewBox, distance, exponent).then(({ textureData, timing }) => {
    const start = now();
    const imageData = new Uint8Array(textureData.length * 4);
    for (let i = 0; i < textureData.length; i++) {
      imageData[i * 4 + channel] = textureData[i];
    }
    mainThreadGenerator.webglUtils.renderImageData(canvas, imageData, x, y, width, height, 1 << 3 - channel);
    timing += now() - start;
    if (--thread.requests === 0) {
      thread.idleTimer = setTimeout(() => {
        terminateWorker(workerId);
      }, idleTimeout);
    }
    return { timing };
  });
}
function warmUpSDFCanvas(canvas) {
  if (!canvas._warm) {
    mainThreadGenerator.webgl.isSupported(canvas);
    canvas._warm = true;
  }
}
var resizeWebGLCanvasWithoutClearing = mainThreadGenerator.webglUtils.resizeWebGLCanvasWithoutClearing;
var CONFIG = {
  defaultFontURL: null,
  unicodeFontsURL: null,
  sdfGlyphSize: 64,
  sdfMargin: 1 / 16,
  sdfExponent: 9,
  textureWidth: 2048,
  useWorker: true
};
var tempColor = new Color();
var hasRequested = false;
function now$1() {
  return (self.performance || Date).now();
}
function configureTextBuilder(config) {
  if (hasRequested) {
    console.warn("configureTextBuilder called after first font request; will be ignored.");
  } else {
    assign2(CONFIG, config);
  }
}
var atlases = /* @__PURE__ */ Object.create(null);
function getTextRenderInfo(args, callback) {
  hasRequested = true;
  args = assign2({}, args);
  const totalStart = now$1();
  const { defaultFontURL } = CONFIG;
  const fonts = [];
  if (defaultFontURL) {
    fonts.push({ label: "default", src: toAbsoluteURL(defaultFontURL) });
  }
  if (args.font) {
    fonts.push({ label: "user", src: toAbsoluteURL(args.font) });
  }
  args.font = fonts;
  args.text = "" + args.text;
  args.sdfGlyphSize = args.sdfGlyphSize || CONFIG.sdfGlyphSize;
  args.unicodeFontsURL = args.unicodeFontsURL || CONFIG.unicodeFontsURL;
  if (args.colorRanges != null) {
    let colors = {};
    for (let key in args.colorRanges) {
      if (args.colorRanges.hasOwnProperty(key)) {
        let val = args.colorRanges[key];
        if (typeof val !== "number") {
          val = tempColor.set(val).getHex();
        }
        colors[key] = val;
      }
    }
    args.colorRanges = colors;
  }
  Object.freeze(args);
  const { textureWidth, sdfExponent } = CONFIG;
  const { sdfGlyphSize } = args;
  const glyphsPerRow = textureWidth / sdfGlyphSize * 4;
  let atlas = atlases[sdfGlyphSize];
  if (!atlas) {
    const canvas = document.createElement("canvas");
    canvas.width = textureWidth;
    canvas.height = sdfGlyphSize * 256 / glyphsPerRow;
    atlas = atlases[sdfGlyphSize] = {
      glyphCount: 0,
      sdfGlyphSize,
      sdfCanvas: canvas,
      sdfTexture: new Texture(
        canvas,
        void 0,
        void 0,
        void 0,
        LinearFilter,
        LinearFilter
      ),
      contextLost: false,
      glyphsByFont: /* @__PURE__ */ new Map()
    };
    atlas.sdfTexture.generateMipmaps = false;
    initContextLossHandling(atlas);
  }
  const { sdfTexture, sdfCanvas } = atlas;
  const typeset = CONFIG.useWorker ? typesetInWorker : typesetOnMainThread;
  typeset(args).then((result) => {
    const { glyphIds, glyphFontIndices, fontData, glyphPositions, fontSize, timings } = result;
    const neededSDFs = [];
    const glyphBounds = new Float32Array(glyphIds.length * 4);
    let boundsIdx = 0;
    let positionsIdx = 0;
    const quadsStart = now$1();
    const fontGlyphMaps = fontData.map((font) => {
      let map = atlas.glyphsByFont.get(font.src);
      if (!map) {
        atlas.glyphsByFont.set(font.src, map = /* @__PURE__ */ new Map());
      }
      return map;
    });
    glyphIds.forEach((glyphId, i) => {
      const fontIndex = glyphFontIndices[i];
      const { src: fontSrc, unitsPerEm } = fontData[fontIndex];
      let glyphInfo = fontGlyphMaps[fontIndex].get(glyphId);
      if (!glyphInfo) {
        const { path, pathBounds } = result.glyphData[fontSrc][glyphId];
        const fontUnitsMargin = Math.max(pathBounds[2] - pathBounds[0], pathBounds[3] - pathBounds[1]) / sdfGlyphSize * (CONFIG.sdfMargin * sdfGlyphSize + 0.5);
        const atlasIndex = atlas.glyphCount++;
        const sdfViewBox2 = [
          pathBounds[0] - fontUnitsMargin,
          pathBounds[1] - fontUnitsMargin,
          pathBounds[2] + fontUnitsMargin,
          pathBounds[3] + fontUnitsMargin
        ];
        fontGlyphMaps[fontIndex].set(glyphId, glyphInfo = { path, atlasIndex, sdfViewBox: sdfViewBox2 });
        neededSDFs.push(glyphInfo);
      }
      const { sdfViewBox } = glyphInfo;
      const posX = glyphPositions[positionsIdx++];
      const posY = glyphPositions[positionsIdx++];
      const fontSizeMult = fontSize / unitsPerEm;
      glyphBounds[boundsIdx++] = posX + sdfViewBox[0] * fontSizeMult;
      glyphBounds[boundsIdx++] = posY + sdfViewBox[1] * fontSizeMult;
      glyphBounds[boundsIdx++] = posX + sdfViewBox[2] * fontSizeMult;
      glyphBounds[boundsIdx++] = posY + sdfViewBox[3] * fontSizeMult;
      glyphIds[i] = glyphInfo.atlasIndex;
    });
    timings.quads = (timings.quads || 0) + (now$1() - quadsStart);
    const sdfStart = now$1();
    timings.sdf = {};
    const currentHeight = sdfCanvas.height;
    const neededRows = Math.ceil(atlas.glyphCount / glyphsPerRow);
    const neededHeight = Math.pow(2, Math.ceil(Math.log2(neededRows * sdfGlyphSize)));
    if (neededHeight > currentHeight) {
      console.info(`Increasing SDF texture size ${currentHeight}->${neededHeight}`);
      resizeWebGLCanvasWithoutClearing(sdfCanvas, textureWidth, neededHeight);
      sdfTexture.dispose();
    }
    Promise.all(neededSDFs.map(
      (glyphInfo) => generateGlyphSDF(glyphInfo, atlas, args.gpuAccelerateSDF).then(({ timing }) => {
        timings.sdf[glyphInfo.atlasIndex] = timing;
      })
    )).then(() => {
      if (neededSDFs.length && !atlas.contextLost) {
        safariPre15Workaround(atlas);
        sdfTexture.needsUpdate = true;
      }
      timings.sdfTotal = now$1() - sdfStart;
      timings.total = now$1() - totalStart;
      callback(Object.freeze({
        parameters: args,
        sdfTexture,
        sdfGlyphSize,
        sdfExponent,
        glyphBounds,
        glyphAtlasIndices: glyphIds,
        glyphColors: result.glyphColors,
        caretPositions: result.caretPositions,
        chunkedBounds: result.chunkedBounds,
        ascender: result.ascender,
        descender: result.descender,
        lineHeight: result.lineHeight,
        capHeight: result.capHeight,
        xHeight: result.xHeight,
        topBaseline: result.topBaseline,
        blockBounds: result.blockBounds,
        visibleBounds: result.visibleBounds,
        timings: result.timings
      }));
    });
  });
  Promise.resolve().then(() => {
    if (!atlas.contextLost) {
      warmUpSDFCanvas(sdfCanvas);
    }
  });
}
function generateGlyphSDF({ path, atlasIndex, sdfViewBox }, { sdfGlyphSize, sdfCanvas, contextLost }, useGPU) {
  if (contextLost) {
    return Promise.resolve({ timing: -1 });
  }
  const { textureWidth, sdfExponent } = CONFIG;
  const maxDist = Math.max(sdfViewBox[2] - sdfViewBox[0], sdfViewBox[3] - sdfViewBox[1]);
  const squareIndex = Math.floor(atlasIndex / 4);
  const x = squareIndex % (textureWidth / sdfGlyphSize) * sdfGlyphSize;
  const y = Math.floor(squareIndex / (textureWidth / sdfGlyphSize)) * sdfGlyphSize;
  const channel = atlasIndex % 4;
  return generateSDF(sdfGlyphSize, sdfGlyphSize, path, sdfViewBox, maxDist, sdfExponent, sdfCanvas, x, y, channel, useGPU);
}
function initContextLossHandling(atlas) {
  const canvas = atlas.sdfCanvas;
  canvas.addEventListener("webglcontextlost", (event) => {
    console.log("Context Lost", event);
    event.preventDefault();
    atlas.contextLost = true;
  });
  canvas.addEventListener("webglcontextrestored", (event) => {
    console.log("Context Restored", event);
    atlas.contextLost = false;
    const promises = [];
    atlas.glyphsByFont.forEach((glyphMap) => {
      glyphMap.forEach((glyph) => {
        promises.push(generateGlyphSDF(glyph, atlas, true));
      });
    });
    Promise.all(promises).then(() => {
      safariPre15Workaround(atlas);
      atlas.sdfTexture.needsUpdate = true;
    });
  });
}
function preloadFont({ font, characters, sdfGlyphSize }, callback) {
  let text = Array.isArray(characters) ? characters.join("\n") : "" + characters;
  getTextRenderInfo({ font, sdfGlyphSize, text }, callback);
}
function assign2(toObj, fromObj) {
  for (let key in fromObj) {
    if (fromObj.hasOwnProperty(key)) {
      toObj[key] = fromObj[key];
    }
  }
  return toObj;
}
var linkEl;
function toAbsoluteURL(path) {
  if (!linkEl) {
    linkEl = typeof document === "undefined" ? {} : document.createElement("a");
  }
  linkEl.href = path;
  return linkEl.href;
}
function safariPre15Workaround(atlas) {
  if (typeof createImageBitmap !== "function") {
    console.info("Safari<15: applying SDF canvas workaround");
    const { sdfCanvas, sdfTexture } = atlas;
    const { width, height } = sdfCanvas;
    const gl = atlas.sdfCanvas.getContext("webgl");
    let pixels = sdfTexture.image.data;
    if (!pixels || pixels.length !== width * height * 4) {
      pixels = new Uint8Array(width * height * 4);
      sdfTexture.image = { width, height, data: pixels };
      sdfTexture.flipY = false;
      sdfTexture.isDataTexture = true;
    }
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  }
}
var typesetterWorkerModule = defineWorkerModule({
  name: "Typesetter",
  dependencies: [
    createTypesetter,
    fontResolverWorkerModule,
    bidi_default
  ],
  init(createTypesetter2, fontResolver, bidiFactory2) {
    return createTypesetter2(fontResolver, bidiFactory2());
  }
});
var typesetInWorker = defineWorkerModule({
  name: "Typesetter",
  dependencies: [
    typesetterWorkerModule
  ],
  init(typesetter) {
    return function(args) {
      return new Promise((resolve) => {
        typesetter.typeset(args, resolve);
      });
    };
  },
  getTransferables(result) {
    const transferables = [];
    for (let p in result) {
      if (result[p] && result[p].buffer) {
        transferables.push(result[p].buffer);
      }
    }
    return transferables;
  }
});
var typesetOnMainThread = typesetInWorker.onMainThread;
function dumpSDFTextures() {
  Object.keys(atlases).forEach((size) => {
    const canvas = atlases[size].sdfCanvas;
    const { width, height } = canvas;
    console.log("%c.", `
      background: url(${canvas.toDataURL()});
      background-size: ${width}px ${height}px;
      color: transparent;
      font-size: 0;
      line-height: ${height}px;
      padding-left: ${width}px;
    `);
  });
}
var templateGeometries = {};
function getTemplateGeometry(detail) {
  let geom = templateGeometries[detail];
  if (!geom) {
    geom = templateGeometries[detail] = new PlaneGeometry(1, 1, detail, detail).translate(0.5, 0.5, 0);
  }
  return geom;
}
var glyphBoundsAttrName = "aTroikaGlyphBounds";
var glyphIndexAttrName = "aTroikaGlyphIndex";
var glyphColorAttrName = "aTroikaGlyphColor";
var GlyphsGeometry = class extends InstancedBufferGeometry {
  constructor() {
    super();
    this.detail = 1;
    this.curveRadius = 0;
    this.groups = [
      { start: 0, count: Infinity, materialIndex: 0 },
      { start: 0, count: Infinity, materialIndex: 1 }
    ];
    this.boundingSphere = new Sphere();
    this.boundingBox = new Box3();
  }
  computeBoundingSphere() {
  }
  computeBoundingBox() {
  }
  set detail(detail) {
    if (detail !== this._detail) {
      this._detail = detail;
      if (typeof detail !== "number" || detail < 1) {
        detail = 1;
      }
      let tpl = getTemplateGeometry(detail);
      ["position", "normal", "uv"].forEach((attr) => {
        this.attributes[attr] = tpl.attributes[attr].clone();
      });
      this.setIndex(tpl.getIndex().clone());
    }
  }
  get detail() {
    return this._detail;
  }
  set curveRadius(r) {
    if (r !== this._curveRadius) {
      this._curveRadius = r;
      this._updateBounds();
    }
  }
  get curveRadius() {
    return this._curveRadius;
  }
  /**
   * Update the geometry for a new set of glyphs.
   * @param {Float32Array} glyphBounds - An array holding the planar bounds for all glyphs
   *        to be rendered, 4 entries for each glyph: x1,x2,y1,y1
   * @param {Float32Array} glyphAtlasIndices - An array holding the index of each glyph within
   *        the SDF atlas texture.
   * @param {Array} blockBounds - An array holding the [minX, minY, maxX, maxY] across all glyphs
   * @param {Array} [chunkedBounds] - An array of objects describing bounds for each chunk of N
   *        consecutive glyphs: `{start:N, end:N, rect:[minX, minY, maxX, maxY]}`. This can be
   *        used with `applyClipRect` to choose an optimized `instanceCount`.
   * @param {Uint8Array} [glyphColors] - An array holding r,g,b values for each glyph.
   */
  updateGlyphs(glyphBounds, glyphAtlasIndices, blockBounds, chunkedBounds, glyphColors) {
    this.updateAttributeData(glyphBoundsAttrName, glyphBounds, 4);
    this.updateAttributeData(glyphIndexAttrName, glyphAtlasIndices, 1);
    this.updateAttributeData(glyphColorAttrName, glyphColors, 3);
    this._blockBounds = blockBounds;
    this._chunkedBounds = chunkedBounds;
    this.instanceCount = glyphAtlasIndices.length;
    this._updateBounds();
  }
  _updateBounds() {
    const bounds = this._blockBounds;
    if (bounds) {
      const { curveRadius, boundingBox: bbox } = this;
      if (curveRadius) {
        const { PI, floor, min, max, sin, cos } = Math;
        const halfPi = PI / 2;
        const twoPi = PI * 2;
        const absR = Math.abs(curveRadius);
        const leftAngle = bounds[0] / absR;
        const rightAngle = bounds[2] / absR;
        const minX = floor((leftAngle + halfPi) / twoPi) !== floor((rightAngle + halfPi) / twoPi) ? -absR : min(sin(leftAngle) * absR, sin(rightAngle) * absR);
        const maxX = floor((leftAngle - halfPi) / twoPi) !== floor((rightAngle - halfPi) / twoPi) ? absR : max(sin(leftAngle) * absR, sin(rightAngle) * absR);
        const maxZ = floor((leftAngle + PI) / twoPi) !== floor((rightAngle + PI) / twoPi) ? absR * 2 : max(absR - cos(leftAngle) * absR, absR - cos(rightAngle) * absR);
        bbox.min.set(minX, bounds[1], curveRadius < 0 ? -maxZ : 0);
        bbox.max.set(maxX, bounds[3], curveRadius < 0 ? 0 : maxZ);
      } else {
        bbox.min.set(bounds[0], bounds[1], 0);
        bbox.max.set(bounds[2], bounds[3], 0);
      }
      bbox.getBoundingSphere(this.boundingSphere);
    }
  }
  /**
   * Given a clipping rect, and the chunkedBounds from the last updateGlyphs call, choose the lowest
   * `instanceCount` that will show all glyphs within the clipped view. This is an optimization
   * for long blocks of text that are clipped, to skip vertex shader evaluation for glyphs that would
   * be clipped anyway.
   *
   * Note that since `drawElementsInstanced[ANGLE]` only accepts an instance count and not a starting
   * offset, this optimization becomes less effective as the clipRect moves closer to the end of the
   * text block. We could fix that by switching from instancing to a full geometry with a drawRange,
   * but at the expense of much larger attribute buffers (see classdoc above.)
   *
   * @param {Vector4} clipRect
   */
  applyClipRect(clipRect) {
    let count = this.getAttribute(glyphIndexAttrName).count;
    let chunks = this._chunkedBounds;
    if (chunks) {
      for (let i = chunks.length; i--; ) {
        count = chunks[i].end;
        let rect = chunks[i].rect;
        if (rect[1] < clipRect.w && rect[3] > clipRect.y && rect[0] < clipRect.z && rect[2] > clipRect.x) {
          break;
        }
      }
    }
    this.instanceCount = count;
  }
  /**
   * Utility for updating instance attributes with automatic resizing
   */
  updateAttributeData(attrName, newArray, itemSize) {
    const attr = this.getAttribute(attrName);
    if (newArray) {
      if (attr && attr.array.length === newArray.length) {
        attr.array.set(newArray);
        attr.needsUpdate = true;
      } else {
        this.setAttribute(attrName, new InstancedBufferAttribute(newArray, itemSize));
        delete this._maxInstanceCount;
        this.dispose();
      }
    } else if (attr) {
      this.deleteAttribute(attrName);
    }
  }
};
var VERTEX_DEFS = `
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform vec4 uTroikaTotalBounds;
uniform vec4 uTroikaClipRect;
uniform mat3 uTroikaOrient;
uniform bool uTroikaUseGlyphColors;
uniform float uTroikaEdgeOffset;
uniform float uTroikaBlurRadius;
uniform vec2 uTroikaPositionOffset;
uniform float uTroikaCurveRadius;
attribute vec4 aTroikaGlyphBounds;
attribute float aTroikaGlyphIndex;
attribute vec3 aTroikaGlyphColor;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec3 vTroikaGlyphColor;
varying vec2 vTroikaGlyphDimensions;
`;
var VERTEX_TRANSFORM = `
vec4 bounds = aTroikaGlyphBounds;
bounds.xz += uTroikaPositionOffset.x;
bounds.yw -= uTroikaPositionOffset.y;

vec4 outlineBounds = vec4(
  bounds.xy - uTroikaEdgeOffset - uTroikaBlurRadius,
  bounds.zw + uTroikaEdgeOffset + uTroikaBlurRadius
);
vec4 clippedBounds = vec4(
  clamp(outlineBounds.xy, uTroikaClipRect.xy, uTroikaClipRect.zw),
  clamp(outlineBounds.zw, uTroikaClipRect.xy, uTroikaClipRect.zw)
);

vec2 clippedXY = (mix(clippedBounds.xy, clippedBounds.zw, position.xy) - bounds.xy) / (bounds.zw - bounds.xy);

position.xy = mix(bounds.xy, bounds.zw, clippedXY);

uv = (position.xy - uTroikaTotalBounds.xy) / (uTroikaTotalBounds.zw - uTroikaTotalBounds.xy);

float rad = uTroikaCurveRadius;
if (rad != 0.0) {
  float angle = position.x / rad;
  position.xz = vec2(sin(angle) * rad, rad - cos(angle) * rad);
  normal.xz = vec2(sin(angle), cos(angle));
}
  
position = uTroikaOrient * position;
normal = uTroikaOrient * normal;

vTroikaGlyphUV = clippedXY.xy;
vTroikaGlyphDimensions = vec2(bounds[2] - bounds[0], bounds[3] - bounds[1]);

${""}
float txCols = uTroikaSDFTextureSize.x / uTroikaSDFGlyphSize;
vec2 txUvPerSquare = uTroikaSDFGlyphSize / uTroikaSDFTextureSize;
vec2 txStartUV = txUvPerSquare * vec2(
  mod(floor(aTroikaGlyphIndex / 4.0), txCols),
  floor(floor(aTroikaGlyphIndex / 4.0) / txCols)
);
vTroikaTextureUVBounds = vec4(txStartUV, vec2(txStartUV) + txUvPerSquare);
vTroikaTextureChannel = mod(aTroikaGlyphIndex, 4.0);
`;
var FRAGMENT_DEFS = `
uniform sampler2D uTroikaSDFTexture;
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform float uTroikaSDFExponent;
uniform float uTroikaEdgeOffset;
uniform float uTroikaFillOpacity;
uniform float uTroikaBlurRadius;
uniform vec3 uTroikaStrokeColor;
uniform float uTroikaStrokeWidth;
uniform float uTroikaStrokeOpacity;
uniform bool uTroikaSDFDebug;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec2 vTroikaGlyphDimensions;

float troikaSdfValueToSignedDistance(float alpha) {
  // Inverse of exponential encoding in webgl-sdf-generator
  ${""}
  float maxDimension = max(vTroikaGlyphDimensions.x, vTroikaGlyphDimensions.y);
  float absDist = (1.0 - pow(2.0 * (alpha > 0.5 ? 1.0 - alpha : alpha), 1.0 / uTroikaSDFExponent)) * maxDimension;
  float signedDist = absDist * (alpha > 0.5 ? -1.0 : 1.0);
  return signedDist;
}

float troikaGlyphUvToSdfValue(vec2 glyphUV) {
  vec2 textureUV = mix(vTroikaTextureUVBounds.xy, vTroikaTextureUVBounds.zw, glyphUV);
  vec4 rgba = texture2D(uTroikaSDFTexture, textureUV);
  float ch = floor(vTroikaTextureChannel + 0.5); //NOTE: can't use round() in WebGL1
  return ch == 0.0 ? rgba.r : ch == 1.0 ? rgba.g : ch == 2.0 ? rgba.b : rgba.a;
}

float troikaGlyphUvToDistance(vec2 uv) {
  return troikaSdfValueToSignedDistance(troikaGlyphUvToSdfValue(uv));
}

float troikaGetAADist() {
  ${""}
  #if defined(GL_OES_standard_derivatives) || __VERSION__ >= 300
  return length(fwidth(vTroikaGlyphUV * vTroikaGlyphDimensions)) * 0.5;
  #else
  return vTroikaGlyphDimensions.x / 64.0;
  #endif
}

float troikaGetFragDistValue() {
  vec2 clampedGlyphUV = clamp(vTroikaGlyphUV, 0.5 / uTroikaSDFGlyphSize, 1.0 - 0.5 / uTroikaSDFGlyphSize);
  float distance = troikaGlyphUvToDistance(clampedGlyphUV);
 
  // Extrapolate distance when outside bounds:
  distance += clampedGlyphUV == vTroikaGlyphUV ? 0.0 : 
    length((vTroikaGlyphUV - clampedGlyphUV) * vTroikaGlyphDimensions);

  ${""}

  return distance;
}

float troikaGetEdgeAlpha(float distance, float distanceOffset, float aaDist) {
  #if defined(IS_DEPTH_MATERIAL) || defined(IS_DISTANCE_MATERIAL)
  float alpha = step(-distanceOffset, -distance);
  #else

  float alpha = smoothstep(
    distanceOffset + aaDist,
    distanceOffset - aaDist,
    distance
  );
  #endif

  return alpha;
}
`;
var FRAGMENT_TRANSFORM = `
float aaDist = troikaGetAADist();
float fragDistance = troikaGetFragDistValue();
float edgeAlpha = uTroikaSDFDebug ?
  troikaGlyphUvToSdfValue(vTroikaGlyphUV) :
  troikaGetEdgeAlpha(fragDistance, uTroikaEdgeOffset, max(aaDist, uTroikaBlurRadius));

#if !defined(IS_DEPTH_MATERIAL) && !defined(IS_DISTANCE_MATERIAL)
vec4 fillRGBA = gl_FragColor;
fillRGBA.a *= uTroikaFillOpacity;
vec4 strokeRGBA = uTroikaStrokeWidth == 0.0 ? fillRGBA : vec4(uTroikaStrokeColor, uTroikaStrokeOpacity);
if (fillRGBA.a == 0.0) fillRGBA.rgb = strokeRGBA.rgb;
gl_FragColor = mix(fillRGBA, strokeRGBA, smoothstep(
  -uTroikaStrokeWidth - aaDist,
  -uTroikaStrokeWidth + aaDist,
  fragDistance
));
gl_FragColor.a *= edgeAlpha;
#endif

if (edgeAlpha == 0.0) {
  discard;
}
`;
function createTextDerivedMaterial(baseMaterial) {
  const textMaterial = createDerivedMaterial(baseMaterial, {
    chained: true,
    extensions: {
      derivatives: true
    },
    uniforms: {
      uTroikaSDFTexture: { value: null },
      uTroikaSDFTextureSize: { value: new Vector2() },
      uTroikaSDFGlyphSize: { value: 0 },
      uTroikaSDFExponent: { value: 0 },
      uTroikaTotalBounds: { value: new Vector4(0, 0, 0, 0) },
      uTroikaClipRect: { value: new Vector4(0, 0, 0, 0) },
      uTroikaEdgeOffset: { value: 0 },
      uTroikaFillOpacity: { value: 1 },
      uTroikaPositionOffset: { value: new Vector2() },
      uTroikaCurveRadius: { value: 0 },
      uTroikaBlurRadius: { value: 0 },
      uTroikaStrokeWidth: { value: 0 },
      uTroikaStrokeColor: { value: new Color() },
      uTroikaStrokeOpacity: { value: 1 },
      uTroikaOrient: { value: new Matrix3() },
      uTroikaUseGlyphColors: { value: true },
      uTroikaSDFDebug: { value: false }
    },
    vertexDefs: VERTEX_DEFS,
    vertexTransform: VERTEX_TRANSFORM,
    fragmentDefs: FRAGMENT_DEFS,
    fragmentColorTransform: FRAGMENT_TRANSFORM,
    customRewriter({ vertexShader, fragmentShader }) {
      let uDiffuseRE = /\buniform\s+vec3\s+diffuse\b/;
      if (uDiffuseRE.test(fragmentShader)) {
        fragmentShader = fragmentShader.replace(uDiffuseRE, "varying vec3 vTroikaGlyphColor").replace(/\bdiffuse\b/g, "vTroikaGlyphColor");
        if (!uDiffuseRE.test(vertexShader)) {
          vertexShader = vertexShader.replace(
            voidMainRegExp,
            "uniform vec3 diffuse;\n$&\nvTroikaGlyphColor = uTroikaUseGlyphColors ? aTroikaGlyphColor / 255.0 : diffuse;\n"
          );
        }
      }
      return { vertexShader, fragmentShader };
    }
  });
  textMaterial.transparent = true;
  textMaterial.forceSinglePass = true;
  Object.defineProperties(textMaterial, {
    isTroikaTextMaterial: { value: true },
    // WebGLShadowMap reverses the side of the shadow material by default, which fails
    // for planes, so here we force the `shadowSide` to always match the main side.
    shadowSide: {
      get() {
        return this.side;
      },
      set() {
      }
    }
  });
  return textMaterial;
}
var defaultMaterial = new MeshBasicMaterial({
  color: 16777215,
  side: DoubleSide,
  transparent: true
});
var defaultStrokeColor = 8421504;
var tempMat4 = new Matrix4();
var tempVec3a = new Vector3();
var tempVec3b = new Vector3();
var tempArray = [];
var origin = new Vector3();
var defaultOrient = "+x+y";
function first(o) {
  return Array.isArray(o) ? o[0] : o;
}
var getFlatRaycastMesh = () => {
  const mesh = new Mesh(
    new PlaneGeometry(1, 1),
    defaultMaterial
  );
  getFlatRaycastMesh = () => mesh;
  return mesh;
};
var getCurvedRaycastMesh = () => {
  const mesh = new Mesh(
    new PlaneGeometry(1, 1, 32, 1),
    defaultMaterial
  );
  getCurvedRaycastMesh = () => mesh;
  return mesh;
};
var syncStartEvent = { type: "syncstart" };
var syncCompleteEvent = { type: "synccomplete" };
var SYNCABLE_PROPS = [
  "font",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "lang",
  "letterSpacing",
  "lineHeight",
  "maxWidth",
  "overflowWrap",
  "text",
  "direction",
  "textAlign",
  "textIndent",
  "whiteSpace",
  "anchorX",
  "anchorY",
  "colorRanges",
  "sdfGlyphSize"
];
var COPYABLE_PROPS = SYNCABLE_PROPS.concat(
  "material",
  "color",
  "depthOffset",
  "clipRect",
  "curveRadius",
  "orientation",
  "glyphGeometryDetail"
);
var Text = class extends Mesh {
  constructor() {
    const geometry = new GlyphsGeometry();
    super(geometry, null);
    this.text = "";
    this.anchorX = 0;
    this.anchorY = 0;
    this.curveRadius = 0;
    this.direction = "auto";
    this.font = null;
    this.unicodeFontsURL = null;
    this.fontSize = 0.1;
    this.fontWeight = "normal";
    this.fontStyle = "normal";
    this.lang = null;
    this.letterSpacing = 0;
    this.lineHeight = "normal";
    this.maxWidth = Infinity;
    this.overflowWrap = "normal";
    this.textAlign = "left";
    this.textIndent = 0;
    this.whiteSpace = "normal";
    this.material = null;
    this.color = null;
    this.colorRanges = null;
    this.outlineWidth = 0;
    this.outlineColor = 0;
    this.outlineOpacity = 1;
    this.outlineBlur = 0;
    this.outlineOffsetX = 0;
    this.outlineOffsetY = 0;
    this.strokeWidth = 0;
    this.strokeColor = defaultStrokeColor;
    this.strokeOpacity = 1;
    this.fillOpacity = 1;
    this.depthOffset = 0;
    this.clipRect = null;
    this.orientation = defaultOrient;
    this.glyphGeometryDetail = 1;
    this.sdfGlyphSize = null;
    this.gpuAccelerateSDF = true;
    this.debugSDF = false;
  }
  /**
   * Updates the text rendering according to the current text-related configuration properties.
   * This is an async process, so you can pass in a callback function to be executed when it
   * finishes.
   * @param {function} [callback]
   */
  sync(callback) {
    if (this._needsSync) {
      this._needsSync = false;
      if (this._isSyncing) {
        (this._queuedSyncs || (this._queuedSyncs = [])).push(callback);
      } else {
        this._isSyncing = true;
        this.dispatchEvent(syncStartEvent);
        getTextRenderInfo({
          text: this.text,
          font: this.font,
          lang: this.lang,
          fontSize: this.fontSize || 0.1,
          fontWeight: this.fontWeight || "normal",
          fontStyle: this.fontStyle || "normal",
          letterSpacing: this.letterSpacing || 0,
          lineHeight: this.lineHeight || "normal",
          maxWidth: this.maxWidth,
          direction: this.direction || "auto",
          textAlign: this.textAlign,
          textIndent: this.textIndent,
          whiteSpace: this.whiteSpace,
          overflowWrap: this.overflowWrap,
          anchorX: this.anchorX,
          anchorY: this.anchorY,
          colorRanges: this.colorRanges,
          includeCaretPositions: true,
          //TODO parameterize
          sdfGlyphSize: this.sdfGlyphSize,
          gpuAccelerateSDF: this.gpuAccelerateSDF,
          unicodeFontsURL: this.unicodeFontsURL
        }, (textRenderInfo) => {
          this._isSyncing = false;
          this._textRenderInfo = textRenderInfo;
          this.geometry.updateGlyphs(
            textRenderInfo.glyphBounds,
            textRenderInfo.glyphAtlasIndices,
            textRenderInfo.blockBounds,
            textRenderInfo.chunkedBounds,
            textRenderInfo.glyphColors
          );
          const queued = this._queuedSyncs;
          if (queued) {
            this._queuedSyncs = null;
            this._needsSync = true;
            this.sync(() => {
              queued.forEach((fn) => fn && fn());
            });
          }
          this.dispatchEvent(syncCompleteEvent);
          if (callback) {
            callback();
          }
        });
      }
    }
  }
  /**
   * Initiate a sync if needed - note it won't complete until next frame at the
   * earliest so if possible it's a good idea to call sync() manually as soon as
   * all the properties have been set.
   * @override
   */
  onBeforeRender(renderer, scene, camera, geometry, material, group) {
    this.sync();
    if (material.isTroikaTextMaterial) {
      this._prepareForRender(material);
    }
  }
  /**
   * Shortcut to dispose the geometry specific to this instance.
   * Note: we don't also dispose the derived material here because if anything else is
   * sharing the same base material it will result in a pause next frame as the program
   * is recompiled. Instead users can dispose the base material manually, like normal,
   * and we'll also dispose the derived material at that time.
   */
  dispose() {
    this.geometry.dispose();
  }
  /**
   * @property {TroikaTextRenderInfo|null} textRenderInfo
   * @readonly
   * The current processed rendering data for this TextMesh, returned by the TextBuilder after
   * a `sync()` call. This will be `null` initially, and may be stale for a short period until
   * the asynchrous `sync()` process completes.
   */
  get textRenderInfo() {
    return this._textRenderInfo || null;
  }
  /**
   * Create the text derived material from the base material. Can be overridden to use a custom
   * derived material.
   */
  createDerivedMaterial(baseMaterial) {
    return createTextDerivedMaterial(baseMaterial);
  }
  // Handler for automatically wrapping the base material with our upgrades. We do the wrapping
  // lazily on _read_ rather than write to avoid unnecessary wrapping on transient values.
  get material() {
    let derivedMaterial = this._derivedMaterial;
    const baseMaterial = this._baseMaterial || this._defaultMaterial || (this._defaultMaterial = defaultMaterial.clone());
    if (!derivedMaterial || !derivedMaterial.isDerivedFrom(baseMaterial)) {
      derivedMaterial = this._derivedMaterial = this.createDerivedMaterial(baseMaterial);
      baseMaterial.addEventListener("dispose", function onDispose() {
        baseMaterial.removeEventListener("dispose", onDispose);
        derivedMaterial.dispose();
      });
    }
    if (this.hasOutline()) {
      let outlineMaterial = derivedMaterial._outlineMtl;
      if (!outlineMaterial) {
        outlineMaterial = derivedMaterial._outlineMtl = Object.create(derivedMaterial, {
          id: { value: derivedMaterial.id + 0.1 }
        });
        outlineMaterial.isTextOutlineMaterial = true;
        outlineMaterial.depthWrite = false;
        outlineMaterial.map = null;
        derivedMaterial.addEventListener("dispose", function onDispose() {
          derivedMaterial.removeEventListener("dispose", onDispose);
          outlineMaterial.dispose();
        });
      }
      return [
        outlineMaterial,
        derivedMaterial
      ];
    } else {
      return derivedMaterial;
    }
  }
  set material(baseMaterial) {
    if (baseMaterial && baseMaterial.isTroikaTextMaterial) {
      this._derivedMaterial = baseMaterial;
      this._baseMaterial = baseMaterial.baseMaterial;
    } else {
      this._baseMaterial = baseMaterial;
    }
  }
  hasOutline() {
    return !!(this.outlineWidth || this.outlineBlur || this.outlineOffsetX || this.outlineOffsetY);
  }
  get glyphGeometryDetail() {
    return this.geometry.detail;
  }
  set glyphGeometryDetail(detail) {
    this.geometry.detail = detail;
  }
  get curveRadius() {
    return this.geometry.curveRadius;
  }
  set curveRadius(r) {
    this.geometry.curveRadius = r;
  }
  // Create and update material for shadows upon request:
  get customDepthMaterial() {
    return first(this.material).getDepthMaterial();
  }
  get customDistanceMaterial() {
    return first(this.material).getDistanceMaterial();
  }
  _prepareForRender(material) {
    const isOutline = material.isTextOutlineMaterial;
    const uniforms = material.uniforms;
    const textInfo = this.textRenderInfo;
    if (textInfo) {
      const { sdfTexture, blockBounds } = textInfo;
      uniforms.uTroikaSDFTexture.value = sdfTexture;
      uniforms.uTroikaSDFTextureSize.value.set(sdfTexture.image.width, sdfTexture.image.height);
      uniforms.uTroikaSDFGlyphSize.value = textInfo.sdfGlyphSize;
      uniforms.uTroikaSDFExponent.value = textInfo.sdfExponent;
      uniforms.uTroikaTotalBounds.value.fromArray(blockBounds);
      uniforms.uTroikaUseGlyphColors.value = !isOutline && !!textInfo.glyphColors;
      let distanceOffset = 0;
      let blurRadius = 0;
      let strokeWidth = 0;
      let fillOpacity;
      let strokeOpacity;
      let strokeColor;
      let offsetX = 0;
      let offsetY = 0;
      if (isOutline) {
        let { outlineWidth, outlineOffsetX, outlineOffsetY, outlineBlur, outlineOpacity } = this;
        distanceOffset = this._parsePercent(outlineWidth) || 0;
        blurRadius = Math.max(0, this._parsePercent(outlineBlur) || 0);
        fillOpacity = outlineOpacity;
        offsetX = this._parsePercent(outlineOffsetX) || 0;
        offsetY = this._parsePercent(outlineOffsetY) || 0;
      } else {
        strokeWidth = Math.max(0, this._parsePercent(this.strokeWidth) || 0);
        if (strokeWidth) {
          strokeColor = this.strokeColor;
          uniforms.uTroikaStrokeColor.value.set(strokeColor == null ? defaultStrokeColor : strokeColor);
          strokeOpacity = this.strokeOpacity;
          if (strokeOpacity == null) strokeOpacity = 1;
        }
        fillOpacity = this.fillOpacity;
      }
      uniforms.uTroikaEdgeOffset.value = distanceOffset;
      uniforms.uTroikaPositionOffset.value.set(offsetX, offsetY);
      uniforms.uTroikaBlurRadius.value = blurRadius;
      uniforms.uTroikaStrokeWidth.value = strokeWidth;
      uniforms.uTroikaStrokeOpacity.value = strokeOpacity;
      uniforms.uTroikaFillOpacity.value = fillOpacity == null ? 1 : fillOpacity;
      uniforms.uTroikaCurveRadius.value = this.curveRadius || 0;
      let clipRect = this.clipRect;
      if (clipRect && Array.isArray(clipRect) && clipRect.length === 4) {
        uniforms.uTroikaClipRect.value.fromArray(clipRect);
      } else {
        const pad = (this.fontSize || 0.1) * 100;
        uniforms.uTroikaClipRect.value.set(
          blockBounds[0] - pad,
          blockBounds[1] - pad,
          blockBounds[2] + pad,
          blockBounds[3] + pad
        );
      }
      this.geometry.applyClipRect(uniforms.uTroikaClipRect.value);
    }
    uniforms.uTroikaSDFDebug.value = !!this.debugSDF;
    material.polygonOffset = !!this.depthOffset;
    material.polygonOffsetFactor = material.polygonOffsetUnits = this.depthOffset || 0;
    const color = isOutline ? this.outlineColor || 0 : this.color;
    if (color == null) {
      delete material.color;
    } else {
      const colorObj = material.hasOwnProperty("color") ? material.color : material.color = new Color();
      if (color !== colorObj._input || typeof color === "object") {
        colorObj.set(colorObj._input = color);
      }
    }
    let orient = this.orientation || defaultOrient;
    if (orient !== material._orientation) {
      let rotMat = uniforms.uTroikaOrient.value;
      orient = orient.replace(/[^-+xyz]/g, "");
      let match = orient !== defaultOrient && orient.match(/^([-+])([xyz])([-+])([xyz])$/);
      if (match) {
        let [, hSign, hAxis, vSign, vAxis] = match;
        tempVec3a.set(0, 0, 0)[hAxis] = hSign === "-" ? 1 : -1;
        tempVec3b.set(0, 0, 0)[vAxis] = vSign === "-" ? -1 : 1;
        tempMat4.lookAt(origin, tempVec3a.cross(tempVec3b), tempVec3b);
        rotMat.setFromMatrix4(tempMat4);
      } else {
        rotMat.identity();
      }
      material._orientation = orient;
    }
  }
  _parsePercent(value) {
    if (typeof value === "string") {
      let match = value.match(/^(-?[\d.]+)%$/);
      let pct = match ? parseFloat(match[1]) : NaN;
      value = (isNaN(pct) ? 0 : pct / 100) * this.fontSize;
    }
    return value;
  }
  /**
   * Translate a point in local space to an x/y in the text plane.
   */
  localPositionToTextCoords(position, target = new Vector2()) {
    target.copy(position);
    const r = this.curveRadius;
    if (r) {
      target.x = Math.atan2(position.x, Math.abs(r) - Math.abs(position.z)) * Math.abs(r);
    }
    return target;
  }
  /**
   * Translate a point in world space to an x/y in the text plane.
   */
  worldPositionToTextCoords(position, target = new Vector2()) {
    tempVec3a.copy(position);
    return this.localPositionToTextCoords(this.worldToLocal(tempVec3a), target);
  }
  /**
   * @override Custom raycasting to test against the whole text block's max rectangular bounds
   * TODO is there any reason to make this more granular, like within individual line or glyph rects?
   */
  raycast(raycaster, intersects) {
    const { textRenderInfo, curveRadius } = this;
    if (textRenderInfo) {
      const bounds = textRenderInfo.blockBounds;
      const raycastMesh = curveRadius ? getCurvedRaycastMesh() : getFlatRaycastMesh();
      const geom = raycastMesh.geometry;
      const { position, uv } = geom.attributes;
      for (let i = 0; i < uv.count; i++) {
        let x = bounds[0] + uv.getX(i) * (bounds[2] - bounds[0]);
        const y = bounds[1] + uv.getY(i) * (bounds[3] - bounds[1]);
        let z = 0;
        if (curveRadius) {
          z = curveRadius - Math.cos(x / curveRadius) * curveRadius;
          x = Math.sin(x / curveRadius) * curveRadius;
        }
        position.setXYZ(i, x, y, z);
      }
      geom.boundingSphere = this.geometry.boundingSphere;
      geom.boundingBox = this.geometry.boundingBox;
      raycastMesh.matrixWorld = this.matrixWorld;
      raycastMesh.material.side = this.material.side;
      tempArray.length = 0;
      raycastMesh.raycast(raycaster, tempArray);
      for (let i = 0; i < tempArray.length; i++) {
        tempArray[i].object = this;
        intersects.push(tempArray[i]);
      }
    }
  }
  copy(source) {
    const geom = this.geometry;
    super.copy(source);
    this.geometry = geom;
    COPYABLE_PROPS.forEach((prop) => {
      this[prop] = source[prop];
    });
    return this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
SYNCABLE_PROPS.forEach((prop) => {
  const privateKey = "_private_" + prop;
  Object.defineProperty(Text.prototype, prop, {
    get() {
      return this[privateKey];
    },
    set(value) {
      if (value !== this[privateKey]) {
        this[privateKey] = value;
        this._needsSync = true;
      }
    }
  });
});
var syncStartEvent$1 = { type: "syncstart" };
var syncCompleteEvent$1 = { type: "synccomplete" };
var memberIndexAttrName = "aTroikaTextBatchMemberIndex";
var floatsPerMember = 32;
var tempBox3 = new Box3();
var tempColor$1 = new Color();
var BatchedText = class _BatchedText extends Text {
  constructor() {
    super();
    this._members = /* @__PURE__ */ new Map();
    this._dataTextures = {};
    this._onMemberSynced = (e) => {
      this._members.get(e.target).dirty = true;
    };
  }
  /**
   * @override
   * Batch any Text objects added as children
   */
  add(...objects) {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i] instanceof Text) {
        this.addText(objects[i]);
      } else {
        super.add(objects[i]);
      }
    }
    return this;
  }
  /**
   * @override
   */
  remove(...objects) {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i] instanceof Text) {
        this.removeText(objects[i]);
      } else {
        super.remove(objects[i]);
      }
    }
    return this;
  }
  /**
   * @param {Text} text
   */
  addText(text) {
    if (!this._members.has(text)) {
      this._members.set(text, {
        index: -1,
        glyphCount: -1,
        dirty: true
      });
      text.addEventListener("synccomplete", this._onMemberSynced);
    }
  }
  /**
   * @param {Text} text
   */
  removeText(text) {
    this._needsRepack = true;
    text.removeEventListener("synccomplete", this._onMemberSynced);
    this._members.delete(text);
  }
  /**
   * Use the custom derivation with extra batching logic
   */
  createDerivedMaterial(baseMaterial) {
    return createBatchedTextMaterial(baseMaterial);
  }
  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);
    this.updateBounds();
  }
  /**
   * Update the batched geometry bounds to hold all members
   */
  updateBounds() {
    const bbox = this.geometry.boundingBox.makeEmpty();
    this._members.forEach((_, text) => {
      if (text.matrixAutoUpdate) text.updateMatrix();
      tempBox3.copy(text.geometry.boundingBox).applyMatrix4(text.matrix);
      bbox.union(tempBox3);
    });
    bbox.getBoundingSphere(this.geometry.boundingSphere);
  }
  /** @override */
  hasOutline() {
    for (let member of this._members.keys()) {
      if (member.hasOutline()) return true;
    }
    return false;
  }
  /**
   * @override
   * Copy member matrices and uniform values into the data texture
   */
  _prepareForRender(material) {
    const isOutline = material.isTextOutlineMaterial;
    material.uniforms.uTroikaIsOutline.value = isOutline;
    let texture = this._dataTextures[isOutline ? "outline" : "main"];
    const dataLength = Math.pow(2, Math.ceil(Math.log2(this._members.size * floatsPerMember)));
    if (!texture || dataLength !== texture.image.data.length) {
      if (texture) texture.dispose();
      const width = Math.min(dataLength / 4, 1024);
      texture = this._dataTextures[isOutline ? "outline" : "main"] = new DataTexture(
        new Float32Array(dataLength),
        width,
        dataLength / 4 / width,
        RGBAFormat,
        FloatType
      );
    }
    const texData = texture.image.data;
    const setTexData = (index, value) => {
      if (value !== texData[index]) {
        texData[index] = value;
        texture.needsUpdate = true;
      }
    };
    this._members.forEach(({ index, dirty }, text) => {
      if (index > -1) {
        const startIndex = index * floatsPerMember;
        const matrix = text.matrix.elements;
        for (let i = 0; i < 16; i++) {
          setTexData(startIndex + i, matrix[i]);
        }
        text._prepareForRender(material);
        const {
          uTroikaTotalBounds,
          uTroikaClipRect,
          uTroikaPositionOffset,
          uTroikaEdgeOffset,
          uTroikaBlurRadius,
          uTroikaStrokeWidth,
          uTroikaStrokeColor,
          uTroikaStrokeOpacity,
          uTroikaFillOpacity,
          uTroikaCurveRadius
        } = material.uniforms;
        for (let i = 0; i < 4; i++) {
          setTexData(startIndex + 16 + i, uTroikaTotalBounds.value.getComponent(i));
        }
        for (let i = 0; i < 4; i++) {
          setTexData(startIndex + 20 + i, uTroikaClipRect.value.getComponent(i));
        }
        let color = isOutline ? text.outlineColor || 0 : text.color;
        if (color == null) color = this.color;
        if (color == null) color = this.material.color;
        if (color == null) color = 16777215;
        setTexData(startIndex + 24, tempColor$1.set(color).getHex());
        setTexData(startIndex + 25, uTroikaFillOpacity.value);
        setTexData(startIndex + 26, uTroikaCurveRadius.value);
        if (isOutline) {
          setTexData(startIndex + 28, uTroikaPositionOffset.value.x);
          setTexData(startIndex + 29, uTroikaPositionOffset.value.y);
          setTexData(startIndex + 30, uTroikaEdgeOffset.value);
          setTexData(startIndex + 31, uTroikaBlurRadius.value);
        } else {
          setTexData(startIndex + 28, uTroikaStrokeWidth.value);
          setTexData(startIndex + 29, tempColor$1.set(uTroikaStrokeColor.value).getHex());
          setTexData(startIndex + 30, uTroikaStrokeOpacity.value);
        }
      }
    });
    material.setMatrixTexture(texture);
    super._prepareForRender(material);
  }
  sync(callback) {
    let syncPromises = this._needsRepack ? [] : null;
    this._needsRepack = false;
    this._members.forEach((packingInfo, text) => {
      if (packingInfo.dirty || text._needsSync) {
        packingInfo.dirty = false;
        (syncPromises || (syncPromises = [])).push(new Promise((resolve) => {
          if (text._needsSync) {
            text.sync(resolve);
          } else {
            resolve();
          }
        }));
      }
    });
    if (syncPromises) {
      this.dispatchEvent(syncStartEvent$1);
      Promise.all(syncPromises).then(() => {
        const { geometry } = this;
        const batchedAttributes = geometry.attributes;
        let memberIndexes = batchedAttributes[memberIndexAttrName] && batchedAttributes[memberIndexAttrName].array || new Uint16Array(0);
        let batchedGlyphIndexes = batchedAttributes[glyphIndexAttrName] && batchedAttributes[glyphIndexAttrName].array || new Float32Array(0);
        let batchedGlyphBounds = batchedAttributes[glyphBoundsAttrName] && batchedAttributes[glyphBoundsAttrName].array || new Float32Array(0);
        let totalGlyphCount = 0;
        this._members.forEach((packingInfo, { textRenderInfo }) => {
          if (textRenderInfo) {
            totalGlyphCount += textRenderInfo.glyphAtlasIndices.length;
            this._textRenderInfo = textRenderInfo;
          }
        });
        if (totalGlyphCount !== memberIndexes.length) {
          memberIndexes = cloneAndResize(memberIndexes, totalGlyphCount);
          batchedGlyphIndexes = cloneAndResize(batchedGlyphIndexes, totalGlyphCount);
          batchedGlyphBounds = cloneAndResize(batchedGlyphBounds, totalGlyphCount * 4);
        }
        let memberIndex = 0;
        let glyphIndex = 0;
        this._members.forEach((packingInfo, { textRenderInfo }) => {
          if (textRenderInfo) {
            const glyphCount = textRenderInfo.glyphAtlasIndices.length;
            memberIndexes.fill(memberIndex, glyphIndex, glyphIndex + glyphCount);
            batchedGlyphIndexes.set(textRenderInfo.glyphAtlasIndices, glyphIndex, glyphIndex + glyphCount);
            batchedGlyphBounds.set(textRenderInfo.glyphBounds, glyphIndex * 4, (glyphIndex + glyphCount) * 4);
            glyphIndex += glyphCount;
            packingInfo.index = memberIndex++;
          }
        });
        geometry.updateAttributeData(memberIndexAttrName, memberIndexes, 1);
        geometry.getAttribute(memberIndexAttrName).setUsage(DynamicDrawUsage);
        geometry.updateAttributeData(glyphIndexAttrName, batchedGlyphIndexes, 1);
        geometry.updateAttributeData(glyphBoundsAttrName, batchedGlyphBounds, 4);
        this.updateBounds();
        this.dispatchEvent(syncCompleteEvent$1);
        if (callback) {
          callback();
        }
      });
    }
  }
  copy(source) {
    if (source instanceof _BatchedText) {
      super.copy(source);
      this._members.forEach((_, text) => this.removeText(text));
      source._members.forEach((_, text) => this.addText(text));
    }
    return this;
  }
  dispose() {
    super.dispose();
    Object.values(this._dataTextures).forEach((tex) => tex.dispose());
  }
};
function cloneAndResize(source, newLength) {
  const copy = new source.constructor(newLength);
  copy.set(source.subarray(0, newLength));
  return copy;
}
function createBatchedTextMaterial(baseMaterial) {
  const texUniformName = "uTroikaMatricesTexture";
  const texSizeUniformName = "uTroikaMatricesTextureSize";
  let batchMaterial = createDerivedMaterial(baseMaterial, {
    chained: true,
    uniforms: {
      [texSizeUniformName]: { value: new Vector2() },
      [texUniformName]: { value: null }
    },
    // language=GLSL
    vertexDefs: `
      uniform highp sampler2D ${texUniformName};
      uniform vec2 ${texSizeUniformName};
      attribute float ${memberIndexAttrName};

      vec4 troikaBatchTexel(float offset) {
        offset += ${memberIndexAttrName} * ${floatsPerMember.toFixed(1)} / 4.0;
        float w = ${texSizeUniformName}.x;
        vec2 uv = (vec2(mod(offset, w), floor(offset / w)) + 0.5) / ${texSizeUniformName};
        return texture2D(${texUniformName}, uv);
      }
    `,
    // language=GLSL prefix="void main() {" suffix="}"
    vertexTransform: `
      mat4 matrix = mat4(
        troikaBatchTexel(0.0),
        troikaBatchTexel(1.0),
        troikaBatchTexel(2.0),
        troikaBatchTexel(3.0)
      );
      position.xyz = (matrix * vec4(position, 1.0)).xyz;
    `
  });
  batchMaterial = createTextDerivedMaterial(batchMaterial);
  batchMaterial = createDerivedMaterial(batchMaterial, {
    chained: true,
    uniforms: {
      uTroikaIsOutline: { value: false }
    },
    customRewriter(shaders) {
      const varyingUniforms = [
        "uTroikaTotalBounds",
        "uTroikaClipRect",
        "uTroikaPositionOffset",
        "uTroikaEdgeOffset",
        "uTroikaBlurRadius",
        "uTroikaStrokeWidth",
        "uTroikaStrokeColor",
        "uTroikaStrokeOpacity",
        "uTroikaFillOpacity",
        "uTroikaCurveRadius",
        "diffuse"
      ];
      varyingUniforms.forEach((uniformName) => {
        shaders = uniformToVarying(shaders, uniformName);
      });
      return shaders;
    },
    // language=GLSL
    vertexDefs: `
      uniform bool uTroikaIsOutline;
      vec3 troikaFloatToColor(float v) {
        return mod(floor(vec3(v / 65536.0, v / 256.0, v)), 256.0) / 256.0;
      }
    `,
    // language=GLSL prefix="void main() {" suffix="}"
    vertexTransform: `
      uTroikaTotalBounds = troikaBatchTexel(4.0);
      uTroikaClipRect = troikaBatchTexel(5.0);
      
      vec4 data = troikaBatchTexel(6.0);
      diffuse = troikaFloatToColor(data.x);
      uTroikaFillOpacity = data.y;
      uTroikaCurveRadius = data.z;
      
      data = troikaBatchTexel(7.0);
      if (uTroikaIsOutline) {
        if (data == vec4(0.0)) { // degenerate if zero outline
          position = vec3(0.0);
        } else {
          uTroikaPositionOffset = data.xy;
          uTroikaEdgeOffset = data.z;
          uTroikaBlurRadius = data.w;
        }
      } else {
        uTroikaStrokeWidth = data.x;
        uTroikaStrokeColor = troikaFloatToColor(data.y);
        uTroikaStrokeOpacity = data.z;
      }
    `
  });
  batchMaterial.setMatrixTexture = (texture) => {
    batchMaterial.uniforms[texUniformName].value = texture;
    batchMaterial.uniforms[texSizeUniformName].value.set(texture.image.width, texture.image.height);
  };
  return batchMaterial;
}
function uniformToVarying({ vertexShader, fragmentShader }, uniformName, varyingName = uniformName) {
  const uniformRE = new RegExp(`uniform\\s+(bool|float|vec[234]|mat[34])\\s+${uniformName}\\b`);
  let type;
  let hadFragmentUniform = false;
  fragmentShader = fragmentShader.replace(uniformRE, ($0, $1) => {
    hadFragmentUniform = true;
    return `varying ${type = $1} ${varyingName}`;
  });
  let hadVertexUniform = false;
  vertexShader = vertexShader.replace(uniformRE, (_, $1) => {
    hadVertexUniform = true;
    return `${hadFragmentUniform ? "varying" : ""} ${type = $1} ${varyingName}`;
  });
  if (!hadVertexUniform) {
    vertexShader = `${hadFragmentUniform ? "varying" : ""} ${type} ${varyingName};
${vertexShader}`;
  }
  return { vertexShader, fragmentShader };
}
function getCaretAtPoint(textRenderInfo, x, y) {
  let closestCaret = null;
  const rows = groupCaretsByRow(textRenderInfo);
  let closestRow = null;
  rows.forEach((row) => {
    if (!closestRow || Math.abs(y - (row.top + row.bottom) / 2) < Math.abs(y - (closestRow.top + closestRow.bottom) / 2)) {
      closestRow = row;
    }
  });
  closestRow.carets.forEach((caret) => {
    if (!closestCaret || Math.abs(x - caret.x) < Math.abs(x - closestCaret.x)) {
      closestCaret = caret;
    }
  });
  return closestCaret;
}
var _rectsCache = /* @__PURE__ */ new WeakMap();
function getSelectionRects(textRenderInfo, start, end) {
  let rects;
  if (textRenderInfo) {
    let prevResult = _rectsCache.get(textRenderInfo);
    if (prevResult && prevResult.start === start && prevResult.end === end) {
      return prevResult.rects;
    }
    const { caretPositions } = textRenderInfo;
    if (end < start) {
      const s = start;
      start = end;
      end = s;
    }
    start = Math.max(start, 0);
    end = Math.min(end, caretPositions.length + 1);
    rects = [];
    let currentRect = null;
    for (let i = start; i < end; i++) {
      const x1 = caretPositions[i * 4];
      const x2 = caretPositions[i * 4 + 1];
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const bottom = caretPositions[i * 4 + 2];
      const top = caretPositions[i * 4 + 3];
      if (!currentRect || bottom !== currentRect.bottom || top !== currentRect.top || left > currentRect.right || right < currentRect.left) {
        currentRect = {
          left: Infinity,
          right: -Infinity,
          bottom,
          top
        };
        rects.push(currentRect);
      }
      currentRect.left = Math.min(left, currentRect.left);
      currentRect.right = Math.max(right, currentRect.right);
    }
    rects.sort((a, b) => b.bottom - a.bottom || a.left - b.left);
    for (let i = rects.length - 1; i-- > 0; ) {
      const rectA = rects[i];
      const rectB = rects[i + 1];
      if (rectA.bottom === rectB.bottom && rectA.top === rectB.top && rectA.left <= rectB.right && rectA.right >= rectB.left) {
        rectB.left = Math.min(rectB.left, rectA.left);
        rectB.right = Math.max(rectB.right, rectA.right);
        rects.splice(i, 1);
      }
    }
    _rectsCache.set(textRenderInfo, { start, end, rects });
  }
  return rects;
}
var _caretsByRowCache = /* @__PURE__ */ new WeakMap();
function groupCaretsByRow(textRenderInfo) {
  let rows = _caretsByRowCache.get(textRenderInfo);
  if (!rows) {
    rows = [];
    const { caretPositions } = textRenderInfo;
    let curRow;
    const visitCaret = (x, bottom, top, charIndex) => {
      if (!curRow || top < (curRow.top + curRow.bottom) / 2) {
        rows.push(curRow = { bottom, top, carets: [] });
      }
      if (top > curRow.top) curRow.top = top;
      if (bottom < curRow.bottom) curRow.bottom = bottom;
      curRow.carets.push({
        x,
        y: bottom,
        height: top - bottom,
        charIndex
      });
    };
    let i = 0;
    for (; i < caretPositions.length; i += 4) {
      visitCaret(caretPositions[i], caretPositions[i + 2], caretPositions[i + 3], i / 4);
    }
    visitCaret(caretPositions[i - 3], caretPositions[i - 2], caretPositions[i - 1], i / 4);
  }
  _caretsByRowCache.set(textRenderInfo, rows);
  return rows;
}
export {
  BatchedText,
  GlyphsGeometry,
  Text,
  configureTextBuilder,
  createTextDerivedMaterial,
  dumpSDFTextures,
  fontResolverWorkerModule,
  getCaretAtPoint,
  getSelectionRects,
  getTextRenderInfo,
  preloadFont,
  typesetterWorkerModule
};
/*! Bundled license information:

troika-three-text/dist/troika-three-text.esm.js:
  (*!
  Custom build of Typr.ts (https://github.com/fredli74/Typr.ts) for use in Troika text rendering.
  Original MIT license applies: https://github.com/fredli74/Typr.ts/blob/master/LICENSE
  *)
  (*!
  Custom bundle of woff2otf (https://github.com/arty-name/woff2otf) with fflate
  (https://github.com/101arrowz/fflate) for use in Troika text rendering. 
  Original licenses apply: 
  - fflate: https://github.com/101arrowz/fflate/blob/master/LICENSE (MIT)
  - woff2otf.js: https://github.com/arty-name/woff2otf/blob/master/woff2otf.js (Apache2)
  *)
  (*!
  Custom bundle of @unicode-font-resolver/client v1.0.2 (https://github.com/lojjic/unicode-font-resolver)
  for use in Troika text rendering. 
  Original MIT license applies
  *)
*/
//# sourceMappingURL=troika-three-text.js.map
