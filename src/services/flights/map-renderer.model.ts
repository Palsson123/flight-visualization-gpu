import {IFeature} from "../data.service";
import RenderPass from "../../models/render-pass";
import Planet from "../../renderer/planet/planet";
import Sun from "../../renderer/sun/sun";
import CountryBorders from "../../renderer/country-borders/country-borders";
import PlanetGlow from "../../renderer/planet-glow/planet-glow";
import {TimeService} from "../time.service";
import * as moment from "moment";

export const MULTI_POLYGON = 'MultiPolygon';
export const POLYGON = 'Polygon';
const angleOffset = 1.2;

export class MapRenderer extends RenderPass {
  private _sun: Sun;
  private _planet: Planet;
  private _planetGlow: PlanetGlow;
  private _countryBorders: CountryBorders;
  private _advancedGraphics: boolean = true;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera, private timeService: TimeService) {
    super(renderer, new THREE.Scene(), camera);

    this._sun = new Sun(renderer, camera);
    this._countryBorders = new CountryBorders(renderer, camera);

    this._planet = new Planet(renderer, camera);
    this._planetGlow = new PlanetGlow(renderer, camera);
  }

  public update(time: number) {
    if (this._advancedGraphics) {
      let momentDate = moment((this.timeService.currentTime + this.timeService.startTime) * 1000);
      let seconds = momentDate.hours() * 3600 + momentDate.minutes() * 60 + momentDate.seconds();
      let angleTime = seconds / 86400 * 2.0 * Math.PI + angleOffset;

      this._sun.render(time);
      this._sun.position.set(80 * Math.cos(angleTime), 0.0, 80 * Math.sin(angleTime));

      this._planet.render(time, this._sun.position);
      this._planetGlow.render(this._planet.texture, this._sun.position);
    }

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
  get borderTexture() { return this._countryBorders.texture; }
  set advancedGraphics(value: boolean) { this._advancedGraphics = value; }
}