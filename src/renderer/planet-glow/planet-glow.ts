import Blur from "../blur/blur";
import SphereGeometry = THREE.SphereGeometry;
import ShaderMaterial = THREE.ShaderMaterial;
import {Settings} from "../settings";

/*
 Shader imports
 */
const normalVert = require('raw-loader!glslify-loader!./shaders/planetNormals.vert');
const normalFrag = require('raw-loader!glslify-loader!./shaders/planetNormals.frag');

export default class PlanetGlow {
  private _texture: THREE.Texture;
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;

  private _normalsRenderTarget: THREE.WebGLRenderTarget;
  private _normalsUniforms: any;
  private _blurPass: Blur;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this._renderer = renderer;
    this._camera = camera;
    this._scene = new THREE.Scene();

    let width = window.innerWidth;
    let height = window.innerHeight;

    this._normalsUniforms = {
      sunPosition: { type: 'v3', value: null }
    };

    let planetNormalsShader = new ShaderMaterial({
      uniforms: this._normalsUniforms,
      vertexShader: normalVert,
      fragmentShader: normalFrag,
      blending: THREE.AdditiveBlending
    });
    let sphere = new THREE.Mesh(new SphereGeometry(10.2, 32, 32), planetNormalsShader);
    this._scene.add(sphere);

    this._normalsRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });

    this._blurPass = new Blur(renderer, camera, Settings.planetGlowIterations);
  }

  public render(planetTexture: THREE.Texture, sunPosition: THREE.Vector3) {
    this._normalsUniforms.sunPosition.value = sunPosition;
    this._renderer.render(this._scene, this._camera, this._normalsRenderTarget);

    this._texture = this._blurPass.blurThisPlease(this._normalsRenderTarget.texture, 3);
  }

  get texture() { return this._texture; }
}