/**
 * Created by fille on 2017-02-16.
 */

export class FBO {
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _particles: any;
  private _orthoCamera: THREE.OrthographicCamera;
  private _renderTarget: THREE.WebGLRenderTarget;

  private _startTime: number;
  private _endTime: number;
  private _currentTime: number;

  constructor(width: number, height: number, renderer: any, simulationMaterial: THREE.ShaderMaterial, renderMaterial: THREE.ShaderMaterial) {
    this._renderer = renderer;
    let gl: WebGLRenderingContext = this._renderer.getContext();

    if (!gl.getExtension('OES_texture_float')) {
      throw new Error('Float textures are not supported');
    }

    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == false) {
      throw new Error('Vertex shader cannot read textures');
    }

    this._scene = new THREE.Scene();
    this._orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow( 2, 53 ), 1);
    this._renderTarget = new THREE.WebGLRenderTarget(width, height, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false
    });

    let bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,-1,0,1,1,0,-1,1,0]), 3 ));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array([0,1,1,1,1,0,0,1,1,0,0,0]),2));
    this._scene.add(new THREE.Mesh(bufferGeometry, simulationMaterial));

    let l = width * height;
    let vertices = new Float32Array(l * 3);
    for (let i = 0; i < l; i++) {
      let i3 = i * 3;
      vertices[i3] = (i % width) / width;
      vertices[i3 + 1] = (i / width) / height;
    }

    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

    this._particles = new THREE.Points(geometry, renderMaterial);

    this._startTime = this._particles.material.uniforms.startTime.value;
    this._endTime = this._particles.material.uniforms.endTime.value;
    this._currentTime = this._particles.material.uniforms.currentTime.value;

    //console.log(this._startTime, this._endTime, this._currentTime);
  }

  public update() {
    this._currentTime += 10;
    this._particles.material.uniforms.currentTime.value = this._currentTime;
    //console.log(this._particles.material.uniforms.currentTime.value);
    this._renderer.render(this._scene, this._orthoCamera, this._renderTarget);
  }

  get particles(): THREE.Points {
    return this._particles;
  }
}