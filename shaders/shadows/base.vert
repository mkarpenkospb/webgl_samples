
uniform float scale;
uniform sampler2D height_map;

uniform float y_pos;
uniform vec3 min_point;
uniform float x_pos;
uniform float z_pos;


void main() {


    vec3 pos_world = (modelMatrix * vec4(position - min_point, 1.0)).xyz;

    vec2 st = (vec2(x_pos, -z_pos)  + 1000.0)/ 2000.0 ;
    vec4 height = texture2D(height_map, st);
    float brightness = height.r;

    vec3 new_pos = pos_world + vec3(0.0, 1.0, 0.0) * scale * brightness + vec3(x_pos, 0, z_pos);

    gl_Position = projectionMatrix * viewMatrix  * vec4(new_pos, 1.0);

}
