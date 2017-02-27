uniform sampler2D planetGlow;
uniform sampler2D sun;
uniform sampler2D stars;
varying vec2 vUv;

void main(void) {
    vec3 planetGlowColor = texture2D( planetGlow, vUv ).xyz;
    vec3 sunColor = texture2D( sun, vUv ).xyz;
    vec3 starsColor = texture2D( stars, vUv ).xyz;

    vec3 totalColor = clamp(0.15 * planetGlowColor + sunColor + starsColor, vec3(0.0), vec3(1.0));
    gl_FragColor = vec4(totalColor, 1.0);
}