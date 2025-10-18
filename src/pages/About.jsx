import "../style.css";
import heroImg from '../assets/brain-ai.png';
import { Link } from 'react-router-dom';
import {
  FaBrain, FaUsers, FaAward, FaHeart, FaRocket, FaStethoscope,
  FaShieldAlt, FaUserMd, FaCheckCircle, FaQuoteLeft, FaStar, FaEye, FaLightbulb,
  FaHandshake, FaGlobe, FaMicroscope, FaLaptopMedical, FaCertificate, FaThumbsUp,
  FaChartLine, FaClock, FaLock, FaHeadset, FaGem, FaFire, FaSignInAlt, FaUserPlus,
  FaHome, FaInfoCircle, FaEnvelope
} from "react-icons/fa";



const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    specialty: "Neurological Surgery",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    description: "15+ years in neurosurgery with expertise in brain tumor diagnosis and treatment.",
    credentials: "MD, PhD - Harvard Medical School"
  },
  {
    name: "Dr. Michael Chen",
    role: "AI Research Director", 
    specialty: "Machine Learning & Diagnostics",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    description: "Leading AI researcher specializing in medical imaging and neural networks.",
    credentials: "PhD Computer Science - Stanford"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Head of Neurology",
    specialty: "Cognitive Neuroscience", 
    image: "https://images.unsplash.com/photo-1594824388068-46d93db8e93f?w=400&h=400&fit=crop&crop=face",
    description: "Expert in cognitive disorders and early-stage dementia detection.",
    credentials: "MD, PhD - Johns Hopkins"
  }
];

const testimonials = [
  {
    name: "Dr. James Wilson",
    role: "Neurologist, Mayo Clinic",
    quote: "NeuroCare's AI diagnostics have revolutionized how we approach early detection. The accuracy is remarkable."
  },
  {
    name: "Maria Santos", 
    role: "Patient",
    quote: "Thanks to NeuroCare's early detection, I received treatment before symptoms appeared. It saved my life."
  },
  {
    name: "Dr. Robert Kim",
    role: "Radiologist",
    quote: "The platform's analysis speed and precision have significantly improved our diagnostic workflow."
  }
];

export default function About() {

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden flex flex-col">
      {/* Same Navbar as Home */}
      <header className="flex justify-between items-center px-12 py-4 w-full bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-blue-700 tracking-wider">NeuroCare</span>
        </div>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          <Link to="/" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaHome className="text-lg" />
            <span>Home</span>
          </Link>
          <a href="#" className="text-blue-600 flex items-center gap-2">
            <FaInfoCircle className="text-lg" />
            <span>About</span>
          </a>
          <a href="#feature" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaStar className="text-lg" />
            <span>Features</span>
          </a>
          <a href="#how" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaGlobe className="text-lg" />
            <span>How it Works</span>
          </a>
          <a href="#contact" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaEnvelope className="text-lg" />
            <span>Contact</span>
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-blue-600 font-semibold hover:underline flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
            <FaSignInAlt className="text-lg" />
            <span>Login</span>
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all flex items-center gap-2">
            <FaUserPlus className="text-lg" />
            <span>Register</span>
          </Link>
        </div>
      </header>

      <main className="w-full bg-white">

        {/* Modern Hero Section */}
        <div className="py-24 px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-8">
              <FaBrain className="text-white text-lg" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">About NeuroCare</h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Revolutionizing neurological healthcare through cutting-edge AI technology,
              delivering precise diagnostics and empowering healthcare professionals worldwide.
            </p>
            <div className="flex items-center justify-center gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <FaAward className="text-yellow-500 text-lg" />
                <span className="font-medium">Award Winning</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-blue-500 text-lg" />
                <span className="font-medium">50K+ Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-500 text-lg" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Section */}
        <div className="py-20 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="text-center">
                <FaUsers className="text-blue-600 text-3xl mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600 font-medium">Patients Served</div>
              </div>
              <div className="text-center">
                <FaAward className="text-green-600 text-3xl mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600 font-medium">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <FaHeadset className="text-red-600 text-3xl mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Support Available</div>
              </div>
              <div className="text-center">
                <FaRocket className="text-purple-600 text-3xl mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900 mb-2">2min</div>
                <div className="text-gray-600 font-medium">Average Analysis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Mission & Values Section */}
        <div className="py-24 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-5xl font-bold text-gray-900 mb-8">Our Mission & Values</h3>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Early detection saves lives. We are committed to making advanced AI-powered neurological
                diagnostics accessible to healthcare professionals worldwide, improving patient outcomes
                through innovative technology and compassionate care.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-16">
              <div className="text-center">
                <FaEye className="text-blue-600 text-4xl mx-auto mb-6" />
                <h4 className="font-bold text-gray-900 mb-4 text-2xl">Vision</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Early detection and prevention for all neurological disorders worldwide through innovative technology
                </p>
              </div>
              <div className="text-center">
                <FaLightbulb className="text-green-600 text-4xl mx-auto mb-6" />
                <h4 className="font-bold text-gray-900 mb-4 text-2xl">Innovation</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Cutting-edge AI technology seamlessly integrated with world-class medical expertise
                </p>
              </div>
              <div className="text-center">
                <FaHandshake className="text-purple-600 text-4xl mx-auto mb-6" />
                <h4 className="font-bold text-gray-900 mb-4 text-2xl">Trust</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Building confidence through transparency, accuracy, and reliable healthcare solutions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Features Section */}
        <div className="py-24 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-5xl font-bold text-gray-900 mb-8">Why Choose NeuroCare?</h3>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Experience the future of neurological diagnostics with our comprehensive platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-20">
              {/* Key Features */}
              <div>
                <h4 className="text-3xl font-bold text-gray-900 mb-12">Key Features</h4>
                <div className="space-y-8">
                  {[
                    { icon: FaCheckCircle, text: "98% diagnostic accuracy", desc: "Industry-leading precision in neurological analysis", color: "text-green-600" },
                    { icon: FaClock, text: "5-minute results", desc: "Rapid processing for immediate clinical decisions", color: "text-blue-600" },
                    { icon: FaLock, text: "HIPAA secure", desc: "Complete data protection and privacy compliance", color: "text-red-600" },
                    { icon: FaHeadset, text: "24/7 support", desc: "Round-the-clock expert assistance available", color: "text-purple-600" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-6">
                      <feature.icon className={`${feature.color} text-3xl mt-1`} />
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2 text-xl">{feature.text}</h5>
                        <p className="text-gray-600 text-lg leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Choose Us */}
              <div>
                <h4 className="text-3xl font-bold text-gray-900 mb-12">Our Advantages</h4>
                <div className="space-y-8">
                  {[
                    { icon: FaBrain, title: "AI-Powered", desc: "Advanced machine learning algorithms trained on millions of cases", color: "text-blue-600" },
                    { icon: FaStethoscope, title: "Expert Team", desc: "Board-certified neurologists and AI specialists", color: "text-green-600" },
                    { icon: FaShieldAlt, title: "Secure Platform", desc: "HIPAA-compliant infrastructure with enterprise security", color: "text-red-600" },
                    { icon: FaRocket, title: "Fast Processing", desc: "Real-time analysis with instant report generation", color: "text-purple-600" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-6">
                      <item.icon className={`${item.color} text-3xl mt-1`} />
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2 text-xl">{item.title}</h5>
                        <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Team Section */}
        <div className="py-24 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-5xl font-bold text-gray-900 mb-8">Meet Our Team</h3>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                World-class medical experts and AI researchers collaborating to revolutionize neurological care
              </p>
            </div>

        <div className="grid md:grid-cols-3 gap-16 mb-24">
          {teamMembers.map((member, index) => {
            const gradients = [
              "bg-gradient-to-br from-blue-500 to-indigo-600",
              "bg-gradient-to-br from-green-500 to-emerald-600",
              "bg-gradient-to-br from-purple-500 to-violet-600"
            ];
            return (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  />
                  <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 ${gradients[index]} rounded-xl flex items-center justify-center shadow-lg`}>
                    <FaUserMd className="text-white" />
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-xl">{member.name}</h4>
                <p className="text-blue-600 font-semibold mb-2 text-lg">{member.role}</p>
                <p className="text-purple-600 font-medium mb-4">{member.specialty}</p>
                <p className="text-gray-600 mb-6 leading-relaxed">{member.description}</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 font-medium text-sm">{member.credentials}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple Testimonials */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg mb-4">
            <FaQuoteLeft className="text-white text-sm" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">What Our Users Say</h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Trusted by healthcare professionals and patients worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {testimonials.map((testimonial, index) => {
            const iconColors = ["text-blue-500", "text-green-500", "text-purple-500"];
            const bgColors = ["bg-blue-500", "bg-green-500", "bg-purple-500"];
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <FaQuoteLeft className={`${iconColors[index]} text-sm`} />
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                  <FaHeart className="text-red-500 text-sm" />
                </div>
                <p className="text-gray-700 mb-4 italic text-sm leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-8 h-8 ${bgColors[index]} rounded-full flex items-center justify-center`}>
                    <FaUserMd className="text-white text-sm" />
                  </div>
                  <FaCheckCircle className={`${iconColors[index]} text-sm`} />
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-gray-600 text-xs">{testimonial.role}</p>
                  </div>
                  <FaThumbsUp className={`${iconColors[index]} text-sm`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Technology */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 rounded-2xl mb-6 shadow-lg">
            <FaMicroscope className="text-white text-2xl" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Our Technology</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cutting-edge AI and machine learning technology powering the future of neurological diagnostics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <FaLaptopMedical className="text-white text-xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">AI Analysis</h4>
            <p className="text-gray-600 leading-relaxed">Deep learning algorithms for precise neurological diagnosis</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <FaChartLine className="text-white text-xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">Real-time</h4>
            <p className="text-gray-600 leading-relaxed">Instant analysis and comprehensive results</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <FaGlobe className="text-white text-xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">Cloud Platform</h4>
            <p className="text-gray-600 leading-relaxed">Secure, scalable cloud infrastructure</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <FaCertificate className="text-white text-xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">FDA Approved</h4>
            <p className="text-gray-600 leading-relaxed">Clinically validated and certified technology</p>
          </div>
        </div>

        {/* Enhanced Achievements */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-2xl mb-6 shadow-lg">
            <FaGem className="text-white text-2xl" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Our Achievements</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Recognition and milestones that showcase our commitment to excellence in neurological care
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 mb-24">
          <div className="flex items-center gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-200 group">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaAward className="text-white text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xl mb-2">Best AI Healthcare</h4>
              <p className="text-gray-600 font-medium">Innovation Award 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-200 group">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaThumbsUp className="text-white text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xl mb-2">98% Accuracy Rate</h4>
              <p className="text-gray-600 font-medium">Clinically validated results</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-200 group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaFire className="text-white text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xl mb-2">50K+ Patients</h4>
              <p className="text-gray-600 font-medium">Successfully diagnosed</p>
            </div>
          </div>
        </div>

        {/* Modern Call to Action */}
        <div className="py-24 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <FaBrain className="text-blue-600 text-4xl mx-auto mb-8" />
            <h3 className="text-5xl font-bold text-gray-900 mb-8">Transform Your Brain Health</h3>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of healthcare professionals and patients who trust NeuroCare for accurate,
              fast, and reliable neurological diagnostics.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register" className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Started Today
              </Link>
              <Link to="/login" className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
          </div>
        </div>

      </main>
    </div>
  );
}