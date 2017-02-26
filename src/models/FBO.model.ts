/**
 * Created by fille on 2017-02-16.
 */

export class FBO {
  private _renderer: THREE.WebGLRenderer;
  private _fboScene: THREE.Scene;
  private _orthographicCamera: THREE.OrthographicCamera;
  private _renderTargets: THREE.WebGLRenderTarget[];
  private _numRenderTargets: number;

  constructor(width: number, height: number, renderer: THREE.WebGLRenderer, shader: THREE.ShaderMaterial, numRenderTargets?: number) {
    this._renderer = renderer;
    let gl: WebGLRenderingContext = this._renderer.getContext();

    if (!gl.getExtension('OES_texture_float')) {
      throw new Error('Float textures are not supported');
    }

    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == false) {
      throw new Error('Vertex shader cannot read textures');
    }

    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow( 2, 53 ), 1);

    if (numRenderTargets != null) {
      this._numRenderTargets =  numRenderTargets;
      this._renderTargets = [];
      for (let i = 0; i < numRenderTargets; i++) {
        this._renderTargets.push(new THREE.WebGLRenderTarget(width, height, {
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBFormat,
          type: THREE.FloatType,
        }));
      }
    }
    else {
      this._numRenderTargets = 1;
      this._renderTargets = [];
      this._renderTargets.push(new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBFormat,
        type: THREE.FloatType,
      }));
    }

    this._fboScene = new THREE.Scene();
    let geometry = new THREE.PlaneGeometry( 2, 2, 2 );
    let plane = new THREE.Mesh( geometry, shader );
    this._fboScene.add( plane );
  }

  public renderToViewport() {
    this._renderer.render(this._fboScene, this._orthographicCamera);
  }

  public render(index?: number) {
    //console.log(index);
    if (index == null) {
      this._renderer.render(this._fboScene, this._orthographicCamera, this._renderTargets[0]);
    }
    else {
      this._renderer.render(this._fboScene, this._orthographicCamera, this._renderTargets[index]);
    }
  }


  get texture(): THREE.Texture {
    return this._renderTargets[0].texture;
  }

  getTextureAtIndex(index: number) {
    //console.log(this._renderTargets[index].texture);
    return this._renderTargets[index].texture;
  }
}