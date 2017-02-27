
import Blur from "../utils/blur/blur";
import {Settings} from "../settings";

/*
 Shader imports
 */
const sunFrag = require('raw-loader!glslify-loader!./shaders/sun.frag');
const sunVert = require('raw-loader!glslify-loader!./shaders/sun.vert');

export default class Sun {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;
  private _sunMesh: THREE.Mesh;
  private _sunRenderTarget: THREE.WebGLRenderTarget;
  private _sunUniforms: any;

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

    let width = Settings.width;
    let height = Settings.height;

    this._sunRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });
  }

  public render(time: number) {
    this._sunUniforms.time.value = time;
    this._renderer.render(this._scene, this._camera, this._sunRenderTarget);
  }

  get texture(): THREE.Texture { return this._sunRenderTarget.texture; }
  get position(): THREE.Vector3 { return this._sunMesh.position; }
  set position(pos: THREE.Vector3){ this._sunMesh.position = pos; }
}