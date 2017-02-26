import {FBO} from "../../models/FBO.model";

/*
 Shader imports
 */
const glowVert = require('raw-loader!glslify-loader!./shaders/fbo.vert');
const glowFrag = require('raw-loader!glslify-loader!./shaders/sun_glow.frag');
const sunFrag = require('raw-loader!glslify-loader!./shaders/sun.frag');
const sunVert = require('raw-loader!glslify-loader!./shaders/sun.vert');

export default class Sun {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;
  private _sunMesh: THREE.Mesh;
  private _sunRenderTarget: THREE.WebGLRenderTarget;
  private _sunUniforms: any;
  private _horizontalGlowUniforms: any;
  private _verticalGlowUniforms: any;
  private _horizontalGlowFBO: FBO;
  private _verticalGlowFBO: FBO;


  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this._scene = new THREE.Scene();
    this._renderer = renderer;
    this._camera = camera;

    let sunGeometry = new THREE.SphereGeometry(10, 16, 16);

    this._sunUniforms = {
      time: { type: 'f', value: 0.0 }
    };

    let sunShader = new THREE.ShaderMaterial({
      uniforms: this._sunUniforms,
      vertexShader: sunVert,
      fragmentShader: sunFrag,
      blending: THREE.AdditiveBlending
    });

    this._sunMesh = new THREE.Mesh(sunGeometry, sunShader);
    this._sunMesh.position.set(40, 0, -40);
    this._scene.add(this._sunMesh);

    let sphere = new THREE.Mesh(new THREE.SphereGeometry(10,32,32), new THREE.MeshBasicMaterial({color: 0x000000}));
    this._scene.add(sphere);

    let width = window.innerWidth;
    let height = window.innerHeight;

    this._sunRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });

    this._horizontalGlowUniforms = {
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      direction: { type: 'v2', value: new THREE.Vector2(1, 0) },
      inputTexture: { value: null },
    };

    this._verticalGlowUniforms = {
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      direction: { type: 'v2', value: new THREE.Vector2(0, 1) },
      inputTexture: { value: null },
    };

    let horizontalGlowShader = new THREE.ShaderMaterial({
      uniforms: this._horizontalGlowUniforms,
      vertexShader: glowVert,
      fragmentShader: glowFrag,
      blending: THREE.AdditiveBlending
    });
    horizontalGlowShader.needsUpdate = true;

    this._horizontalGlowFBO = new FBO(width, height, this._renderer, horizontalGlowShader);

    let verticalGlowShader = new THREE.ShaderMaterial({
      uniforms: this._verticalGlowUniforms,
      vertexShader: glowVert,
      fragmentShader: glowFrag,
      blending: THREE.AdditiveBlending
    });
    verticalGlowShader.needsUpdate = true;

    this._verticalGlowFBO = new FBO(width, height, this._renderer, verticalGlowShader);
  }

  public render(time: number) {
    this._sunUniforms.time.value = time;
    this._renderer.render(this._scene, this._camera, this._sunRenderTarget);

    this._horizontalGlowUniforms.inputTexture.value = this._sunRenderTarget.texture;
    for (let i = 0; i < 10; i++) {
      this._horizontalGlowFBO.render();
      this._verticalGlowUniforms.inputTexture.value = this._horizontalGlowFBO.texture;
      this._verticalGlowFBO.render();
      this._horizontalGlowUniforms.inputTexture.value = this._verticalGlowFBO.texture;
    }
  }

  get texture() { return this._verticalGlowFBO.texture; }
  get position(): THREE.Vector3 { return this._sunMesh.position; }
  set position(pos: THREE.Vector3){ this._sunMesh.position = pos; }
}