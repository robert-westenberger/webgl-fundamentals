import {
    createShader,
     createProgram,
     resizeCanvasToDisplaySize,
     randomInt,
     setRectangle
    } from './helpers';
import {
    // vertexShader2DSource,
     vertexShader2DFlippedSource,
    fragmentShaderDynamicRectangleSource} from './shaders/index';


export function sec1_dynamicRectangles() {
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
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShader2DFlippedSource);
        /**
         * Fragment shader to compute a color for each pixel of the primitive 
         * currently being drawn.
         */
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderDynamicRectangleSource);
        
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
        
        // Get uniform location 
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        const colorUniformLocation = gl.getUniformLocation(program, "u_color");
      
        // Attributes get their data from buffers so we need to create a buffer
        const positionBuffer = gl.createBuffer();
    
        // WebGL exposes global "bind points", essentially internal 
        // global variables inside WebGL, to allow us to bind a resource
        // to it (the bind point) and then reference that resource
        // through that bind point.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        const positions = [
            10, 20,
            80, 20,
            10, 30,
            10, 30,
            80, 20,
            80, 30,
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
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
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
    
        // Set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        // Now, ask WebGL to execute our GLSL program.
        

        for (let ii = 0; ii < 50; ++ii) {
            // Setup a random rectangle
            // This will write to positionBuffer because
            // its the last thing we bound on the ARRAY_BUFFER
            // bind point
            setRectangle(
                gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
        
            // Set a random color.
            gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
        
            // Draw the rectangle.
            const primitiveType = gl.TRIANGLES;
            const count = 6;
            gl.drawArrays(primitiveType, offset, count);
          }
    
        
}
