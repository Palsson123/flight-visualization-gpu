import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from "rxjs";
import * as d3 from 'd3-dsv';
import {Flight} from "./flights/flight.model";
import {Http, Response} from "@angular/http";
import {Airport} from "../models/airport.model";

@Injectable()
export class DataService {
  private _features: Observable<IFeature[]>;
  private _flights: Observable<Flight[]>;
  private _airports: Observable<any>;

  constructor(private http: Http) {
    this._flights = this.http.get('../../assets/data/march_2016-2.csv').map((res: any) => {
      let flights: Flight[] = [];
      for (let flightJSON of d3.csvParse(res._body)) {
        flights.push(Flight.CreateFromJSON(flightJSON));
      }
      return flights;
    });

    this._airports = this.http.get('../../assets/data/airports.csv').map((res: any) => {
      let airports = {};
      for (let airportJSON of d3.csvParse(res._body)) {
        airports[airportJSON['iata']] = Airport.CreateFromJSON(airportJSON);
      }
      console.log(airports);
      return airports;
    });

    this._features = this.http.get('../assets/data/world.json').map((res: Response) => {
      return res.json().features;
    });
  }


  get airports(): Observable<any> {
    return this._airports;
  }
  get flights(): Observable<any> {
    return this._flights;
  }
  get features(): Observable<IFeature[]> {
    return this._features;
  }
}



export interface IFeature {
  geometry: IGeometry;
  properties: IProperties;
}

export interface IGeometry {
  coordinates: any;
  type: string;
}

export interface IProperties {

}