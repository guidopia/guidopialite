import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import schoolQuestions from '../data/schoolQuestions';
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Brain, Target, FileText } from 'lucide-react';

const SchoolAssessment = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(schoolQuestions.length).fill(''));
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Calculate progress percentage
    const completed = answers.filter(answer => answer !== '').length;
    const total = schoolQuestions.length;
    setProgress(Math.floor((completed / total) * 100));

    // Check if assessment is complete
    setIsComplete(completed === total);
  }, [answers]);

  const handleSingleOptionChange = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
    setValidationError('');
  };

  const handleTextInputChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setValidationError('');
  };

  const handleMultiOptionChange = (option) => {
    const currentAnswer = answers[currentQuestion] ? answers[currentQuestion].split(', ') : [];
    let newAnswer;

    if (currentAnswer.includes(option)) {
      // Remove option if already selected
      newAnswer = currentAnswer.filter(item => item !== option);
    } else {
      // Add option if not at max limit
      const question = schoolQuestions[currentQuestion];
      if (currentAnswer.length < (question.max || Infinity)) {
        newAnswer = [...currentAnswer, option];
      } else {
        setValidationError(`You can only select up to ${question.max} options`);
        return;
      }
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = newAnswer.join(', ');
    setAnswers(newAnswers);
    setValidationError('');
  };

  const isOptionSelected = (option) => {
    if (answers[currentQuestion]) {
      return answers[currentQuestion].split(', ').includes(option);
    }
    return false;
  };

  const goToNextQuestion = () => {
    if (!answers[currentQuestion] || answers[currentQuestion].trim() === '') {
      setValidationError('Please provide an answer to continue');
      return;
    }

    if (currentQuestion < schoolQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setValidationError('');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setValidationError('');
    }
  };

  const handleGenerateReport = () => {
    if (isComplete) {
      // Store answers in sessionStorage for the report page
      sessionStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      sessionStorage.setItem('assessmentType', 'school');
      
      // Navigate to the report generation page
      navigate('/generate-report');
    } else {
      setValidationError('Please complete all questions before generating a report');
    }
  };

  const currentQuestionData = schoolQuestions[currentQuestion];

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      basic_info: 'Basic Information',
      personality: 'Personality Assessment',
      intelligence: 'Intelligence Type',
      aptitude: 'Aptitude Test',
      interests: 'Interests & Values',
      academics: 'Academic Preferences',
      career_values: 'Career Values',
      work_style: 'Work Style'
    };
    return categoryMap[category] || category;
  };

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
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .input-focus:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          border-color: #10b981;
        }
      `}</style>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl opacity-20 animate-float"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl opacity-20 animate-float-delayed"></div>

      {/* Company Name Header */}
      <div className="relative z-10 pt-6 pb-4">
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 tracking-tight">
            GUIDOPIA
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-1 rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50 rounded-full px-6 py-3 mb-6">
            <Brain className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold text-sm">Career Discovery Assessment</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
              Discover Your Perfect Career Path
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer these questions to get personalized career recommendations based on your personality, interests, and goals.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {schoolQuestions.length}</span>
            <span>{progress}% Complete</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="relative mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-emerald-200/50 shadow-xl">
            
            {/* Category Badge */}
            <div className="flex justify-between items-center mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-full">
                {getCategoryDisplayName(currentQuestionData.category)}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {currentQuestionData.type === 'radio' ? 'Select one' : 
                 currentQuestionData.type === 'checkbox' ? `Select up to ${currentQuestionData.max || 'multiple'}` : 
                 'Type your answer'}
              </span>
            </div>

            {/* Question */}
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-8 leading-tight">
              {currentQuestionData.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {currentQuestionData.type === 'text' ? (
                // Text input
                <div>
                  <input
                    type="text"
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleTextInputChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-emerald-500 input-focus transition-all duration-200"
                  />
                </div>
              ) : currentQuestionData.type === 'radio' ? (
                // Single-select options
                currentQuestionData.options.map((option, index) => (
                  <div
                    key={index}
                    className={`group flex items-center p-4 lg:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg
                      ${answers[currentQuestion] === option
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'}`}
                    onClick={() => handleSingleOptionChange(option)}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-4 flex items-center justify-center transition-all duration-200
                      ${answers[currentQuestion] === option
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300 group-hover:border-emerald-400'}`}
                    >
                      {answers[currentQuestion] === option && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                    <label className="flex-grow cursor-pointer text-gray-700 text-lg font-medium">{option}</label>
                  </div>
                ))
              ) : (
                // Multi-select options
                currentQuestionData.options.map((option, index) => (
                  <div
                    key={index}
                    className={`group flex items-center p-4 lg:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg
                      ${isOptionSelected(option)
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'}`}
                    onClick={() => handleMultiOptionChange(option)}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mr-4 flex items-center justify-center transition-all duration-200
                      ${isOptionSelected(option)
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300 group-hover:border-emerald-400'}`}
                    >
                      {isOptionSelected(option) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <label className="flex-grow cursor-pointer text-gray-700 text-lg font-medium">{option}</label>
                  </div>
                ))
              )}
            </div>

            {/* Error message */}
            {validationError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
                <AlertTriangle size={20} className="mr-3 flex-shrink-0 text-red-500" />
                <p className="font-medium">{validationError}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestion === 0}
                className={`group inline-flex items-center justify-center py-3 px-6 rounded-xl font-semibold transition-all duration-200
                  ${currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300'}`}
              >
                <ArrowLeft size={18} className="mr-2" />
                Previous
              </button>

              {currentQuestion < schoolQuestions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  disabled={!answers[currentQuestion] || answers[currentQuestion].trim() === ''}
                  className={`group inline-flex items-center justify-center py-3 px-8 rounded-xl font-bold transition-all duration-200 shadow-lg
                    ${!answers[currentQuestion] || answers[currentQuestion].trim() === ''
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-emerald-500/30 transform hover:-translate-y-0.5'}`}
                >
                  Next Question
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleGenerateReport}
                  disabled={!isComplete}
                  className={`group inline-flex items-center justify-center py-3 px-8 rounded-xl font-bold transition-all duration-200 shadow-lg
                    ${!isComplete
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-emerald-500/30 transform hover:-translate-y-0.5'}`}
                >
                  <FileText size={18} className="mr-2" />
                  Generate Career Report
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Incomplete assessment warning */}
        {!isComplete && currentQuestion === schoolQuestions.length - 1 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-8">
            <div className="flex items-start">
              <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-200 mr-4">
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-yellow-800 font-bold text-lg mb-2">
                  Almost There! {schoolQuestions.length - answers.filter(a => a !== '').length} Questions Remaining
                </h4>
                <p className="text-yellow-700 mb-4">
                  Complete all questions to get your personalized career recommendations.
                </p>
                <button
                  onClick={() => setCurrentQuestion(answers.findIndex(a => a === ''))}
                  className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  Go to Next Question
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-emerald-200/50 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p>© 2025 GUIDOPIA • Guiding Futures with Precision</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAssessment;