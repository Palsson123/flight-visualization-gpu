export class Flight {
  carrierId: string;
  departureTime: number;
  departureAirportId: string;
  arrivalTime: number;
  arrivalAirportId: string;

  arrivalDelay: number;
  departureDelay: number;

  constructor(caId: string, depTime: number, depAirpId: string, arrTime: number, arrAirpId: string, arrDelay: number, depDelay: number) {
    this.carrierId = caId;
    this.departureTime = depTime;
    this.departureAirportId = depAirpId;
    this.arrivalTime = arrTime;
    this.arrivalAirportId = arrAirpId;
    this.arrivalDelay = arrDelay;
    this.departureDelay = depDelay;
  }

  static CreateFromJSON(json: any): Flight {
    return new Flight(
      json.CARRIER,
      json.DEPARTURE,
      json.ORIGIN,
      json.ARRIVAL,
      json.DEST,
      json.ARR_DELAY,
      json.DEP_DELAY
    );
  }

}