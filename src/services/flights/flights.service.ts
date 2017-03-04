import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DataService} from "../data.service";
import {Flight} from "./flight.model";
import {RenderService} from "../../renderer/render.service";
import {Airport} from "../../models/airport.model";
import {AirportsRenderer} from "./airports-renderer.model";
import {FlightsRenderer} from "./airports-renderer";
import {TimeService} from "../time.service";

@Injectable()
export class FlightsService {
  private _airports: {[id:string]: Airport};
  private _airportsRenderer: AirportsRenderer;

  private _flights: Flight[];
  private _flightsRenderer: FlightsRenderer;

  constructor(
    private dataService: DataService,
    private timeService: TimeService,
    private renderService: RenderService
  ) {
    // //this._airportsRenderer = new AirportsRenderer(renderService.mapGroup);
    // //this._flightsRenderer = new FlightsRenderer(renderService.mapGroup);
    //
    // dataService.airports.subscribe((airports: { [id: string]: Airport } ) => {
    //   this._airports = airports;
    //
    //   dataService.flights.subscribe((flights: Flight[]) => {
    //     this._flights = flights;
    //     this.timeService.init(this._flights, this._airports);
    //     renderService.initData(this._flights, this._airports);
    //   });
    //
    //   //this._airportsRenderer.drawAirports(airports);
    // });
  }

}