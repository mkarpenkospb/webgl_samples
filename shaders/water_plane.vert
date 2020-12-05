out vec3 pos_world;
out vec3 out_normal;
out vec2 vUV;
out mat3 TBN;

uniform vec3 tangent;
uniform vec3 bitangent;
uniform float water_level;

void main()
{
  out_normal = normal;
  pos_world = (modelMatrix * vec4(position, 1.0)).xyz + vec3(0.0, water_level, 0.0);
  vUV = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos_world, 1.0);

  vec3 T = normalize(vec3(modelMatrix * vec4(tangent, 0.0)));
  vec3 B = normalize(vec3(modelMatrix * vec4(bitangent, 0.0)));
  vec3 N = normalize(vec3(modelMatrix * vec4(vec3(0.0, 0.1, 0.0), 0.0)));
  TBN = mat3(T, B, N);
}