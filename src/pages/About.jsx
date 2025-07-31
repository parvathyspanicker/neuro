import "../style.css";
import { FaPlay, FaUsers, FaAward, FaHeart, FaRocket, FaBrain, FaShieldAlt, FaLightbulb } from "react-icons/fa";
import heroImg from '../assets/brain-ai.png';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Board-certified neurologist with 15+ years experience",
    specialty: "Neurological Disorders"
  },
  {
    name: "Alex Chen",
    role: "AI Research Director", 
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "PhD in Machine Learning, former Google AI researcher",
    specialty: "Deep Learning & AI"
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Clinical Director",
    image: "https://randomuser.me/api/portraits/men/45.jpg", 
    description: "Specialist in neurological disorders and brain imaging",
    specialty: "Brain Imaging"
  }
];

const stats = [
  { icon: FaUsers, number: "50K+", label: "Patients Served", color: "text-indigo-600" },
  { icon: FaAward, number: "98%", label: "Accuracy Rate", color: "text-green-600" },
  { icon: FaHeart, number: "24/7", label: "Support Available", color: "text-pink-600" },
  { icon: FaRocket, number: "2min", label: "Average Analysis", color: "text-purple-600" }
];

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 overflow-x-hidden flex flex-col">
      {/* Header - Same as Home */}
      <header className="flex justify-between items-center px-12 py-4 w-full">
        <Link to="/" className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-indigo-700 tracking-wider">NeuroCare</span>
        </Link>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          <Link to="/" className="hover:text-indigo-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </Link>
          <a href="#" className="text-indigo-600 font-semibold flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            <span>About</span>
          </a>
        </nav>
      </header>

      {/* Hero Section - Clean and Medical */}
      <section className="flex flex-col items-center justify-center w-full px-4 md:px-12 lg:px-24 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-900 leading-tight mb-6">About NeuroCare</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl">
          Revolutionizing neurological healthcare through AI-powered diagnostics and expert medical care
        </p>
        <div className="flex gap-12 mt-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.number}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section id="tutorial" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 neuro-title">
              How to Use NeuroCare
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto medical-font">
              Watch our comprehensive tutorial to get started with our platform
            </p>
          </div>

          {/* Video Player */}
          <div className="relative max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                    <FaPlay className="text-white text-2xl ml-1" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">NeuroCare Platform Tutorial</h3>
                  <p className="text-white/80">Learn how to upload MRI scans and get AI analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tutorial Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FaBrain, title: "Upload Process", description: "Step-by-step MRI upload guide", color: "text-indigo-600", bgColor: "bg-indigo-100" },
              { icon: FaShieldAlt, title: "AI Analysis", description: "Understanding your results", color: "text-green-500", bgColor: "bg-green-100" },
              { icon: FaUsers, title: "Expert Consultation", description: "Connecting with specialists", color: "text-purple-500", bgColor: "bg-purple-100" }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6`}>
                  <feature.icon className={`text-2xl ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 neuro-title">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 medical-font">
                At NeuroCare, we believe early detection saves lives. Our AI-powered platform makes 
                advanced neurological diagnostics accessible to everyone, anywhere.
              </p>
              <p className="text-gray-600 medical-font">
                We combine cutting-edge artificial intelligence with expert medical knowledge to 
                provide accurate, fast, and affordable brain health assessments.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Why Choose NeuroCare?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-gray-700">95%+ accuracy in AI diagnostics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-gray-700">Results in under 5 minutes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-gray-700">HIPAA-compliant security</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-gray-700">24/7 expert support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 neuro-title">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto medical-font">
              Expert professionals dedicated to your brain health
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-100"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-purple-600 mb-3">{member.specialty}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Info Bar - Same as Home */}
      <div className="flex justify-between items-center px-12 py-4 border-t border-gray-100 text-indigo-900 text-base font-semibold w-full bg-white">
        <span>Better brain health</span>
        <span>AI for early diagnosis</span>
        <span>Care for your family</span>
      </div>
    </div>
  );
}

