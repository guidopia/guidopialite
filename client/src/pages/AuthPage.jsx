import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Mail, Lock, GraduationCap, Sparkles, Zap, Brain, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    class: '',
    phone: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signup, login, error, clearError, isAuthenticated, isAdmin: userIsAdmin } = useAuth();

  const careerWords = ['FUTURE', 'PASSION', 'SUCCESS', 'DESTINY'];

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (userIsAdmin()) {
        navigate('/admin');
      } else {
        navigate('/landing');
      }
    }
  }, [isAuthenticated, userIsAdmin, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % careerWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Clear errors when switching between signup and login
  useEffect(() => {
    setErrors({});
    setLocalError('');
    clearError();
    // Reset form data when switching modes
    setFormData({
      fullName: '',
      class: '',
      phone: '',
      email: '',
      password: ''
    });
  }, [isSignUp, isAdmin, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const previousValue = formData[name];
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Only clear auth errors when user actually types (value changes)
    if (value !== previousValue && value.length > 0) {
      if (error) {
        clearError();
      }
      if (localError) {
        setLocalError('');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp && !isAdmin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters';
      }

      if (!formData.class) {
        newErrors.class = 'Please select a class/grade';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Enter a valid phone number';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && !isAdmin && formData.password.length < 8) {
      newErrors.password = 'Password must be 8+ characters';
    } else if (isSignUp && !isAdmin && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Must contain uppercase, lowercase, number & special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear any previous errors
    setLocalError('');
    clearError();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isSignUp && !isAdmin) {
        // Student signup
        result = await signup(formData);
      } else {
        // Login (both admin and student)
        result = await login({
          email: formData.email,
          password: formData.password
        });
      }

      if (result && result.success) {
        console.log('Auth success:', result.message);
        console.log('Result data:', result.data);
        console.log('Redirect URL:', result.data?.redirectUrl);
        
        // Navigate based on redirectUrl from backend
        if (result.data && result.data.redirectUrl) {
          console.log('Navigating to:', result.data.redirectUrl);
          navigate(result.data.redirectUrl);
        } else if (result.data && result.data.user) {
          // Fallback navigation logic
          console.log('Using fallback navigation, user role:', result.data.user.role);
          if (result.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/landing');
          }
        }
        return;
      }
      
      // Handle authentication failure
      if (result && !result.success) {
        setLocalError(result.error);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setLocalError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  const hasFieldError = (fieldName) => {
    return !!errors[fieldName];
  };

  // Get the current error to display (prioritize local error, then auth context error)
  const currentError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 relative overflow-hidden">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Company Name Header */}
      <div className="relative z-10 pt-6 pb-4">
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 tracking-tight">
            GUIDOPIA
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-1 rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-[calc(100vh-120px)] py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            
            {/* Left Side - Auth Form */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-6 w-full max-w-md hover:shadow-2xl hover:bg-white/80 transition-all duration-300">
                
                {/* Admin/Student Toggle */}
                <div className="mb-6">
                  <div className="flex relative bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setIsAdmin(false)}
                      className={`flex-1 py-2 px-3 text-center text-sm font-semibold rounded-lg transition-all duration-300 ${
                        !isAdmin 
                          ? 'bg-white text-emerald-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      onClick={() => setIsAdmin(true)}
                      className={`flex-1 py-2 px-3 text-center text-sm font-semibold rounded-lg transition-all duration-300 ${
                        isAdmin 
                          ? 'bg-white text-emerald-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {/* Header Toggle */}
                <div className="mb-6">
                  <div className="flex relative">
                    <button
                      onClick={() => setIsSignUp(true)}
                      className={`flex-1 py-2 text-center font-semibold transition-all duration-300 ${
                        isSignUp ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {isAdmin ? 'Admin Login' : 'Sign Up'}
                    </button>
                    {!isAdmin && (
                      <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 text-center font-semibold transition-all duration-300 ${
                          !isSignUp ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Login
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <div className="h-0.5 bg-gray-200 rounded-full"></div>
                    <div 
                      className={`absolute top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out ${
                        isAdmin ? 'left-0 w-full' : (isSignUp ? 'left-0 w-1/2' : 'left-1/2 w-1/2')
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Error Message */}
                {currentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm leading-relaxed break-words">{currentError}</p>
                    </div>
                  </div>
                )}

                {/* Form Container */}
                <div className="space-y-4">
                  
                  {/* Sign Up Fields - Only for Students */}
                  {isSignUp && !isAdmin && (
                    <>
                      <div className="space-y-1">
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                          <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-3 bg-white/60 border rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white/80 focus:ring-1 transition-all duration-300 text-sm hover:bg-white/70 ${
                              hasFieldError('fullName') 
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                                : 'border-gray-200/50 focus:border-emerald-400 focus:ring-emerald-200 hover:border-emerald-300/50'
                            }`}
                          />
                        </div>
                        {hasFieldError('fullName') && (
                          <p className="text-red-500 text-xs ml-1 leading-tight">{getFieldError('fullName')}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="relative group">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                          <select
                            name="class"
                            value={formData.class}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-3 bg-white/60 border rounded-xl text-gray-800 focus:outline-none focus:bg-white/80 focus:ring-1 transition-all duration-300 appearance-none cursor-pointer text-sm hover:bg-white/70 ${
                              hasFieldError('class') 
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                                : 'border-gray-200/50 focus:border-emerald-400 focus:ring-emerald-200 hover:border-emerald-300/50'
                            }`}
                          >
                            <option value="">Select Class</option>
                            <option value="6th">6th Grade</option>
                            <option value="7th">7th Grade</option>
                            <option value="8th">8th Grade</option>
                            <option value="9th">9th Grade</option>
                            <option value="10th">10th Grade</option>
                            <option value="11th">11th Grade</option>
                            <option value="12th">12th Grade</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {hasFieldError('class') && (
                          <p className="text-red-500 text-xs ml-1 leading-tight">{getFieldError('class')}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-3 bg-white/60 border rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white/80 focus:ring-1 transition-all duration-300 text-sm hover:bg-white/70 ${
                              hasFieldError('phone') 
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                                : 'border-gray-200/50 focus:border-emerald-400 focus:ring-emerald-200 hover:border-emerald-300/50'
                            }`}
                          />
                        </div>
                        {hasFieldError('phone') && (
                          <p className="text-red-500 text-xs ml-1 leading-tight">{getFieldError('phone')}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Email Field - For Both */}
                  <div className="space-y-1">
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                      <input
                        type="email"
                        name="email"
                        placeholder={isAdmin ? "Admin Email" : "Email Address"}
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 bg-white/60 border rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white/80 focus:ring-1 transition-all duration-300 text-sm hover:bg-white/70 ${
                          hasFieldError('email') 
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                            : 'border-gray-200/50 focus:border-emerald-400 focus:ring-emerald-200 hover:border-emerald-300/50'
                        }`}
                      />
                    </div>
                    {hasFieldError('email') && (
                      <p className="text-red-500 text-xs ml-1 leading-tight">{getFieldError('email')}</p>
                    )}
                  </div>

                  {/* Password Field - For Both */}
                  <div className="space-y-1">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={isAdmin ? "Admin Password" : "Password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 bg-white/60 border rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white/80 focus:ring-1 transition-all duration-300 text-sm hover:bg-white/70 ${
                          hasFieldError('password') 
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                            : 'border-gray-200/50 focus:border-emerald-400 focus:ring-emerald-200 hover:border-emerald-300/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-600 focus:outline-none hover:scale-110 transition-all duration-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {hasFieldError('password') && (
                      <p className="text-red-500 text-xs ml-1 leading-tight">{getFieldError('password')}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1 hover:scale-[1.02] text-sm flex items-center justify-center space-x-2 mt-6 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>
                        {isAdmin 
                          ? 'Admin Login' 
                          : (isSignUp ? 'Start Your Journey' : 'Welcome Back')
                        }
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-xs">
                    {isAdmin 
                      ? 'Need student access?' 
                      : (isSignUp ? 'Already have an account?' : "Don't have an account?")
                    }{' '}
                    <button
                      onClick={() => setIsAdmin(!isAdmin)}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-300 hover:underline"
                    >
                      {isAdmin ? 'Student Login' : 'Admin Login'}
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Creative Content */}
            <div className="lg:col-span-3 lg:pl-4">
              <div className="space-y-8">
                
                {/* Animated Main Headline */}
                <div className="relative">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-800 leading-tight mb-4">
                    <span className="inline-block">UNLOCK YOUR</span>{' '}
                    <span 
                      key={currentWord}
                      className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 animate-pulse"
                    >
                      {careerWords[currentWord]}
                    </span>
                  </h2>
                  <div className="flex items-center space-x-2 mb-6 flex-wrap">
                    <GraduationCap className="w-6 h-6 text-emerald-600 animate-pulse" />
                    <p className="text-lg lg:text-xl text-gray-600 font-medium">
                      AI-powered career discovery that changes everything
                    </p>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>

                {/* Creative Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group bg-gradient-to-br from-gray-800 via-gray-900 to-black backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg">Smart AI Analysis</h3>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">Get personalized insights based on your unique personality and interests</p>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-gray-800 via-gray-900 to-black backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-teal-500/20 to-transparent rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                          <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg">Future-Focused</h3>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">Explore careers that are growing and in high demand today</p>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-2xl p-6 text-white relative overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                      <span className="text-emerald-400 font-semibold text-sm">Ready to start?</span>
                    </div>
                    <h3 className="text-xl font-black mb-2">Discover your perfect career match</h3>
                    <p className="text-gray-300 text-sm">Take the assessment that reveals your hidden potential and opens doors to your dream career.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;