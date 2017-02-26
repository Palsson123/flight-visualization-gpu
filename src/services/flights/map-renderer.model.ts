import {IFeature} from "../data.service";
import RenderPass from "../../models/render-pass";
import Planet from "../../renderer/planet/planet";
import Sun from "../../renderer/sun/sun";
import CountryBorders from "../../renderer/country-borders/country-borders";

export const MULTI_POLYGON = 'MultiPolygon';
export const POLYGON = 'Polygon';

export class MapRenderer extends RenderPass {
  private _group: THREE.Group;
  private _sun: Sun;
  private _planetMesh: Planet;
  private _countryBorders: CountryBorders;
  private _countryBorderLines: THREE.Line[];
  private _lineMaterial: THREE.LineBasicMaterial;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    super(renderer, new THREE.Scene(), camera);

    this._group = new THREE.Group();
    this._group.rotateX(-Math.PI / 1.4);
    this._scene.add(this._group);

    this._sun = new Sun(renderer, camera);
    this._countryBorders = new CountryBorders(renderer, camera);

    this._countryBorderLines = [];
    this._lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });

    this._planetMesh = new Planet(renderer, camera);
  }

  public update(time: number) {
    this._sun.render(time);
    this._sun.position.set(80 * Math.cos(time * 0.5), 0.0, 80 * Math.sin(time * 0.5));
    this._planetMesh.render(time, this._sun.position);
    this._countryBorders.render();
  }

  public drawMap(features: IFeature[]) {
    for (let feature of features) {
      switch (feature.geometry.type) {
        case MULTI_POLYGON:
          this._countryBorders.createMapFromMultiPolygon(feature.geometry);
          break;
        case POLYGON:
          this._countryBorders.createMapFromPolygon(feature.geometry);
          break;
      }
    }
  }

  get planetTexture() { return this._planetMesh.texture }
  get sunTexture() { return this._sun.texture; }
  get borderTexture() { return this._countryBorders.texture; }
}