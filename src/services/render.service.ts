import {Injectable, ElementRef} from "@angular/core";
import {MapRenderer} from "./flights/map-renderer.model";
import {DataService, IFeature} from "./data.service";
import {FBO} from "../models/FBO.model";
import ShaderLoader from "../models/shader-loader";
import {Flight} from "./flights/flight.model";
import {Airport} from "../models/airport.model";
import {FlightsParticleSystem} from "./renderer/flights-particle-system.model";

@Injectable()
export class RenderService {
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _controls: THREE.OrbitControls;
  private _mapRenderer: MapRenderer;
  private _renderTarget: THREE.WebGLRenderTarget;

  //private _renderShader: THREE
  private _flightsParticleSystem: FlightsParticleSystem;

  private _fbo: FBO;
  private _composerUniforms: any;
  private _shaderLoader: ShaderLoader;

  constructor(private dataService: DataService) {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.z = -25;
    this._camera.lookAt(new THREE.Vector3(0,0,0));

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    this._flightsParticleSystem = new FlightsParticleSystem(this._renderer, this._camera);
  }

  private time = 0.0;
  private render = () => {
    requestAnimationFrame( this.render );

    this._controls.update();

    this._mapRenderer.update(this.time);
    this._mapRenderer.render();
    this._composerUniforms.map.value = this._mapRenderer.texture;

    this._flightsParticleSystem.update();
    this._composerUniforms.planet.value = this._mapRenderer.planetTexture;
    this._composerUniforms.planetGlow.value = this._mapRenderer.planetGlowTexture;
    this._composerUniforms.flights.value = this._flightsParticleSystem.texture;
    this._composerUniforms.flightsGlow.value = this._flightsParticleSystem.glowTexture;
    this._composerUniforms.stars.value = this._mapRenderer.starsTexture;
    this._composerUniforms.sun.value = this._mapRenderer.sunTexture;
    this._composerUniforms.countryBorders.value = this._mapRenderer.borderTexture;

    this._fbo.renderToViewport();

    this.time += 0.01;
  };

  public initRenderer(domElement: ElementRef) {
    this._shaderLoader = new ShaderLoader();
    this._shaderLoader.loadShaders({
      simulation_vs : '',
      simulation_fs : '',
      render_vs : '',
      render_fs : '',
      composer_vs : '',
      composer_fs : '',
      flight_trail_vs: '',
      flight_trail_fs: '',
      vertical_glow_vs: '',
      vertical_glow_fs: '',
      horizontal_glow_vs: '',
      horizontal_glow_fs: ''
    },
    './assets/shaders/',
    () => {
      domElement.nativeElement.appendChild(this._renderer.domElement);
      this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
    });
  }

  public initData(flights: Flight[], airports: {[id: string]: Airport}) {
    this._mapRenderer = new MapRenderer(this._renderer, this._camera);
    this.dataService.features.subscribe((features: IFeature[]) => this._mapRenderer.drawMap(features));

    this._flightsParticleSystem.init(flights, airports, this._shaderLoader);

    this._composerUniforms = {
      flights: { value: null },
      flightsGlow: { value: null },
      planet: { value: null },
      planetGlow: { value: null },
      stars: { value: null },
      sun: { value: null },
      map: { value: null },
      countryBorders: { value: null },
      size: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    let shader = new THREE.ShaderMaterial({
      uniforms: this._composerUniforms,
      vertexShader: this._shaderLoader.get( "composer_vs" ),
      fragmentShader: this._shaderLoader.get( "composer_fs" ),
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    shader.needsUpdate = true;

    this._fbo = new FBO(window.innerWidth, window.innerHeight, this._renderer, shader);

    this.render();
  }
}