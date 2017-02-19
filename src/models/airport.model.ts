/**
 * Created by fille on 2017-02-13.
 */

export class Airport {
  id: string;
  name: string;
  city: string;
  coordinate: number[];
  state: string;

  constructor(id: string, name: string, city: string, coordinate: number[], state: string) {
    this.id = id;
    this.name = name;
    this.city = city;
    this.coordinate = coordinate;
    this.state = state;
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