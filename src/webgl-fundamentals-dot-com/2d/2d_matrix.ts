import {
    createProgramInfo,
    createBufferInfoFromArrays,
    resizeCanvasToDisplaySize,
    setBuffersAndAttributes,
    setUniforms,
    drawBufferInfo,
    Arrays
} from "twgl.js";
import {mat3} from "gl-matrix";
import {create2DRotationInput} from "../helpers";



const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// A matrix to transform the positions by
uniform mat3 u_matrix;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}`;

const data = [// left column
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
    67, 90]

export function twoDMatrix() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }


    const programInfo = createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);
    const translation = [300,300];
    const rotation = [0, 1];
    const angleInRadians = 0;
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    const sx = 1;
    const sy = 1;

    const translationMatrix = mat3.fromValues(
        1, 0, 0,
        0, 1, 0,
        translation[0], translation[1], 1,
    );
    const rotationMatrix = mat3.fromValues(
        c,-s, 0,
        s, c, 0,
        0, 0, 1,
    );
    const scalingMatrix = mat3.fromValues(
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
    );
    let matrix = mat3.create();
    matrix = mat3.multiply(matrix, translationMatrix, rotationMatrix);
    matrix = mat3.multiply(matrix, matrix, scalingMatrix);
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
        u_matrix: matrix,
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_color: [Math.random(), Math.random(), Math.random(), 1],
    };


    function updatePosition(updatedRotation: [number,number]) {
        rotation[0] = updatedRotation[0];
        rotation[1] = updatedRotation[1];
        setUniforms(programInfo, uniforms);
        gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
        drawBufferInfo(gl!, bufferInfoArray);

    }


    create2DRotationInput(updatePosition);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(programInfo.program);

    setUniforms(programInfo, uniforms);
    setBuffersAndAttributes(gl, programInfo, bufferInfoArray);
    drawBufferInfo(gl, bufferInfoArray);

}
