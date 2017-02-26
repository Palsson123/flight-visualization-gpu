import {Injectable, ElementRef} from "@angular/core";
import {MapRenderer} from "../flights/map-renderer.model";
import {DataService, IFeature} from "../data.service";
import {FBO} from "../../renderer/utils/fbo/fbo";
import {Flight} from "../flights/flight.model";
import {Airport} from "../../models/airport.model";
import FlightParticles from "../../renderer/flight-particles/flight-particles";
const Stats = require('stats-js');

/*
 Shader imports
 */
const composerFrag = require('raw-loader!glslify-loader!./shaders/composer.frag');
const composerVert = require('raw-loader!glslify-loader!./shaders/composer.vert');

@Injectable()
export class RenderService {
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _stats: any;
  private _controls: THREE.OrbitControls;
  private _mapRenderer: MapRenderer;
  private _renderTarget: THREE.WebGLRenderTarget;

  private _flightParticles: FlightParticles;

  private _fbo: FBO;
  private _composerUniforms: any;

  constructor(private dataService: DataService) {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.z = -25;
    this._camera.lookAt(new THREE.Vector3(0,0,0));

    this._stats = new Stats();
    this._stats.setMode(0);
    this._stats.domElement.style.position = 'absolute';
    this._stats.domElement.style.left = '0px';
    this._stats.domElement.style.top = '0px';
    document.body.appendChild(this._stats.domElement);

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });


    this._flightParticles = new FlightParticles(this._renderer, this._camera);
  }

  private time = 0.0;
  private render = () => {
    this._stats.begin();
    requestAnimationFrame( this.render );

    this._controls.update();
    this._flightParticles.update();
    this._composerUniforms.flights.value = this._flightParticles.texture;
    //his._composerUniforms.flightsGlow.value = this._flightParticles.glowTexture;

    this._mapRenderer.update(this.time);
    this._mapRenderer.render();

    this._composerUniforms.map.value = this._mapRenderer.texture;
    this._composerUniforms.planet.value = this._mapRenderer.planetTexture;
    this._composerUniforms.planetGlow.value = this._mapRenderer.planetGlowTexture;
    this._composerUniforms.stars.value = this._mapRenderer.starsTexture;
    this._composerUniforms.sun.value = this._mapRenderer.sunTexture;
    this._composerUniforms.countryBorders.value = this._mapRenderer.borderTexture;

    this._fbo.renderToViewport();

    this.time += 0.01;
    this._stats.end();
  };

  public initRenderer(domElement: ElementRef) {
    domElement.nativeElement.appendChild(this._renderer.domElement);
    this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
  }

  public initData(flights: Flight[], airports: {[id: string]: Airport}) {
    this._mapRenderer = new MapRenderer(this._renderer, this._camera);
    this.dataService.features.subscribe((features: IFeature[]) => this._mapRenderer.drawMap(features));

    this._flightParticles.init(flights, airports);

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
      vertexShader: composerVert,
      fragmentShader: composerFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    shader.needsUpdate = true;

    this._fbo = new FBO(window.innerWidth, window.innerHeight, this._renderer, shader);

    this.render();
  }
}