import {
    createShader,
     createProgram,
     resizeCanvasToDisplaySize
    } from './helpers';


function drawScene(gl: WebGL2RenderingContext) {
      const primitiveType = gl!.TRIANGLES;
      const offset = 0;
      const count = 3;
      gl.drawArrays(primitiveType, offset, count);
    }

const vertexShader = `#version 300 es
in vec4 a_position;
varying vec4 v_color

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
 
  // Convert from clip space to color space.
  // Clip space goes -1.0 to +1.0
  // Color space goes from 0.0 to 1.0
  v_color = gl_Position * 0.5 + 0.5;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;
 
varying vec4 v_color;
 
void main() {
  gl_FragColor = v_color;
}
`;
export function sec1() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }
    
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("No WebGL Rendering Context");
    }
    
    

    
        
}
