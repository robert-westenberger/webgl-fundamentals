import $ from 'jquery';
interface Options {
    width: number,
    height: number,
    value: number,
    xLabel: string,
    yLabel: string,
}

const defaultOptions: Options = {
    width: 300,
    height: 300,
    value: Math.PI / 5,
    xLabel: "X=",
    yLabel: "Y=",
};

function modClamp(v: number, range: number, opt_rangeStart?: number) {
    const start = opt_rangeStart || 0;
    if (range < 0.00001) {
        return start;
    }
    v -= start;
    if (v < 0) {
        v -= Math.floor(v / range) * range;
    } else {
        v = v % range;
    }
    return v + start;
}

export function create2DRotationInput(passedOptions?: Partial<Options>) {
    const canvas =<HTMLCanvasElement> document.getElementById("rotation");

    if (!canvas) {
        throw new Error ("Unable to find rotation input canvas");
    }

    const options = {...defaultOptions, ...passedOptions};

    canvas.width = options.width * window.devicePixelRatio;
    canvas.height = options.height * window.devicePixelRatio;
    canvas.style.width = options.width + "px";
    canvas.style.height = options.height + "px";
    canvas.onselectstart = () => false;

    const renderingContext = canvas.getContext("2d");

    const width = options.width;
    const height = options.height;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const gridSize = Math.floor(Math.min(halfWidth, halfHeight) * 0.8);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    let moving = false;
    const cursorRadius = 10;
    
    let angle = modClamp(options.value + Math.PI, Math.PI * 2);
    let circlePointX: number;
    let circlePointY: number;
    let flash = false;

    setInterval(function() {
        flash = !flash;
        if (moving) {
            drawCircle(renderingContext);
            // drawCircle(ctx, angle);
        }
    }, 500);

    drawCircle(renderingContext);

    function start() {
        moving = true;
        drawCircle(renderingContext);
    }

    function stop() {
        moving = false;
        drawCircle(renderingContext);
    }

    function trackMouse(e: MouseEvent) {
        const position = toLocal(e, canvas);

        angle = Math.atan2(position.x, position.y);
        const v = modClamp(angle + Math.PI, 2 * Math.PI);
        if (moving) {
            drawCircle(renderingContext);

            console.log({
                x: Math.sin(v), //circleSin,
                y: Math.cos(v), //circleCos,
                angle: v // ,
            });
        }
    }
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', trackMouse);
    canvas.addEventListener('mouseup', stop);
    // canvas.addEventListener('mousecapture', ??);


    function toLocal(e: MouseEvent, t: HTMLCanvasElement) {
        const offset = $(t).offset();
        if (!offset) {
            throw new Error("Unable to get offset");
        }
        let x = e.pageX - offset.left;
        let y = e.pageY - offset.top;

        x -= halfWidth;
        y -= halfHeight;
        return {x, y};
    }

    function computeCircleCenter() {
        const circleSin = Math.sin(angle);
        const circleCos = Math.cos(angle);

        circlePointX = circleSin * gridSize;
        circlePointY = circleCos * gridSize;
    }

    function inCircle(x: number, y: number) {
        computeCircleCenter();
        var dx = Math.abs(x - circlePointX);
        var dy = Math.abs(y - circlePointY);
        return dx * dx + dy * dy < cursorRadius * cursorRadius;
    }

    function drawCircle(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) {
            throw new Error("Unable to find rendering context in drawCircle");
        }
        const canvas = ctx.canvas;

        computeCircleCenter();

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.translate(centerX, centerY);
        drawGrid();
        drawTriangle();
        _drawCircle();
        drawCursor();
        drawCoords();
        ctx.restore();

        function drawGrid() {
            if (!ctx) {
                throw new Error("Unable to find rendering context in drawCircle");
            }
            for (let y = -1; y <= 1; ++y) {
                var position = y * gridSize;

                ctx.fillStyle = "#ccc";
                ctx.fillRect(-halfWidth, position, width, 1);
                ctx.fillRect(position, -halfWidth, 1, width);

                ctx.font = "10pt serif";
                ctx.fillStyle = "#888";
                ctx.fillText(String(y), position + 5, 12);
                if (y) {
                    ctx.fillText(String(-y), 5, position + 12);
                }
            }
        }

        function drawCoords() {
            if (!ctx) {
                throw new Error("Unable to find rendering context in drawCircle");
            }

            ctx.font = "10pt sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            //ctx.fillText("X=" + Math.sin(angle).toFixed(3), 10, -gridSize * 0.3);
            //ctx.fillText("Y=" + (-Math.cos(angle)).toFixed(3), 10, -gridSize * 0.3 + 14);
            for (var y = -2; y <= 2; ++y) {
                for (var x = -2; x <= 2; ++x) {
                    drawText(x, y);
                }
            }
            ctx.fillStyle = "#000";
            drawText(0, 0);

            function drawText(x: number, y: number) {
                if (!ctx) {
                    throw new Error("Unable to find rendering context in drawCircle");
                }
                ctx.fillText(options.xLabel + Math.sin(angle).toFixed(2), circlePointX / 2 + x - 25, y - 5);
                ctx.fillText(options.yLabel + (-Math.cos(angle)).toFixed(2), circlePointX + x - 30, circlePointY / 2 + y);
            }
        }

        function drawTriangle() {
            if (!ctx) {
                throw new Error("Unable to find rendering context in drawTriangle");
            }

            ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
            ctx.strokeStyle = "#888";
            ctx.beginPath();
            ctx.moveTo(0, 1);
            ctx.lineTo(circlePointX, 1);
            ctx.lineTo(circlePointX, circlePointY);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#888";
            ctx.fillRect(0, 0, circlePointX, 1);
            ctx.fillRect(circlePointX, 0, 1, circlePointY);

            function sign(v: number) {
                return v < 0 ? -1 : v > 0 ? 1 : 0;
            }

            var arrowSize = 7
            var backX = circlePointX - sign(circlePointX) * arrowSize;
            var backY = circlePointY - sign(circlePointY) * arrowSize;

            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.moveTo(circlePointX, 1);
            ctx.lineTo(backX, -arrowSize * 0.7);
            ctx.lineTo(backX, +arrowSize * 0.7);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(circlePointX, circlePointY);
            ctx.lineTo(circlePointX - arrowSize * 0.7, backY);
            ctx.lineTo(circlePointX + arrowSize * 0.7, backY);
            ctx.fill();
        }

        function _drawCircle() {
            if (!ctx) {
                throw new Error("Unable to find rendering context in _drawCircle");
            }
            ctx.strokeStyle = "#00f";
            ctx.beginPath();
            ctx.arc(0, 0, gridSize, 0, 360);
            ctx.closePath();
            ctx.stroke();
        }

        function drawCursor() {
            if (!ctx) {
                throw new Error("Unable to find rendering context in drawCursor");
            }
            ctx.strokeStyle = "#000";
            ctx.fillStyle = moving ? "rgba(100, 0, 255, 0.5)" : "rgba(0, 0, 255, " + (flash ? 0.3 : 0.1) + ")";
            ctx.beginPath();
            ctx.arc(circlePointX, circlePointY, cursorRadius, 0, 360);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}