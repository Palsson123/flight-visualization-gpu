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
    return new Flight(
      json.CARRIER,
      json.DEPARTURE,
      json.ORIGIN,
      json.ARRIVAL,
      json.DEST
    );
  }

}