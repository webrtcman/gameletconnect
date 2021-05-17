/**
 * demolishedRenderer
 * @version 2.2.3
 * @author MagnusThor / https://github.com/MagnusThor
 * @repository https://github.com/MagnusThor/demolishedRenderer
 * Included manually due to a weird problem with webpack
 */
export interface ITx {
        unit: number;
        src?: any;
        fn?(prg: WebGLProgram, gl: WebGLRenderingContext, src: any): Function;
        w?: number;
        h?: number;
}
export class Dt {
        framebuffer: WebGLFramebuffer;
        renderbuffer: WebGLRenderbuffer;
        texture: WebGLTexture;
        textures: Array<string>;
        uniforms: any;
        locations: Map<string, WebGLUniformLocation>;
        constructor(gl: WebGLRenderingContext, textures: string[], customUniforms: any) {
                this.textures = new Array<string>();
                this.locations = new Map<string, WebGLUniformLocation>();
                this.framebuffer = gl.createFramebuffer();
                this.renderbuffer = gl.createRenderbuffer();
                this.texture = gl.createTexture();
                this.textures = textures;
                this.uniforms = customUniforms;
        }
}
export class DR {
        gl: WebGLRenderingContext;
        mainProgram: WebGLProgram;
        programs: Map<string, WebGLProgram>;
        surfaceBuffer: WebGLBuffer;
        textureCache: Map<string, ITx>;
        targets: Map<string, Dt>;
        mainUniforms: Map<string, WebGLUniformLocation>
        buffer: WebGLBuffer;
        vertexPosition: number;
        screenVertexPosition: number;
        frameCount: number = 0;
        animFrameId: number;
        header: string =
                `#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
precision mediump sampler3D;
#endif
`;
        /**
         * Create a Shader
         *
         * @param {WebGLProgram} program
         * @param {number} type
         * @param {string} source
         * @memberof DR
         */
        cS(program: WebGLProgram, type: number, source: string): void {
                let gl = this.gl;
                let shader = gl.createShader(type)
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                gl.attachShader(program, shader);
                if (!gl.getShaderParameter(shader, 35713)) { // this.gl.COMPILE_STATUS
                        gl.getShaderInfoLog(shader).trim().split("\n").forEach((l: string) =>
                                console.error("[shader] " + l))
                        throw new Error("Error while compiling vertex/fragment" + source)
                };
        }
        /**
         * Create and a a WebGLProgram
         *
         * @param {string} name
         * @returns {WebGLProgram}
         * @memberof DR
         */
        aP(name: string): WebGLProgram {
                let p = this.gl.createProgram();
                this.programs.set(name, p);
                return p;
        }
        /**
         *  Create a new WEBGLTexture
         *
         * @param {*} data  image or UInt8Array
         * @returns WebGLTexture
         * @memberof DR
         */
        t(data: HTMLImageElement | Uint8Array, d: number): WebGLTexture {
                let gl = this.gl;
                let texture = gl.createTexture();
                gl.activeTexture(d);
                gl.bindTexture(3553, texture);
                if (data instanceof Image) {
                        gl.texImage2D(3553, 0, 6408, 6408, 5121, data);
                } else {
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                                1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                                data)
                }
                gl.generateMipmap(3553);
                return texture;
        }

        /**
         * Create a texture cube map
         *
         * @param {Array<any>} sources
         * @param {number} d
         * @returns {WebGLTexture}
         * @memberof DR
         */
        tC(sources: Array<any>, d: number): WebGLTexture {
                let gl = this.gl;
                let texture = gl.createTexture();
                gl.activeTexture(d);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                const fetchAll = (src: string, key: string) => {
                        return new Promise<any>((resolve, reject) => {
                                let image = new Image();
                                image.dataset.key = key
                                image.onerror = reject;
                                image.onload = () => {
                                        resolve(image);
                                }
                                image.src = src;
                        });
                };
                Promise.all(sources.map(i => {
                        return fetchAll(i.d, i.t);
                })).then(data => {
                        data.forEach(image => {
                                const target = image.dataset.key
                                const level = 0;
                                const internalFormat = gl.RGBA;
                                const width = 512;
                                const height = 512;
                                const format = gl.RGBA;
                                const type = gl.UNSIGNED_BYTE;
                                gl.texImage2D(target,
                                        level, internalFormat,
                                        width, height, 0, format, type, null);
                                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                                gl.texImage2D(target, level, internalFormat, format, type, image);
                                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                        });
                });
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                return texture;
        }
        /**
         * add assets ( textures )
         *
         * @param {*} assets
         * @param {()=>void} cb
         * @returns {this}
         * @memberof DR
         */
        aA(assets: any, cb: (r?: any) => void): this {
                const cache = (k, n, v, f) => {
                        this.textureCache.set(k, { unit: n, src: v, fn: f });
                }
                const p = (key: string, texture: any) => {
                        const unit = texture.unit
                        return new Promise<any>((resolve) => {
                                if (!texture.src) {
                                        cache(key, unit, this.t(new Uint8Array(1024), unit), texture.fn);
                                        resolve(key);
                                } else {
                                        if (!Array.isArray(texture.src)) {
                                                const i = new Image();
                                                i.onload = (e) => {
                                                        cache(key, unit, this.t(i, unit), null);
                                                        resolve(key)
                                                };
                                                i.src = texture.src;
                                        } else {

                                                cache(key, unit, this.tC(texture.src as Array<any>, unit),
                                                        texture.fn);
                                                resolve(key);
                                        }
                                }
                        });
                }
                Promise.all(Object.keys(assets).map((key: string) => {
                        return p(key, assets[key]);
                })).then((result: any) => {
                        cb(result);
                }).catch(() => {
                        //
                });
                return this;
        }
        /**
         * add a new buffer / shader program
         *
         * @param {string} name
         * @param {string} vertex
         * @param {string} fragment
         * @param {Array<string>} [textures]
         * @param {*} [customUniforms]
         * @returns {this}
         * @memberof DR
         */
        aB(name: string, vertex: string, fragment: string, textures?: Array<string>, customUniforms?: any): this {
                let gl = this.gl;

                let tA = this.cT(this.canvas.width, this.canvas.height, textures ? textures : [], customUniforms ? customUniforms : {});
                let tB = this.cT(this.canvas.width, this.canvas.height, textures ? textures : [], customUniforms ? customUniforms : {});

                this.targets.set(name, tA);
                this.targets.set(`_${name}`, tB)

                let program = this.aP(name);

                this.cS(program, 35633, this.header + vertex);
                this.cS(program, 35632, this.header + fragment);
                gl.linkProgram(program);
                gl.validateProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        var info = gl.getProgramInfoLog(program);
                        throw 'Could not compile WebGL program. \n\n' + info;
                }
                gl.useProgram(program);
                if (textures) {
                        textures.forEach((tk: string) => {
                                gl.bindTexture(3553, this.textureCache.get(tk).src);
                        });
                }
                this.vertexPosition = gl.getAttribLocation(program, "pos");
                gl.enableVertexAttribArray(this.vertexPosition);
                for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); ++i) {
                        const u: any = gl.getActiveUniform(program, i);
                        tA.locations.set(u.name, gl.getUniformLocation(program, u.name));
                }

                return this;
        }
        /**
         * Render
         *
         * @param {number} time
         * @memberof DR
         */
        R(time: number) {

                let gl = this.gl;
                let main = this.mainProgram;
                let tc = 0;
                this.programs.forEach((current: WebGLProgram, key: string) => {

                        gl.useProgram(current);

                        let fT = this.targets.get(key);
                        let bT = this.targets.get(`_${key}`);

                        // resolution, time
                        gl.uniform2f(fT.locations.get("resolution"), this.canvas.width, this.canvas.height);
                        gl.uniform1f(fT.locations.get("time"), time);
                        gl.uniform1f(fT.locations.get("frame"), this.frameCount);

                        let customUniforms = fT.uniforms;

                        customUniforms && Object.keys(customUniforms).forEach((v: string) => {
                                customUniforms[v](fT.locations.get(v), gl, current, time);
                        });


                        let bl = gl.getUniformLocation(current, key);
                        gl.uniform1i(bl, 0);
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, bT.texture)

                        fT.textures.forEach((tk: string, index: number) => {
                                let ct = this.textureCache.get(tk);
                                gl.activeTexture(ct.unit);
                                gl.bindTexture(gl.TEXTURE_2D, ct.src)
                                if (ct.fn)
                                        ct.fn(current, gl, ct.src);

                                let loc = gl.getUniformLocation(current, tk);
                                gl.uniform1i(loc, index + 1);
                                tc++;

                        });

                        gl.bindBuffer(34962, this.surfaceBuffer);
                        gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);

                        gl.bindBuffer(34962, this.buffer);
                        gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);

                        gl.bindFramebuffer(36160, fT.framebuffer);

                        gl.clear(16384 | 256);
                        gl.drawArrays(4, 0, 6);

                        bT = fT;
                        fT = bT;

                });
                gl.useProgram(main);
                gl.uniform2f(this.mainUniforms.get("resolution"), this.canvas.width, this.canvas.height);
                gl.uniform1f(this.mainUniforms.get("time"), time);


                Object.keys(this.cU).forEach((v: string) => {
                        this.cU[v](gl.getUniformLocation(main, v), gl, main, time); // todo: cache locations?
                });

                gl.bindBuffer(34962, this.buffer);
                gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);

                this.targets.forEach((target: any, key: string) => {
                        gl.uniform1i(gl.getUniformLocation(main, key), tc);
                        gl.activeTexture(33984 + tc);
                        gl.bindTexture(3553, target.texture);
                        tc++;
                });
                gl.bindFramebuffer(36160, null);
                gl.clear(16384 | 256);
                gl.drawArrays(4, 0, 6);
                this.frameCount++;
        }

        /**
         * Create render target
         *
         * @param {number} width
         * @param {number} height
         * @param {Array<string>} textures
         * @returns {*}
         * @memberof DR
         */
        cT(width: number, height: number, textures: Array<string>, customUniforms: any): Dt {
                let gl = this.gl;
                let target = new Dt(gl, textures, customUniforms);

                gl.bindTexture(3553, target.texture);
                gl.texImage2D(3553, 0, 6408, width, height, 0, 6408, 5121, null);

                gl.texParameteri(3553, 10242, 33071);
                gl.texParameteri(3553, 10243, 33071);

                gl.texParameteri(3553, 10240, 9728);
                gl.texParameteri(3553, 10241, 9728);

                gl.bindFramebuffer(36160, target.framebuffer);
                gl.framebufferTexture2D(36160, 36064, 3553, target.texture, 0);
                gl.bindRenderbuffer(36161, target.renderbuffer);

                gl.renderbufferStorage(36161, 33189, width, height);
                gl.framebufferRenderbuffer(36160, 36096, 36161, target.renderbuffer);

                gl.bindTexture(3553, null);
                gl.bindRenderbuffer(36161, null);
                gl.bindFramebuffer(36160, null);

                return target;
        }
        /**
         * Render loop
         *
         * @param {number} t
         * @param {number} fps
         * @returns {this}
         * @memberof DR
         */
        run(t: number, fps: number): this {
                let pt: number = performance.now();
                let interval = 1000 / fps;
                let dt = 0;
       
                const a = (t: number) => {
                        this.animFrameId = requestAnimationFrame(a);

                        dt = t - pt;
                        if (dt > interval) {
                                pt = t - (dt % interval);
                                this.R(pt / 1000);
                                console.log('rendering')
                        }
                };
                a(t | 0);
                return this;

        }
        stop() {
                window.cancelAnimationFrame(this.animFrameId);
        }
        constructor(public canvas: HTMLCanvasElement, v: string, f: string, public cU: any = {}) {

                this.targets = new Map<string, any>();
                this.mainUniforms = new Map<string, WebGLUniformLocation>();

                this.programs = new Map<string, WebGLProgram>();
                this.textureCache = new Map<string, ITx>();

                let gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true }) as WebGLRenderingContext;

                // hash each method of gl, shorten the names , so we can save a few bytes.
                let c = 0, d: any; for (let i in gl) "function" == typeof gl[i] && (d = (c++ & 255).toString(16), d = d.match(/^[0-9].*$/) ? "x" + d : d, gl[d] = gl[i]);

                this.gl = gl;

                let mp = gl.createProgram();

                this.mainProgram = mp;

                gl.viewport(0, 0, canvas.width, canvas.height);

                this.buffer = gl.createBuffer();
                this.surfaceBuffer = gl.createBuffer();

                this.cS(mp, 35633, this.header + v);
                this.cS(mp, 35632, this.header + f);

                gl.linkProgram(mp);
                gl.validateProgram(mp);

                if (!gl.getProgramParameter(mp, gl.LINK_STATUS)) {
                        var info = gl.getProgramInfoLog(mp);
                        throw 'Could not compile WebGL program. \n\n' + info;
                }

                gl.useProgram(mp);

                for (let i = 0; i < gl.getProgramParameter(mp, gl.ACTIVE_UNIFORMS); ++i) {
                        const u: any = gl.getActiveUniform(mp, i);
                        this.mainUniforms.set(u.name, gl.getUniformLocation(mp, u.name));
                }

                this.screenVertexPosition = gl.getAttribLocation(mp, "pos");
                gl.enableVertexAttribArray(this.screenVertexPosition);

                gl.bindBuffer(34962, this.buffer);
                gl.bufferData(34962, new Float32Array([- 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0]), 35044);
        }

        /**
         *  Generate a texture and return a canvas element
         *
         * @static
         * @param {string} mainVertex
         * @param {string} mainFrag
         * @param {string} textureVertex
         * @param {*} textureFrag
         * @param {number} w
         * @param {number} h
         * @returns {HTMLCanvasElement}
         * @memberof DR
         */
        static gT(mainVertex: string, mainFrag: string,
                textureVertex: string,
                textureFrag, w: number, h: number): HTMLCanvasElement {
                let canvas = document.createElement("canvas") as HTMLCanvasElement;
                canvas.width = w; canvas.height = h;
                let dr = new DR(canvas, mainVertex, mainFrag);
                dr.aB("A", textureVertex, textureFrag);
                // do a few frames due to back buffer.
                for (var i = 0; i < 2; i++) {
                        dr.R(i);
                }
                return canvas;
        }

}