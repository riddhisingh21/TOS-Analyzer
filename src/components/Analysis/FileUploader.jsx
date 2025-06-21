import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiAlertCircle, FiKey } from 'react-icons/fi';
import { extractTextFromPDF } from '../../services/pdfService';
import { 
  simplifyLegalText, 
  identifyRiskyClauses, 
  summarizeLegalDocument, 
  testGeminiAPI,
  resetMockDataFlag,
  setApiKey
} from '../../services/geminiService';
import ApiKeySetup from './ApiKeySetup';
import ApiKeyInput from './ApiKeyInput';

function FileUploader({ onFileProcessed, setIsLoading, navigate }) {
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Check for stored API key on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (!storedApiKey) {
      setShowApiKeyInput(true);
    }
  }, []);
  
  // Handle API key submission
  const handleApiKeySubmit = (apiKey) => {
    // Store API key in localStorage
    localStorage.setItem('geminiApiKey', apiKey);
    // Update the API key in the service
    setApiKey(apiKey);
    // Hide the API key input
    setShowApiKeyInput(false);
    // Reset any errors
    setError(null);
  };
  
  // Handle file processing
  const processFile = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Processing file:', file.name);
      console.log('File type:', file.type);
      
      let extractedText = '';
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log('Processing PDF file...');
        extractedText = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        console.log('Processing text file...');
        // Use FileReader instead of file.text()
        extractedText = await readFileAsText(file);
      } else {
        // Try to read as text anyway
        console.log('Unknown file type, attempting to read as text...');
        try {
          extractedText = await readFileAsText(file);
        } catch (readError) {
          throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF or text file.`);
        }
      }
      
      if (!extractedText || extractedText.trim() === '') {
        throw new Error('Could not extract text from the file. The file may be empty or corrupted.');
      }
      
      console.log('Text extracted successfully, length:', extractedText.length);
      
      // Truncate text if it's too long
      const maxLength = 100000; // Adjust based on Gemini's limits
      const truncatedText = extractedText.length > maxLength 
        ? extractedText.substring(0, maxLength) + '... (text truncated due to length)'
        : extractedText;
      
      console.log('Processing document with Gemini API...');
      
      try {
        // Process with real Gemini service (not mock)
        const [simplifiedTextResult, riskyClausesResult, summaryResult] = await Promise.all([
          simplifyLegalText(truncatedText),
          identifyRiskyClauses(truncatedText),
          summarizeLegalDocument(truncatedText)
        ]);
        
        console.log('Document processed successfully');
        
        // Create document object
        const document = {
          fileName: file.name,
          originalText: extractedText,
          simplifiedText: simplifiedTextResult,
          riskyClauses: riskyClausesResult,
          summary: summaryResult
        };
        
        // Pass the processed document to the parent component
        onFileProcessed(document);
        
        // Navigate to the results page
        if (navigate) {
          navigate('/results');
        }
      } catch (apiError) {
        console.error('API processing error:', apiError);
        setError(`API processing failed: ${apiError.message}. Please check your API key and try again.`);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setError(`Error processing file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: useCallback((acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log('File dropped:', file.name, file.type);
        processFile(file);
      }
    }, []),
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      // Add more MIME types if needed
    },
    maxFiles: 1,
    multiple: false
  });
  
  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      // Check if file is a valid Blob
      if (!(file instanceof Blob)) {
        console.error('Invalid file object:', file);
        reject(new Error('Invalid file object. Expected a Blob or File.'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Error reading file: ' + (error.message || 'Unknown error')));
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showApiKeySetup ? (
        <ApiKeySetup onClose={() => setShowApiKeySetup(false)} />
      ) : (
        <>
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-1">
                {isDragActive ? 'Drop the file here' : 'Upload Terms of Service'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop a PDF or text file, or click to browse
              </p>
            </motion.div>
          </div>
          
          {/* API key input */}
          {showApiKeyInput && (
            <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
          )}
          
          {/* Display any errors */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Display any warnings */}
          {warning && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          )}
          
          {/* Display API test result */}
          {apiTestResult && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{apiTestResult}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileUploader;







































