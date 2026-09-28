import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

function PdfReader({ file, onTextSelected }) {
  const containerRef = useRef(null)
  const pdfRef = useRef(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const fileReader = new FileReader()

    fileReader.onload = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: fileReader.result }).promise
        if (cancelled) return
        pdfRef.current = pdf
        setPageCount(pdf.numPages)
        setPageNumber(1)
      } catch {
        if (!cancelled) setError('Não foi possível abrir este PDF.')
      }
    }

    fileReader.onerror = () => {
      if (!cancelled) setError('Não foi possível ler este arquivo PDF.')
    }
    fileReader.readAsArrayBuffer(file)

    return () => {
      cancelled = true
      fileReader.abort()
      pdfRef.current?.destroy()
      pdfRef.current = null
    }
  }, [file])

  useEffect(() => {
    let cancelled = false

    async function renderPage() {
      const pdf = pdfRef.current
      const container = containerRef.current
      if (!pdf || !container) return

      setIsRendering(true)
      setError('')
      container.replaceChildren()

      try {
        const page = await pdf.getPage(pageNumber)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const scale = Math.min(Math.max((container.clientWidth - 32) / baseViewport.width, 0.5), 1.5)
        const viewport = page.getViewport({ scale })
        const pageElement = document.createElement('div')
        pageElement.className = 'pdf-page'
        pageElement.style.width = `${viewport.width}px`
        pageElement.style.height = `${viewport.height}px`
        pageElement.style.setProperty('--scale-factor', scale)
        pageElement.style.setProperty('--total-scale-factor', scale)

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        pageElement.appendChild(canvas)

        const textLayerElement = document.createElement('div')
        textLayerElement.className = 'pdf-text-layer'
        textLayerElement.style.setProperty('--scale-factor', scale)
        textLayerElement.style.setProperty('--total-scale-factor', scale)
        pageElement.appendChild(textLayerElement)
        container.appendChild(pageElement)

        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        const textContent = await page.getTextContent()
        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerElement,
          viewport,
        })
        await textLayer.render()

        textLayerElement.addEventListener('mouseup', () => {
          window.setTimeout(() => {
            const selectedText = window.getSelection()?.toString().trim()
            if (!selectedText) return
            const context = textContent.items.map((item) => item.str).join(' ')
            onTextSelected(selectedText, context, { bookTitle: file.name })
          }, 0)
        })
      } catch {
        if (!cancelled) setError('Não foi possível renderizar esta página.')
      } finally {
        if (!cancelled) setIsRendering(false)
      }
    }

    renderPage()
    return () => {
      cancelled = true
    }
  }, [file, onTextSelected, pageNumber])

  function changePage(offset) {
    setPageNumber((currentPage) => Math.min(Math.max(currentPage + offset, 1), pageCount))
  }

  return (
    <div className="pdf-reader">
      <div ref={containerRef} className="pdf-canvas-container" />
      {isRendering && <p className="reader-status">Renderizando página...</p>}
      {error && <p className="reader-error" role="alert">{error}</p>}
      {pageCount > 0 && (
        <div className="reader-pagination">
          <button type="button" disabled={pageNumber === 1 || isRendering} onClick={() => changePage(-1)}>
            Página anterior
          </button>
          <span>Página {pageNumber} de {pageCount}</span>
          <button type="button" disabled={pageNumber === pageCount || isRendering} onClick={() => changePage(1)}>
            Próxima página
          </button>
        </div>
      )}
    </div>
  )
}

export default PdfReader