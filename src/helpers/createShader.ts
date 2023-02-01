
type ShaderType = typeof WebGL2RenderingContext["VERTEX_SHADER"] | typeof WebGL2RenderingContext["FRAGMENT_SHADER"];

/**
 * 
 * @param gl - WebGL Rendering Context
 * @param type - Vertex or Fragment Shader
 * @param source - The shader specified in GLSL
 * @returns 
 */ 
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