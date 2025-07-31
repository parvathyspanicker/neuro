import "../style.css";
import { FaFileMedical, FaMicroscope, FaUserMd, FaClipboardCheck, FaRocket, FaHeartbeat } from "react-icons/fa";

const steps = [
  {
    icon: FaFileMedical,
    title: "Upload Your MRI",
    description: "Securely upload your MRI scans in any format. Our platform supports DICOM, JPEG, PNG, and other medical imaging formats.",
    details: ["HIPAA-compliant upload", "Multiple format support", "Instant processing"],
    color: "from-blue-500 to-cyan-500",
    step: "01",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center"
  },
  {
    icon: FaMicroscope,
    title: "AI Analysis",
    description: "Our advanced AI models, trained on millions of scans, analyze your MRI for signs of neurological disorders with clinical-grade accuracy.",
    details: ["95%+ accuracy rate", "Sub-minute processing", "FDA-approved algorithms"],
    color: "from-indigo-500 to-purple-500",
    step: "02",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center"
  },
  {
    icon: FaClipboardCheck,
    title: "Instant Results",
    description: "Receive comprehensive analysis results with detailed visualizations, risk assessments, and preliminary findings.",
    details: ["Detailed reports", "Visual annotations", "Risk scoring"],
    color: "from-purple-500 to-pink-500",
    step: "03",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center"
  },
  {
    icon: FaUserMd,
    title: "Expert Review",
    description: "Board-certified neurologists review AI findings and provide personalized recommendations and treatment plans.",
    details: ["Board-certified doctors", "Personalized care", "Treatment recommendations"],
    color: "from-pink-500 to-red-500",
    step: "04",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop&crop=center"
  },
  {
    icon: FaHeartbeat,
    title: "Ongoing Monitoring",
    description: "Track your neurological health over time with regular check-ins, progress monitoring, and preventive care guidance.",
    details: ["Health tracking", "Progress monitoring", "Preventive care"],
    color: "from-green-500 to-teal-500",
    step: "05",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop&crop=center"
  },
  {
    icon: FaRocket,
    title: "Better Outcomes",
    description: "Early detection and expert care lead to better treatment outcomes and improved quality of life for patients.",
    details: ["Early detection", "Better outcomes", "Improved quality of life"],
    color: "from-orange-500 to-yellow-500",
    step: "06",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop&crop=center"
  }
];

export default function Howitwork() {
  return (
    <section id="how" className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 shadow-lg">
            <svg width="24" height="24" fill="#2563eb" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of neurological care with our streamlined, AI-powered diagnostic process
          </p>
        </div>

        {/* Enhanced Process Steps */}
        <div className="relative">
          {/* Animated Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 transform -translate-y-1/2 z-0 rounded-full shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full animate-pulse opacity-50"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group relative"
              >
                {/* Clean Medical Card */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  
                  {/* Professional Icon Header */}
                  <div className={`relative h-32 bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <step.icon className="text-5xl mb-3 opacity-90" />
                      <div className="text-sm font-medium tracking-wide">{step.title}</div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
                        {step.step}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Simple Features List */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Stats Section */}
        <div className="mt-16 bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-center text-blue-900 mb-6">Trusted Healthcare Platform</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-700 mb-1">10,000+</div>
              <div className="text-gray-600 text-sm">Scans Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 mb-1">95%</div>
              <div className="text-gray-600 text-sm">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 mb-1">&lt;5min</div>
              <div className="text-gray-600 text-sm">Processing Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 mb-1">24/7</div>
              <div className="text-gray-600 text-sm">Support Available</div>
            </div>
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
}
