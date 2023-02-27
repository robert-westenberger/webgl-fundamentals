/**
 * 
 * @param gl - WebGL rendering context
 * @param x - x coord of top left corner
 * @param y - y coord of top left corner
 * @param width - rectangle width
 * @param height - rectangle height
 */
export function setRectangle(
    gl: WebGL2RenderingContext, 
    x: number, y: number, 
    width: number, 
    height:number
    ) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
   
    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
   
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2]), gl.STATIC_DRAW);
  }