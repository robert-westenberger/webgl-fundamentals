import {
    createProgramInfo,
    createBufferInfoFromArrays,
    resizeCanvasToDisplaySize,
    setBuffersAndAttributes,
    setUniforms,
    drawBufferInfo,
    Arrays,
    drawObjectList,
    DrawObject,
    primitives
} from "twgl.js";
import {mat3} from "gl-matrix";
import {getCircleVertices} from "../helpers/getCircleVertices";

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

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
  // outColor = vec4(1, 0, 0, 1); // return red
}`;


function setRectangle(x: number, y: number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    return [
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ];
}

interface Uniforms {
    u_matrix: mat3;
    u_resolution: [number, number];
    u_color: [number, number, number, number];
}
interface ObjectData {
    translation: [number, number];
    uniforms: Uniforms;
}
export function multipleDifferentShapes() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }


    const programInfo = createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);


    const circleBuffer = createBufferInfoFromArrays(gl,
        {
            a_position: {
                data: getCircleVertices(),
                numComponents: 2,

            } }
    );
    const squareBuffer = createBufferInfoFromArrays(gl,
        {
            a_position: {
                data: setRectangle(0, 0, 1, 1),
                numComponents: 2,

            } }
    );
    const squareObj = {
        bufferInfo: squareBuffer,

    }
    const circleObj = {
        bufferInfo: circleBuffer,
        type: gl.TRIANGLE_FAN
    }
    const drawObjects: DrawObject[] = [];
    const numObjects = 100;

    for (let ii = 0; ii < numObjects; ++ii) {
        const translation = [rand(0, 100), rand(0, 100)];
        const angleInRadians = 0;
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        const scale = rand(1, 10);
        const sx = scale;
        const sy = scale;

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

        const uniforms: Uniforms = {
            u_matrix: matrix,
            u_resolution: [gl.canvas.width, gl.canvas.height],
            u_color: [Math.random(), Math.random(), Math.random(), 1],
        };

        drawObjects.push({
            programInfo: programInfo,
            uniforms: uniforms,
            ...(Math.random() > 0.5 ? circleObj : squareObj)
        });
    }

    resizeCanvasToDisplaySize(gl!.canvas as HTMLCanvasElement);
    gl!.viewport(0, 0, gl!.canvas.width, gl!.canvas.height);

    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);


    drawObjectList(gl!, drawObjects);


}
