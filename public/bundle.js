(()=>{"use strict";var e={10:(e,r)=>{Object.defineProperty(r,"__esModule",{value:!0}),r.createShader=void 0,r.createShader=function(e,r,t){var a=e.createShader(r);if(!a)throw Error("Unable to create shader");if(e.shaderSource(a,t),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS))return a;console.log(e.getShaderInfoLog(a)),e.deleteShader(a)}},489:(e,r,t)=>{Object.defineProperty(r,"__esModule",{value:!0}),r.createShader=void 0;var a=t(10);Object.defineProperty(r,"createShader",{enumerable:!0,get:function(){return a.createShader}})}},r={};!function t(a){var o=r[a];if(void 0!==o)return o.exports;var d=r[a]={exports:{}};return e[a](d,d.exports,t),d.exports}(489)})();