import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHeadset, FaArrowLeft, FaSearch, FaQuestionCircle, FaBook,
  FaPhone, FaEnvelope, FaComments, FaVideo, FaDownload, FaExternalLinkAlt,
  FaChevronDown, FaChevronUp, FaPlay, FaFileAlt, FaPaperPlane,
  FaClock, FaCheckCircle, FaExclamationCircle, FaLightbulb
} from 'react-icons/fa';

export default function HelpSupport() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });

  const supportCategories = [
    { id: 'all', name: 'All Topics', icon: FaBook },
    { id: 'getting-started', name: 'Getting Started', icon: FaLightbulb },
    { id: 'mri-upload', name: 'MRI Upload', icon: FaFileAlt },
    { id: 'reports', name: 'Reports & Results', icon: FaCheckCircle },
    { id: 'appointments', name: 'Appointments', icon: FaClock },
    { id: 'billing', name: 'Billing & Plans', icon: FaExclamationCircle }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with NeuroCare?',
      answer: 'Getting started is easy! First, create your account and verify your email. Then upload your MRI scan using our secure upload tool. Our AI will analyze your scan within minutes and provide detailed results.'
    },
    {
      id: 2,
      category: 'mri-upload',
      question: 'What MRI file formats are supported?',
      answer: 'We support DICOM (.dcm), NIfTI (.nii), and common image formats like JPEG and PNG. Files should be under 500MB for optimal processing speed.'
    },
    {
      id: 3,
      category: 'reports',
      question: 'How accurate are the AI analysis results?',
      answer: 'Our AI has a 95%+ accuracy rate and is FDA-certified for medical imaging analysis. However, all results should be reviewed with a qualified healthcare professional.'
    },
    {
      id: 4,
      category: 'appointments',
      question: 'How do I schedule a consultation with a doctor?',
      answer: 'Go to the Appointments section in your dashboard, click "Book Appointment", select your preferred doctor and time slot. You\'ll receive a confirmation email with meeting details.'
    },
    {
      id: 5,
      category: 'billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from the Subscription page. Your access will continue until the end of your current billing period.'
    },
    {
      id: 6,
      category: 'getting-started',
      question: 'Is my medical data secure?',
      answer: 'Absolutely. We use bank-level encryption and are HIPAA compliant. Your data is stored securely and never shared with third parties without your explicit consent.'
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'How to Upload Your First MRI Scan',
      duration: '3:45',
      description: 'Step-by-step guide to uploading and analyzing your MRI',
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Understanding Your Analysis Results',
      duration: '5:20',
      description: 'Learn how to interpret AI analysis reports',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Booking Doctor Consultations',
      duration: '2:30',
      description: 'How to schedule and join video consultations',
      thumbnail: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=200&fit=crop'
    }
  ];

  const contactMethods = [
    {
      icon: FaComments,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      availability: '24/7 Available',
      color: 'blue'
    },
    {
      icon: FaPhone,
      title: 'Phone Support',
      description: 'Speak directly with our medical experts',
      action: '+1 (555) 123-4567',
      availability: 'Mon-Fri 9AM-6PM EST',
      color: 'green'
    },
    {
      icon: FaEnvelope,
      title: 'Email Support',
      description: 'Send detailed questions and get comprehensive answers',
      action: 'support@neurocare.ai',
      availability: 'Response within 2 hours',
      color: 'purple'
    },
    {
      icon: FaVideo,
      title: 'Video Support',
      description: 'Screen sharing for technical assistance',
      action: 'Schedule Session',
      availability: 'By Appointment',
      color: 'orange'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent! We\'ll respond within 2 hours.');
    setContactForm({ subject: '', message: '', priority: 'normal' });
  };

  return (
    <div className="min-h-screen bg-white" style={{fontFamily: 'Times New Roman, serif'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FaHeadset className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600">Find answers and get assistance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className={`w-16 h-16 bg-${method.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className={`text-${method.color}-600 text-2xl`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                <button className={`w-full bg-${method.color}-600 text-white py-2 rounded-xl font-medium hover:bg-${method.color}-700 transition-colors duration-200 mb-2`}>
                  {method.action}
                </button>
                <p className="text-xs text-gray-500">{method.availability}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - FAQs */}
          <div className="col-span-2 space-y-8">
            {/* Search and Categories */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              {/* Search */}
              <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                {supportCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <category.icon className="text-sm" />
                    {category.name}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaQuestionCircle className="text-blue-600" />
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </div>
                      {expandedFAQ === faq.id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                  <p className="text-gray-600">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>

            {/* Video Tutorials */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Tutorials</h2>
              <div className="grid grid-cols-1 gap-6">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="relative">
                      <img 
                        src={tutorial.thumbnail} 
                        alt={tutorial.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <FaPlay className="text-white text-sm ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{tutorial.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{tutorial.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaClock />
                        <span>{tutorial.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form & Resources */}
          <div className="space-y-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaPaperPlane />
                  Send Message
                </button>
              </form>
            </div>

            {/* Quick Resources */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Resources</h3>
              <div className="space-y-4">
                {[
                  { icon: FaDownload, title: 'User Manual', desc: 'Complete guide to using NeuroCare' },
                  { icon: FaFileAlt, title: 'Privacy Policy', desc: 'How we protect your data' },
                  { icon: FaExternalLinkAlt, title: 'System Status', desc: 'Check platform availability' },
                  { icon: FaBook, title: 'API Documentation', desc: 'For developers and integrations' }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <resource.icon className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-red-900 mb-3">Medical Emergency?</h3>
              <p className="text-red-700 text-sm mb-4">
                If you're experiencing a medical emergency, please contact emergency services immediately.
              </p>
              <button className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200">
                Call Emergency Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}