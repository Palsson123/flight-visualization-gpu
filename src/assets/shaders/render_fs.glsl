uniform sampler2D departurePositions;
uniform sampler2D positions;
varying vec2 vUv;

void main()
{
    vec3 clr = texture2D( positions, vUv.xy ).xyz;
    gl_FragColor = vec4( vec3(1.0, 1.0, 0.0), .1 );
}