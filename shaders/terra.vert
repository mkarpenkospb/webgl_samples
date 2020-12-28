#include <clipping_planes_pars_vertex>

uniform mat4 shadowProjView;
uniform mat4 shadowNearProjView;

out vec3 shadowTexPos;
out vec3 shadowNearTexPos;

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

  vec4 tmp = shadowProjView * modelMatrix * vec4(new_pos, 1.0);
  shadowTexPos = (tmp.xyz / tmp.w) * 0.5 + 0.5;

  tmp = shadowNearProjView * modelMatrix * vec4(new_pos, 1.0);
  shadowNearTexPos = (tmp.xyz / tmp.w) * 0.5 + 0.5;

  #include <clipping_planes_vertex>
}