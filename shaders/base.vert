#include <clipping_planes_pars_vertex>

out vec3 pos_world;
out vec3 out_normal;
out vec2 vUV;
out vec3 shadowTexPos;

uniform float scale;
uniform sampler2D height_map;

uniform mat4 shadowProjView;

uniform float y_pos;
uniform vec3 min_point;
uniform float x_pos;
uniform float z_pos;
uniform int shadowRender;


void main() {
    #include <begin_vertex>

    if (shadowRender == 0) {
        vec4 tmp = shadowProjView * vec4(position, 1);
        shadowTexPos = ((tmp.xyz / tmp.w) * vec3(0.5)) + vec3(0.5);
    }


    out_normal = normalize(normalMatrix * normal);
    pos_world = (modelMatrix * vec4(position - min_point, 1.0)).xyz;

    vec2 st = (vec2(x_pos, -z_pos)  + 1000.0)/ 2000.0 ;
    vec4 height = texture2D(height_map, st);
    float brightness = height.r;

    vec3 new_pos = pos_world + vec3(0.0, 1.0, 0.0) * scale * brightness + vec3(x_pos, 0, z_pos);

//    gl_Position = projectionMatrix * viewMatrix  * vec4(new_pos, 1.0);
    vUV = uv;

    #include <project_vertex>
    mvPosition = viewMatrix  * vec4(new_pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <clipping_planes_vertex>
}
