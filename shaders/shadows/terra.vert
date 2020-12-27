uniform sampler2D height_map;
uniform float scale;

void main()
{
  float local_scale = scale;
  vec3 pos_world = (modelMatrix * vec4(position, 1.0)).xyz;

  vec4 height = texture2D(height_map, uv);
  float brightness = height.r;
  vec3 new_pos = position + vec3(0, 0, 1) * float(local_scale) * brightness;

  gl_Position = projectionMatrix * modelViewMatrix  * vec4(new_pos, 1.0);
}