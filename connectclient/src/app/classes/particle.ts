import { Vector2 } from './vector2';
export class Particle {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    flicker: number = 0;
    opacity: number;
    color: string = '#FFEED4';
    neighbors: Particle[];
    canvasRef;
    mousePosRef: Vector2;
    contextRef: CanvasRenderingContext2D;
    nPosRef: Vector2;
    motion: number;
    noiseStrength: number;
    particleSizeBase: number = 1;
    particleSizeMultiplier: number = 0.5;
    flickerSmoothing: number = 15;
    bFlicker: boolean;
    bRenderParticleGlare: boolean = true;
    glareAngle: number = -60;
    glareOpacityMultiplier: number = 0.05;

    constructor(
        canvasRef, 
        contextRef,
        mousePosRef: Vector2, 
        nPosRef: Vector2, 
        noiseStrength: number, 
        motion: number
        ){
        this.x = this.random(-0.1, 1.1, true);
        this.y = this.random(-0.1, 1.1, true);
        this.z = this.random(0.3, 4);
        this.opacity = this.random(0.1,1,true);
        this.neighbors = [];
        this.noiseStrength = noiseStrength;
        this.motion = motion;
        this.bFlicker = true;

        this.canvasRef = canvasRef;
        this.contextRef = contextRef;
        this.mousePosRef = mousePosRef;
        this.nPosRef = nPosRef;
    }

    random(min: number, max: number, bFloat: boolean = false) {
        return bFloat ?
            Math.random() * (max - min) + min :
            Math.floor(Math.random() * (max - min + 1)) + min;
    }

    render() {
        let pos = this.position(this.x, this.y, this.z);
        let r = ((this.z * this.particleSizeMultiplier) + this.particleSizeBase) * (this.sizeRatio() / 1000);
        let o = this.opacity;

        if(this.bFlicker) {
            this.flicker += (this.random(-0.5, 0.5, true) -this.flicker) /this.flickerSmoothing
            if (this.flicker > 0.5) this.flicker = 0.5;
            if (this.flicker < -0.5) this.flicker = -0.5;
            o += this.flicker;
            if (o > 1) o = 1;
            if (o < 0) o = 0;
        }
        this.contextRef.fillStyle = this.color;
        this.contextRef.globalAlpha = o;
        this.contextRef.beginPath();
        this.contextRef.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
        this.contextRef.fill();
        this.contextRef.closePath();
        if (this.bRenderParticleGlare) {
            this.contextRef.globalAlpha = o * this.glareOpacityMultiplier;
            /*
            this.contextRef.ellipse(pos.x, pos.y, r * 30, r, 90 * (Math.PI / 180), 0, 2 * Math.PI, false);
            this.contextRef.fill();
            this.contextRef.closePath();
            */
            this.contextRef.ellipse(pos.x, pos.y, r * 100, r, (this.glareAngle - ((this.nPosRef.x - 0.5) * this.noiseStrength * this.motion)) * (Math.PI / 180), 0, 2 * Math.PI, false);
            this.contextRef.fill();
            this.contextRef.closePath();
        }
    
        this.contextRef.globalAlpha = 1;
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