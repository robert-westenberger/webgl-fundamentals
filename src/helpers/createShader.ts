
type ShaderType = typeof WebGL2RenderingContext["VERTEX_SHADER"] | typeof WebGL2RenderingContext["FRAGMENT_SHADER"];

export function createShader(gl: WebGL2RenderingContext, type: ShaderType , source: string) {
    const shader = gl.createShader(type);
    if (!shader) {
      throw Error("Unable to create shader");
    }
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }