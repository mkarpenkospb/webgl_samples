in vec3 pos_world;
uniform vec3 u_color;

uniform sampler2D u_upper_tex;
uniform sampler2D u_lower_tex;
uniform sampler2D u_middle_tex;

varying float brightness;
varying vec2 vUV;

void main()
{
//  vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.24, 0.26, vAmount)) * texture2D( oceanTexture, vUV * 10.0 );
  vec4 lower = (smoothstep(0.24, 0.27, brightness) - smoothstep(0.28, 0.31, brightness)) * texture2D( u_lower_tex, vUV * 10.0 );
//  vec4 grass = (smoothstep(0.28, 0.32, vAmount) - smoothstep(0.35, 0.40, vAmount)) * texture2D( grassTexture, vUV * 20.0 );
  vec4 middle = (smoothstep(0.30, 0.50, brightness) - smoothstep(0.40, 0.70, brightness)) * texture2D( u_middle_tex, vUV * 20.0 );
  vec4 upper = (smoothstep(0.50, 0.65, brightness))                                   * texture2D( u_upper_tex, vUV * 10.0 );

  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + lower  + middle + upper; //, 1.0);

}