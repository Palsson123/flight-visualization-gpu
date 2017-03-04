import PingPongFBO from "../utils/fbo/ping-pong-fbo";
import {generateCircleLine} from "../utils/circleLine";

/*
 Shader imports
 */
const timeLineTrailVert = require('raw-loader!glslify-loader!./shaders/timeLineTrail.vert');
const timeLineTrailFrag = require('raw-loader!glslify-loader!./shaders/timeLineTrail.frag');

export default class Timeline {
  private _scene: THREE.Scene;
  private _timeCircle: THREE.Line;
  private _timeLineRenderTarget: THREE.WebGLRenderTarget;
  private _timeLineTrailFBO: PingPongFBO;
  private _timeLineUniforms: any;
  private _lastCameraPosition: THREE.Vector3;

  constructor(private _renderer: THREE.WebGLRenderer, private _camera: THREE.Camera) {
    this._scene = new THREE.Scene();

    this._timeCircle = new THREE.Line(generateCircleLine(10.05, 100), new THREE.LineBasicMaterial({ color: 0x999999}));
    this._scene.add(this._timeCircle);

    let sphere = new THREE.Mesh(new THREE.SphereGeometry(10,32,32), new THREE.MeshBasicMaterial({color: 0x000000}));
    this._scene.add(sphere);

    this._timeLineRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });

    this._timeLineUniforms = {
      currentLine: { value: null },
      accumulatedLineTrail: { value: null },
      cameraUpdated: { type: 'f', value: 0.0 }
    };

    let trailShader = new THREE.ShaderMaterial({
      uniforms: this._timeLineUniforms,
      vertexShader: timeLineTrailVert,
      fragmentShader: timeLineTrailFrag,
      blending: THREE.AdditiveBlending
    });
    trailShader.needsUpdate = true;

    this._timeLineTrailFBO = new PingPongFBO(window.innerWidth, window.innerHeight, this._renderer, trailShader);
    this._lastCameraPosition = this._camera.position.clone();
  }

  public render(time: number) {
    this._timeCircle.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -time);
    this._renderer.render(this._scene, this._camera, this._timeLineRenderTarget);

    if (!this._camera.position.equals(this._lastCameraPosition)) {
      console.log('camera updated')
      this._timeLineUniforms.cameraUpdated.value = 1.0;
    }

    this._lastCameraPosition = this._camera.position.clone();

    this._timeLineUniforms.currentLine.value = this._timeLineRenderTarget.texture;
    this._timeLineTrailFBO.render();
    this._timeLineUniforms.accumulatedLineTrail.value = this._timeLineTrailFBO.texture;

    this._timeLineUniforms.cameraUpdated.value = 0.0;
  }

  get texture() { return this._timeLineTrailFBO.texture }
}