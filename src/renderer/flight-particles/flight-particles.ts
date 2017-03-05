import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";
import {Airport} from "../../models/airport.model";
import {Flight} from "../../services/flights/flight.model";
import {Settings} from "../settings";
import {TimeService} from "../../services/time.service";
import PingPongFBO from "../utils/fbo/ping-pong-fbo";

const uniformFactor = 1.0;

/*
 Shader imports
 */
const flightsVert = require('raw-loader!glslify-loader!./shaders/flights.vert');
const flightsFrag = require('raw-loader!glslify-loader!./shaders/flights.frag');
const flightsTrailFrag = require('raw-loader!glslify-loader!./shaders/flightsTrail.frag');
const flightsTrailVert = require('raw-loader!glslify-loader!./shaders/flightsTrail.vert');

export default class FlightParticles {
  private _scene: THREE.Scene;
  private _lastCameraPosition: THREE.Vector3;
  private _group: THREE.Group;
  private _flightParticles: THREE.Points;
  private _currentTime: number;
  private _particlesRenderShader: THREE.ShaderMaterial;
  private _uniforms: any;

  private _renderTarget: THREE.WebGLRenderTarget;
  private _flightTrailFBO: PingPongFBO;
  private _flightTrailShader: THREE.ShaderMaterial;
  private _flightTrailUniforms: any;

  constructor(private _renderer: THREE.WebGLRenderer, private _camera: THREE.Camera, private _timeService: TimeService) {
    this._scene = new THREE.Scene();
    this._group = new THREE.Group();
    this._group.rotateX(-Math.PI / 1.4);
    this._scene.add(this._group);

    let sphere = new THREE.Mesh(new THREE.SphereGeometry(10,16,16), new THREE.MeshBasicMaterial({color: 0x000000}));
    this._scene.add(sphere);

    this._lastCameraPosition = new THREE.Vector3(this._camera.position.x, this._camera.position.y, this._camera.position.z);
    this._currentTime = 0.0;
  }

  private _currentIndex = 0;
  public update() {

    if (this._timeService.isPlaying) {
      this._timeService.incrementTime();
    }

    this._uniforms.currentTime.value = this._timeService.currentTime / uniformFactor;

    this._renderer.render(this._scene, this._camera, this._renderTarget);
    this._currentIndex = this._currentIndex == 0 ? 1 : 0;
    this._flightTrailUniforms.flightTrail.value = this._renderTarget.texture;

    this._flightTrailUniforms.accumulatedFlightTrail.value = this._flightTrailFBO.texture;

    if (!this._lastCameraPosition.equals(this._camera.position)) {
      this._flightTrailUniforms.cameraHasUpdated.value = 1.0;
      this._lastCameraPosition = new THREE.Vector3(this._camera.position.x, this._camera.position.y, this._camera.position.z);
    }

    this._flightTrailFBO.render();
    this._flightTrailUniforms.cameraHasUpdated.value = 0.0;
  }

  public init(flights: Flight[], airports: {[id: string]: Airport}) {
    let width = Settings.width;
    let height = Settings.height;

    let flightTextures = this.generateFlightTextures(flights, airports, width, height);

    this._renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    this._uniforms = {
      departurePositions: { value: flightTextures.departurePositions },
      midPointPositions: { value: flightTextures.midPointPositions },
      arrivalPositions: { value: flightTextures.arrivalPositions },
      flightTimes: { value: flightTextures.flightTimes },
      positions: { value: flightTextures.departurePositions },
      pointSize: { value: 2 },
      startTime: { value: 0 },
      endTime: { value: this._timeService.endTime - this._timeService.startTime},
      currentTime: { value: 0 }
    };

    this._timeService.startTimeObservable.subscribe((value: number) => this._uniforms.startTime.value = value / uniformFactor);
    this._timeService.endTimeObservable.subscribe((value: number) => this._uniforms.endTime.value = value / uniformFactor);

    this._particlesRenderShader = new THREE.ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: flightsVert,
      fragmentShader: flightsFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    this._particlesRenderShader.needsUpdate = true;

    let flightCountSquared = Math.sqrt(flights.length);
    let l = flightCountSquared * flightCountSquared;
    let vertices = new Float32Array(l * 3);
    for (let i = 0; i < l; i++) {
      let i3 = i * 3;
      vertices[i3] = (i % width) / width;
      vertices[i3 + 1] = (i / width) / height;
    }

    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

    this._flightParticles = new THREE.Points(geometry, this._particlesRenderShader);
    this._group.add(this._flightParticles);

    /*
     Trail fbo
     */
    this._flightTrailUniforms = {
      flightTrail: { value: null },
      accumulatedFlightTrail: { value: null },
      cameraHasUpdated: { value: 0.0 }
    };
    this._flightTrailShader = new THREE.ShaderMaterial({
      uniforms: this._flightTrailUniforms,
      vertexShader: flightsTrailVert,
      fragmentShader: flightsTrailFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    this._flightTrailShader.needsUpdate = true;

    this._flightTrailFBO = new PingPongFBO(window.innerWidth, window.innerHeight, this._renderer, this._flightTrailShader);
  }

  private generateFlightTextures(flights: Flight[], airports: {[id: string]: Airport}, width, height) {
    let length = width * height * 3;
    let departurePositions = new Float32Array(length);
    let midPointPositions = new Float32Array(length);
    let arrivalPositions = new Float32Array(length);
    let flightTimes = new Float32Array(length);

    for (let i = 0; i < flights.length * 3; i += 3) {
      let flight: Flight = flights[i / 3];

      let departureAirport = airports[flight.departureAirportId];
      let arrivalAirport = airports[flight.arrivalAirportId];

      if (departureAirport && arrivalAirport) {
        let departurePos = spheriticalToCartesian(departureAirport.coordinate[0], departureAirport.coordinate[1], 10);
        let arrivalPos = spheriticalToCartesian(arrivalAirport.coordinate[0], arrivalAirport.coordinate[1], 10);
        let midPos = departurePos.clone().add(arrivalPos).multiplyScalar(0.5).normalize().multiplyScalar(11);

        departurePositions[i] = departurePos.x;
        midPointPositions[i] = midPos.x;
        arrivalPositions[i] = arrivalPos.x;

        departurePositions[i + 1] = departurePos.y;
        midPointPositions[i + 1] = midPos.y;
        arrivalPositions[i + 1] = arrivalPos.y;

        departurePositions[i + 2] = departurePos.z;
        midPointPositions[i + 2] = midPos.z;
        arrivalPositions[i + 2] = arrivalPos.z;

        flightTimes[i] = (flight.departureTime - this._timeService.startTime) / uniformFactor;
        flightTimes[i + 1] = (flight.arrivalTime - this._timeService.startTime) / uniformFactor;
        flightTimes[i + 2] = 0;
      }
    }

    return {
      departurePositions: this.generateDataTexture(departurePositions, width, height),
      midPointPositions: this.generateDataTexture(midPointPositions, width, height),
      arrivalPositions: this.generateDataTexture(arrivalPositions, width, height),
      flightTimes: this.generateDataTexture(flightTimes, width, height),
    }
  }

  private generateDataTexture(data: Float32Array, width: number, height: number) {
    let dataTexture = new THREE.DataTexture(
      data, width, height,
      THREE.RGBFormat, THREE.FloatType, THREE.UVMapping,
      THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
      THREE.NearestFilter, THREE.NearestFilter
    );
    dataTexture.needsUpdate = true;

    return dataTexture;
  }

  get texture() {
    return this._flightTrailFBO.texture;
  }

  get renderTarget(): THREE.WebGLRenderTarget {
    return this._renderTarget;
  }
}