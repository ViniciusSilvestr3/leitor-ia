import { useCallback, useRef, useState } from 'react'
import AiAnalysisModal from './AiAnalysisModal.jsx'
import EpubReader from './EpubReader.jsx'
import PdfReader from './PdfReader.jsx'

function ReaderScreen({ isDarkMode, idiomaDestino }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [selection, setSelection] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    setFileError('')
    setSelection(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isEpub = file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub')

    if (!isPdf && !isEpub) {
      setSelectedFile(null)
      setFileError('Selecione um arquivo EPUB ou PDF.')
      event.target.value = ''
      return
    }

    setSelectedFile({ file, type: isPdf ? 'pdf' : 'epub' })
  }

  const handleSelection = useCallback((text, context, metadata = {}) => {
    const termo = text.trim()
    if (!termo) return

    setSelection({
      termo,
      contexto: context.trim(),
      livroTitulo: metadata.bookTitle || selectedFile?.file.name || 'Livro desconhecido',
      cfi: metadata.cfi || '',
    })
  }, [selectedFile])

  return (
    <section className="reader-screen" aria-labelledby="reader-title">
      <div className="reader-toolbar">
        <div>
          <p className="eyebrow">Leitura local</p>
          <h1 id="reader-title">Abra um livro para começar</h1>
        </div>
        <label className="file-picker">
          <span>{selectedFile?.file.name || 'Escolher EPUB ou PDF'}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub,.pdf,application/epub+zip,application/pdf"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {fileError && <p className="reader-error" role="alert">{fileError}</p>}

      <div className="reader-viewport">
        {!selectedFile && (
          <div className="reader-empty-state">
            <strong>Nenhum arquivo aberto</strong>
            <span>O conteúdo será processado diretamente no navegador.</span>
          </div>
        )}

        {selectedFile?.type === 'pdf' && (
          <PdfReader
            key={`${selectedFile.file.name}-${selectedFile.file.lastModified}`}
            file={selectedFile.file}
            onTextSelected={handleSelection}
          />
        )}

        {selectedFile?.type === 'epub' && (
          <EpubReader
            key={`${selectedFile.file.name}-${selectedFile.file.lastModified}`}
            file={selectedFile.file}
            isDarkMode={isDarkMode}
            onTextSelected={handleSelection}
          />
        )}
      </div>

      <AiAnalysisModal
        selection={selection}
        idiomaDestino={idiomaDestino}
        onClose={() => setSelection(null)}
      />
    </section>
  )
}

export default ReaderScreen