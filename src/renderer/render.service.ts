import {Injectable, ElementRef} from "@angular/core";
import {MapRenderer} from "./map-renderer.model";
import {DataService, IFeature} from "../services/data.service";
import {FBO} from "./utils/fbo/fbo";
import {Flight} from "../services/flights/flight.model";
import {Airport} from "../models/airport.model";
import FlightParticles from "./flight-particles/flight-particles";
import Blur from "./utils/blur/blur";
import {TimeService} from "../services/time.service";
import PlanetRaycaster from "./planet-raycaster/planet-raycaster";
const Stats = require('stats-js');

/*
 Shader imports
 */
const composerFrag = require('raw-loader!glslify-loader!./shaders/composer.frag');
const composerVert = require('raw-loader!glslify-loader!./shaders/composer.vert');
const glowComposerVert = require('raw-loader!glslify-loader!./shaders/glowComposer.vert');
const glowComposerFrag = require('raw-loader!glslify-loader!./shaders/glowComposer.frag');

@Injectable()
export class RenderService {
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _planetRaycaster: PlanetRaycaster;
  private _stats: any;
  private _controls: THREE.OrbitControls;
  private _mapRenderer: MapRenderer;
  private _flightParticles: FlightParticles;
  private _composerPass: FBO;
  private _composerUniforms: any;
  private _glowComposerPass: FBO;
  private _glowComposerUniforms: any;
  private _glowPass: Blur;
  private _started: boolean = false;
  private _advancedGraphics: boolean;

  constructor(
    private dataService: DataService,
    private timeService: TimeService
  ) {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.z = -20;
    this._camera.lookAt(new THREE.Vector3(0,0,0));

    this._stats = new Stats();
    this._stats.setMode(0);
    this._stats.domElement.style.position = 'absolute';
    this._stats.domElement.style.left = '0px';
    this._stats.domElement.style.top = '0px';
    document.body.appendChild(this._stats.domElement);

    this._renderer = new THREE.WebGLRenderer({ alpha: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setClearColor( 0x000000, 0 );

    this._flightParticles = new FlightParticles(this._renderer, this._camera, this.timeService);
    this._glowPass = new Blur(this._renderer, this._camera, 1);

    this._mapRenderer = new MapRenderer(this._renderer, this._camera, this.timeService);
  }

  private time = 0.0;
  private render = () => {
    this._stats.begin();
    requestAnimationFrame( this.render );

    this._controls.update();
    //this._planetRaycaster.update();

    this._flightParticles.update();
    this._composerUniforms.flights.value = this._flightParticles.texture;

    this._mapRenderer.update(this.time);
    this._mapRenderer.render();

    if (this._advancedGraphics) {
      this._glowComposerUniforms.planet.value = this._mapRenderer.planetTexture;
      this._glowComposerUniforms.planetGlow.value = this._mapRenderer.planetGlowTexture;
      this._glowComposerUniforms.sun.value = this._mapRenderer.sunTexture;
      this._glowComposerUniforms.flightTrail.value = this._flightParticles.texture;
      this._glowComposerPass.render();

      this._composerUniforms.glow.value = this._glowPass.blurThisPlease(this._glowComposerPass.texture, 5);
      this._composerUniforms.map.value = this._mapRenderer.texture;
      this._composerUniforms.planet.value = this._mapRenderer.planetTexture;
      this._composerUniforms.sun.value = this._mapRenderer.sunTexture;
    }

    this._composerUniforms.countryBorders.value = this._mapRenderer.borderTexture;

    this._composerPass.renderToViewport();

    this.time += 0.01;
    this._stats.end();
  };

  public initRenderer(domElement: ElementRef) {
    domElement.nativeElement.appendChild(this._renderer.domElement);
    this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
    this._controls.target = new THREE.Vector3(0,0,0);
    this._controls.minDistance = 13.0;
    this._controls.maxDistance = 25.0;
    this._controls.rotateSpeed = 0.2;
    this._controls.enableRotate = false;
  }

  public init(flights: Flight[], airports: { [id: string]: Airport }, advancedGraphics: boolean) {
    this._advancedGraphics = advancedGraphics;
    this._mapRenderer.advancedGraphics = advancedGraphics;

    //this._planetRaycaster = new PlanetRaycaster(this._camera, airports);

    this.dataService.features.subscribe((features: IFeature[]) => this._mapRenderer.drawMap(features));
    this._flightParticles.init(flights, airports);

    this._composerUniforms = {
      flights: { value: null },
      planet: { value: null },
      stars: { value: null },
      sun: { value: null },
      map: { value: null },
      countryBorders: { value: null },
      timeline: { value: null },
      glow: { value: null },
      size: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    let shader = new THREE.ShaderMaterial({
      uniforms: this._composerUniforms,
      vertexShader: composerVert,
      fragmentShader: composerFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    shader.needsUpdate = true;

    this._composerPass = new FBO(window.innerWidth, window.innerHeight, this._renderer, shader);

    this._glowComposerUniforms = {
      planet: { value: null },
      planetGlow: { value: null },
      sun: { value: null },
      stars: { value: null },
      flightTrail: { value: null }
    };

    let glowShader = new THREE.ShaderMaterial({
      uniforms: this._glowComposerUniforms,
      vertexShader: glowComposerVert,
      fragmentShader: glowComposerFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    glowShader.needsUpdate = true;

    this._glowComposerPass = new FBO(window.innerWidth, window.innerHeight, this._renderer, glowShader);

    this.render();
  }

  enableDelayVisualization(enable: boolean) {
    this._flightParticles.enableDelayVisualization(enable);
  }
  get started(): boolean { return this._started; }
  set started(value: boolean) { this._started = value; }
}