import "../style.css";
import { FaBrain, FaHeartbeat, FaShieldAlt, FaChartLine, FaClock, FaUsers } from "react-icons/fa";

const features = [
  {
    icon: FaBrain,
    title: "AI-Powered MRI Analysis",
    description: "Advanced deep learning algorithms analyze MRI scans with 95%+ accuracy, detecting early signs of neurological disorders.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    stats: "95% Accuracy"
  },
  {
    icon: FaHeartbeat,
    title: "Real-Time Doctor Consultation",
    description: "Connect instantly with certified neurologists through secure video calls, chat, and comprehensive health assessments.",
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    stats: "24/7 Available"
  },
  {
    icon: FaShieldAlt,
    title: "HIPAA-Compliant Security",
    description: "Enterprise-grade encryption and security protocols ensure your medical data remains private and protected.",
    color: "text-green-500",
    bgColor: "bg-green-100",
    stats: "Bank-Level Security"
  },
  {
    icon: FaChartLine,
    title: "Predictive Health Analytics",
    description: "Track your neurological health trends over time with personalized insights and early warning systems.",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    stats: "Trend Analysis"
  },
  {
    icon: FaClock,
    title: "Rapid Results",
    description: "Get your MRI analysis results in minutes, not days. Fast-track your path to diagnosis and treatment.",
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    stats: "< 5 Minutes"
  },
  {
    icon: FaUsers,
    title: "Family Health Management",
    description: "Manage health records for your entire family with shared dashboards and coordinated care plans.",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    stats: "Multi-User"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Advanced Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cutting-edge technology for precise neurological diagnostics
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`${feature.color} text-2xl`} />
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-indigo-800 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${feature.bgColor} ${feature.color}`}>
                    {feature.stats}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Learn More Link */}
              <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:text-indigo-500 transition-colors">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-blue-900">Ready to Experience the Future of Neurological Care?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of patients and doctors who trust NeuroCare for accurate, fast, and secure neurological health management.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
