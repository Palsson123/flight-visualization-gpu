uniform sampler2D planet;
uniform sampler2D flights;
uniform sampler2D stars;
uniform sampler2D map;
uniform sampler2D sun;
uniform sampler2D countryBorders;
uniform sampler2D timeline;
uniform sampler2D glow;
uniform vec2 size;

varying vec2 vUv;

void main(void) {
    vec4 planetColor = texture2D( planet, vUv );
    vec4 flightsColor = texture2D( flights, vUv );
    vec4 mapColor = texture2D( map, vUv );
    vec4 sunColor = texture2D( sun, vUv );
    vec4 borderColor = texture2D( countryBorders, vUv );
    vec4 starsColor = texture2D( stars, vUv );
    vec4 glowColor = texture2D( glow, vUv );
    vec4 timelineColor = texture2D( timeline, vUv );

    gl_FragColor = glowColor + planetColor + starsColor + flightsColor + mapColor + sunColor + borderColor;
}