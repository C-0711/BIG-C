import { useState } from 'react';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DocumentEvidence = ({ documents, person1, person2, onClose, onDocumentClick }) => {
  const [expandedDoc, setExpandedDoc] = useState(null);

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
        <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400">No documents found</p>
      </div>
    );
  }

  const getDocumentTypeColor = (docType) => {
    const types = {
      'Flight Log': 'bg-[#374151]/30 text-gray-400 border-[#4B5563]',
      'Deposition': 'bg-purple-900/30 text-purple-400 border-purple-700',
      'Court Filing': 'bg-amber-900/30 text-amber-400 border-amber-700',
      'FBI Report': 'bg-red-900/30 text-red-400 border-red-700',
      'Contact List': 'bg-green-900/30 text-green-400 border-green-700',
      'Email': 'bg-cyan-900/30 text-cyan-400 border-cyan-700',
      'Legal Document': 'bg-gray-900/30 text-gray-400 border-gray-700'
    };

    for (const [key, value] of Object.entries(types)) {
      if (docType && docType.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'bg-gray-900/30 text-gray-400 border-gray-700';
  };

  const handleDocumentClick = (doc) => {
    if (onDocumentClick) {
      onDocumentClick(doc);
    } else {
      // Open in new tab
      window.open(`/document/${doc.id}`, '_blank');
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Documentary Evidence</h3>
          {person1 && person2 ? (
            <p className="text-sm text-gray-400 mt-1">
              Documents mentioning both <span className="text-gray-400">{person1}</span> and{' '}
              <span className="text-gray-400">{person2}</span>
            </p>
          ) : person1 ? (
            <p className="text-sm text-gray-400 mt-1">
              Documents mentioning <span className="text-gray-400">{person1}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">{documents.length} documents</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Document List */}
      <div className="max-h-[600px] overflow-y-auto space-y-3 p-2">
        {documents.map((doc, idx) => {
          // Generate document purpose based on type
          const getDocumentPurpose = () => {
            const purposes = {
              'fbi_report': 'FBI investigation into Jeffrey Epstein case - official federal law enforcement findings',
              'deposition': 'Sworn witness testimony taken under oath as part of legal proceedings',
              'lawsuit': 'Legal complaint filed in court alleging wrongdoing or seeking damages',
              'flight_log': 'Passenger manifest from Epstein\'s private jet showing who traveled when',
              'court_filing': 'Official legal document filed with court as part of case proceedings',
              'volume_document': 'Collection document containing evidence, exhibits, or case materials',
              'contact_list': 'Address book or contact list showing personal/business relationships',
              'email': 'Email correspondence between parties involved in the case',
              'affidavit': 'Sworn written statement made under oath for legal proceedings',
              'transcript': 'Written record of spoken testimony or legal proceedings',
              'exhibit': 'Physical or documentary evidence submitted as part of legal case'
            };

            const docType = (doc.document_type || '').toLowerCase();
            for (const [key, purpose] of Object.entries(purposes)) {
              if (docType.includes(key)) {
                return purpose;
              }
            }

            return 'Legal document from Epstein case proceedings';
          };

          const purpose = getDocumentPurpose();

          return (
            <div
              key={doc.id || idx}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors border border-gray-600"
            >
              {/* Document Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Filename - small gray mono */}
                  <div className="text-xs text-gray-500 mb-3 font-mono truncate" title={doc.filename || doc.title}>
                    {doc.filename || doc.title || 'Untitled Document'}
                  </div>

                  {/* Tags/Badges - horizontal layout */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Document type badge */}
                    {doc.document_type && (
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getDocumentTypeColor(
                          doc.document_type
                        )}`}
                      >
                        {doc.document_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    )}

                    {/* Page count tag */}
                    {doc.page_count && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-600">
                        {doc.page_count} page{doc.page_count !== 1 ? 's' : ''}
                      </span>
                    )}

                    {/* Mention count tags */}
                    {doc.person1_mentions !== undefined && person1 && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700">
                        {person1} mentioned {doc.person1_mentions}x
                      </span>
                    )}

                    {doc.person2_mentions !== undefined && person2 && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700">
                        {person2} mentioned {doc.person2_mentions}x
                      </span>
                    )}
                  </div>

                  {/* Document Purpose - single line, prominent */}
                  <div className="text-sm text-gray-200 leading-relaxed mb-2">
                    {purpose}
                  </div>

                  {/* Document ID - tiny */}
                  <div className="text-xs text-gray-600">
                    Document ID: {doc.id}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleDocumentClick(doc)}
                  className="ml-4 px-4 py-2 bg-[#374151] hover:bg-[#374151] rounded font-medium text-sm transition-colors flex items-center space-x-2 flex-shrink-0"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Open</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Context Snippets (if available) */}
              {doc.person1_contexts && doc.person1_contexts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                    className="text-sm text-gray-400 hover:text-gray-400 font-medium"
                  >
                    {expandedDoc === doc.id ? '▼' : '▶'} Show Context Snippets ({doc.person1_contexts.length + (doc.person2_contexts?.length || 0)} total)
                  </button>

                  {expandedDoc === doc.id && (
                    <div className="space-y-3 mt-2 pl-4 border-l-2 border-gray-600">
                      {person1 && doc.person1_contexts && (
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-1">
                            Mentions of {person1}:
                          </div>
                          {doc.person1_contexts.slice(0, 3).map((context, i) => (
                            <div key={i} className="bg-gray-900 rounded p-2 mb-2">
                              <div className="text-sm text-gray-300 leading-relaxed">
                                {context.context || context.mention_text}
                              </div>
                              {context.position && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Position: {context.position}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {person2 && doc.person2_contexts && (
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-1">
                            Mentions of {person2}:
                          </div>
                          {doc.person2_contexts.slice(0, 3).map((context, i) => (
                            <div key={i} className="bg-gray-900 rounded p-2 mb-2">
                              <div className="text-sm text-gray-300 leading-relaxed">
                                {context.context || context.mention_text}
                              </div>
                              {context.position && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Position: {context.position}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-700 px-4 py-3 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
          {person1 && person2 && (
            <span className="text-gray-400">
              Evidence of connection between {person1} and {person2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentEvidence;
