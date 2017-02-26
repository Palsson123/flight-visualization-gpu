import {IGeometry} from "../../services/data.service";
import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";

export default class CountryBorders {
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _renderTarget: THREE.WebGLRenderTarget;
  private _lineMaterial: THREE.LineBasicMaterial;
  private _countryBorderLines: THREE.Line[];

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this._renderer = renderer;
    this._camera = camera;

    this._scene = new THREE.Scene();
    this._scene.rotateX(-Math.PI / 1.4);
    let sphere = new THREE.Mesh(new THREE.SphereGeometry(10,32,32), new THREE.MeshBasicMaterial({color: 0x000000}));
    this._scene.add(sphere);

    this._lineMaterial = new THREE.LineBasicMaterial({ color: 0x222222 });
    this._countryBorderLines = [];
    this._renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });
  }

  public render() {
    this._renderer.render(this._scene, this._camera, this._renderTarget);
  }

  public createMapFromPolygon(geometry: IGeometry) {
    let borderGeometry = new THREE.Geometry();

    for (let coordObject of geometry.coordinates) {
      for (let coord of coordObject) {
        borderGeometry.vertices.push(spheriticalToCartesian(coord[0], coord[1], 10));
      }
    }

    let line = new THREE.Line(borderGeometry, this._lineMaterial);
    this._countryBorderLines.push(line);
    this._scene.add(line);
  }

  public createMapFromMultiPolygon(geometry: IGeometry) {
    for (let polygon of geometry.coordinates) {
      let borderGeometry = new THREE.Geometry();

      for (let coordObject of polygon) {
        for (let coord of coordObject) {
          borderGeometry.vertices.push(spheriticalToCartesian(coord[0], coord[1], 10.0));
        }
      }

      let line = new THREE.Line(borderGeometry, this._lineMaterial);
      this._countryBorderLines.push(line);
      this._scene.add(line);
    }
  }

  get texture() { return this._renderTarget.texture; }
}