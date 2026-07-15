precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Background
 * @color
 * @default #EFEFEF
 */
uniform vec3 u_bg;

/**
 * @label Line Color
 * @color
 * @default #1A1A1A
 */
uniform vec3 u_line;

/**
 * @label Levels
 * @range 4.0, 24.0
 * @default 12.0
 */
uniform float u_levels;

/**
 * @label Speed
 * @range 0.0, 1.0
 * @default 0.15
 */
uniform float u_speed;

/**
 * @label Line Opacity
 * @range 0.0, 1.0
 * @default 0.18
 */
uniform float u_alpha;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash2(i), vec2(1.0));
  float b = dot(hash2(i + vec2(1.0, 0.0)), vec2(1.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), vec2(1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), vec2(1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.5;
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = p * 2.03 + vec2(11.3, 7.7);
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 2.2;

  float t = u_time * u_speed;
  // Slowly morphing height field (mouse-reactive in production)
  float h = fbm(p + vec2(t * 0.4, -t * 0.25) + fbm(p * 0.6 + t * 0.1));

  // Iso lines from the height field
  float band = fract(h * u_levels);
  float dist = abs(band - 0.5);
  float line = 1.0 - smoothstep(0.015, 0.06, dist);

  vec3 color = mix(u_bg, u_line, line * u_alpha);
  gl_FragColor = vec4(color, 1.0);
}
