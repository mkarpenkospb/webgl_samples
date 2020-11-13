///////////////////////////////////////////////////////////////////////////
// Builtin uniform
//
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
//
///////////////////////////////////////////////////////////////////////////


out vec3 pos_world;
out vec3 vert_color;

varying vec3 vColor;

void main()
{
  //pos_world = (modelMatrix * vec4(position, 1.0)).xyz;
  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//  gl_Position =  vec4(position, 1.0) ;//projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}