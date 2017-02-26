varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    vUv = -uv;

    vNormal = vec3(modelMatrix * vec4(normal, 1.0));
    vPosition = vec3(modelMatrix * vec4(position, 1.0));
}