import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiFileText, FiEye, FiCopy } from 'react-icons/fi';
// Import the real Gemini service
import { simplifyLegalText, identifyRiskyClauses, summarizeLegalDocument } from '../../services/geminiService';

function TextDisplay({ originalText, simplifiedText, riskyClauses, isPDFBinary }) {
  const [activeTab, setActiveTab] = useState('simplified');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const copyToClipboard = (text) => {
    if (!text) return;
    
    // Create a temporary textarea element to copy from
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        // You could add a toast notification here
        alert('Text copied to clipboard!');
      } else {
        console.error('Failed to copy text');
      }
    } catch (err) {
      console.error('Error copying text: ', err);
    }
    
    document.body.removeChild(textarea);
  };
  
  const handleManualTextSubmit = () => {
    if (!manualText.trim()) return;
    
    // Process the manually entered text with the real Gemini service
    Promise.all([
      simplifyLegalText(manualText),
      identifyRiskyClauses(manualText),
      summarizeLegalDocument(manualText)
    ]).then(([simplifiedResult, riskyResult, summaryResult]) => {
      // Update the document with manually entered text
      const updatedDocument = {
        fileName: "Manual Entry",
        originalText: manualText,
        simplifiedText: simplifiedResult,
        riskyClauses: riskyResult,
        summary: summaryResult
      };
      
      // Store in localStorage
      localStorage.setItem('analyzedDocument', JSON.stringify(updatedDocument));
      
      // Refresh the page to show the new results
      window.location.reload();
    }).catch(error => {
      console.error('Error processing manual text:', error);
      alert('Failed to process the text. Please try again.');
    });
  };
  
  // If no text is provided, show a message
  if (!originalText && !simplifiedText) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <p className="text-gray-600 dark:text-gray-300">No document has been uploaded yet.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('simplified')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base ${
              activeTab === 'simplified'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiEye className="inline mr-2" />
            Simplified Version
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base ${
              activeTab === 'original'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiFileText className="inline mr-2" />
            Original Text
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base ${
              activeTab === 'risks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiAlertTriangle className="inline mr-2" />
            Risky Clauses
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'simplified' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <button
              onClick={() => copyToClipboard(simplifiedText)}
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Copy to clipboard"
            >
              <FiCopy className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Simplified Terms</h3>
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
              {simplifiedText ? (
                <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 p-0 m-0 bg-transparent border-0">
                  {simplifiedText}
                </pre>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No simplified text available.</p>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'original' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <button
              onClick={() => copyToClipboard(originalText)}
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Copy to clipboard"
            >
              <FiCopy className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Original Text</h3>
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
              {originalText && !originalText.startsWith('%PDF') ? (
                <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 p-0 m-0 bg-transparent border-0">
                  {originalText}
                </pre>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-400">
                    <FiAlertTriangle className="inline mr-2" />
                    Unable to display readable text from this PDF. The file may be scanned, encrypted, or in an unsupported format.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => setShowManualInput(!showManualInput)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {showManualInput ? 'Hide Manual Input' : 'Enter Text Manually'}
                    </button>
                    
                    {showManualInput && (
                      <div className="mt-4">
                        <textarea
                          value={manualText}
                          onChange={(e) => setManualText(e.target.value)}
                          placeholder="Paste or type the document text here..."
                          className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                        <button
                          onClick={handleManualTextSubmit}
                          className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                        >
                          Process Text
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'risks' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Risky Clauses</h3>
            
            {!riskyClauses || riskyClauses.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No risky clauses detected.</p>
            ) : (
              <div className="space-y-6">
                {riskyClauses.map((clause, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      clause.riskLevel === 'High' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      clause.riskLevel === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-1 rounded-full mr-3 mt-1 ${
                        clause.riskLevel === 'High' ? 'bg-red-100 dark:bg-red-800' :
                        clause.riskLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-800' :
                        'bg-blue-100 dark:bg-blue-800'
                      }`}>
                        <FiAlertTriangle className={`h-4 w-4 ${
                          clause.riskLevel === 'High' ? 'text-red-600 dark:text-red-300' :
                          clause.riskLevel === 'Medium' ? 'text-yellow-600 dark:text-yellow-300' :
                          'text-blue-600 dark:text-blue-300'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-gray-900 dark:text-white ${
                          clause.riskLevel === 'High' ? 'text-red-700 dark:text-red-300' :
                          clause.riskLevel === 'Medium' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-blue-700 dark:text-blue-300'
                        }`}>
                          {clause.type || clause.category || 'Risk Detected'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{clause.explanation}</p>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">
                          {clause.clause || clause.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TextDisplay;







