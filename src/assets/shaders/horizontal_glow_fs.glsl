uniform sampler2D inputTexture;
uniform vec2 size;
varying vec2 vUv;

void main() {
    vec3 clr = (
        texture2D( inputTexture, vUv + vec2(2.0, 0.0) / size ).xyz +
        texture2D( inputTexture, vUv + vec2(1.0, 0.0) / size ).xyz +
        texture2D( inputTexture, vUv + vec2(0.0, 0.0) / size ).xyz +
        texture2D( inputTexture, vUv - vec2(1.0, 0.0) / size ).xyz +
        texture2D( inputTexture, vUv - vec2(2.0, 0.0) / size ).xyz
    );

    vec3 minVal = vec3(0.0);
    vec3 maxVal = vec3(5.0);
    gl_FragColor = vec4(clamp(clr / 5.0, minVal, maxVal), 1.0);
}
