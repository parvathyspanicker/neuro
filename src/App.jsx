import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MRIAnalysis from './pages/MRIAnalysis';
import Subscription from './pages/Subscription';
import Footer from './components/Footer';
import About from './pages/About';
import HelpSupport from './pages/HelpSupport';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Home />
            <Contact />
            <Footer />
          </>
        } />
        <Route path="/about" element={<><About /><Footer /></>} />
        <Route path="/login" element={<><Login /><Footer /></>} />
        <Route path="/register" element={<><Register /><Footer /></>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mri-analysis" element={<MRIAnalysis />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;