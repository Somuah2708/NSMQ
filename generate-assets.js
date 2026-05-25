/**
 * Asset generator — Achimota NSMQ App
 * node generate-assets.js
 */
const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const OUT = path.join(__dirname, 'assets')
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT)

const CREST_SVG = fs.readFileSync(path.join(OUT, 'achimota_crest.svg'))

async function main() {
  // Render the real crest to a high-res PNG and trim white borders
  const crestRaw = await sharp(CREST_SVG, { density: 300 })
    .resize(1200, 1200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 255 } })
    .png()
    .toBuffer()

  const crestTrimmed = await sharp(crestRaw)
    .trim({ background: '#ffffff', threshold: 10 })
    .png()
    .toBuffer()

  const crestMeta = await sharp(crestTrimmed).metadata()
  const crestB64  = crestTrimmed.toString('base64')

  // ── APP ICON  1024×1024 ──────────────────────────────────────────────────
  {
    const SZ = 1024
    // Crest takes up most of the icon; leave room at the bottom for the text
    const cW = Math.round(SZ * 0.82)
    const cH = Math.round(cW * crestMeta.height / crestMeta.width)
    const cX = Math.round((SZ - cW) / 2)
    const cY = Math.round(SZ * 0.03)

    const textSz  = Math.round(SZ * 0.058)
    const textY   = cY + cH + Math.round(SZ * 0.018) + Math.round(textSz * 0.5)

    const svg = `<svg width="${SZ}" height="${SZ}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SZ}" height="${SZ}" fill="white"/>
  <image x="${cX}" y="${cY}" width="${cW}" height="${cH}"
    href="data:image/png;base64,${crestB64}"/>
  <text x="${SZ / 2}" y="${textY}" text-anchor="middle" dominant-baseline="middle"
    font-size="${textSz}" font-weight="700"
    font-family="Arial,Helvetica,sans-serif"
    fill="#0b2033">Achimota NSMQ App</text>
</svg>`

    await sharp(Buffer.from(svg), { density: 150 })
      .resize(SZ, SZ)
      .png()
      .toFile(path.join(OUT, 'icon.png'))
    console.log('✓  icon.png')
  }

  // ── SPLASH SCREEN  1284×2778 ──────────────────────────────────────────────
  {
    const W = 1284, H = 2778

    const cW  = Math.round(W * 0.88)
    const cH  = Math.round(cW * crestMeta.height / crestMeta.width)
    const cX  = Math.round((W - cW) / 2)

    const nameSz = Math.round(W * 0.080)
    const appSz  = Math.round(W * 0.066)

    // Total content block height
    const blockH = cH + Math.round(H * 0.014) + nameSz + Math.round(H * 0.009) + appSz
    // Centre exactly
    const cY = Math.round((H - blockH) / 2)

    let y = cY + cH + Math.round(H * 0.014)
    const nameY = y + nameSz / 2
    y += nameSz + Math.round(H * 0.009)
    const appY = y + appSz / 2

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <image x="${cX}" y="${cY}" width="${cW}" height="${cH}"
    href="data:image/png;base64,${crestB64}"/>
  <text x="${W / 2}" y="${nameY}" text-anchor="middle" dominant-baseline="middle"
    font-size="${nameSz}" font-weight="900"
    font-family="'Arial Black',Arial,Helvetica,sans-serif"
    fill="#0b2033">ACHIMOTA</text>
  <text x="${W / 2}" y="${appY}" text-anchor="middle" dominant-baseline="middle"
    font-size="${appSz}" font-weight="700"
    font-family="Arial,Helvetica,sans-serif"
    fill="#b87f00">NSMQ App</text>
</svg>`

    await sharp(Buffer.from(svg), { density: 150 })
      .resize(W, H)
      .png()
      .toFile(path.join(OUT, 'splash.png'))
    console.log('✓  splash.png')
  }

  // ── ADAPTIVE ICON  1024×1024 ─────────────────────────────────────────────
  {
    const SZ = 1024
    const cW  = Math.round(SZ * 0.82)
    const cH  = Math.round(cW * crestMeta.height / crestMeta.width)
    const cX  = Math.round((SZ - cW) / 2)
    const cY  = Math.round((SZ - cH) / 2)

    const svg = `<svg width="${SZ}" height="${SZ}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SZ}" height="${SZ}" fill="white"/>
  <image x="${cX}" y="${cY}" width="${cW}" height="${cH}"
    href="data:image/png;base64,${crestB64}"/>
</svg>`

    await sharp(Buffer.from(svg), { density: 150 })
      .resize(SZ, SZ)
      .png()
      .toFile(path.join(OUT, 'adaptive-icon.png'))
    console.log('✓  adaptive-icon.png')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
