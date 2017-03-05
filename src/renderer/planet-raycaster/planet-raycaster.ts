import {Airport} from "../../models/airport.model";

export default class PlanetRaycaster {
  private _raycaster: THREE.Raycaster;
  private _mousePosition: THREE.Vector2;
  private _scene: THREE.Scene;
  private _planetMesh: THREE.Mesh;

  constructor(private _camera: THREE.Camera, private _airports: { [id: string]: Airport }) {
    this._raycaster = new THREE.Raycaster();
    this._mousePosition = new THREE.Vector2(0,0);
    document.addEventListener('mousemove', (event) => {
      event.preventDefault();
      this._mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this._mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });

    this._scene = new THREE.Scene();
    this._planetMesh = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16));
    this._planetMesh.rotateX(-Math.PI / 1.4);
    this._scene.add(this._planetMesh);
  }

  public update() {
    this._raycaster.setFromCamera(this._mousePosition, this._camera);
    let intersects = this._raycaster.intersectObjects(this._scene.children);

    if (intersects.length > 0) {
      let intersectionPosition = intersects[0].point;

      let closestAirport;
      let closestDistance = 10000.0;
      for (let airportId in this._airports) {
        let airport = this._airports[airportId];
        let distance = airport.cartesianCoordinate.distanceTo(intersectionPosition);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestAirport = airport;
        }

        if (airport.name == 'William B Hartsfield-Atlanta Intl') {
          console.log(distance);
        }
      }

      if (closestDistance < 0.2) {
        //console.log(closestAirport.name);
      }
    }
  }
}