import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable, BehaviorSubject} from "rxjs";
import * as d3 from 'd3-dsv';
import {Flight} from "./flights/flight.model";
import {Http, Response} from "@angular/http";
import {Airport} from "../models/airport.model";
import * as moment from 'moment';

@Injectable()
export class DataService {
  private _features: Observable<IFeature[]>;
  private _flights: Observable<Flight[]>;
  private _airports: Observable<any>;
  private _dataLoaded: BehaviorSubject<boolean>;

  constructor(private http: Http) {
    this._dataLoaded = new BehaviorSubject(false);
    this._flights = this.http.get('../../assets/data/flights.csv').map((res: any) => {
      //this.exportFilteredCSV(res, '2016-03-01T00:00:00', '2016-03-06T00:00:00');

      let flights: Flight[] = [];
      for (let flightJSON of d3.csvParse(res._body)) {
        flights.push(Flight.CreateFromJSON(flightJSON));
      }
      this._dataLoaded.next(true);
      return flights;
    });

    this._airports = this.http.get('../../assets/data/airports.csv').map((res: any) => {
      let airports = {};
      for (let airportJSON of d3.csvParse(res._body)) {
        airports[airportJSON['iata']] = Airport.CreateFromJSON(airportJSON);
      }
      return airports;
    });

    this._features = this.http.get('../assets/data/world.json').map((res: Response) => {
      return res.json().features;
    });
  }

  private exportFilteredCSV(res: any, startDate: string, endDate: string) {
    // let header = '"MONTH","DAY_OF_MONTH","DAY_OF_WEEK","FL_DATE","CARRIER","TAIL_NUM","FL_NUM","ORIGIN","DEST","CRS_DEP_TIME","DEP_TIME","DEP_DELAY","DEP_DELAY_NEW","CRS_ARR_TIME","ARR_TIME","ARR_DELAY","ARR_DELAY_NEW","CANCELLED","CANCELLATION_CODE","CRS_ELAPSED_TIME","ACTUAL_ELAPSED_TIME","AIR_TIME","DISTANCE","CARRIER_DELAY","WEATHER_DELAY","NAS_DELAY","SECURITY_DELAY","LATE_AIRCRAFT_DELAY",\n'
    let csvString = '"DEPARTURE","ARRIVAL","CARRIER","ORIGIN","DEST","CARRIER","DISTANCE","ARR_DELAY",\n'
    let start = moment(startDate).unix();
    let end = moment(endDate).unix();

    for (let flightJSON of d3.csvParse(res._body)) {
      let deparuteDateString = flightJSON['FL_DATE'] + ' ' + flightJSON['DEP_TIME'].slice(0,2) + ':' + flightJSON['DEP_TIME'].slice(2,4);
      let departureTime = moment(deparuteDateString, 'YYYY-MM-DD hh:mm').unix();
      let arrivalTime = moment(deparuteDateString, 'YYYY-MM-DD hh:mm').unix() + parseFloat(flightJSON['ACTUAL_ELAPSED_TIME']) / 100 * 60 * 60;

      if (departureTime >= start && arrivalTime <= end) {
        csvString +=`${departureTime},${arrivalTime},"${flightJSON["CARRIER"]}","${flightJSON["ORIGIN"]}","${flightJSON["DEST"]}","${flightJSON["DISTANCE"]}",${flightJSON["DISTANCE"]}, \n`
      }
    }

    let downloadLink = document.createElement("a");
    let blob = new Blob(["\ufeff", csvString]);
    let url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "flights.csv";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    //console.log(csvString);
  }


  get airports(): Observable<any> { return this._airports; }
  get flights(): Observable<any> { return this._flights; }
  get features(): Observable<IFeature[]> { return this._features; }
  get dataLoaded(): Observable<boolean> { return this._dataLoaded.asObservable(); }
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