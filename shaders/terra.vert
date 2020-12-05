#include <clipping_planes_pars_vertex>

out vec3 pos_world;
varying float brightness;
uniform sampler2D height_map;
uniform sampler2D height_map_bed;
uniform float scale;
varying vec2 vUV;

varying float distToCamera;

void main()
{
  #include <begin_vertex>
  float local_scale = scale;
  vUV = uv;
  pos_world = (modelMatrix * vec4(position, 1.0)).xyz;

  vec4 height = texture2D(height_map, uv);
  brightness = height.r;
  vec3 new_pos = position + vec3(0, 0, 1) * float(local_scale) * brightness;
//  gl_Position = projectionMatrix * modelViewMatrix * vec4(new_pos, 1.0);

  #include <project_vertex>
  mvPosition = modelViewMatrix  * vec4(new_pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  distToCamera = gl_Position.w;
  #include <clipping_planes_vertex>
}