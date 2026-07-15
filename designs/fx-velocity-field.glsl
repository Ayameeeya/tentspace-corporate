precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Base Color
 * @color
 * @default #0A0A0A
 */
uniform vec3 u_base;

/**
 * @label Streak Color
 * @color
 * @default #CCFF00
 */
uniform vec3 u_streak;

/**
 * @label Speed
 * @range 0.2, 3.0
 * @default 1.0
 */
uniform float u_speed;

/**
 * @label Density
 * @range 4.0, 40.0
 * @default 18.0
 */
uniform float u_density;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  // Diagonal axis: streaks sweep from bottom-left to top-right
  float axis = uv.x * aspect * 0.7 - uv.y * 0.7;
  float lane = axis * u_density;
  float laneId = floor(lane);
  float lanePos = fract(lane);

  float rnd = hash(laneId);
  float flow = fract(uv.x * aspect * 0.35 + u_time * u_speed * (0.15 + rnd * 0.45) + rnd * 7.0);

  // Sharp head, long fading tail
  float streak = smoothstep(0.0, 0.08, flow) * (1.0 - smoothstep(0.08, 0.75, flow));

  // Thin lines within each lane
  float line = smoothstep(0.45, 0.5, lanePos) * (1.0 - smoothstep(0.52, 0.57, lanePos));

  // Only some lanes are lit
  float gate = step(0.55, hash(laneId * 3.7));

  float intensity = streak * line * gate;

  // Subtle ambient grid glow near bottom
  float floorGlow = (1.0 - uv.y) * 0.08;

  vec3 color = u_base + u_streak * intensity * 0.9 + u_streak * floorGlow * 0.25;
  gl_FragColor = vec4(color, 1.0);
}
