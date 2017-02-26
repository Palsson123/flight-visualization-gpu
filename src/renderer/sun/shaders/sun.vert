varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = vec3(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}