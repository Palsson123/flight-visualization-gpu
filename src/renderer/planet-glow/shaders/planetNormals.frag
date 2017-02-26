varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 sunPosition;

void main() {
    vec3 s = normalize( vPosition - sunPosition );
    vec3 v = normalize( vPosition - cameraPosition );

    float cameraFactor = clamp(abs(dot(v, vNormal)), 0.0, 1.0);
    float sunFactor = clamp(dot(s, vNormal), 0.0, 1.0);
    float totalFactor = (1.0 - 1.0 * sunFactor) * pow((1.0 - 1.0 * cameraFactor), 2.0);
    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * vec3(pow(totalFactor, 1.0)), 1.0);
}