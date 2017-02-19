import {Airport} from "../../models/airport.model";
import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";

export class AirportsRenderer {
  private _group: THREE.Group;
  private _points: THREE.Points;
  private _material: THREE.PointsMaterial;

  constructor(group: THREE.Group) {
    this._group = group;
    this._material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
  }

  public drawAirports(airports: {[id:string]: Airport}) {
    let geometry = new THREE.Geometry();
    for (let id in airports) {
      let airport = airports[id];
      geometry.vertices.push(spheriticalToCartesian(airport.coordinate[0], airport.coordinate[1], 10));
    }
    this._points = new THREE.Points(geometry, this._material);
    this._group.add(this._points);
  }
}