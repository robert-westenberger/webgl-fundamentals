import { useRef, useEffect, useState } from 'react';
import './App.css';
import {createShader, createProgram} from './helpers';
import {vertexShaderSource, fragmentShaderSource} from './shaders/index';


function App() {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGL] = useState<WebGL2RenderingContext>();
  const [hasRenderingContext, setHasRenderingContext] = useState(false);

  if (canvasRef.current) {
    
  }

  useEffect(() => {
    if (!hasRenderingContext && canvasRef.current) {
      const context = canvasRef.current.getContext('webgl2');
      if (context) {
        setHasRenderingContext(true);
        setGL(context);

      }
      
    }
  }, [hasRenderingContext]);

  if (hasRenderingContext && gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader!, fragmentShader!);
    const positionAttributeLocation = gl.getAttribLocation(program!, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      0, 0,
      0, 0.5,
      0.7, 0,
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
        positionAttributeLocation, size, type, normalize, stride, offset)

  }
  return (
    <div className="App">
      <canvas id="primaryRenderingContext" ref={canvasRef} />
    </div>
  );
}

export default App;
