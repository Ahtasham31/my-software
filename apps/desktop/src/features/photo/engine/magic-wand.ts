export function floodSelect(
  imageData: ImageData,
  startX: number,
  startY: number,
  tolerance: number
): Uint8Array {
  const { data, width, height } = imageData;
  const mask = new Uint8Array(width * height);
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return mask;

  const targetIdx = (startY * width + startX) * 4;
  const tr = data[targetIdx];
  const tg = data[targetIdx + 1];
  const tb = data[targetIdx + 2];
  const ta = data[targetIdx + 3];

  const maxDist = tolerance * tolerance * 4 * 4;
  const stack: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = idx * 4;
    const dr = data[p] - tr;
    const dg = data[p + 1] - tg;
    const db = data[p + 2] - tb;
    const da = data[p + 3] - ta;
    const dist = dr * dr + dg * dg + db * db + da * da;

    if (dist <= maxDist) {
      mask[idx] = 1;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }

  return mask;
}