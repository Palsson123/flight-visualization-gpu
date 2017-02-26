import ShaderMaterial = THREE.ShaderMaterial;
import {invertNormals} from "../utils/invertNormals";
import Blur from "../blur/blur";
import {FBO} from "../../models/FBO.model";

/*
 Shader imports
 */
const starsVert = require('raw-loader!glslify-loader!./shaders/stars.vert');
const starsFrag = require('raw-loader!glslify-loader!./shaders/stars.frag');
const starsCompositionVert = require('raw-loader!glslify-loader!./shaders/starsComposition.vert');
const starsCompositionFrag = require('raw-loader!glslify-loader!./shaders/starsComposition.frag');

export default class Stars {
  private _scene: THREE.Scene;
  private _starsRenderTarget: THREE.WebGLRenderTarget;
  private _starsGlow: Blur;
  private _texture: THREE.Texture;
  private _starsCompositionUniforms: any;
  private _starsCompositionFBO: FBO;

  constructor(private _renderer: THREE.WebGLRenderer, private _camera: THREE.Camera) {
    this._scene = new THREE.Scene();

    let width = window.innerWidth;
    let height = window.innerHeight;
    this._starsRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });

    let starsShader = new ShaderMaterial({
      vertexShader: starsVert,
      fragmentShader: starsFrag,
      blending: THREE.AdditiveBlending
    });

    let starsSphereGeometry = new THREE.SphereGeometry(100, 30, 30);
    invertNormals(starsSphereGeometry);

    let sphere = new THREE.Mesh(starsSphereGeometry, starsShader);
    let earth = new THREE.Mesh(new THREE.SphereGeometry(10, 30, 30), new THREE.MeshBasicMaterial({color: 0x000000}));
    this._scene.add(sphere);
    this._scene.add(earth);

    this._starsGlow = new Blur(this._renderer, this._camera, 1.0);

    this._starsCompositionUniforms = {
      glow: { value: null },
      stars: { value: null }
    };

    let starsCompositionShader = new ShaderMaterial({
      uniforms: this._starsCompositionUniforms,
      vertexShader: starsCompositionVert,
      fragmentShader: starsCompositionFrag,
      blending: THREE.AdditiveBlending
    });
    starsCompositionShader.needsUpdate = true;

    this._starsCompositionFBO = new FBO(width, height, this._renderer, starsCompositionShader);
  }

  public render() {
    this._renderer.render(this._scene, this._camera, this._starsRenderTarget);
    this._starsCompositionUniforms.glow.value = this._starsGlow.blurThisPlease(this._starsRenderTarget.texture, 5.0);
    this._starsCompositionUniforms.stars.value = this._starsRenderTarget.texture;
    this._starsCompositionFBO.render();
  }

  get texture(): THREE.Texture { return this._starsCompositionFBO.texture; }
}