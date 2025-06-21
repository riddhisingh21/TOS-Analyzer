import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiTrash2, FiBarChart2, FiCheckCircle, FiPlus } from 'react-icons/fi';
import FileUploader from '../components/FileUpload/FileUploader';

function ComparePage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [activeUpload, setActiveUpload] = useState(true);

  const handleFileProcessed = (data) => {
    // Add the processed document to our list
    const newDocument = {
      id: Date.now(),
      name: data.fileName || `Document ${documents.length + 1}`,
      text: data.text,
      simplifiedText: data.simplifiedText,
      riskyClauses: data.riskyClauses
    };
    
    setDocuments([...documents, newDocument]);
    setActiveUpload(false);
  };

  const addAnotherDocument = () => {
    setActiveUpload(true);
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setComparisonResult(null);
  };

  const compareDocuments = () => {
    if (documents.length < 2) return;
    
    // For this example, we'll just compare the first two documents
    const doc1 = documents[0];
    const doc2 = documents[1];
    
    // Simple comparison - count risky clauses by type
    const riskComparison = {};
    
    // Process first document
    doc1.riskyClauses.forEach(clause => {
      if (!riskComparison[clause.type]) {
        riskComparison[clause.type] = { doc1: 0, doc2: 0 };
      }
      riskComparison[clause.type].doc1++;
    });
    
    // Process second document
    doc2.riskyClauses.forEach(clause => {
      if (!riskComparison[clause.type]) {
        riskComparison[clause.type] = { doc1: 0, doc2: 0 };
      }
      riskComparison[clause.type].doc2++;
    });
    
    // Calculate text similarity (very basic)
    const textSimilarity = calculateSimilarity(doc1.text, doc2.text);
    
    setComparisonResult({
      riskComparison,
      textSimilarity,
      doc1Name: doc1.name,
      doc2Name: doc2.name
    });
  };
  
  // Very basic text similarity calculation
  const calculateSimilarity = (text1, text2) => {
    // Count words in common
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    let commonWords = 0;
    words1.forEach(word => {
      if (words2.has(word)) commonWords++;
    });
    
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    return Math.round((commonWords / totalUniqueWords) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Compare Terms of Service
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-lg text-gray-600 dark:text-gray-300"
          >
            Upload multiple documents to compare their terms and identify differences
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <FiUpload className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Documents</h2>
                </div>
                
                {activeUpload ? (
                  <FileUploader
                    onFileProcessed={handleFileProcessed}
                    setIsLoading={setIsLoading}
                  />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addAnotherDocument}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Another Document
                  </motion.button>
                )}
                
                {isLoading && (
                  <div className="mt-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Processing document...</p>
                  </div>
                )}
                
                {documents.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Uploaded Documents</h3>
                    <ul className="space-y-3">
                      {documents.map(doc => (
                        <li 
                          key={doc.id} 
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                            {doc.name}
                          </span>
                          <button 
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiTrash2 />
                          </button>
                        </li>
                      ))}
                    </ul>
                    
                    {documents.length >= 2 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={compareDocuments}
                        className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                      >
                        <FiBarChart2 className="mr-2" />
                        Compare Documents
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            {comparisonResult ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comparison Results</h2>
                  
                  <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Text Similarity</h3>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            {comparisonResult.textSimilarity}% Similar
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div 
                          style={{ width: `${comparisonResult.textSimilarity}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This indicates how similar the overall text content is between documents.
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risky Clauses Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Risk Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {comparisonResult.doc1Name}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {comparisonResult.doc2Name}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Difference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(comparisonResult.riskComparison).map(([type, counts], index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {counts.doc1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {counts.doc2}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                counts.doc1 > counts.doc2 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : counts.doc1 < counts.doc2 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {counts.doc1 - counts.doc2}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interpretation</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {comparisonResult.textSimilarity > 75 
                        ? "These documents are very similar. The differences are likely minor variations or updates."
                        : comparisonResult.textSimilarity > 50
                          ? "These documents have significant similarities but also contain notable differences."
                          : "These documents are substantially different from each other."}
                    </p>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Pay special attention to risk categories with significant differences, as these may represent important changes in terms.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <FiBarChart2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Ready to Compare</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Upload at least two documents and click "Compare Documents" to see a detailed analysis of their similarities and differences.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default ComparePage;
