in vec3 pos_world;
in vec3 out_normal;

uniform vec3 u_color;
uniform samplerCube skybox;

// reflection controllers
uniform float n_from;
uniform float n_to;
uniform float a;
uniform vec3 cameraPos;

void main()
{
    //    vec3 vec_x = dFdx(pos_world);
    //    vec3 vec_y = dFdy(pos_world);
    //  vec3 normal = normalize(cross(vec_x, vec_y));
    vec3 i = normalize(pos_world - cameraPos);
    vec3 r = reflect(i, out_normal);// отражение
//    float dot_val = 0.1 + 0.9 * clamp(dot(out_normal, vec3(0, 1, 0)), 0.0, 1.0);

    gl_FragColor = vec4(texture(skybox, r).rgb, 1);
}