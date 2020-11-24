///////////////////////////////////////////////////////////////////////////
// Builtin uniform
//
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
//
///////////////////////////////////////////////////////////////////////////

out vec3 pos_world;
varying float brightness;
uniform sampler2D height_map;
uniform float scale;
varying vec2 vUV;

void main()
{
  vUV = uv;
  vec4 height = texture2D(height_map, uv );
  brightness = height.r;
  pos_world = (modelMatrix * vec4(position, 1.0)).xyz;

  vec3 new_pos = position + normal * float(scale) * brightness;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(new_pos, 1.0);
}