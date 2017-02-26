import {FBO} from "../../models/FBO.model";
/**
 * Created by fille on 2017-02-25.
 */


export default class PlanetGlow {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;
  private _planetRenderTarget: THREE.WebGLRenderTarget;

  private _planetThresholdFBO: FBO;
  private _planetThresholdUniforms: any;

  private _planetVerticalBlurFBO: FBO;
  private _planetVerticalBlurUniforms: any;

  private _planetHorizontalBlurFBO: FBO;
  private _planetHoirzontalBlurUniforms: any;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this._renderer = renderer;
    this._camera = camera;
    this._scene = new THREE.Scene();

    let width = window.innerWidth;
    let height = window.innerHeight;
    this._planetRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });

    this._planetThresholdUniforms = {
      threshold: { type: 'f', value: 0.7 }
    };

    // let earthShader = new THREE.ShaderMaterial({
    //   uniforms: this._uniforms,
    //   vertexShader: planetVert,
    //   fragmentShader: planetFrag,
    //   blending: THREE.AdditiveBlending
    // });

  }

  public render(time: number) {

  }
}