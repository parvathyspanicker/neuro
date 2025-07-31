import "../style.css";
import { useState } from "react";
import brainContact from "../assets/brain-contact.png";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaHeadset, FaShieldAlt } from "react-icons/fa";

const contactMethods = [
  {
    icon: FaPhone,
    title: "Phone Support",
    description: "Speak with our medical support team",
    contact: "+1 (555) 123-4567",
    availability: "24/7 Emergency Support",
    color: "text-green-500",
    bgColor: "bg-green-100"
  },
  {
    icon: FaEnvelope,
    title: "Email Support",
    description: "Get detailed responses to your queries",
    contact: "support@neurocare.ai",
    availability: "Response within 2 hours",
    color: "text-blue-500",
    bgColor: "bg-blue-100"
  },
  {
    icon: FaHeadset,
    title: "Live Chat",
    description: "Instant support for urgent questions",
    contact: "Available on dashboard",
    availability: "24/7 Live Support",
    color: "text-purple-500",
    bgColor: "bg-purple-100"
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    urgency: "normal"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert("Thank you for your message! We'll get back to you within 2 hours.");
      setFormData({ name: "", email: "", subject: "", message: "", urgency: "normal" });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <section id="contact" className="bg-white py-12 px-4 text-gray-800 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mb-3 shadow-md">
            <span className="text-lg">💬</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3 tracking-tight neuro-title">
            Get in Touch
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed medical-font">
            Have questions about your neurological health? Our expert team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* Contact Methods */}
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-900 mb-1 neuro-title">Contact Methods</h3>
              <p className="text-gray-600 text-xs medical-font">Choose your preferred way to reach us</p>
            </div>
            {contactMethods.map((method, index) => (
              <div key={index} className="group bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`p-2 ${method.bgColor} rounded-lg group-hover:scale-105 transition-transform duration-300`}>
                    <method.icon className={`${method.color} text-sm`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-blue-900 mb-1 neuro-font">{method.title}</h4>
                    <p className="text-gray-600 mb-1 text-xs leading-relaxed medical-font">{method.description}</p>
                    <p className="font-semibold text-blue-700 mb-1 text-xs neuro-font">{method.contact}</p>
                    <p className="text-xs text-gray-500 medical-font">{method.availability}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Office Info */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl text-white shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FaMapMarkerAlt className="text-sm" />
                </div>
                <h4 className="font-semibold text-sm neuro-title">Our Headquarters</h4>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 font-medium text-sm neuro-font">NeuroCare Medical Center</p>
                <p className="text-blue-100 text-xs medical-font">Kottayam, Kerala, India 686001</p>
                <div className="flex items-center gap-2 text-blue-200 pt-2 border-t border-white/20">
                  <FaClock className="text-xs" />
                  <span className="text-xs medical-font">Mon-Fri: 9AM-6PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <FaShieldAlt className="text-blue-600 text-sm" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 neuro-title">Send us a Message</h3>
                  <p className="text-gray-600 text-xs medical-font">We'll respond within 2 hours</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 neuro-font">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm medical-font"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 neuro-font">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm medical-font"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 neuro-font">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm medical-font"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 neuro-font">Priority Level</label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm medical-font"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 neuro-font">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your question or concern in detail..."
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none resize-none transition-all duration-200 text-sm medical-font"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-2">
                    <FaShieldAlt className="text-indigo-600 text-sm mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-indigo-800 mb-1 text-xs neuro-font">Privacy & Security</h4>
                      <p className="text-xs text-indigo-700 medical-font">
                        Your message is encrypted and handled in compliance with HIPAA regulations. 
                        We never share your personal information with third parties.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm neuro-font"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="text-center">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 max-w-4xl mx-auto">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-900 mb-1 neuro-title">Visit Our Location</h3>
              <p className="text-gray-600 text-sm medical-font">Find us at the heart of Kerala's medical district</p>
            </div>
            <div className="w-full h-64 rounded-lg overflow-hidden shadow-md border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125442.72455312653!2d76.44608!3d9.59411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d514abec6bf%3A0xbd582caa5844192!2sKottayam%2C%20Kerala!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="NeuroCare Location - Kottayam, Kerala"
              ></iframe>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-900 font-semibold mb-1 text-sm neuro-font">
                NeuroCare Medical Center
              </p>
              <p className="text-gray-700 text-xs mb-1 medical-font">
                Kottayam, Kerala, India 686001
              </p>
              <p className="text-blue-600 text-xs neuro-font">
                📞 +91 (481) 123-4567 | 📧 info@neurocare.in
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
