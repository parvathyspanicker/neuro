import "../style.css";
import {
  FaBrain, FaHeartbeat, FaShieldAlt, FaChartLine, FaClock, FaUsers,
  FaCheckCircle, FaStar, FaAward, FaLock, FaRocket, FaEye, FaUserMd,
  FaMicroscope, FaLaptopMedical, FaClipboardCheck, FaThumbsUp, FaGem
} from "react-icons/fa";

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
    <section id="features" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Clean Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <FaGem className="text-blue-600 text-lg" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cutting-edge technology for precise neurological diagnostics
          </p>
        </div>

        {/* Modern Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Icon Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                  <feature.icon className={`${feature.color} text-lg`} />
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${feature.bgColor} ${feature.color}`}>
                  {feature.stats}
                </span>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
              </div>

              {/* Feature Benefits */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <FaCheckCircle className="text-green-600 text-xs mr-2" />
                  <span>Clinically validated</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FaAward className="text-blue-600 text-xs mr-2" />
                  <span>FDA approved</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FaLock className="text-purple-600 text-xs mr-2" />
                  <span>Secure & private</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full bg-gray-50 hover:bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <FaEye className="text-xs" />
                Learn More
              </button>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Powered by Advanced Technology</h3>
            <p className="text-sm text-gray-600">Industry-leading tools and frameworks</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <FaMicroscope className="text-blue-600 text-2xl mx-auto mb-3" />
              <div className="text-sm font-semibold text-gray-900 mb-1">Deep Learning</div>
              <div className="text-xs text-gray-600">Neural networks</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <FaLaptopMedical className="text-green-600 text-2xl mx-auto mb-3" />
              <div className="text-sm font-semibold text-gray-900 mb-1">Cloud Computing</div>
              <div className="text-xs text-gray-600">Scalable infrastructure</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <FaUserMd className="text-purple-600 text-2xl mx-auto mb-3" />
              <div className="text-sm font-semibold text-gray-900 mb-1">Expert Network</div>
              <div className="text-xs text-gray-600">Board-certified doctors</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <FaClipboardCheck className="text-orange-600 text-2xl mx-auto mb-3" />
              <div className="text-sm font-semibold text-gray-900 mb-1">Quality Assurance</div>
              <div className="text-xs text-gray-600">Rigorous testing</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <FaStar className="text-yellow-500 text-2xl mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 mb-1">4.9/5</div>
            <div className="text-sm text-gray-600">Patient Rating</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <FaAward className="text-blue-600 text-2xl mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 mb-1">FDA</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <FaThumbsUp className="text-green-600 text-2xl mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 mb-1">99.2%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <FaRocket className="text-purple-600 text-2xl mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 mb-1">2.3s</div>
            <div className="text-sm text-gray-600">Analysis Time</div>
          </div>
        </div>

        {/* Clean White CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready to Transform Your Neurological Care?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of patients and doctors who trust NeuroCare for accurate, fast, and secure health management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                <FaRocket className="text-sm" />
                Get Started Today
              </button>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-600 flex items-center justify-center gap-2">
                <FaEye className="text-sm" />
                View Demo
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                <span>Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <FaLock className="text-blue-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <FaAward className="text-purple-600" />
                <span>Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
