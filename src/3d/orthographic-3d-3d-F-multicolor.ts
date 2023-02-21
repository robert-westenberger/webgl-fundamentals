import {
    createProgramInfo,
    createBufferInfoFromArrays,
    resizeCanvasToDisplaySize,
    setBuffersAndAttributes,
    setUniforms,
    drawBufferInfo,
    Arrays
} from "twgl.js";
import {mat4} from "gl-matrix";
import {create2DRotationInput} from "../helpers";



const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;
 
// A matrix to transform the positions by
uniform mat4 u_matrix;
 
// a varying the color to the fragment shader
out vec4 v_color;
 
// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
 
  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es
 
precision highp float;
 
// the varied color passed from the vertex shader
in vec4 v_color;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  outColor = v_color;
}`;


const degreesToRadians = (degrees:number) => degrees * (Math.PI/180);
export function orthographic3d3dFMulticolor() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }


    const programInfo = createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);
    const translation = [250,200,50];

    const angleX = degreesToRadians(15);
    const angleY = degreesToRadians(25);
    const angleZ = degreesToRadians(0);
    const cX = Math.cos(angleX);
    const sX = Math.sin(angleX);
    const cY = Math.cos(angleY);
    const sY = Math.sin(angleY);
    const cZ = Math.cos(angleZ);
    const sZ = Math.sin(angleZ);
    const sx = 1;
    const sy = 1;
    const sz = 1;
    const projectionWidth = (gl.canvas as HTMLCanvasElement).clientWidth;
    const projectionHeight = (gl.canvas as HTMLCanvasElement).clientHeight;
    const projectionDepth = 400;
    const projectionMatrix = mat4.fromValues(
        2 / projectionWidth, 0, 0, 0,
        0, -2 / projectionHeight, 0, 0,
        0, 0, 2 / projectionDepth, 0,
        -1, 1, 0, 1
    )
    const translationMatrix = mat4.fromValues(
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        translation[0], translation[1], translation[2], 1,
    );
    const xRotationMatrix = mat4.fromValues(
        1, 0, 0, 0,
        0, cX, sX, 0,
        0, -sX, cX, 0,
        0, 0, 0, 1,
    );
    const yRotationMatrix = mat4.fromValues(
        cY, 0, -sY, 0,
        0, 1, 0, 0,
        sY, 0, cY, 0,
        0, 0, 0, 1,
    );
    const zRotationMatrix = mat4.fromValues(
        cZ, sZ, 0, 0,
        -sZ, cZ, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    );
    const scalingMatrix = mat4.fromValues(
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
    );
    let matrix = mat4.create();

    matrix = mat4.multiply(matrix, matrix, projectionMatrix);
    matrix = mat4.multiply(matrix, matrix, translationMatrix);
    matrix = mat4.multiply(matrix, matrix, xRotationMatrix);
    matrix = mat4.multiply(matrix, matrix, yRotationMatrix);
    matrix = mat4.multiply(matrix, matrix, zRotationMatrix);
    matrix = mat4.multiply(matrix, matrix, scalingMatrix);
    const vertexAttributes: Arrays = {
        a_position: {
            data: [
                // left column front
                0,   0,  0,
                30,   0,  0,
                0, 150,  0,
                0, 150,  0,
                30,   0,  0,
                30, 150,  0,

                // top rung front
                30,   0,  0,
                100,   0,  0,
                30,  30,  0,
                30,  30,  0,
                100,   0,  0,
                100,  30,  0,

                // middle rung front
                30,  60,  0,
                67,  60,  0,
                30,  90,  0,
                30,  90,  0,
                67,  60,  0,
                67,  90,  0,

                // left column back
                0,   0,  30,
                30,   0,  30,
                0, 150,  30,
                0, 150,  30,
                30,   0,  30,
                30, 150,  30,

                // top rung back
                30,   0,  30,
                100,   0,  30,
                30,  30,  30,
                30,  30,  30,
                100,   0,  30,
                100,  30,  30,

                // middle rung back
                30,  60,  30,
                67,  60,  30,
                30,  90,  30,
                30,  90,  30,
                67,  60,  30,
                67,  90,  30,

                // top
                0,   0,   0,
                100,   0,   0,
                100,   0,  30,
                0,   0,   0,
                100,   0,  30,
                0,   0,  30,

                // top rung right
                100,   0,   0,
                100,  30,   0,
                100,  30,  30,
                100,   0,   0,
                100,  30,  30,
                100,   0,  30,

                // under top rung
                30,   30,   0,
                30,   30,  30,
                100,  30,  30,
                30,   30,   0,
                100,  30,  30,
                100,  30,   0,

                // between top rung and middle
                30,   30,   0,
                30,   30,  30,
                30,   60,  30,
                30,   30,   0,
                30,   60,  30,
                30,   60,   0,

                // top of middle rung
                30,   60,   0,
                30,   60,  30,
                67,   60,  30,
                30,   60,   0,
                67,   60,  30,
                67,   60,   0,

                // right of middle rung
                67,   60,   0,
                67,   60,  30,
                67,   90,  30,
                67,   60,   0,
                67,   90,  30,
                67,   90,   0,

                // bottom of middle rung.
                30,   90,   0,
                30,   90,  30,
                67,   90,  30,
                30,   90,   0,
                67,   90,  30,
                67,   90,   0,

                // right of bottom
                30,   90,   0,
                30,   90,  30,
                30,  150,  30,
                30,   90,   0,
                30,  150,  30,
                30,  150,   0,

                // bottom
                0,   150,   0,
                0,   150,  30,
                30,  150,  30,
                0,   150,   0,
                30,  150,  30,
                30,  150,   0,

                // left side
                0,   0,   0,
                0,   0,  30,
                0, 150,  30,
                0,   0,   0,
                0, 150,  30,
                0, 150,   0,
            ],
            numComponents: 3
        },
        a_color: {
            data: new Uint8Array([
                // left column front
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // top rung front
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // middle rung front
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // left column back
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // top rung back
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // middle rung back
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // top
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,

                // top rung right
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,

                // under top rung
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,

                // between top rung and middle
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,

                // top of middle rung
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,

                // right of middle rung
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,

                // bottom of middle rung.
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,

                // right of bottom
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,

                // bottom
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,

                // left side
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
            ]),
            numComponents: 3
        }
    }

    const bufferInfo = createBufferInfoFromArrays(gl, vertexAttributes);
    resizeCanvasToDisplaySize(canvas);
    const uniforms = {
        u_matrix: matrix,
        u_color: [Math.random(), Math.random(), Math.random(), 1],
    };





    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(programInfo.program);

    setUniforms(programInfo, uniforms);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    drawBufferInfo(gl, bufferInfo);

}
