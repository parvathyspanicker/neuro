import React, { useState, useRef, useEffect } from 'react';
import { FaBrain, FaPaperPlane, FaUser, FaRobot, FaMicrophone } from 'react-icons/fa';

const BrainHealthChat = () => {
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
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
      'nice', 'wonderful', 'excellent', 'perfect', 'amazing', 'fantastic'
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
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or feel free to ask your question in a different way.",
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
      
      switch(event.error) {
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <FaBrain className="text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Brain Health Assistant</h3>
            <p className="text-blue-100 text-sm">AI-powered neurological guidance</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-md border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'bot' && (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaRobot className="text-blue-600 text-xs" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaUser className="text-white text-xs" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaRobot className="text-blue-600 text-xs" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about brain health, symptoms, or neurological conditions..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <button
              onClick={startVoiceRecognition}
              className={`absolute right-3 bottom-3 transition-colors ${
                isListening 
                  ? 'text-red-500 animate-pulse bg-red-50 rounded-full p-1' 
                  : 'text-gray-400 hover:text-blue-600'
              }`}
              disabled={isLoading || isListening}
              title={isListening ? 'Listening... Speak now!' : 'Voice input (English only)'}
            >
              <FaMicrophone className={`text-sm ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            {isListening && (
              <div className="absolute -top-8 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse">
                Listening...
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane className="text-sm" />
            )}
          </button>
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          This AI assistant provides general information only. For medical diagnosis and treatment, please consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
};

export default BrainHealthChat; 