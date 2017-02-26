varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D glow;
uniform sampler2D stars;

void main() {
    gl_FragColor = vec4(5.0 * texture2D(glow, vUv).rgb + texture2D(stars, vUv).rgb, 1.0);
}