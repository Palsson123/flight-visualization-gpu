/**
 * Created by fille on 2017-02-19.
 */

export default class RenderPass {
  protected _renderTarget: THREE.WebGLRenderTarget;
  protected _renderer: THREE.WebGLRenderer;
  protected _scene: THREE.Scene;
  protected _camera: THREE.Camera;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this._renderer = renderer;
    this._scene = scene;
    this._camera = camera;

    this._renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });
  }

  public render() {
    this._renderer.render(this._scene, this._camera, this._renderTarget);
  }

  get texture() {
    return this._renderTarget.texture;
  }
}