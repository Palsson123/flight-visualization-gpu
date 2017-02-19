varying vec2 vUv;
uniform sampler2D earthMap;

void main() {
    vec3 earthMapClr = texture2D(earthMap, -vUv).xyz;

    // Water
    if (length(earthMapClr) == 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.1, 1.0);
    }
    // Land
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }

}