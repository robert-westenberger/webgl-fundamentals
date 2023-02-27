import {
    createProgramInfo, 
    createBufferInfoFromArrays,
    resizeCanvasToDisplaySize,
    setBuffersAndAttributes,
    setUniforms,
    drawBufferInfo
} from "twgl.js";

const vertexShaderSource = `#version 300 es

    in vec3 position; // Attribute
    in vec3 normal;   // Attribute
    uniform float asp; // Windo aspect ratio: hindow.width/window.height
  
    out vec3 fragNormal; // Variable whose value will be associated with the gl_position.

    void main () {
      gl_Position = vec4(position.x/asp, position.yz, 1); 
      // Note: gl_Position is a A predefined vec4 variable.  It must be set with a vec4 value.
      fragNormal = normalize(normal);
    }`;

  const fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec3 fragNormal;

    out vec4 outColor; // User-defined output variable for  

    void main () {
      vec3 N = normalize(fragNormal);
      //vec3 color = (N+1.0)/2.0;
      outColor = vec4(abs(N), 1);
    }`;

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


const axes = [
    ...yAxis,
    ...xAxis

];
const axesLength = axes.length / 2;

const useAspectRatio = true;


const cellDensity = 5;

const linePositions = Array.from(Array(cellDensity)).reduce((prev, curr, index) => {
    const position = Number((index / cellDensity).toFixed(2));
    return [...prev, 
        // horizontal
        -1, position, 1, position,
        -1, -position, 1, -position,
        // vertical
        position, -1, position, 1,
        -position, -1, -position, 1
    ];
}, []);



export function twoDSpaceTWGL() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }
    
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }


    const programInfo = createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);
    
    const vertexAttributes = [
        {
          position: {
            numComponents: 3,
            data: [1, 0, 0, 0, 1, 0, -1, -1, 0]
          }, // Attribute position
          normal: {
            numComponents: 3,
            data: [1, 0, 1, 0, 1, 1, -1, -1, -1]
          } // Attribtue normal
        }
      ];

    const bufferInfoArray = vertexAttributes.map((d) =>
        createBufferInfoFromArrays(gl, d)
  )
    
  const uniforms = {
    asp: useAspectRatio ? gl.canvas.width / gl.canvas.height : 1
  };

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
  gl.useProgram(programInfo.program);
  
  bufferInfoArray.forEach((bufferInfo) => {
    setUniforms(programInfo, uniforms);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    drawBufferInfo(gl, bufferInfo);
  });
}
