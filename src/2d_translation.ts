import {
    createProgramInfo, 
    createBufferInfoFromArrays,
    resizeCanvasToDisplaySize,
    setBuffersAndAttributes,
    setUniforms,
    drawBufferInfo,
    Arrays
} from "twgl.js";
import {ValuePayload} from "./helpers/setupSlider";

const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
 
// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;
 
// translation to add to position
uniform vec2 u_translation;
 
// all shaders have a main function
void main() {
  // Add in the translation
  vec2 position = a_position + u_translation;
 
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;
 
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
 
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;
 
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}`;

  const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}`;

const useAspectRatio = true;




export function twoDTranslation() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");
    const xRange = <HTMLInputElement> document.getElementById("x");
    const yRange = <HTMLInputElement> document.getElementById("y");
    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }
    if (!xRange) {
        throw new Error ("Unable to find x range");
    }
    if (!yRange) {
        throw new Error ("Unable to find y range");
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }


    const programInfo = createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);
    const translation = [0,0];
    const vertexAttributes: Arrays = {
        a_position: {
            data: [// left column
                0, 0,
                30, 0,
                0, 150,
                0, 150,
                30, 0,
                30, 150,

                // top rung
                30, 0,
                100, 0,
                30, 30,
                30, 30,
                100, 0,
                100, 30,

                // middle rung
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 60,
                67, 90],
            numComponents: 2
        } }

    const bufferInfoArray = createBufferInfoFromArrays(gl, vertexAttributes);
    resizeCanvasToDisplaySize(canvas);
  const uniforms = {
      u_translation: translation,
      u_resolution: [gl.canvas.width, gl.canvas.height],
      u_color: [Math.random(), Math.random(), Math.random(), 1]
  };


    function updatePosition(index: number) {
        return function(event: Event, updatedTranslation: number) {
            translation[index] = updatedTranslation;
            setUniforms(programInfo, uniforms);
            setBuffersAndAttributes(gl!, programInfo, bufferInfoArray);
            drawBufferInfo(gl!, bufferInfoArray);

        };
    }

xRange.addEventListener('input', (event ) => {
    const val = (event.currentTarget as HTMLInputElement)?.value;
    updatePosition(0)(event, parseInt(val));
});
yRange.addEventListener('input', (event ) => {
    const val = (event.currentTarget as HTMLInputElement)?.value;
    updatePosition(1)(event, parseInt(val));
});
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
  gl.useProgram(programInfo.program);

  setUniforms(programInfo, uniforms);
  setBuffersAndAttributes(gl, programInfo, bufferInfoArray);
  drawBufferInfo(gl, bufferInfoArray);

}
