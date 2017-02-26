/**
 * Created by fille on 2017-02-26.
 */

export const invertNormals = (geometry: THREE.Geometry): void => {
  for ( let i = 0; i < geometry.faces.length; i ++ ) {

    let face = geometry.faces[ i ];
    let temp = face.a;
    face.a = face.c;
    face.c = temp;

  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  let faceVertexUvs = geometry.faceVertexUvs[ 0 ];
  for (let i = 0; i < faceVertexUvs.length; i++) {
    let temp = faceVertexUvs[ i ][ 0 ];
    faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
    faceVertexUvs[ i ][ 2 ] = temp;
  }
};