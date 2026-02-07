import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function DocumentPage() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocument()
  }, [id])

  const loadDocument = async () => {
    try {
      const response = await fetch(`http://localhost:8766/api/documents/${id}`)
      const data = await response.json()
      setDocument(data)
    } catch (error) {
      console.error('Error loading document:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto p-8">Loading...</div>

  if (!document) return <div className="container mx-auto p-8">Document not found</div>

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{document.title || document.filename}</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Type:</span> {document.document_type}
          </div>
          <div>
            <span className="font-semibold">Pages:</span> {document.page_count || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Filename:</span> {document.filename}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Document Text</h2>
        <div className="prose max-w-none whitespace-pre-wrap text-sm">
          {document.extracted_text || 'Text not yet extracted. Run processor to extract text from PDF.'}
        </div>
      </div>
    </div>
  )
}
