import {IFeature, IGeometry} from "../data.service";
import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";
import RenderPass from "../../models/render-pass";
import ShaderLoader from "../../models/shader-loader";

export const MULTI_POLYGON = 'MultiPolygon';
export const POLYGON = 'Polygon';

export class MapRenderer extends RenderPass {
  private _group: THREE.Group;
  private _sunMesh: THREE.Mesh;
  private _earthUniforms: any;
  private _countryBorderLines: THREE.Line[];
  private _lineMaterial: THREE.LineBasicMaterial;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera, shaderLoader: ShaderLoader) {
    super(renderer, new THREE.Scene(), camera);

    this._group = new THREE.Group();
    this._group.rotateX(-Math.PI / 1.4);
    this._scene.add(this._group);

    let sunGeometry = new THREE.SphereGeometry(6, 16, 16);
    let sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff66 });
    this._sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    this._sunMesh.position.set(40, 0, -40);
    this._scene.add(this._sunMesh);

    this._countryBorderLines = [];
    this._lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });

    let geometry = new THREE.SphereGeometry(10, 128, 128);

    let earthMaskMap = new THREE.TextureLoader().load('./assets/textures/world_map_mask.png');
    earthMaskMap.wrapS = THREE.RepeatWrapping;
    earthMaskMap.wrapT = THREE.RepeatWrapping;

    let earthHeightMap = new THREE.TextureLoader().load('./assets/textures/world_height_map.jpg');
    earthHeightMap.wrapS = THREE.RepeatWrapping;
    earthHeightMap.wrapT = THREE.RepeatWrapping;

    let earthNormalMap = new THREE.TextureLoader().load('./assets/textures/world_normal_map.jpg');
    earthNormalMap.wrapS = THREE.RepeatWrapping;
    earthNormalMap.wrapT = THREE.RepeatWrapping;

    this._earthUniforms = {
      earthMaskMap: { value: earthMaskMap },
      earthHeightMap: { value: earthHeightMap },
      earthNormalMap: { value: earthNormalMap },
      sunPosition: { type: 'v3', value: this._sunMesh.position }
    };
    let earthShader = new THREE.ShaderMaterial({
      uniforms: this._earthUniforms,
      vertexShader: shaderLoader.get( 'earth_vs' ),
      fragmentShader: shaderLoader.get( 'earth_fs' ),
      blending: THREE.AdditiveBlending
    });
    earthShader.needsUpdate = true;

    let earthMesh = new THREE.Mesh(geometry, earthShader);
    earthMesh.rotation.set(Math.PI / 2.0, 0.0, Math.PI);
    this._group.add(earthMesh);
  }

  public update(time: number) {
    //this._sunMesh.position.set(40 * Math.cos(time), 0.0, 40 * Math.sin(time));
    //this._earthUniforms.sunPosition.value = this._sunMesh.position;
  }

  public drawMap(features: IFeature[]) {
    for (let feature of features) {
      switch (feature.geometry.type) {
        case MULTI_POLYGON:
          this.createMapFromMultiPolygon(feature.geometry);
          break;
        case POLYGON:
          this.createMapFromPolygon(feature.geometry);
          break;
      }
    }
  }

  private createMapFromPolygon(geometry: IGeometry) {
    let borderGeometry = new THREE.Geometry();

    for (let coordObject of geometry.coordinates) {
      for (let coord of coordObject) {
        borderGeometry.vertices.push(spheriticalToCartesian(coord[0], coord[1], 10.05));
      }
    }

    let line = new THREE.Line(borderGeometry, this._lineMaterial);
    this._countryBorderLines.push(line);
    this._group.add(line);
  }

  private createMapFromMultiPolygon(geometry: IGeometry) {
    for (let polygon of geometry.coordinates) {
      let borderGeometry = new THREE.Geometry();

      for (let coordObject of polygon) {
        for (let coord of coordObject) {
          if (coord.length != 2) {
            console.log(coord);
          }

          borderGeometry.vertices.push(spheriticalToCartesian(coord[0], coord[1], 10.05));
        }
      }

      let line = new THREE.Line(borderGeometry, this._lineMaterial);
      this._countryBorderLines.push(line);
      this._group.add(line);
    }
  }

}