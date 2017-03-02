import {IFeature} from "../data.service";
import RenderPass from "../../models/render-pass";
import Planet from "../../renderer/planet/planet";
import Sun from "../../renderer/sun/sun";
import CountryBorders from "../../renderer/country-borders/country-borders";
import PlanetGlow from "../../renderer/planet-glow/planet-glow";
import Stars from "../../renderer/stars/stars";
import {TimeService} from "../time.service";

export const MULTI_POLYGON = 'MultiPolygon';
export const POLYGON = 'Polygon';

export class MapRenderer extends RenderPass {
  private _sun: Sun;
  private _planet: Planet;
  private _planetGlow: PlanetGlow;
  private _stars: Stars;
  private _countryBorders: CountryBorders;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera, private timeService: TimeService) {
    super(renderer, new THREE.Scene(), camera);

    this._sun = new Sun(renderer, camera);
    this._countryBorders = new CountryBorders(renderer, camera);

    this._planet = new Planet(renderer, camera);
    this._planetGlow = new PlanetGlow(renderer, camera);

    this._stars = new Stars(renderer, camera);
  }

  public update(time: number) {
    this._sun.render(time);
    this._sun.position.set(80 * Math.cos(time * 0.5), 0.0, 80 * Math.sin(time * 0.5));

    this._planet.render(time, this._sun.position);
    this._planetGlow.render(this._planet.texture, this._sun.position);

    this._stars.render();
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

  get planetTexture() { return this._planet.texture }
  get planetGlowTexture() { return this._planetGlow.texture }
  get sunTexture() { return this._sun.texture; }
  get starsTexture(): THREE.Texture { return this._stars.texture; }
  get borderTexture() { return this._countryBorders.texture; }
}