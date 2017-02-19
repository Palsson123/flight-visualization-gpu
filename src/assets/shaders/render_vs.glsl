//float texture containing the positions of each particle
uniform sampler2D positions;
uniform sampler2D departurePositions;
uniform sampler2D midPointPositions;
uniform sampler2D arrivalPositions;
uniform sampler2D flightTimes;

//size
uniform float startTime;
uniform float endTime;
uniform float currentTime;
uniform float pointSize;
varying vec2 vUv;

vec3 bezier(
  float t,
  vec3 c1,
  vec3 c2,
  vec3 c3)
{
  return pow((1.0 - t), 2.0) * c1 + 2.0 * (1.0 - t) * t * c2 + pow(t,2.0) * c3;
}

void main() {
    vec3 departurePosition = texture2D( departurePositions, position.xy).xyz;
    vec3 midPointPosition = texture2D( midPointPositions, position.xy).xyz;
    vec3 arrivalPosition = texture2D( arrivalPositions, position.xy).xyz;

    float flightDepartureTime = texture2D(flightTimes, position.xy).x;
    float flightArrivalTime = texture2D(flightTimes, position.xy).y;
    float flightTime = clamp((currentTime - flightDepartureTime) / endTime, 0.0, 1.0);


    //vec3 interpolatedPosition = departurePosition * (1.0 - time) + arrivalPosition * time;
    vec3 interpolatedPosition = bezier(flightTime, departurePosition, midPointPosition, arrivalPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( interpolatedPosition.xyz, 1.0 );

    vUv = vec2(position.x, position.y);
    gl_PointSize = pointSize;
}