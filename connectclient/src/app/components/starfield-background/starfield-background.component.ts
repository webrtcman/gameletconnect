import { AfterViewInit, NgZone } from '@angular/core';
// Copyright (c) 2021 by Cory Hughart (https://codepen.io/cr0ybot/pen/zNyYeW)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// Ported to typescript from Johannes Franzen

import { Vector2 } from './../../classes/vector2';
import { Component, OnInit, ViewChild } from '@angular/core';
import Delaunay from 'delaunay-fast';
import { Particle } from 'src/app/classes/particle';
import { Flare } from 'src/app/classes/flare';
import { Link } from 'src/app/classes/link';

@Component({
  selector: 'app-starfield-background',
  templateUrl: './starfield-background.component.html',
  styleUrls: ['./starfield-background.component.css']
})
export class StarfieldBackgroundComponent implements OnInit, AfterViewInit {

  @ViewChild('starcanvas') canvas;
  canvasCtx: CanvasRenderingContext2D;

  mousePosition: Vector2;


  bRenderParticles: boolean = true;
  bRenderFlares: boolean = true;
  bFlicker: boolean = true;
  bRandomMotion = true;

  color: string = '#FFEED4';
  motion: number = 0.05;
  tilt: number = 0.05;

  flareCount: number = 5;

  particleCount: number = 30;

  linkChance: number = 200; //Higher = lower chance
  linkLengthMin: number = 5;
  linkLengthMax: number = 7;

  blurSize: number = 0;

  noiseLength: number = 1000;
  noiseStrength: number = 1;

  n: number = 0;
  delaunayMultiplier: number = 1000;
  nAngle = (Math.PI * 2) / this.noiseLength;
  nRad = 100;
  nPos: Vector2;
  points = [];
  vertices = [];
  triangles = [];
  links: Link[] = [];
  particles: Particle[] = [];
  flares: Flare[] = [];

  frameCounter: number = 0;
  performanceProfile: number = 0;

  constructor(private ngZone: NgZone) {
    this.nPos = new Vector2();
    this.mousePosition = new Vector2();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

    this.canvasCtx = this.canvas.nativeElement.getContext('2d');
    this.init();
  }

  init() {
    let i, j, k;

    this.resize();

    this.mousePosition.x = this.canvas.nativeElement.clientWidth / 2;
    this.mousePosition.y = this.canvas.nativeElement.clientHeight / 2;

    for (i = 0; i < this.particleCount; i++) {
      var p = new Particle(this.canvas.nativeElement, this.canvasCtx, this.mousePosition, this.nPos, this.noiseStrength, this.motion);
      this.particles.push(p);
      this.points.push([p.x * this.delaunayMultiplier, p.y * this.delaunayMultiplier]);
    }

    this.vertices = Delaunay.triangulate(this.points);
    let tri = [];

    for (i = 0; i < this.vertices.length; i++) {
      if (tri.length == 3) {
        this.triangles.push(tri);
        tri = [];
      }
      tri.push(this.vertices[i]);
    }

    for (i = 0; i < this.particles.length; i++) {
      // Loop through all tirangles
      for (j = 0; j < this.triangles.length; j++) {
        // Check if this particle's index is in this triangle
        k = this.triangles[j].indexOf(i);
        // If it is, add its neighbors to the particles contacts list
        if (k !== -1) {
          this.triangles[j].forEach((value, index, array) => {
            if (value !== i && this.particles[i].neighbors.indexOf(value) == -1) {
              this.particles[i].neighbors.push(value);
            }
          });
        }
      }
    }

    if (this.bRenderFlares) {
      // Create flare positions
      for (i = 0; i < this.flareCount; i++) {
        this.flares.push(new Flare(this.canvas.nativeElement, this.canvasCtx, this.mousePosition, this.nPos, this.noiseStrength, this.motion));
      }
      this.ngZone.runOutsideAngular(() => {
        document.body.addEventListener('mousemove', (e) => {
          //console.log('moved');
          this.mousePosition.x = e.clientX;
          this.mousePosition.y = e.clientY;
        });
      });
    }

    this.animloopProfiled();
  }

  animloopProfiled() {
    
    this.frameCounter++;
    //Take perf sample before rendering 
    if (this.frameCounter % 4 !== 0)
      return window.requestAnimationFrame(() => this.animloopProfiled());

    let perf = performance.now()
    this.resize();
    this.render();
    //subtract new perf sample from old to get cpu time and add it to total
    this.performanceProfile += performance.now() - perf;

    //at 1500 frames => 750 anim update calculate how long one anim update took on avg
    if (this.frameCounter == 1500) {
      let totalPerf = this.performanceProfile / 750;
      console.log(totalPerf);

      if (totalPerf > 1)
        console.log("slow pc detected")

      //run unprofiled version after this
      window.requestAnimationFrame(() => this.animloop());
      return;
    }
    window.requestAnimationFrame(() => this.animloopProfiled());
  }
  animloop() {

    this.frameCounter++;
    if (this.frameCounter % 4 === 0)
      return window.requestAnimationFrame(() => this.animloop());

    this.resize();
    this.render();
    
    window.requestAnimationFrame(() => this.animloop());
  }
  render() {
    this.n++;
    if (this.n >= this.noiseLength) {
      this.n = 0;
    }
    this.nPos = this.noisePoint();

    this.canvasCtx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    if (this.blurSize > 0) {
      this.canvasCtx.shadowBlur = this.blurSize;
      this.canvasCtx.shadowColor = this.color;
    }

    for (let i = 0; i < this.particleCount; i++) {
      this.particles[i].render();
    }

    if (this.random(0, this.linkChance) === this.linkChance - 10) {
      let length = this.random(this.linkLengthMin, this.linkLengthMax);
      let start = this.random(0, this.particles.length - 1);
      this.startLink(start, length);
    }

    // Render existing links
    // Iterate in reverse so that removing items doesn't affect the loop
    for (let l = this.links.length - 1; l >= 0; l--) {
      if (this.links[l] && !this.links[l].finished) {
        this.links[l].render();
      }
      else {
        delete this.links[l];
      }
    }

    for (let j = 0; j < this.flareCount; j++) {
      this.flares[j].render();
    }
  }

  resize() {
    this.canvas.nativeElement.width = window.innerWidth * (window.devicePixelRatio || 1);
    this.canvas.nativeElement.height = window.innerHeight * (window.devicePixelRatio || 1);
  }

  noisePoint(): Vector2 {
    let a = this.nAngle * this.n,
      cosA = Math.cos(a),
      sinA = Math.sin(a),
      //value = simplex.noise2D(nScale * cosA + nScale, nScale * sinA + nScale),
      //rad = nRad + value;
      rad = this.nRad;
    return {
      x: rad * cosA,
      y: rad * sinA
    };
  }

  random(min: number, max: number, bFloat: boolean = false) {
    return bFloat ?
      Math.random() * (max - min) + min :
      Math.floor(Math.random() * (max - min + 1)) + min;
  }
  startLink(vertex: number, length: number) {
    this.links.push(new Link(vertex, length, this.canvas.nativeElement, this.canvasCtx, this.mousePosition, this.particles, this.nPos, this.noiseStrength, this.motion));
  }
}

