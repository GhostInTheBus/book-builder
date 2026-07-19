import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Captures all [data-export-page] elements and stitches them into a
 * multi-page PDF mockup — one book page per PDF page.
 */
export async function exportBookMockup(templateName: string): Promise<void> {
  const pageEls = Array.from(
    document.querySelectorAll<HTMLElement>('[data-export-page]')
  )
  if (!pageEls.length) return

  const first = pageEls[0]
  const { width, height } = first.getBoundingClientRect()

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling'],
  })

  for (let i = 0; i < pageEls.length; i++) {
    const canvas = await html2canvas(pageEls[i], {
      scale: 3,
      useCORS: true,
      backgroundColor: '#f5f2ee',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    if (i > 0) pdf.addPage([width, height], width >= height ? 'landscape' : 'portrait')
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
  }

  const filename = `${templateName.replace(/\s+/g, '-').toLowerCase()}-mockup.pdf`
  pdf.save(filename)
}
