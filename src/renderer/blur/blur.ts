import {FBO} from "../../models/FBO.model";

/*
 Shader imports
 */
const blurVert = require('raw-loader!glslify-loader!./shaders/blur.vert');
const blurFrag = require('raw-loader!glslify-loader!./shaders/blur.frag');

export default class Blur {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;

  private _verticalBlurFBO: FBO;
  private _verticalBlurUniforms: any;

  private _horizontalBlurFBO: FBO;
  private _horizontalBlurUniforms: any;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera, blurSize: number) {
    this._renderer = renderer;
    this._camera = camera;
    this._scene = new THREE.Scene();

    let width = window.innerWidth;
    let height = window.innerHeight;

    this._verticalBlurUniforms = {
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      direction: { type: 'v2', value: new THREE.Vector2(0, 1) },
      blurSize: { type: 'f', value: blurSize },
      inputTexture: { value: null },
    };

    this._horizontalBlurUniforms = {
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      direction: { type: 'v2', value: new THREE.Vector2(1, 0) },
      blurSize: { type: 'f', value: blurSize },
      inputTexture: { value: null },
    };

    let verticalBlurShader = new THREE.ShaderMaterial({
      uniforms: this._verticalBlurUniforms,
      vertexShader: blurVert,
      fragmentShader: blurFrag,
      blending: THREE.AdditiveBlending
    });
    this._verticalBlurFBO = new FBO(width, height, this._renderer, verticalBlurShader);


    let horizontalBlurShader = new THREE.ShaderMaterial({
      uniforms: this._horizontalBlurUniforms,
      vertexShader: blurVert,
      fragmentShader: blurFrag,
      blending: THREE.AdditiveBlending
    });
    this._horizontalBlurFBO = new FBO(width, height, this._renderer, horizontalBlurShader);
  }


  public blurThisPlease(texture: any, blurStrength): THREE.Texture {
    this._horizontalBlurUniforms.inputTexture.value = texture;

    for (let i = 0; i < blurStrength; i++) {
      this._horizontalBlurFBO.render();
      this._verticalBlurUniforms.inputTexture.value = this._horizontalBlurFBO.texture;

      this._verticalBlurFBO.render();
      this._horizontalBlurUniforms.inputTexture.value = this._verticalBlurFBO.texture;
    }

    return this._verticalBlurFBO.texture;
  }
}