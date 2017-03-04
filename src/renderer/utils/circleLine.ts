/**
 * Created by fille on 2017-03-03.
 */

export const generateCircleLine = (radius: number, segments: number) => {
  let geometry = new THREE.BufferGeometry();
  let vertices = new Float32Array((segments + 1) * 3);

  for (let i = 0; i <= segments * 3; i += 3) {
    let circleLength = Math.PI * 2.0 * ((i / 3) / segments);
    let position = new THREE.Vector3(0.0, radius * Math.cos(circleLength), radius * Math.sin(circleLength));
    vertices[i] = position.x;
    vertices[i + 1] = position.y;
    vertices[i + 2] = position.z;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

  return geometry;
};