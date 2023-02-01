/**
 * 
 * @param gl - WebGL Rendering Context
 * @param vertexShader - A vertex shader loaded into the rendering context
 * @param fragmentShader - A fragment shader loaded into the rendering context
 * @returns 
 */
export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram();
    if (!program) {
        throw new Error("Couldn't create program");
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return;
  }