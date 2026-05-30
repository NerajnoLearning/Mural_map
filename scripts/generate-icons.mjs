import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, '../public/icons')

if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true })
}

// Font Awesome 5 Free — map-marker-alt (fas)
// viewBox: 0 0 384 512
const FA_MAP_MARKER_ALT =
  'M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z'

function buildSvg(size, bgColor = '#FF6B35', iconColor = '#FFFFFF') {
  const padding = Math.round(size * 0.18)
  const iconAreaW = size - padding * 2
  const iconAreaH = size - padding * 2

  // FA icon is 384 wide x 512 tall
  const scaleX = iconAreaW / 384
  const scaleY = iconAreaH / 512
  const scale = Math.min(scaleX, scaleY)

  const scaledW = 384 * scale
  const scaledH = 512 * scale
  const translateX = (size - scaledW) / 2
  const translateY = (size - scaledH) / 2

  const radius = Math.round(size * 0.2)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bgColor}"/>
  <g transform="translate(${translateX.toFixed(2)}, ${translateY.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path d="${FA_MAP_MARKER_ALT}" fill="${iconColor}"/>
  </g>
</svg>`
}

async function generateIcon(filename, size, bgColor = '#FF6B35') {
  const svg = buildSvg(size, bgColor)
  const outputPath = join(ICONS_DIR, filename)

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath)

  console.log(`✓ ${filename} (${size}×${size})`)
}

async function main() {
  console.log('Generating MuralMap PWA icons...\n')

  const mainSizes = [72, 96, 128, 144, 152, 192, 384, 512]
  for (const size of mainSizes) {
    await generateIcon(`icon-${size}x${size}.png`, size)
  }

  // Shortcut icons — distinct accent colors
  await generateIcon('icon-upload-96x96.png', 96, '#4A90D9') // blue — upload
  await generateIcon('icon-map-96x96.png', 96, '#27AE60')    // green — map
  await generateIcon('icon-discover-96x96.png', 96, '#FF6B35') // orange — discover

  console.log('\nAll icons generated to public/icons/')
}

main().catch((err) => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
