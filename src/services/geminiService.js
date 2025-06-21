// Define Gemini model endpoints
const GEMINI_MODELS = {
  'gemini-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  'gemini-1.5-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'gemini-1.5-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  'gemini-2.5-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
};

// Use Gemini 1.5 Flash by default (more cost-effective)
let GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('geminiApiKey') || '';
const SELECTED_MODEL = 'gemini-1.5-flash';
const API_URL = GEMINI_MODELS[SELECTED_MODEL];

// Import mock services for fallback
import * as mockService from './mockGeminiService';

let usingMockData = false;

// Check if API key is available at startup
if (!GEMINI_API_KEY) {
  console.warn('No Gemini API key found. Will use mock data by default.');
  usingMockData = true;
} else {
  console.log('Gemini API key found, length:', GEMINI_API_KEY.length);
  usingMockData = false;
}

/**
 * Set the API key for Gemini
 * @param {string} apiKey - The API key to use
 */
export function setApiKey(apiKey) {
  console.log('Setting new API key...');
  GEMINI_API_KEY = apiKey;
  usingMockData = false;
  console.log('API key updated, mock data flag reset');
}

/**
 * Sends a request to the Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Array} examples - Optional examples for few-shot learning
 * @param {string} model - Optional model override
 * @returns {Promise} - The response from Gemini
 */
export async function generateWithGemini(prompt, examples = [], model = SELECTED_MODEL) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is missing. Please add your API key to the .env file.');
      throw new Error('API key is missing. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.');
    }
    
    const modelUrl = GEMINI_MODELS[model] || API_URL;
    console.log(`Calling Gemini API (${model}) with prompt length: ${prompt.length}`);
    console.log(`Using model URL: ${modelUrl}`);
    console.log(`API key exists: ${Boolean(GEMINI_API_KEY)}, length: ${GEMINI_API_KEY.length}`);
    
    // Adjust parameters based on model
    let temperature = 0.2;
    let maxOutputTokens = 8192;
    
    // Flash models typically work better with slightly different parameters
    if (model.includes('flash')) {
      temperature = 0.4;
      maxOutputTokens = 4096; // Flash models may have lower token limits
    }
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxOutputTokens,
      }
    };
    
    console.log('Request body structure:', JSON.stringify(requestBody, null, 2).substring(0, 200) + '...');
    
    try {
      console.log('Sending fetch request to Gemini API...');
      const response = await fetch(`${modelUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Received response from Gemini API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('Parsed error data:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
        }
        
        // Check for specific error types
        if (errorData.error?.status === 'PERMISSION_DENIED') {
          throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
        } else if (errorData.error?.status === 'RESOURCE_EXHAUSTED') {
          throw new Error('Gemini API quota exceeded. Please check your usage limits.');
        } else if (errorData.error?.message) {
          throw new Error(`Gemini API error: ${errorData.error.message}`);
        } else {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
      }
      
      console.log('Parsing response as JSON...');
      const data = await response.json();
      console.log(`Gemini API (${model}) response received successfully`);
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected Gemini API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Unexpected API response format. The response did not contain the expected data structure.');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error when calling Gemini API: ${fetchError.message}`);
    }
  } catch (error) {
    console.error(`Error calling Gemini API (${model}):`, error);
    throw error;
  }
}

/**
 * Simplifies legal text using Gemini
 * @param {string} text - The legal text to simplify
 * @returns {Promise<string>} - Simplified text
 */
export async function simplifyLegalText(text) {
  console.log('simplifyLegalText called with text length:', text.length);
  
  const apiCall = async (text) => {
    // Ensure we have an API key
    if (!GEMINI_API_KEY) {
      console.error('No API key available for simplifyLegalText');
      throw new Error('API key is missing. Please add your Gemini API key.');
    }
    
    // Create a prompt based on the selected model
    let prompt;
    
    if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Simplify this legal document into plain language. Highlight concerning clauses.

${text}`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are an expert in legal document analysis and simplification. Your task is to:

1. Simplify the following Terms of Service or legal document into plain, easy-to-understand language.
2. Highlight any potentially concerning clauses that users should be aware of.
3. Organize the simplified text in a clear, readable format.
4. Focus on explaining what rights the user is giving up and what obligations they're accepting.

Here is the legal text to simplify:

${text}

Provide your simplified version below:
`;
    }

    console.log('Sending simplification request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received simplification response from Gemini API');
      return result;
    } catch (error) {
      console.error('Simplification with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };
  
  return withQuotaHandling(apiCall, mockService.simplifyLegalText, text);
}

/**
 * Identifies risky clauses in legal text
 * @param {string} text - The legal text to analyze
 * @returns {Promise<Array>} - Array of risky clauses with explanations
 */
export async function identifyRiskyClauses(text) {
  console.log('identifyRiskyClauses called with text length:', text.length);
  
  const apiCall = async (text) => {
    // Create a prompt based on the selected model
    let prompt;
    
    if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Identify risky clauses in this legal document. For each risky clause:
- Quote the exact text
- Explain why it's concerning
- Rate risk level (Low/Medium/High)
- Categorize the risk type

Format as JSON array with objects containing: "clause", "explanation", "riskLevel", "category"

${text}`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are an expert legal analyst specializing in consumer protection. Your task is to:

1. Analyze the following Terms of Service or legal document.
2. Identify potentially risky or concerning clauses that users should be aware of.
3. For each risky clause:
   - Quote the exact text of the clause
   - Explain in simple terms why it might be concerning
   - Rate the risk level (Low, Medium, High)
   - Categorize the type of risk (Privacy, Financial, Legal Rights, etc.)

Format your response as a JSON array with objects containing:
- "clause": The exact text of the risky clause
- "explanation": Your simple explanation of the concern
- "riskLevel": "Low", "Medium", or "High"
- "category": The category of risk

Here is the legal text to analyze:

${text}
`;
    }

    console.log('Sending risk analysis request to Gemini API...');
    try {
      const response = await generateWithGemini(prompt);
      console.log('Received risk analysis response from Gemini API');
      
      try {
        // Try to parse the response as JSON
        // First, try to find JSON in the response (in case the model added extra text)
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        console.log('Raw response:', response);
        
        // If parsing fails, create a simple array with the raw response
        return [
          {
            clause: "API returned non-JSON response",
            explanation: "The AI couldn't format the response as JSON. Here's the raw analysis.",
            riskLevel: "Unknown",
            category: "Processing Error",
            rawResponse: response
          }
        ];
      }
    } catch (error) {
      console.error('Risk analysis with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      try {
        const response = await tryMultipleModels(prompt);
        
        try {
          // Try to parse the response as JSON
          const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
          const jsonString = jsonMatch ? jsonMatch[0] : response;
          
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse response from all models:', parseError);
          
          // If parsing fails, create a simple array with the raw response
          return [
            {
              clause: "API returned non-JSON response",
              explanation: "The AI couldn't format the response as JSON. Here's the raw analysis.",
              riskLevel: "Unknown",
              category: "Processing Error",
              rawResponse: response
            }
          ];
        }
      } catch (allModelsError) {
        console.error('All models failed:', allModelsError);
        throw new Error('All Gemini models failed to analyze risky clauses');
      }
    }
  };
  
  return withQuotaHandling(apiCall, mockService.identifyRiskyClauses, text);
}

/**
 * Summarizes the key points of a legal document
 * @param {string} text - The legal text to summarize
 * @returns {Promise<string>} - Summary of key points
 */
export async function summarizeLegalDocument(text) {
  console.log('summarizeLegalDocument called with text length:', text.length);
  
  const apiCall = async (text) => {
    // Create a prompt based on the selected model
    let prompt;
    
    if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Summarize this legal document in 5-7 bullet points. Focus on the most important points users should understand.

${text}`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are an expert in legal document analysis. Your task is to:

1. Provide a concise summary of the following Terms of Service or legal document.
2. Focus on the most important points that a user should understand.
3. Limit your summary to 5-7 key points.
4. Use bullet points for clarity.

Here is the legal text to summarize:

${text}

Provide your summary below:
`;
    }

    console.log('Sending summary request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received summary response from Gemini API');
      return result;
    } catch (error) {
      console.error('Summary with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };
  
  return withQuotaHandling(apiCall, mockService.summarizeLegalDocument, text);
}

/**
 * Tries multiple models in order until one works
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The response from the first working model
 */
async function tryMultipleModels(prompt) {
  // Try models in this order - starting with more cost-effective options
  const modelOrder = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro'];
  
  for (const model of modelOrder) {
    try {
      console.log(`Trying model: ${model}`);
      return await generateWithGemini(prompt, [], model);
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      // Continue to next model
    }
  }
  
  // If all models fail, throw error
  throw new Error('All Gemini models failed');
}

/**
 * Test function to verify the Gemini API is working
 * @returns {Promise<string>} - Test response from Gemini
 */
export async function testGeminiAPI() {
  try {
    // First, check if API key exists
    if (!GEMINI_API_KEY) {
      return "API Test Failed: No API key found. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.";
    }
    
    // Check if API key looks valid (basic format check)
    if (!GEMINI_API_KEY.startsWith('AI') || GEMINI_API_KEY.length < 20) {
      return "API Test Failed: API key format appears invalid. Gemini API keys typically start with 'AI' and are longer than 20 characters.";
    }
    
    console.log("API key format looks valid, testing API connection...");
    
    const testPrompt = "Hello, can you respond with a simple 'Hello, I'm Gemini!' to verify the API is working?";
    
    // Try to use the selected model first
    try {
      const response = await generateWithGemini(testPrompt);
      return `API Test Successful using ${SELECTED_MODEL}: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`;
    } catch (error) {
      console.error(`Selected model ${SELECTED_MODEL} failed:`, error);
      
      // Check for specific error types
      if (error.message && error.message.includes('quota exceeded')) {
        return "API Test Result: You've exceeded your Gemini API quota. You need to upgrade your plan or wait until your quota resets. The application will use mock data for now.";
      } else if (error.message && error.message.includes('API key is missing')) {
        return "API Test Failed: No API key found. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.";
      } else if (error.message && error.message.includes('API key is invalid')) {
        return "API Test Failed: Your API key appears to be invalid. Please check your Gemini API key.";
      }
      
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      try {
        const response = await tryMultipleModels(testPrompt);
        
        // Try to determine which model succeeded
        const modelRegex = /Calling Gemini API \((.*?)\)/;
        const consoleOutput = console.logs ? console.logs.join('\n') : '';
        const modelMatch = consoleOutput.match(modelRegex);
        const modelUsed = modelMatch && modelMatch[1] ? modelMatch[1] : 'unknown model';
        
        return `API Test Successful using fallback ${modelUsed}: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`;
      } catch (fallbackError) {
        console.error('All models failed:', fallbackError);
        return `API Test Failed: ${error.message}. Make sure your API key is valid and has access to the Gemini models.`;
      }
    }
  } catch (error) {
    console.error('API test error:', error);
    return `API Test Failed: ${error.message}`;
  }
}

/**
 * Handles API quota exceeded errors by using mock service
 * @param {Function} apiCall - The API function to try
 * @param {Function} mockFallback - The mock function to use as fallback
 * @param {Array} args - Arguments to pass to both functions
 * @returns {Promise} - Result from either API or mock
 */
async function withQuotaHandling(apiCall, mockFallback, ...args) {
  // If we're already using mock data, don't try the API again
  if (usingMockData) {
    console.log('Already using mock data, skipping API call');
    return mockFallback(...args);
  }

  // Double-check that we have an API key
  if (!GEMINI_API_KEY) {
    console.log('No API key available, using mock data');
    usingMockData = true;
    return mockFallback(...args);
  }

  try {
    // Always try to use the real API first
    console.log('Attempting to use Gemini API...');
    const result = await apiCall(...args);
    console.log('Successfully used Gemini API');
    return result;
  } catch (error) {
    console.error('API error:', error.message);
    
    // Check if it's a quota exceeded error
    if (error.message && error.message.includes('quota exceeded')) {
      console.log('Quota exceeded, falling back to mock service');
      alert('API quota exceeded. Using mock data instead. Results will not be specific to your document.');
      usingMockData = true;
      return mockFallback(...args);
    }
    
    // For other errors, try to use other models before falling back to mock
    try {
      console.log('Trying alternative models...');
      // This assumes apiCall already tries multiple models internally
      // If not, we could implement that logic here
      return await apiCall(...args);
    } catch (secondError) {
      console.log('All API attempts failed, falling back to mock service');
      alert('API processing failed. Using mock data instead. Results will not be specific to your document.');
      usingMockData = true;
      return mockFallback(...args);
    }
  }
}

export function resetMockDataFlag() {
  usingMockData = false;
  console.log('Reset mock data flag, will try to use Gemini API again');
}
















