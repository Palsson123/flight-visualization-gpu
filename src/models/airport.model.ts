import {spheriticalToCartesian} from "./spheritical-to-cartesian.model";
/**
 * Created by fille on 2017-02-13.
 */

export class Airport {
  id: string;
  name: string;
  city: string;
  coordinate: number[];
  cartesianCoordinate: THREE.Vector3;
  state: string;

  constructor(id: string, name: string, city: string, coordinate: number[], state: string) {
    console.log(name);
    this.id = id;
    this.name = name;
    this.city = city;
    this.coordinate = coordinate;
    this.state = state;

    this.cartesianCoordinate = spheriticalToCartesian(this.coordinate[0], this.coordinate[1] - 57.2957795 * (Math.PI / 1.4), 10);
  }

  static CreateFromJSON(json: any): Airport {
    return new Airport(
      json.iata,
      json.airport,
      json.city,
      [parseFloat(json.long), parseFloat(json.lat)],
      json.state
    );
  }
}