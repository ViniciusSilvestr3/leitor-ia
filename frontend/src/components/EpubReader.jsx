import { useEffect, useRef, useState } from 'react'
import ePub from 'epubjs'

function EpubReader({ file, isDarkMode, onTextSelected }) {
  const viewerRef = useRef(null)
  const renditionRef = useRef(null)
  const [error, setError] = useState('')
  const [bookTitle, setBookTitle] = useState('')

  useEffect(() => {
    let cancelled = false
    let book
    let selectionTimeout

    async function renderBook() {
      try {
        const bookBuffer = await file.arrayBuffer()
        if (cancelled || !viewerRef.current) return

        book = ePub(bookBuffer)
        const rendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
        })
        renditionRef.current = rendition

        rendition.themes.register('light', { body: { background: '#ffffff', color: '#333333' } })
        rendition.themes.register('dark', {
          body: { background: '#1e1e1e', color: '#e0e0e0' },
          a: { color: '#66b3ff' },
        })
        rendition.themes.select(isDarkMode ? 'dark' : 'light')

        book.ready.then(() => {
          if (!cancelled) setBookTitle(book.package.metadata.title || file.name)
        })

        rendition.on('selected', (cfiRange, contents) => {
          clearTimeout(selectionTimeout)
          selectionTimeout = setTimeout(async () => {
            try {
              const range = await book.getRange(cfiRange)
              const selectedText = range.toString().trim()
              if (!selectedText) return

              const selectionObject = contents.window.getSelection()
              const contextNode = selectionObject?.anchorNode
              const context = contextNode?.parentElement?.textContent?.trim() || selectedText
              selectionObject?.removeAllRanges()
              onTextSelected(selectedText, context, {
                bookTitle: book.package.metadata.title || file.name,
                cfi: cfiRange,
              })
            } catch {
              if (!cancelled) setError('Não foi possível capturar este trecho.')
            }
          }, 250)
        })

        await rendition.display()
      } catch {
        if (!cancelled) setError('Não foi possível abrir este EPUB.')
      }
    }

    if (viewerRef.current) viewerRef.current.replaceChildren()
    renderBook()

    return () => {
      cancelled = true
      clearTimeout(selectionTimeout)
      renditionRef.current?.destroy()
      renditionRef.current = null
      book?.destroy()
    }
  }, [file, isDarkMode, onTextSelected])

  return (
    <div className="epub-reader">
      <div ref={viewerRef} className="epub-viewer" />
      {bookTitle && <p className="reader-status">{bookTitle}</p>}
      {error && <p className="reader-error" role="alert">{error}</p>}
    </div>
  )
}

export default EpubReader