import "../style.css";
import {
  FaFileMedical, FaMicroscope, FaUserMd, FaClipboardCheck, FaRocket, FaHeartbeat,
  FaCheckCircle, FaStethoscope, FaEye
} from "react-icons/fa";

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
    <section id="how" className="py-16 bg-white relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <FaStethoscope className="text-blue-600 text-lg" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Simple steps, modern experience</p>
        </div>

        {/* Card-based steps, aligned with Features style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <step.icon className="text-white text-lg" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  Step {step.step}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>
              </div>

              <ul className="space-y-2 mb-4">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-700">
                    <FaCheckCircle className="text-green-600 text-xs mr-2" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-gray-50 hover:bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <FaEye className="text-xs" />
                Learn more
              </button>
            </div>
          ))}
        </div>

        {/* Minimal CTA to mirror Features */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Get started in minutes</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Upload, analyze, and review results with ease.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                <FaRocket className="text-sm" />
                Start now
              </button>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-600 flex items-center justify-center gap-2">
                <FaEye className="text-sm" />
                View demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
