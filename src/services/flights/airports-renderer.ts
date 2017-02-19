import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";
import {Flight} from "./flight.model";
import {Airport} from "../../models/airport.model";

export class FlightsRenderer {
  private _group: THREE.Group;
  private _flightCurves: THREE.Line[];
  private _material: THREE.LineBasicMaterial;

  constructor(group: THREE.Group) {
    this._group = group;
    this._material = new THREE.LineBasicMaterial({ color: 0xff00ff });
    this._flightCurves = [];
  }

  public drawFlights(flights: Flight[], airports: {[id: string]: Airport}) {
    //for (let flight of flights) {
    for (let i = 0; i < flights.length; i += 1) {
      let flight = flights[i];
      let departureAirport = airports[flight.departureAirportId];
      let arrivalAirport = airports[flight.arrivalAirportId];

      let departurePos = spheriticalToCartesian(departureAirport.coordinate[0], departureAirport.coordinate[1], 10);
      let arrivalPos = spheriticalToCartesian(arrivalAirport.coordinate[0], arrivalAirport.coordinate[1], 10);
      let midPos = departurePos.clone().add(arrivalPos).multiplyScalar(0.5).normalize().multiplyScalar(11);

      let flightCurve = new THREE.QuadraticBezierCurve3(departurePos, midPos, arrivalPos);
      let flightGeometry = new THREE.Geometry();
      flightGeometry.vertices = flightCurve.getPoints(5);
      let lineObject = new THREE.Line(flightGeometry, this._material);

      this._flightCurves.push(lineObject);
      this._group.add(lineObject);

    }

  }
}