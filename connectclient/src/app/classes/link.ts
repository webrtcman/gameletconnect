import { Particle } from "./particle";
import { Vector2 } from "./vector2";

export class Link {
    color: string = '#FFEED4';

    length;
    verts;
    stage = 0;
    linked;
    distances = [];
    traveled = 0;
    fade = 0;
    finished = false;

    lineWidth: number = 1;
    linkOpacity: number = 0.25;
    linkFade: number = 90;
    linkSpeed: number = 0.25;

    canvasRef;
    mousePosRef: Vector2;
    contextRef: CanvasRenderingContext2D;
    nPosRef: Vector2;
    motion: number;
    noiseStrength: number;

    particlesRef: Particle[]

    constructor(
        startVertex,
        numPoints,
        canvasRef,
        contextRef: CanvasRenderingContext2D,
        mousePosRef: Vector2,
        particlesRef: Particle[],
        nPosRef: Vector2,
        noiseStrength: number,
        motion: number
    ) {
        this.length = numPoints;
        this.verts = [startVertex];
        this.linked = [startVertex];

        this.canvasRef = canvasRef;
        this.contextRef = contextRef;
        this.mousePosRef = mousePosRef;
        this.nPosRef = nPosRef;

        this.noiseStrength = noiseStrength;
        this.motion = motion;

        this.particlesRef = particlesRef;

    }

    render() {
        let i, p, pos, points;

        switch (this.stage) {
            // VERTEX COLLECTION STAGE
            case 0:
                this.renderStage0();
                break;

            case 1:
                this.renderStage1();
                break;

            case 2:
                this.renderStage2();
                break;

            // FINISHED STAGE
            case 3:
            default:
                this.finished = true;
                break;
        }

    }

    renderStage0() {
        // Grab the last member of the link
        let last = this.particlesRef[this.verts[this.verts.length - 1]];
        //console.log(JSON.stringify(last));
        if (last && last.neighbors && last.neighbors.length > 0) {
            // Grab a random neighbor
            let neighbor = last.neighbors[this.random(0, last.neighbors.length - 1)];
            // If we haven't seen that particle before, add it to the link
            if (this.verts.indexOf(neighbor) == -1) {
                this.verts.push(neighbor);
            }
            // If we have seen that particle before, we'll just wait for the next frame
        }
        else {
            //console.log(this.verts[0]+' prematurely moving to stage 3 (0)');
            this.stage = 3;
            this.finished = true;
        }

        if (this.verts.length >= this.length) {
            // Calculate all distances at once
            for (let i = 0; i < this.verts.length - 1; i++) {
                let p1 = this.particlesRef[this.verts[i]],
                    p2 = this.particlesRef[this.verts[i + 1]],
                    dx = p1.x - p2.x,
                    dy = p1.y - p2.y,
                    dist = Math.sqrt(dx * dx + dy * dy);

                this.distances.push(dist);
            }
            //console.log('Distances: '+JSON.stringify(this.distances));
            //console.log('verts: '+this.verts.length+' distances: '+this.distances.length);

            //console.log(this.verts[0]+' moving to stage 1');
            this.stage = 1;
        }
    }
    renderStage1() {

        if (!(this.distances.length > 0)) {
            this.stage = 3;
            this.finished = true;
            return;
        }


        let points, i, p, pos;
        points = [];

        // Gather all points already linked
        for (i = 0; i < this.linked.length; i++) {
            p = this.particlesRef[this.linked[i]];
            pos = this.position(p.x, p.y, p.z);
            points.push([pos.x, pos.y]);
        }

        var linkSpeedRel = this.linkSpeed * 0.00001 * this.canvasRef.width;
        this.traveled += linkSpeedRel;
        var d = this.distances[this.linked.length - 1];
        // Calculate last point based on linkSpeed and distance travelled to next point
        if (this.traveled >= d) {
            this.traveled = 0;

            // We've reached the next point, add coordinates to array
            //console.log(this.verts[0]+' reached vertex '+(this.linked.length+1)+' of '+this.verts.length);
            this.linked.push(this.verts[this.linked.length]);
            p = this.particlesRef[this.linked[this.linked.length - 1]];
            pos = this.position(p.x, p.y, p.z);
            points.push([pos.x, pos.y]);

            if (this.linked.length >= this.verts.length) {
                //console.log(this.verts[0]+' moving to stage 2 (1)');
                this.stage = 2;
            }
        }
        else {
            // We're still travelling to the next point, get coordinates at travel distance
            // http://math.stackexchange.com/a/85582
            var a = this.particlesRef[this.linked[this.linked.length - 1]],
                b = this.particlesRef[this.verts[this.linked.length]],
                t = d - this.traveled,
                x = ((this.traveled * b.x) + (t * a.x)) / d,
                y = ((this.traveled * b.y) + (t * a.y)) / d,
                z = ((this.traveled * b.z) + (t * a.z)) / d;

            pos = this.position(x, y, z);

            //console.log(this.verts[0]+' traveling to vertex '+(this.linked.length+1)+' of '+this.verts.length+' ('+this.traveled+' of '+this.distances[this.linked.length]+')');

            points.push([pos.x, pos.y]);
        }

        this.drawLine(points);

    }

    renderStage2() {
        let points, i, p, pos;
        if (this.verts.length > 1) {
            if (this.fade < this.linkFade) {
                this.fade++;

                // Render full link between all vertices and fade over time
                points = [];
                var alpha = (1 - (this.fade / this.linkFade)) * this.linkOpacity;
                for (i = 0; i < this.verts.length; i++) {
                    p = Particle[this.verts[i]];
                    pos = this.position(p?.x, p?.y, p?.z);
                    points.push([pos.x, pos.y]);
                }
                this.drawLine(points, alpha);
            }
            else {
                //console.log(this.verts[0]+' moving to stage 3 (2a)');
                this.stage = 3;
                this.finished = true;
            }
        }
        else {
            //console.log(this.verts[0]+' prematurely moving to stage 3 (2b)');
            this.stage = 3;
            this.finished = true;
        }
    }

    drawLine(points, alpha = null) {
        if (typeof alpha !== 'number')
            alpha = this.linkOpacity;

        if (points.length > 1 && alpha > 0) {
            //console.log(this.verts[0]+': Drawing line '+alpha);
            this.contextRef.globalAlpha = alpha;
            this.contextRef.beginPath();
            for (var i = 0; i < points.length - 1; i++) {
                this.contextRef.moveTo(points[i][0], points[i][1]);
                this.contextRef.lineTo(points[i + 1][0], points[i + 1][1]);
            }
            this.contextRef.strokeStyle = this.color;
            this.contextRef.lineWidth = this.lineWidth;
            this.contextRef.stroke();
            this.contextRef.closePath();
            this.contextRef.globalAlpha = 1;
        }
    }

    random(min: number, max: number, bFloat: boolean = false) {
        return bFloat ?
            Math.random() * (max - min) + min :
            Math.floor(Math.random() * (max - min + 1)) + min;
    }

    position(x = 0, y = 0, z = 0) {
        return {
            x: (x * this.canvasRef.width) + ((((this.canvasRef.width / 2) - this.mousePosRef.x + ((this.nPosRef.x - 0.5) * this.noiseStrength)) * z) * this.motion),
            y: (y * this.canvasRef.height) + ((((this.canvasRef.height / 2) - this.mousePosRef.y + ((this.nPosRef.y - 0.5) * this.noiseStrength)) * z) * this.motion)
        };
    }
}