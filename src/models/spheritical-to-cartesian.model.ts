/**
 * Created by fille on 2017-02-14.
 */

export function spheriticalToCartesian(lon: number, lat: number, radius: number): THREE.Vector3 {
  let phi = (90 - lat) * (Math.PI / 180);
  let theta = (lon + 180) * (Math.PI / 180);
  let cartesian = new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );

  return cartesian;
}