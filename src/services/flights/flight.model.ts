import * as moment from 'moment'

export class Flight {
  carrierId: string;
  departureTime: number;
  departureAirportId: string;
  arrivalTime: number;
  arrivalAirportId: string;


  constructor(caId: string, depTime: number, depAirpId: string, arrTime: number, arrAirpId: string) {
    this.carrierId = caId;
    this.departureTime = depTime;
    this.departureAirportId = depAirpId;
    this.arrivalTime = arrTime;
    this.arrivalAirportId = arrAirpId;
  }

  static CreateFromJSON(json: any): Flight {
    let deparuteDateString = json.FL_DATE + 'T' + json.DEP_TIME.slice(0,2) + ':' + json.DEP_TIME.slice(2,4);

    return new Flight(
      json.CARRIER,
      moment(deparuteDateString).unix(),
      json.ORIGIN,
      moment(deparuteDateString).unix() + parseFloat(json.ACTUAL_ELAPSED_TIME) / 100 * 60 * 60,
      json.DEST
    );
  }

}