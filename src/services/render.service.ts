import {Injectable, ElementRef} from "@angular/core";
import {MapRenderer} from "./flights/map-renderer.model";
import {AirportsRenderer} from "./flights/airports-renderer.model";
import {DataService, IFeature} from "./data.service";
import {FBO} from "../models/FBO.model";
import ShaderLoader from "../models/shader-loader";
import {Flight} from "./flights/flight.model";
import {Airport} from "../models/airport.model";
import {spheriticalToCartesian} from "../models/spheritical-to-cartesian.model";

@Injectable()
export class RenderService {
  private _renderer: THREE.Renderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _controls: THREE.OrbitControls;
  private _mapRenderer: MapRenderer;

  private _mapGroup: THREE.Group;

  private _fbo: FBO;
  private _shaderLoader: ShaderLoader;

  constructor(private dataService: DataService) {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.z = -15;
    this._camera.lookAt(new THREE.Vector3(0,0,0));

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._mapGroup = new THREE.Group();
    this._mapGroup.rotateX(-Math.PI / 1.4);
    this._scene.add(this._mapGroup);

    this._mapRenderer = new MapRenderer(this._mapGroup);

    dataService.features.subscribe((features: IFeature[]) => this._mapRenderer.drawMap(features));
  }

  private render = () => {
    requestAnimationFrame( this.render );

    //this._mapGroup.rotateOnAxis(new THREE.Vector3(0,0,1), 0.0001);

    this._controls.update();

    if (this._fbo != null) this._fbo.update();

    this._renderer.render(this._scene, this._camera);
  };

  public init(domElement: ElementRef) {
    this._shaderLoader = new ShaderLoader();
    this._shaderLoader.loadShaders({
      simulation_vs : "",
      simulation_fs : "",
      render_vs : "",
      render_fs : ""
    },
    './assets/shaders/',
    () => {
      domElement.nativeElement.appendChild(this._renderer.domElement);
      this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);

      //this.initFBO();
      this.render();
    });
  }

  public initFBO(flights: Flight[], airports: {[id: string]: Airport}) {
    let width = 256;
    let height = 256;

    let data = this.getRandomData(width, height, 20.0);
    let positions = this.generateDataTexture(data, width, height);


    let flightTextures = this.generateFlightTextures(flights, airports, width, height);

    let simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        departurePositions: { value: flightTextures.departurePositions },
        midPointPositions: { value: flightTextures.midPointPositions },
        arrivalPositions: { value: flightTextures.arrivalPositions },
        vertexShader: this._shaderLoader.get( "simulation_vs" ),
        fragmentShader:  this._shaderLoader.get( "simulation_fs" )
      }
    });

    let renderShader = new THREE.ShaderMaterial({
      uniforms: {
        departurePositions: { value: flightTextures.departurePositions },
        midPointPositions: { value: flightTextures.midPointPositions },
        arrivalPositions: { value: flightTextures.arrivalPositions },
        flightTimes: { value: flightTextures.flightTimes },
        positions: { value: flightTextures.departurePositions },
        pointSize: { value: 2 },
        startTime: { value: flightTextures.startTime / 10000.0 },
        endTime: { value: flightTextures.endTime / 10000.0 },
        currentTime: { value: flightTextures.startTime / 10000.0 }
      },
      vertexShader: this._shaderLoader.get( "render_vs" ),
      fragmentShader: this._shaderLoader.get( "render_fs" ),
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this._fbo = new FBO(width, height, this._renderer, simulationShader, renderShader );
    this._mapGroup.add(this._fbo.particles);
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

  private generateFlightTextures(flights: Flight[], airports: {[id: string]: Airport}, width, height) {
    let length = width * height * 3;
    let departurePositions = new Float32Array(length);
    let midPointPositions = new Float32Array(length);
    let arrivalPositions = new Float32Array(length);
    let flightTimes = new Float32Array(length);

    let startTime = 900000000000;
    let endTime = -900000000000;

    for (let i = 0; i < flights.length * 3; i += 3) {
      let flight: Flight = flights[i / 3];

      let departureAirport = airports[flight.departureAirportId];
      let arrivalAirport = airports[flight.arrivalAirportId];

      let departurePos = spheriticalToCartesian(departureAirport.coordinate[0], departureAirport.coordinate[1], 10);
      let arrivalPos = spheriticalToCartesian(arrivalAirport.coordinate[0], arrivalAirport.coordinate[1], 10);
      let midPos = departurePos.clone().add(arrivalPos).multiplyScalar(0.5).normalize().multiplyScalar(10.5);

      departurePositions[i] = departurePos.x;
      midPointPositions[i] = midPos.x;
      arrivalPositions[i] = arrivalPos.x;

      departurePositions[i + 1] = departurePos.y;
      midPointPositions[i + 1] = midPos.y;
      arrivalPositions[i + 1] = arrivalPos.y;

      departurePositions[i + 2] = departurePos.z;
      midPointPositions[i + 2] = midPos.z;
      arrivalPositions[i + 2] = arrivalPos.z;

      flightTimes[i] = flight.departureTime / 10000.0;
      flightTimes[i + 1] = flight.arrivalTime / 10000.0;
      flightTimes[i + 2] = 0;

      startTime = flight.departureTime < startTime ? flight.departureTime : startTime;
      endTime = flight.arrivalTime > endTime ? flight.arrivalTime : endTime;
    }

    return {
      departurePositions: this.generateDataTexture(departurePositions, width, height),
      midPointPositions: this.generateDataTexture(midPointPositions, width, height),
      arrivalPositions: this.generateDataTexture(arrivalPositions, width, height),
      flightTimes: this.generateDataTexture(flightTimes, width, height),
      startTime: startTime,
      endTime: endTime
    }
  }

  private getRandomData( width, height, size ){
    let len = width * height * 3;
    let data = new Float32Array( len );
    while( len-- )data[len] = ( Math.random() -.5 ) * size;
    return data;
  }

  get mapGroup(): THREE.Group {
    return this._mapGroup;
  }
}