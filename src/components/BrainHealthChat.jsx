import React, { useState, useRef, useEffect } from 'react';
import { FaBrain, FaPaperPlane, FaUser, FaRobot, FaMicrophone } from 'react-icons/fa';

const BrainHealthChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI brain health assistant. I can help you with questions about brain health, neurological conditions, symptoms, and general brain-related queries. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBJJsl2hCj9RGnaxten3qtb1rzFKOoGUN8';
  // Updated for 2026: Using Gemini 2.5 Flash (latest stable)
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSystemPrompt = () => {
    return `You are a specialized AI brain health assistant for NeuroCare, a neurological care platform. Your role is to:

1. Provide accurate, helpful information about brain health, neurological conditions, and brain-related symptoms
2. Offer general guidance and educational content about brain diseases
3. Always maintain a professional, caring, and supportive tone
4. Clearly state that you are an AI assistant and cannot provide medical diagnosis
5. Encourage users to consult healthcare professionals for specific medical concerns
6. Focus on brain health topics including:
   - Common neurological conditions (Alzheimer's, Parkinson's, epilepsy, etc.)
   - Brain health tips and prevention
   - Understanding brain anatomy and function
   - Mental health and brain wellness
   - Warning signs and symptoms to watch for

IMPORTANT: Always include a disclaimer that you are an AI assistant and cannot replace professional medical advice. For specific medical concerns, users should consult qualified healthcare professionals.`;
  };

  // Check if query is brain/health related or social greeting
  const isBrainHealthQuery = (query) => {
    const brainHealthKeywords = [
      'brain', 'neurological', 'neurology', 'nervous system', 'neuron', 'synapse',
      'alzheimer', 'parkinson', 'epilepsy', 'stroke', 'migraine', 'headache',
      'memory', 'cognitive', 'mental health', 'depression', 'anxiety', 'stress',
      'concussion', 'trauma', 'seizure', 'tremor', 'dementia', 'autism',
      'adhd', 'dyslexia', 'brain tumor', 'cancer', 'tumor', 'lesion',
      'symptom', 'diagnosis', 'treatment', 'medication', 'therapy',
      'doctor', 'physician', 'neurologist', 'psychiatrist', 'psychologist',
      'hospital', 'clinic', 'medical', 'health', 'disease', 'condition',
      'pain', 'numbness', 'tingling', 'weakness', 'paralysis', 'vision',
      'hearing', 'speech', 'language', 'coordination', 'balance', 'dizziness',
      'fatigue', 'sleep', 'insomnia', 'mood', 'behavior', 'personality',
      'consciousness', 'coma', 'unconscious', 'fainting', 'seizure'
    ];

    const socialKeywords = [
      'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
      'thanks', 'thank you', 'thank', 'bye', 'goodbye', 'see you',
      'how are you', 'how do you do', 'nice to meet you', 'pleasure',
      'appreciate', 'grateful', 'welcome', 'good', 'great', 'awesome',
      'nice', 'wonderful', 'excellent', 'perfect', 'amazing', 'fantastic',
      'help', 'can you help', 'assist'
    ];

    const lowerQuery = query.toLowerCase();
    return brainHealthKeywords.some(keyword => lowerQuery.includes(keyword)) ||
      socialKeywords.some(keyword => lowerQuery.includes(keyword));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Check if query is brain/health related
    if (!isBrainHealthQuery(inputMessage)) {
      const invalidMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Sorry, I can only answer questions related to brain health, neurological diseases, and related medical topics. Please ask me about brain health, neurological conditions, symptoms, or related medical concerns.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, invalidMessage]);
      setIsLoading(false);
      setIsTyping(false);
      return;
    }

    // Check for valid API Key before making request
    if (GEMINI_API_KEY === 'AIzaSyBJJsl2hCj9RGnaxten3qtb1rzFKOoGUN8' || !GEMINI_API_KEY) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Configuration Error: The AI service cannot connect because a valid API Key is missing. \n\nPlease add your Google Gemini API Key to the VITE_GEMINI_API_KEY variable in the .env file.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
      return;
    }

    try {
      const systemPrompt = generateSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${inputMessage}\n\nPlease provide a helpful, accurate response about brain health:`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.candidates[0].content.parts[0].text,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      console.log('API Key Status:', GEMINI_API_KEY ? 'Present' : 'Missing', 'Key Length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0);

      let errorMsg = `Connection Error: ${error.message}`;

      if (error.message.includes('404')) errorMsg = "404 Not Found: The AI model 'gemini-2.5-flash' is not responding. Please check available models for 2026.";
      if (error.message.includes('400')) errorMsg = "400 Bad Request: Check if the AI model name is correct or if the request format is valid.";
      if (error.message.includes('401') || error.message.includes('403')) errorMsg = "Authentication Error: Your API Key appears to be invalid or lacks permission. Please check your Google AI Studio key.";
      if (error.message.includes('Failed to fetch')) errorMsg = "Network Error: Could not connect to Google's AI server. Check your internet connection or CORS settings.";

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMsg + "\n\n(Debugging info: Using model 'gemini-2.5-flash')",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Voice recognition functionality
  const startVoiceRecognition = () => {
    console.log('Starting voice recognition...');

    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Microphone permission granted');
        startRecognition();
      })
      .catch((err) => {
        console.error('Microphone permission denied:', err);
        alert('Microphone access is required for voice input. Please allow microphone access in your browser settings and try again.');
      });
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    console.log('Recognition object created, starting...');

    recognition.onstart = () => {
      console.log('Voice recognition started successfully');
    };

    recognition.onresult = (event) => {
      console.log('Voice recognition result:', event.results);
      const transcript = event.results[0][0].transcript;
      console.log('Transcript:', transcript);
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      switch (event.error) {
        case 'no-speech':
          alert('No speech detected. Please speak clearly and try again.');
          break;
        case 'audio-capture':
          alert('Microphone access denied. Please allow microphone access and try again.');
          break;
        case 'not-allowed':
          alert('Microphone access blocked. Please allow microphone access in your browser settings.');
          break;
        case 'network':
          alert('Network error. Please check your internet connection and try again.');
          break;
        default:
          alert(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    try {
      recognition.start();
      console.log('Recognition start() called');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      alert('Error starting voice recognition. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-md">
              <FaBrain className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Brain Health Assistant</h3>
              <p className="text-blue-100 text-sm font-medium">AI-powered neurological guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-sm ${message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-12'
                  : 'bg-gray-50 text-gray-800 border border-gray-100 mr-12'
                  }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <FaRobot className="text-blue-600 text-sm" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-3 font-medium ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <FaUser className="text-white text-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 text-gray-800 border border-gray-100 rounded-3xl px-6 py-4 shadow-sm mr-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                    <FaRobot className="text-blue-600 text-sm" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about brain health, symptoms, or neurological conditions..."
                className="w-full p-4 pr-14 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                rows="1"
                style={{ minHeight: '52px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              <button
                onClick={startVoiceRecognition}
                className={`absolute right-4 bottom-4 transition-all duration-200 ${isListening
                  ? 'text-red-500 animate-pulse bg-red-50 rounded-full p-2 shadow-md'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2'
                  }`}
                disabled={isLoading || isListening}
                title={isListening ? 'Listening... Speak now!' : 'Voice input (English only)'}
              >
                <FaMicrophone className={`text-base ${isListening ? 'animate-pulse' : ''}`} />
              </button>
              {isListening && (
                <div className="absolute -top-10 right-0 bg-red-500 text-white text-xs px-3 py-2 rounded-lg animate-pulse shadow-lg">
                  Listening...
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaPaperPlane className="text-base" />
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mt-4 text-center font-medium">
            This AI assistant provides general information only. For medical diagnosis and treatment, please consult a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrainHealthChat; 