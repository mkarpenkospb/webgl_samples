

uniform float water_level;

void main()
{

  vec3 pos_world = (modelMatrix * vec4(position, 1.0)).xyz + vec3(0.0, water_level, 0.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(pos_world, 1.0);

}