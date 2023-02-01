import {
    createShader,
     createProgram,
     resizeCanvasToDisplaySize
    } from './helpers';
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
    
    if (!vertexShader || !fragmentShader) {
        throw new Error("Unable to initialize shaders");
    }
    /* Create a GLSL program by linking our two shaders to the rendering
    context */
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    
    if (!program) {
        throw new Error("Unable to initialize program");
    }
    // Get position from vertex shader
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    
    // Attributes get their data from buffers so we need to create a buffer
    const positionBuffer = gl.createBuffer();

    // WebGL exposes global "bind points", essentially internal 
    // global variables inside WebGL, to allow us to bind a resource
    // to it (the bind point) and then reference that resource
    // through that bind point.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = [
     0, 0,
     0, 0.5,
    0.7, 0,
    ];
    
    // WebGL needs strongly typed data, so we create a new array
    // of 32bit floating point numbers.
    const positionData = new Float32Array(positions);

    // Data is loaded into the buffer by referencing it's bind point.
    // The below fn copies the values from positionData to the
    // positionBuffer on the GPU. It's using the positionBuffer
    // because we bound it to the ARRAY_BUFFER bind point above.
    gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);
    // END PREPROCESSING

    // START RENDERING

    // Use helper function to make the number of pixels in the canvas
    // match the size it's displayed.
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Call gl.viewport, passing the current size of the canvas,
    // to tell WebGL how to convert from clip space values 
    // we'll be setting in gl_Position back into pixels, often 
    // called screen space.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // The above tells WebGL that the -1 + 1 clip space maps to
    // 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y.

    // Clear the color (0,0,0,0) = (red,green,blue,alpha) = transparent.
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell WebGL to execute our shader program.
    gl.useProgram(program);

    // Need to tell WebGL how to take data from the position buffer
    // above  and supply it to the attribute in the shader. 
    // First, we need to turn the attribute on.
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Then specify how to pull the data out.

    // Bind the position buffer. (Do we need to do this twice..?)
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of 
    // the positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    // Above, a hidden part of gl.vertexAttribPointer is that it binds
    // the current ARRAY_BUFFER to the attribute. Now this attribute
    // is bound to positionBuffer. That means we're free to bind something
    // else to the ARRAY_BUFFER bind point. The attribute will continue
    // to use positionBuffer.


    // Now, ask WebGL to execute our GLSL program.
    const primitiveType = gl.TRIANGLES;
    const count = 3;
    // Because the count is 3, this will execute our vertex
    // shader 3 times. The first time, a_position.x and a_position.y
    // in our vertex shader attribute will be set to the first
    // 2 values from the positionBuffer. The second time
    // a_position.x and a_position.y will be set to the second 2 vals.
    // The last time they will be set to the last 2 vals.

    // Because primitiveType is gl.TRIANGLES, each time our vertex
    // shader is run 3 times WebGL will draw a triangle based on
    // the 3 values we set gl_Position to. No matter what size
    // our canvas is, those values are in clip space coords
    // that go from -1 to 1 i neach direction.
    gl.drawArrays(primitiveType, offset, count);


