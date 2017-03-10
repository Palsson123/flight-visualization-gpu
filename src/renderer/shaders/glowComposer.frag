uniform sampler2D planetGlow;
uniform sampler2D planet;
uniform sampler2D sun;
uniform sampler2D stars;
uniform sampler2D flightTrail;
//uniform sampler2D timeline;
varying vec2 vUv;

void main(void) {
    vec3 planetGlowColor = texture2D( planetGlow, vUv ).xyz;
    float planetGlowAlpha = texture2D( planetGlow, vUv ).a;

    vec3 sunColor = texture2D( sun, vUv ).xyz;
    vec3 starsColor = texture2D( stars, vUv ).xyz;
    vec3 flightColor = 10.0 * texture2D( flightTrail, vUv ).xyz;
    //vec3 timelineColor = texture2D( timeline, vUv ).xyz;

    vec3 totalColor = clamp(0.6 * planetGlowAlpha * planetGlowColor + 0.1 * flightColor + 1.5 * sunColor + starsColor, vec3(0.0), vec3(1.5));
    gl_FragColor = vec4(totalColor, 1.0);
}