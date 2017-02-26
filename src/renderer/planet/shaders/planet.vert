attribute vec3 tangent;
attribute vec3 bitangent;

uniform vec3 sunPosition;
uniform sampler2D earthHeightMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec3 vVt;
varying vec3 vVs;

varying vec3 vTangentSunPosition;

void calculateTangents(inout vec3 tangent, inout vec3 binormal) {
    vec3 c1 = cross(normal, vec3(0.0, 0.0, 1.0));
    vec3 c2 = cross(normal, vec3(0.0, 1.0, 0.0));

    if (length(c1) > length(c2)) {
        tangent = normalize(c1);
    }
    else {
        tangent = normalize(c2);
    }

    binormal = cross(normal, tangent);
    binormal = normalize(binormal);
}


void main() {
    vec3 newPosition = position + normal * texture2D(earthHeightMap, -uv).xyz * 0.2;

    vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vUv = -uv;
    vNormal = vec3(modelMatrix * vec4(normal, 1.0));
    vPosition = vec3(modelMatrix * vec4(position, 1.0));

    vTangent = vec3(modelMatrix * vec4(normalize(tangent), 1.0));
    vBitangent = vec3(modelMatrix * vec4(normalize(bitangent), 1.0));
}