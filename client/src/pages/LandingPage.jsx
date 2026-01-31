import { useState, useEffect } from 'react';
import { Brain, Rocket, Target, FileText, ArrowRight, CheckCircle, Star, Users, Zap, GraduationCap, TrendingUp, Lightbulb, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const goToAssessment = () => navigate('/SchoolAssessment');
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const benefits = [
    "Clear your career confusion in 15 minutes",
    "Get AI-powered insights that actually make sense",
    "Discover careers you never knew existed"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 relative overflow-hidden">
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(8deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Removed random green patterns for cleaner look */}
      </div>

      {/* Company Name Header */}
      <div className="relative z-10 pt-6 pb-4">
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 tracking-tight">
            GUIDOPIA
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-1 rounded-full"></div>
          
          {/* Saved Reports Button - Top Right */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <button 
              onClick={() => navigate('/saved-reports')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Saved Reports
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50 rounded-full px-6 py-3">
                <Brain className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold text-sm">AI-Powered Career Discovery</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-gray-800 leading-tight">
                  Confused About Your Future?
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 mt-2">
                    We're Not.
                  </div>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
                  While everyone else gives you the same old "follow your passion" speech, we're busy 
                  building an AI that actually understands what makes you tick.
                </p>
                
                <div className="flex items-center space-x-4">
                  <button onClick={goToAssessment} className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1 hover:scale-105 text-lg">
                    Start Your Career Discovery
                    <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Visual Elements */}
            <div className="relative">
              <div className="relative z-10">
                {/* Floating Career Cards - Simple 5 */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100/80 to-teal-100/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200/50 animate-float">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Career Match</p>
                </div>
                
                <div className="absolute top-20 left-0 w-36 h-36 bg-gradient-to-br from-teal-100/80 to-green-100/80 backdrop-blur-sm rounded-2xl p-5 border border-teal-200/50 animate-float-delayed">
                  <div className="w-9 h-9 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center mb-3">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">AI Analysis</p>
                </div>
                
                <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gradient-to-br from-emerald-100/80 to-teal-100/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200/50 animate-float-slow">
                  <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Growth Path</p>
                </div>
                
                <div className="absolute bottom-1/3 left-0 w-40 h-40 bg-gradient-to-br from-teal-100/80 to-green-100/80 backdrop-blur-sm rounded-2xl p-5 border border-teal-200/50 animate-float">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center mb-3">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Smart Insights</p>
                </div>
                
                <div className="absolute bottom-0 right-10 w-40 h-40 bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-2xl p-5 border border-green-200/50 animate-float-slow">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Detailed Report</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You Actually Get */}
        <div className="mb-20">
          <h2 className="text-3xl lg:text-4xl font-black text-center text-gray-800 mb-12">
            What You Actually Get
          </h2>
          
          <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-emerald-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black mb-6">Your 15-Page Career Blueprint</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Top 5 career matches with detailed explanations</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Salary ranges and job market demand</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Required skills and how to develop them</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Step-by-step action plan for the next 6 months</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 mb-6">
                    <FileText className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-white font-semibold">Comprehensive Report</p>
                  </div>
                  <button onClick={goToAssessment} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1">
                    Get Your Report Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Students Need This */}
        <div className="mb-20">
          <h2 className="text-3xl lg:text-4xl font-black text-center text-gray-800 mb-12">
            The Problem Nobody Talks About
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Career Options Exploded</h4>
                    <p className="text-gray-600">There are 12,000+ career paths today. How do you choose?</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Generic Advice Everywhere</h4>
                    <p className="text-gray-600">"Follow your passion" sounds good but doesn't help you decide.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Everyone Has an Opinion</h4>
                    <p className="text-gray-600">Parents, teachers, friends - they all give different advice.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-100/80 to-teal-100/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Solution?</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We don't tell you what to do. We show you what fits YOU specifically, 
                based on data, not opinions.
              </p>
              <button onClick={goToAssessment} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1">
                Stop Guessing, Start Discovering
              </button>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black mb-4">Ready to End Your Career Confusion?</h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students who finally know what they want to do with their lives. 
                It only takes 15 minutes to get clarity.
              </p>
              <button onClick={goToAssessment} className="bg-white text-emerald-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-white/20 transform hover:-translate-y-1 hover:scale-105 text-lg">
                Start Your 15-Minute Discovery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
