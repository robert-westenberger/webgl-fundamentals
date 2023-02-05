import {
    createShader,
     createProgram,
     resizeCanvasToDisplaySize,
     randomInt,
    setLetterF,
    setupSlider,
     setRectangle
    } from './helpers';
import {
    vertexShader2DTranslationSource,
    fragmentShaderDynamicRectangleSource} from './shaders/index';
import {ValuePayload} from "./helpers/setupSlider";


function drawScene(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    positionLocation: number,
    positionBuffer: WebGLBuffer,
    resolutionLocation: WebGLUniformLocation,
    translationLocation: WebGLUniformLocation,
    colorLocation: WebGLUniformLocation,
    color: number[],
    translation: [number, number]

) {
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Set the translation.
    gl.uniform2fv(translationLocation, translation);

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;

    const count = 18;  // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
}

export function translate_rectangles() {
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
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShader2DTranslationSource);
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
        const translationLocation = gl.getUniformLocation(program, "u_translation");
        const positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        setLetterF(gl);

        const translation: [number, number] = [0, 0];
        const color = [Math.random(), Math.random(), Math.random(), 1];
        if (!positionBuffer) {
            throw new Error( "unable to find position buffer");
        }
        if (!resolutionUniformLocation) {
            throw new Error( "unable to find resolution uniform location");
        }
        if (!colorUniformLocation) {
            throw new Error( "unable to find  color uniform location");
        }
        if (!translationLocation) {
            throw new Error( "unable to find translation  location");
        }
        drawScene(
            gl,
            program,
            positionAttributeLocation,
            positionBuffer,
            resolutionUniformLocation,
            translationLocation,
            colorUniformLocation,
            color,
            translation
            );

    function updatePosition(index: number) {
        return function(event: Event, ui: ValuePayload) {
            translation[index] = ui.value;
            drawScene(
                gl!,
                program!,
                positionAttributeLocation,
                positionBuffer!,
                resolutionUniformLocation!,
                translationLocation!,
                colorUniformLocation!,
                color!,
                translation!
            );
        };
    }

    // Setup a ui.
    setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});


}

