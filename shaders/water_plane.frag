in vec3 out_normal;
in vec3 pos_world;
in vec2 vUV;
in mat3 TBN;
in vec3 shadowTexPos;

uniform samplerCube u_scene_reflect;
uniform samplerCube u_scene_refract;

uniform sampler2D normal_map_fst;

uniform sampler2D shadowsTexture;

uniform float n_water;
uniform float n_air;
uniform float ripple;
uniform float time;

uniform int shadowRender;

void main()
{
  vec3 sampleNormalFst = texture(normal_map_fst, vUV * ripple + time).rgb;
  sampleNormalFst = normalize(sampleNormalFst * 2.0 - 1.0);
  vec3 sampleNormalSnd = texture(normal_map_fst, vec2(1.0 - vUV.x, vUV.y) * ripple - time).rgb;
  sampleNormalSnd = normalize(sampleNormalSnd * 2.0 - 1.0);
  vec3 sampleNormal = normalize(sampleNormalFst + sampleNormalSnd);
  vec3 Normal = normalize(TBN * sampleNormal);


  vec3 i = normalize(pos_world - cameraPosition);
  vec3 r = reflect(i, Normal);
  vec3 t = refract(i, Normal, n_air / n_water);

  float refractiveFactor = dot(-i, Normal);
  
  gl_FragColor = vec4(mix(texture(u_scene_reflect, r).rgb, texture(u_scene_refract, t).rgb, refractiveFactor), 1.0);
  gl_FragColor = mix(gl_FragColor,  vec4(0.0, 0.3, 0.7, 1.0), 0.2);
}