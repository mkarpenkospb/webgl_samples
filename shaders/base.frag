//#include <clipping_planes_pars_vertex>
//#include <clipping_planes_vertex>
#include <clipping_planes_pars_fragment>


in vec3 pos_world;
in vec3 out_normal;
in vec2 vUV;

uniform sampler2D u_color;

void main()
{
    #include <clipping_planes_fragment>
    gl_FragColor = vec4(texture2D(u_color, vUV).rgb, 1.0);
}