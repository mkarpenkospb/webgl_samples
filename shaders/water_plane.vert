out vec3 pos_world;
out vec3 out_normal;
out vec2 vUV;

void main()
{
  out_normal = normal;
  pos_world = (modelMatrix * vec4(position, 1.0)).xyz;
  vUV = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}