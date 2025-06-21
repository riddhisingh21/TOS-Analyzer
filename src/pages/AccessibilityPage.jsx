import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiVolume2, FiType, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

function AccessibilityPage() {
  const [fontSize, setFontSize] = useState('text-base');
  const [theme, setTheme] = useState('light');
  const [contrastMode, setContrastMode] = useState('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Get the analyzed document from localStorage
  const [analyzedDocument, setAnalyzedDocument] = useState(null);
  
  useEffect(() => {
    // Try to get the analyzed document from localStorage
    const storedDocument = localStorage.getItem('analyzedDocument');
    console.log('Stored document in localStorage:', storedDocument);
    
    if (storedDocument) {
      try {
        const parsedDocument = JSON.parse(storedDocument);
        console.log('Parsed document:', parsedDocument);
        setAnalyzedDocument(parsedDocument);
      } catch (error) {
        console.error('Error parsing stored document:', error);
      }
    }
  }, []);
  
  // Use the simplified text from the analyzed document, or fall back to sample text
  const textToDisplay = analyzedDocument?.simplifiedText || 
    "This is a sample Terms of Service text. It contains complex legal language that our tool can simplify. " +
    "By using our service, you agree to these terms and conditions. The service provider reserves the right " +
    "to modify these terms at any time without prior notice.";

  // Define a sample text for the preview section
  const sampleText = analyzedDocument?.simplifiedText || 
    "This is a sample Terms of Service text. It contains complex legal language that our tool can simplify. " +
    "By using our service, you agree to these terms and conditions. The service provider reserves the right " +
    "to modify these terms at any time without prior notice.";

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToDisplay);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getContrastClasses = () => {
    if (contrastMode === 'high-contrast') {
      return 'bg-black text-white border-gray-600';
    } else if (contrastMode === 'low-contrast') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-white text-gray-800 border-gray-200';
  };

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'bg-gray-800 text-white';
    } else if (theme === 'light') {
      return 'bg-white text-gray-800';
    }
    return 'bg-white text-gray-800';
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
            Accessibility Settings
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-lg text-gray-600 dark:text-gray-300"
          >
            Customize your reading experience to suit your needs
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
                  <FiEye className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Display Settings</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiType className="inline mr-2" /> Font Size
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        defaultValue="2"
                        onChange={(e) => {
                          const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
                          setFontSize(sizes[parseInt(e.target.value) - 1]);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <span className="text-gray-600 dark:text-gray-400 text-sm w-16">
                        {fontSize === 'text-sm' ? 'Small' : 
                         fontSize === 'text-base' ? 'Medium' : 
                         fontSize === 'text-lg' ? 'Large' : 'X-Large'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMonitor className="inline mr-2" /> Contrast Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setContrastMode('normal')}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          contrastMode === 'normal' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => setContrastMode('low-contrast')}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          contrastMode === 'low-contrast' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        onClick={() => setContrastMode('high-contrast')}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          contrastMode === 'high-contrast' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiSun className="inline mr-2" /> Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTheme('light')}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          theme === 'light' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          theme === 'dark' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          theme === 'system' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        System
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiVolume2 className="inline mr-2" /> Text-to-Speech
                    </label>
                    <button
                      onClick={handleTextToSpeech}
                      className={`w-full py-2 px-4 rounded-md text-white ${
                        isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {isSpeaking ? 'Stop Reading' : 'Read Sample Text'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className={`rounded-lg shadow-xl overflow-hidden ${getThemeClasses()}`}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Preview</h2>
                
                <div className={`p-6 rounded-lg border ${getContrastClasses()}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${fontSize}`}>Sample Terms of Service</h3>
                  <p className={`${fontSize}`}>
                    {sampleText}
                  </p>
                  
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className={`font-medium ${fontSize}`}>Risky Clause Detected</h4>
                    <p className={`mt-2 ${fontSize} text-gray-600 dark:text-gray-400`}>
                      The service provider reserves the right to modify these terms at any time without prior notice.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">How to Use Accessibility Features</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">1</span>
                      <span>Adjust the font size using the slider to make text easier to read</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">2</span>
                      <span>Choose a contrast mode that works best for your vision needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">3</span>
                      <span>Use the text-to-speech feature to have documents read aloud to you</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">4</span>
                      <span>Select a theme that reduces eye strain based on your environment</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default AccessibilityPage;



