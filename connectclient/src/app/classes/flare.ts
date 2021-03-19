import { Vector2 } from "./vector2";

export class Flare {

    x: number;
    y: number;
    z: number;
    color: string = '#FFEED4';
    opacity: number;

    canvasRef;
    mousePosRef: Vector2;
    contextRef: CanvasRenderingContext2D;
    nPosRef: Vector2;
    motion: number = 0.05;
    noiseStrength: number;

    flareSizeBase: number = 100;
    flareSizeMultiplier: number = 100;


    constructor(
        canvasRef,
        contextRef,
        mousePosRef: Vector2,
        nPosRef: Vector2,
        noiseStrength: number,
        motion: number
    ) {
        this.x = this.random(-0.25, 1.25, true);
        this.y = this.random(-0.25, 1.25, true);
        this.z = this.random(0, 2);
        this.opacity = this.random(0.001, 0.01, true);

        this.canvasRef = canvasRef;
        this.contextRef = contextRef;
        this.mousePosRef = mousePosRef;
        this.nPosRef = nPosRef;

        this.noiseStrength = noiseStrength;
        this.motion = motion;
    }

    render() {
        let pos = this.position(this.x, this.y, this.z),
            r = ((this.z * this.flareSizeMultiplier) + this.flareSizeBase) * (this.sizeRatio() / 1000);

        this.contextRef.beginPath();
        this.contextRef.globalAlpha = this.opacity;
        this.contextRef.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
        this.contextRef.fillStyle = this.color;
        this.contextRef.fill();
        this.contextRef.closePath();
        this.contextRef.globalAlpha = 1;
    }

    random(min: number, max: number, bFloat: boolean = false) {
        return bFloat ?
            Math.random() * (max - min) + min :
            Math.floor(Math.random() * (max - min + 1)) + min;
    }

    position(x, y, z) {
        return {
            x: (x * this.canvasRef.width) + ((((this.canvasRef.width / 2) - this.mousePosRef.x + ((this.nPosRef.x - 0.5) * this.noiseStrength)) * z) * this.motion),
            y: (y * this.canvasRef.height) + ((((this.canvasRef.height / 2) - this.mousePosRef.y + ((this.nPosRef.y - 0.5) * this.noiseStrength)) * z) * this.motion)
        };
    }

    sizeRatio() {
        return this.canvasRef.width >= this.canvasRef.height ? this.canvasRef.width : this.canvasRef.height;
    }
}