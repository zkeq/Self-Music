'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FluidCoverCanvasProps {
  imageUrl?: string;
  animated?: boolean;
  className?: string;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying vec2 v_uv;
  uniform sampler2D u_cover;
  uniform float u_time;
  uniform float u_aspect;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.82, 0.57, -0.57, 0.82);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 13.17;
      amplitude *= 0.5;
    }

    return value;
  }

  vec3 palette(float position) {
    return texture2D(u_cover, vec2(clamp(position, 0.01, 0.99), 0.5)).rgb;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 p = (uv - 0.5) * vec2(u_aspect, 1.0) * 1.55;
    float time = u_time * 0.064;

    vec2 firstWarp = vec2(
      fbm(p * 0.78 + vec2(time, -time * 0.72)),
      fbm(p * 0.74 + vec2(5.2 - time * 0.64, 1.3 + time))
    );

    vec2 secondWarp = vec2(
      fbm(p * 0.68 + 1.8 * firstWarp + vec2(1.7, 9.2) + time * 0.43),
      fbm(p * 0.64 + 1.7 * firstWarp + vec2(8.3, 2.8) - time * 0.38)
    );

    float broadField = fbm(p * 0.46 + firstWarp * 1.9 + vec2(time * 0.42, -time * 0.31));
    float detailField = fbm(p * 0.66 + secondWarp * 1.55 - vec2(time * 0.34, time * 0.25));
    float field = broadField * 0.82 + detailField * 0.18;
    float height = smoothstep(0.27, 0.73, field);
    float lightRibbon = smoothstep(0.43, 0.75, secondWarp.x) * 0.075;

    vec3 color = palette(height);
    color = mix(color, palette(clamp(height + lightRibbon, 0.02, 0.98)), 0.46);
    color = mix(color, palette(clamp(0.08 + secondWarp.y * 0.84, 0.02, 0.98)), 0.2);

    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luminance), color, 1.38);

    luminance = max(dot(color, vec3(0.2126, 0.7152, 0.0722)), 0.001);
    color *= max(1.0, 0.28 / luminance);

    float brightest = max(color.r, max(color.g, color.b));
    color *= min(1.0, 0.95 / max(brightest, 0.001));
    color = mix(color, vec3(0.075, 0.045, 0.085), 0.035);

    float edge = smoothstep(0.42, 0.92, length((uv - 0.5) * vec2(0.84, 1.0)));
    color *= 1.0 - edge * 0.07;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function colorDistance(a: RgbColor, b: RgbColor) {
  const red = a.r - b.r;
  const green = a.g - b.g;
  const blue = a.b - b.b;
  return red * red + green * green + blue * blue;
}

function luminance(color: RgbColor) {
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
}

function gradePaletteColor(color: RgbColor): RgbColor {
  const average = (color.r + color.g + color.b) / 3;
  const saturation = 1.28;
  let r = average + (color.r - average) * saturation;
  let g = average + (color.g - average) * saturation;
  let b = average + (color.b - average) * saturation;
  const light = luminance({ r, g, b });

  if (light < 58) {
    const scale = 58 / Math.max(light, 1);
    r *= scale;
    g *= scale;
    b *= scale;
  } else if (light > 238) {
    const scale = 238 / light;
    r *= scale;
    g *= scale;
    b *= scale;
  }

  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b)),
  };
}

function liftDarkPalette(palette: RgbColor[]) {
  const averageLight = palette.reduce((sum, color) => sum + luminance(color), 0) / palette.length;
  const exposure = Math.min(1.72, Math.max(1, 122 / Math.max(averageLight, 1)));

  return palette.map((color) => {
    let adjusted = {
      r: Math.min(255, color.r * exposure),
      g: Math.min(255, color.g * exposure),
      b: Math.min(255, color.b * exposure),
    };
    const adjustedLight = luminance(adjusted);

    if (adjustedLight < 72) {
      const shadowLift = 72 / Math.max(adjustedLight, 1);
      adjusted = {
        r: Math.min(255, adjusted.r * shadowLift),
        g: Math.min(255, adjusted.g * shadowLift),
        b: Math.min(255, adjusted.b * shadowLift),
      };
    }

    return adjusted;
  });
}

function createFluidPalette(image: HTMLImageElement) {
  const surface = document.createElement('canvas');
  const size = 64;
  surface.width = size;
  surface.height = size;

  const context = surface.getContext('2d');
  if (!context) return new Uint8Array([62, 42, 72, 255]);

  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;

  context.drawImage(
    image,
    (size - width) / 2,
    (size - height) / 2,
    width,
    height,
  );

  const pixels: RgbColor[] = [];
  const data = context.getImageData(0, 0, size, size).data;
  for (let index = 0; index < data.length; index += 16) {
    if (data[index + 3] < 180) continue;
    pixels.push({ r: data[index], g: data[index + 1], b: data[index + 2] });
  }

  if (!pixels.length) return new Uint8Array([62, 42, 72, 255]);

  const clusterCount = Math.min(18, pixels.length);
  const centroids: RgbColor[] = [pixels[Math.floor(pixels.length / 2)]];

  while (centroids.length < clusterCount) {
    let candidate = pixels[0];
    let furthestDistance = -1;

    for (const pixel of pixels) {
      const nearestDistance = Math.min(...centroids.map((color) => colorDistance(pixel, color)));
      if (nearestDistance > furthestDistance) {
        candidate = pixel;
        furthestDistance = nearestDistance;
      }
    }

    centroids.push(candidate);
  }

  const weights = new Array(clusterCount).fill(0) as number[];
  for (let iteration = 0; iteration < 6; iteration += 1) {
    const sums = Array.from({ length: clusterCount }, () => ({ r: 0, g: 0, b: 0, count: 0 }));

    for (const pixel of pixels) {
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < centroids.length; index += 1) {
        const distance = colorDistance(pixel, centroids[index]);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      }

      sums[nearest].r += pixel.r;
      sums[nearest].g += pixel.g;
      sums[nearest].b += pixel.b;
      sums[nearest].count += 1;
    }

    for (let index = 0; index < clusterCount; index += 1) {
      const cluster = sums[index];
      if (!cluster.count) continue;
      centroids[index] = {
        r: cluster.r / cluster.count,
        g: cluster.g / cluster.count,
        b: cluster.b / cluster.count,
      };
      weights[index] = cluster.count;
    }
  }

  const orderedPalette = centroids
    .map((color, index) => ({ color: gradePaletteColor(color), weight: weights[index] }))
    .filter(({ weight }) => weight > 2)
    .sort((a, b) => luminance(a.color) - luminance(b.color))
    .map(({ color }) => color);

  const basePalette = orderedPalette.length >= 2
    ? orderedPalette
    : [gradePaletteColor(pixels[0]), gradePaletteColor(pixels[pixels.length - 1])];
  const palette = liftDarkPalette(basePalette);
  const textureWidth = 256;
  const textureData = new Uint8Array(textureWidth * 4);

  for (let index = 0; index < textureWidth; index += 1) {
    const position = (index / (textureWidth - 1)) * (palette.length - 1);
    const leftIndex = Math.floor(position);
    const rightIndex = Math.min(palette.length - 1, leftIndex + 1);
    const mix = position - leftIndex;
    const left = palette[leftIndex];
    const right = palette[rightIndex];

    textureData[index * 4] = Math.round(left.r + (right.r - left.r) * mix);
    textureData[index * 4 + 1] = Math.round(left.g + (right.g - left.g) * mix);
    textureData[index * 4 + 2] = Math.round(left.b + (right.b - left.b) * mix);
    textureData[index * 4 + 3] = 255;
  }

  return textureData;
}

export function FluidCoverCanvas({ imageUrl, animated = true, className }: FluidCoverCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) {
      setReady(false);
      return;
    }

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      setReady(false);
      return;
    }

    let animationFrame = 0;
    let disposed = false;
    let lastRenderedAt = 0;
    let startedAt = performance.now();

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Unable to link ambient fluid shader:', gl.getProgramInfoLog(program));
      setReady(false);
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const aspectLocation = gl.getUniformLocation(program, 'u_aspect');
    const textureLocation = gl.getUniformLocation(program, 'u_cover');
    gl.uniform1i(textureLocation, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([62, 42, 72, 255]),
    );

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform1f(aspectLocation, width / height);
    };

    const draw = (now: number) => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(draw);

      if (now - lastRenderedAt < 33) return;
      lastRenderedAt = now;
      resize();
      gl.uniform1f(timeLocation, animated ? (now - startedAt) / 1000 : 18);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      if (disposed) return;
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          256,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          createFluidPalette(image),
        );
        startedAt = performance.now();
        setReady(true);
        draw(startedAt);
      } catch (error) {
        console.warn('Unable to upload cover texture for ambient background:', error);
        setReady(false);
      }
    };
    image.onerror = () => setReady(false);
    image.src = imageUrl;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [imageUrl, animated]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('ambient-fluid-canvas', ready && 'ambient-fluid-canvas--ready', className)}
    />
  );
}
