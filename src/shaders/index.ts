export const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
// Our vertex shader's a_position attribute is a vec4, a
// vector of 4 single-precision floating-point numbers.
// In JS, it would be something like a_position = {x: 0, y: 0, z: 0, w: 0}
in vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;


export const vertexShader2DSource = `#version 300 es
in vec2 a_position;
uniform vec2 u_resolution;
 
void main() {
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace, 0, 1);
}
`;

export const vertexShader2DFlippedSource = `#version 300 es
in vec2 a_position;
uniform vec2 u_resolution;
 
void main() {
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

export const vertexShader2DTranslationSource = `#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;

void main() {
   // Add in the translation.
   vec2 position = a_position + u_translation;

   // convert the position from pixels to 0.0 to 1.0
   vec2 zeroToOne = position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

export const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outputCol;
 
void main() {
  // Just set the output to a const blue
  outputCol = vec4(0, 0, 1, 1);
}
`;

export const fragmentShaderDynamicRectangleSource = `#version 300 es
 
precision mediump float;
uniform vec4 u_color;
out vec4 FragColor;

void main() {
  FragColor = u_color;
}
`;