const vertexShaderSource = `#version 300 es

layout(location=0) in vec4 aPosition;
layout(location=1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
   vTexCoord = aTexCoord;
   gl_Position = aPosition;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec2 vTexCoord;
uniform sampler2D uSampler;
out vec4 fragColor;
void main() {
   fragColor = texture(uSampler, vTexCoord);
}
`;

export function textures() {
    const canvas =<HTMLCanvasElement> document.getElementById("c");

    if (!canvas) {
        throw new Error ("Unable to find canvas");
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw Error("No WebGL Rendering Context");
    }

    const program = gl.createProgram();

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader!, vertexShaderSource);
    gl.compileShader(vertexShader!);
    gl.attachShader(program!, vertexShader!);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader!, fragmentShaderSource);
    gl.compileShader(fragmentShader!);
    gl.attachShader(program!, fragmentShader!);

    gl.linkProgram(program!);

    if (!gl.getProgramParameter(program!, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader!));
        console.log(gl.getShaderInfoLog(fragmentShader!));
    }

    gl.useProgram(program);

    const vertexBufferData = new Float32Array([
        -.9, -.9,
        0, .9,
        .9, -.9
    ]);

    const texCoordBufferData = new Float32Array([
        0, 0,
        .5, 1,
        1, 0
    ]);

    const pixels = new Uint8Array([
        255,255,255,		230,25,75,			60,180,75,			255,225,25,
        67,99,216,			245,130,49,			145,30,180,			70,240,240,
        240,50,230,			188,246,12,			250,190,190,		0,128,128,
        230,190,255,		154,99,36,			255,250,200,		0,0,0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0,0 )
    gl.enableVertexAttribArray(0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false,0, 0);
    gl.enableVertexAttribArray(1);

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 4, 4, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);

    // gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
