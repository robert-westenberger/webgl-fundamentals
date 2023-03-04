const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 1) in float aPointSize;
layout(location = 0) in vec2 aPosition;
layout(location = 2) in vec3 aColor;

out vec3 vColor;

void main()
{
    vColor = aColor;
    gl_PointSize = aPointSize;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

in vec3 vColor;

out vec4 fragColor;

void main()
{
    fragColor = vec4(vColor, 1.0);
}
`;

export function attributes_2() {
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

    const bufferData = new Float32Array([
        0, 1,          100,        1,0,0,
        -1,-1,           32,        0,1,0,
        1,-1,           50,        0,0,1,
    ]);

    const vertData = new Float32Array([
        -0.6618,-0.7687, 	50, 	0.5849, 0.7600, 0.4662,
        -0.3149, 0.7417, 	10, 	0.9232, 0.9332, 0.4260,
        0.9749,-0.8996, 	40, 	0.6969, 0.5353, 0.1471,
        -0.9202,-0.2956, 	90, 	0.2899, 0.9056, 0.7799,
        0.4550,-0.0642, 	20, 	0.2565, 0.6451, 0.8498,
        0.6192, 0.5755, 	70, 	0.6133, 0.8137, 0.4046,
        -0.5946, 0.7057, 	20, 	0.6745, 0.5229, 0.4518,
        0.6365, 0.7236, 	70, 	0.4690, 0.0542, 0.7396,
        0.8625,-0.0835, 	20, 	0.3708, 0.6588, 0.8611,
        0.7997, 0.4695, 	70, 	0.7490, 0.3797, 0.6879,
    ]);

    const aPositionLoc = 0;
    const aPointSizeLoc = 1;
    const aColorLoc = 2;

    gl.vertexAttrib4f(aPositionLoc, 0, 0, 0, 1);
    gl.vertexAttrib1f(aPointSizeLoc, 50);
    gl.vertexAttrib4f(aColorLoc, 1, 0, 0, 1);

    const vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(aPointSizeLoc, 1, gl.FLOAT, false, 24, 8);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 24, 12);

    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);
    gl.enableVertexAttribArray(aPointSizeLoc);

    gl.drawArrays(gl.POINTS, 0, 10);
}
