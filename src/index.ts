import {createShader, createProgram} from './helpers';
import {vertexShaderSource, fragmentShaderSource} from './shaders/index';

const canvas =<HTMLCanvasElement> document.getElementById("c");

if (!canvas) {
    throw new Error ("Unable to find canvas");
}

const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }

    // START PREPROCESSING
    /* 
        Vertex shader  computing vertex positions. Will draw points,
        lines, or triangles.    
    */
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    /**
     * Fragment shader to compute a color for each pixel of the primitive 
     * currently being drawn.
     */
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = createProgram(gl, vertexShader!, fragmentShader!);
    
    // Get position from vertex shader
    const positionAttributeLocation = gl.getAttribLocation(program!, "aPosition");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = [
      0, 0,
      0, 1,
      1, 0,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Tell it to use our program (pair of shaders)
gl.useProgram(program!);
// Bind the attribute/buffer set we want.
gl.bindVertexArray(vao);

const primitiveType = gl.TRIANGLES;
const count = 3;
gl.drawArrays(primitiveType, offset, count);