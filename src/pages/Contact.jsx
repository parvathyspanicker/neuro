import "../style.css";
import { useState } from "react";
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaHeadset, FaShieldAlt,
  FaRocket, FaUserMd, FaLock, FaStar, FaThumbsUp,
  FaComments, FaPaperPlane, FaAward, FaUsers, FaHeart
} from "react-icons/fa";

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
    <section id="contact" className="bg-white py-16 px-4 text-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Clean Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <FaComments className="text-blue-600 text-lg" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about your neurological health? Our expert team is here to help.
          </p>
        </div>

        {/* Horizontal Contact Methods */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <div className={`w-12 h-12 ${method.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <method.icon className={`${method.color} text-lg`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{method.title}</h4>
                  <p className="text-gray-600 text-sm mb-1">{method.description}</p>
                  <p className="font-semibold text-blue-600 text-sm">{method.contact}</p>
                  <p className="text-xs text-gray-500">{method.availability}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Form - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaPaperPlane className="text-blue-600 text-sm" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send us a Message</h3>
                <p className="text-gray-600 text-sm">We'll respond within 2 hours</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your question or concern in detail..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all duration-200"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaShieldAlt className="text-green-600" />
                  <span>Your information is secure and confidential</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Compact Info Sidebar */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            {/* Office Info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FaMapMarkerAlt className="text-blue-600 text-sm" />
                <h4 className="font-semibold text-gray-900">Our Office</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">NeuroCare Medical Center</p>
                <p className="text-gray-600">Kottayam, Kerala, India</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaClock className="text-xs" />
                  <span>Mon-Fri: 9AM-6PM</span>
                </div>
              </div>
            </div>

            {/* Quick Features */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Why Choose Us?</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FaUserMd className="text-blue-600 text-xs" />
                  <span className="text-gray-700">Expert neurologists</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaRocket className="text-green-600 text-xs" />
                  <span className="text-gray-700">2-hour response</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaLock className="text-purple-600 text-xs" />
                  <span className="text-gray-700">HIPAA secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaStar className="text-yellow-600 text-xs" />
                  <span className="text-gray-700">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Trust Stats */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Trust Indicators</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <FaUsers className="text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-bold">10,000+</div>
                  <div className="text-xs text-gray-600">Patients</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <FaAward className="text-green-600 mx-auto mb-1" />
                  <div className="text-xs font-bold">FDA</div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <FaThumbsUp className="text-purple-600 mx-auto mb-1" />
                  <div className="text-xs font-bold">99.2%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <FaHeart className="text-red-600 mx-auto mb-1" />
                  <div className="text-xs font-bold">24/7</div>
                  <div className="text-xs text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Map & Contact Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Our Location</h3>
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
            </div>

            {/* Location Details */}
            <div className="flex flex-col justify-center">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-blue-900 font-semibold mb-3 text-center">
                  NeuroCare Medical Center
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FaMapMarkerAlt className="text-blue-600" />
                    <span className="text-gray-700">Kottayam, Kerala, India 686001</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaPhone className="text-blue-600" />
                    <span className="text-gray-700">+91 (481) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaEnvelope className="text-blue-600" />
                    <span className="text-gray-700">info@neurocare.in</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaClock className="text-blue-600" />
                    <span className="text-gray-700">Mon-Fri: 9AM-6PM IST</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <FaMapMarkerAlt className="text-xs" />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
