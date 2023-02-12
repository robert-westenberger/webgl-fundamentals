import {
    createShader,
     createProgramLegacy as createProgram,
     resizeCanvasToDisplaySize
    } from './helpers';
import {
    // vertexShader2DSource,
    //  vertexShader2DFlippedSource,
    // fragmentShaderSource
} from './shaders';


const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(0, 0.5, 1, 1);
}
`;
export function twoDSpace() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }
    
    const gl = canvas.getContext("webgl2");
        if (!gl) {
            throw Error("No WebGL Rendering Context");
        }
    
       
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            throw new Error("Unable to initialize shaders");
        }
       
        const program = createProgram(gl, vertexShader, fragmentShader);
        
        if (!program) {
            throw new Error("Unable to initialize program");
        }
        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

         
        const axesThickness = 0.01;
        const gridStepSize = 0.15;
       const yAxis = [
        -axesThickness, -1,
        -axesThickness, 1,
        axesThickness, 1,
        axesThickness, 1,
        axesThickness, -1,
        -axesThickness, -1
       ];
       const xAxis = [
        -1, -axesThickness,
        1, -axesThickness,
        1, axesThickness,
        1, axesThickness,
        -1, axesThickness,
        -1, -axesThickness
       ];


        const positions = [
            ...yAxis,
            ...xAxis
   
        ];
        const axes = positions.length / 2;
        
        

        for (let i = 0; i < 1 + gridStepSize; i += gridStepSize) {
            // horizontal 
            positions.push(-1, i, 1, i);
            positions.push(-1, -i, 1, -i);
            // vertical
            positions.push(i, -1, i, 1);
            positions.push(-i, -1, -i, 1);
        }

    
        const positionData = new Float32Array(positions);
        

        gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);
  
        

        


        resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
   
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        

    
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = true; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, axes);
        const primitiveType = gl.LINES;
        const count = (positions.length / size) - axes;
        gl.drawArrays(primitiveType, axes, count);
    
        
}
