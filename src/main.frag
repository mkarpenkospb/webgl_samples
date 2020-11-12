in vec3 pos_world;
in vec3 vert_color;
uniform vec3 u_color;

uniform vec2 c;
uniform float r;
uniform int iterations;
uniform float width;
uniform float height;
uniform float scaleScreen;
uniform vec2 screenCenter;

varying vec3 vColor;

void main() {
    vec2 f_coord = vec2((gl_FragCoord.x / (width / 1.0)) * (2.0 * r) - r, (gl_FragCoord.y / (height / 1.0)) * (2.0 * r) - r);
    f_coord -= vec2(0.3, 0.3);
    f_coord *= 2.0;
    float tmp = 0.0;
    int step = 0;

    for (; step < iterations; ++step) {
        if (length(f_coord) > r ) {
            break;
        }
        f_coord = vec2(f_coord.x * f_coord.x - f_coord.y * f_coord.y, 2.0 * f_coord.x * f_coord.y) + c;
    }

    gl_FragColor = vec4(1.0 - 10.0 * ( float(step) / float(iterations)),
    1.0 - 100.0 * ( float(step) / float(iterations)),  1.0 - 10.0 * (float(step) / float(iterations)), 1.0);
}