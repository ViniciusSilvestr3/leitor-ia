import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

function AiAnalysisModal({ selection, idiomaDestino, onClose }) {
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selection) return undefined

    let cancelled = false

    async function requestAnalysis() {
      setIsLoading(true)
      setError('')

      try {
        const data = await api.ai.explicar({
          termo: selection.termo,
          contexto: selection.contexto,
          livro_titulo: selection.livroTitulo,
          cfi: selection.cfi,
          idioma_destino: idiomaDestino,
        })

        if (!cancelled) {
          setAnalysis({ selection, idiomaDestino, result: data.explicacao })
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    requestAnalysis()

    return () => {
      cancelled = true
    }
  }, [selection, idiomaDestino])

  if (!selection) return null

  const result = analysis?.selection === selection && analysis.idiomaDestino === idiomaDestino
    ? analysis.result
    : null

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="analysis-modal" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Análise contextual</p>
            <h2 id="analysis-title">{selection.termo}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Fechar análise" onClick={onClose}>×</button>
        </div>

        {isLoading && <p className="reader-status">Analisando o contexto...</p>}
        {error && <p className="reader-error" role="alert">{error}</p>}
        {result && (
          <div className="analysis-result">
            <p className="analysis-translation">{result.traducao}</p>
            <p className="analysis-explanation">{result.explicacao}</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AiAnalysisModal