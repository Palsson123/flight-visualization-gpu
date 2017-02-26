
varying vec2 vUv;
varying vec3 vPosition;

uniform float threshold;
uniform sampler2D inputTexture;

void main() {
    vec3 color = texture2D(inputTexture, vUv).rgb;
    float mag = length(color);

    if (mag > threshold) {
        gl_FragColor = vec4(vec3(1.0), 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}