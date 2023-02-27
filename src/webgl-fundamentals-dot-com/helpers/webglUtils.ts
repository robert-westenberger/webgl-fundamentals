import webglDebug from 'webgl-debug';


function isInIFrame(w?: Window) {
    w = w || window;
    return w !== w.top;
  }

  if (!isInIFrame()) {
    console.log("%c%s", 'color:blue;font-weight:bold;', 'for more about webgl-utils.js see:');  // eslint-disable-line
    console.log("%c%s", 'color:blue;font-weight:bold;', 'http://webgl2fundamentals.org/webgl/lessons/webgl-boilerplate.html');  // eslint-disable-line
  }

  /**
   * Wrapped logging function.
   * @param {string} msg The message to log.
   */
  function error(msg: string) {
    if (window.console) {
      if (window.console.error) {
        window.console.error(msg);
      } else if (window.console.log) {
        window.console.log(msg);
      }
    }
  }

  const errorRE = /ERROR:\s*\d+:(\d+)/gi;
  function addLineNumbersWithError(src: string, log = '') {
    // Note: Error message formats are not defined by any spec so this may or may not work.
    const matches = [...log.matchAll(errorRE)];
    const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
      const lineNo = parseInt(m[1]);
      const next = matches[ndx + 1];
      const end = next ? next.index : log.length;
      const msg = log.substring(m.index ? m.index : 0, end);
      return [lineNo - 1, msg];
    }));
    return src.split('\n').map((line, lineNo) => {
      const err = lineNoToErrorMap.get(lineNo);
      return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
    }).join('\n');
  }


  /**
   * Error Callback
   * @callback ErrorCallback
   * @param {string} msg error message.
   * @memberOf module:webgl-utils
   */

  /**
   * Loads a shader.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} shaderSource The shader source.
   * @param {number} shaderType The type of shader.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
   * @return {WebGLShader} The created shader.
   */
  function loadShader(
    gl: WebGL2RenderingContext, 
    shaderSource: string, 
    shaderType: number, 
    opt_errorCallback: (msg: string) => void ) {
    const errFn = opt_errorCallback || error;
    // Create the shader object
    const shader = gl.createShader(shaderType);

    if (!shader) {
      throw new Error("Unable to create shader!");
    }
    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // Something went wrong during compilation; get the error
      const lastError = gl.getShaderInfoLog(shader);
      errFn(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(shaderSource, lastError!)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGL2RenderingContext} gl The WebGLRenderingContext to use.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @memberOf module:webgl-utils
   */
  export function createProgram(
      gl: WebGL2RenderingContext, 
      shaders: WebGLShader[], 
      opt_attribs: string[], 
      opt_locations: number[], 
      opt_errorCallback: (msg: string) => void) {
    const errFn = opt_errorCallback || error;
    const program = gl.createProgram();
    if (!program) {
      throw new Error("Unable to create WebGL program");
    }
    shaders.forEach(function(shader) {
      gl.attachShader(program, shader);
    });
    if (opt_attribs) {
      opt_attribs.forEach(function(attrib, ndx) {
        gl.bindAttribLocation(
            program,
            opt_locations ? opt_locations[ndx] : ndx,
            attrib);
      });
    }
    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        errFn(`Error in program linking: ${lastError}\n${
          shaders.map(shader => {
            const shaderSrc = gl.getShaderSource(shader);
            if (!shaderSrc) {
              throw new Error(`Couldn't get shader source`)
            }
            const src = addLineNumbersWithError(shaderSrc);
            const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
            return `${webglDebug.glEnumToString(gl, type)}:\n${src}`;
          }).join('\n')
        }`);

        gl.deleteProgram(program);
        return null;
    }
    return program;
  }

  /**
   * Loads a shader from a script tag.
   * @param {WebGL2RenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} scriptId The id of the script tag.
   * @param {number} opt_shaderType The type of shader. If not passed in it will
   *     be derived from the type of the script tag.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
   * @return {WebGLShader} The created shader.
   */
  function createShaderFromScript(
      gl: WebGL2RenderingContext, 
      scriptId: string, 
      opt_shaderType: number, 
      opt_errorCallback: (msg: string) => void
      ) {
    let shaderSource = "";
    let shaderType;
    const shaderScript = <HTMLScriptElement> document.getElementById(scriptId);
    if (!shaderScript) {
      throw ("*** Error: unknown script element" + scriptId);
    }
    shaderSource = shaderScript.text;

    if (!opt_shaderType) {
      if (shaderScript.type === "x-shader/x-vertex") {
        shaderType = gl.VERTEX_SHADER;
      } else if (shaderScript.type === "x-shader/x-fragment") {
        shaderType = gl.FRAGMENT_SHADER;
      } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
        throw ("*** Error: unknown shader type");
      }
    }
    if (!shaderType) {
      throw new Error("Unknown shader type");
    }
    return loadShader(
        gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
        opt_errorCallback);
  }

  const defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
  ];

  /**
   * Creates a program from 2 script tags.
   *
   * @param {WebGL2RenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderScriptIds Array of ids of the script
   *        tags for the shaders. The first is assumed to be the
   *        vertex shader, the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
  export function createProgramFromScripts(
      gl: WebGL2RenderingContext, 
      shaderScriptIds: string[], 
      opt_attribs: string[],
      opt_locations: number[], 
      opt_errorCallback: (msg: string) => void
      ) {
    const shaders = [];
    for (let ii = 0; ii < shaderScriptIds.length; ++ii) {
      const shader = createShaderFromScript(
          gl, shaderScriptIds[ii], gl[(defaultShaderType[ii] as "VERTEX_SHADER" | "FRAGMENT_SHADER")], opt_errorCallback);
      
      if (!shader) {
        throw new Error("Something bad happened!");
      }
     shaders.push(shader);
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
  }

  /**
   * Creates a program from 2 sources.
   *
   * @param {WebGL2RenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSources Array of sources for the
   *        shaders. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
  export function createProgramFromSources(
      gl: WebGL2RenderingContext, 
      shaderSources: string[], 
      opt_attribs: string[], 
      opt_locations: number[], 
      opt_errorCallback: () => void
      ) {
    const shaders = [];
    for (let ii = 0; ii < shaderSources.length; ++ii) {
      const shader = loadShader(
          gl, shaderSources[ii], gl[(defaultShaderType[ii] as "VERTEX_SHADER" | "FRAGMENT_SHADER")], opt_errorCallback);
      if (!shader){
        throw new Error("Something bad happened");
      }
      shaders.push(shader);
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
  }

  /**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] amount to multiply by.
   *    Pass in window.devicePixelRatio for native pixels.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:webgl-utils
   */
  export function resizeCanvasToDisplaySize(
    canvas: HTMLCanvasElement, 
    multiplier?: number
    ) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  }
