uniform vec3 sunPosition;
uniform sampler2D earthHeightMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vSunPosition;

varying vec3 vTangentSunPosition;

void main() {
    vec3 newPosition = position + normal * texture2D(earthHeightMap, -uv).xyz * 0.2;

    vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vUv = -uv;
    vNormal = vec3(modelMatrix * vec4(normal, 1.0));
    vPosition = vec3(modelMatrix * vec4(position, 1.0));
    vSunPosition = vec3(vec4(sunPosition, 1.0));
}