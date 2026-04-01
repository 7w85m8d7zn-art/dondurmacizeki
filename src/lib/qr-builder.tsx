import {
  pdf,
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import QRCode from "qrcode"

import type { QrBuilderState } from "@/types/qr-builder"

const pdfStyles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#ffffff",
  },
  card: {
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#57534e",
    marginBottom: 16,
    textAlign: "center",
  },
  qr: {
    width: 260,
    height: 260,
    marginBottom: 16,
  },
  url: {
    fontSize: 10,
    color: "#78716c",
    textAlign: "center",
  },
})

export async function generateQrDataUrl(
  url: string,
  foregroundColor: string,
  backgroundColor: string,
) {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 640,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  })
}

export function createQrCardSvg(state: QrBuilderState, qrDataUrl: string) {
  const logoMarkup = state.showLogo
    ? `<g>
        <circle cx="52" cy="52" r="28" fill="${state.accentColor}" opacity="0.15" />
        <text x="52" y="58" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" fill="${state.accentColor}" font-weight="700">DZ</text>
      </g>`
    : ""

  const iconMarkup = state.showIcon
    ? `<g transform="translate(252 34)">
        <circle cx="18" cy="18" r="18" fill="${state.accentColor}" opacity="0.18" />
        <path d="M18 8c4.6 0 8 3.2 8 7.7 0 4.3-3.2 7.3-8 7.3s-8-3-8-7.3C10 11.2 13.4 8 18 8zm0 2.7c-3 0-5.2 2-5.2 5 0 2.7 2 4.6 5.2 4.6s5.2-1.9 5.2-4.6c0-3-2.2-5-5.2-5z" fill="${state.accentColor}" />
      </g>`
    : ""

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1240" viewBox="0 0 900 1240">
      <rect width="900" height="1240" rx="${state.cornerRadius * 3}" fill="${state.backgroundColor}" />
      <rect x="${state.frameThickness * 2}" y="${state.frameThickness * 2}" width="${900 - state.frameThickness * 4}" height="${1240 - state.frameThickness * 4}" rx="${state.cornerRadius * 3}" fill="none" stroke="${state.accentColor}" stroke-width="${state.frameThickness * 2}" />
      ${logoMarkup}
      ${iconMarkup}
      <text x="450" y="180" text-anchor="middle" font-size="56" font-family="Arial, sans-serif" fill="${state.textColor}" font-weight="700">${escapeXml(state.title)}</text>
      <text x="450" y="238" text-anchor="middle" font-size="26" font-family="Arial, sans-serif" fill="${state.textColor}" opacity="0.72">${escapeXml(state.subtitle)}</text>
      <rect x="170" y="300" width="560" height="560" rx="${state.cornerRadius * 2}" fill="${state.qrBackgroundColor}" />
      <image href="${qrDataUrl}" x="210" y="340" width="480" height="480" />
      <text x="450" y="950" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" fill="${state.textColor}" opacity="0.56">${escapeXml(state.generatedUrl)}</text>
      <text x="450" y="1044" text-anchor="middle" font-size="30" font-family="Arial, sans-serif" fill="${state.accentColor}" font-weight="700">Dondurmaci Zeki</text>
    </svg>
  `.trim()
}

export async function downloadQrAsPng(svgMarkup: string, fileName: string) {
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImage(objectUrl)
    const canvas = document.createElement("canvas")
    canvas.width = 900
    canvas.height = 1240
    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("PNG export icin canvas olusturulamadi.")
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const pngUrl = canvas.toDataURL("image/png")
    triggerDownload(pngUrl, `${fileName}.png`)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function downloadQrAsPdf(
  state: QrBuilderState,
  qrDataUrl: string,
  fileName: string,
) {
  const document = (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View
          style={{
            ...pdfStyles.card,
            backgroundColor: state.backgroundColor,
            borderWidth: state.frameThickness,
            borderColor: state.accentColor,
            borderRadius: state.cornerRadius,
          }}
        >
          <Text style={{ ...pdfStyles.title, color: state.textColor }}>
            {state.title}
          </Text>
          <Text style={{ ...pdfStyles.subtitle, color: state.textColor }}>
            {state.subtitle}
          </Text>
          <PdfImage src={qrDataUrl} style={pdfStyles.qr} />
          <Text style={pdfStyles.url}>{state.generatedUrl}</Text>
        </View>
      </Page>
    </Document>
  )

  const blob = await pdf(document).toBlob()
  const blobUrl = URL.createObjectURL(blob)

  try {
    triggerDownload(blobUrl, `${fileName}.pdf`)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function triggerDownload(href: string, fileName: string) {
  const link = document.createElement("a")
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("QR onizleme gorseli yuklenemedi."))
    image.src = src
  })
}
