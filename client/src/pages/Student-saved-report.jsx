import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Download, 
  Home, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  User,
  School,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Archive
} from 'lucide-react';
import jsPDF from 'jspdf';

const StudentSavedReport = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [marketInsights, setMarketInsights] = useState('');
  const [learningPaths, setLearningPaths] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    loadSavedReports();
    if (reportId) {
      loadSpecificReport(reportId);
    } else {
      loadMostRecentReport();
    }
  }, [reportId]);

  const loadSavedReports = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedCareerReports') || '[]');
      setSavedReports(saved);
    } catch (err) {
      console.error('Error loading saved reports:', err);
      setSavedReports([]);
    }
  };

  const loadSpecificReport = (id) => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedCareerReports') || '[]');
      const report = saved.find(r => r.id === id);
      
      if (report) {
        setReportData(report.reportData);
        setMarketInsights(report.marketInsights || '');
        setLearningPaths(report.learningPaths || '');
        setLoading(false);
      } else {
        setError('Report not found. Please complete an assessment first to generate reports.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading specific report:', err);
      setError('Failed to load report');
      setLoading(false);
    }
  };

  const loadMostRecentReport = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedCareerReports') || '[]');
      if (saved.length > 0) {
        // Sort by timestamp and get the most recent
        const sortedReports = saved.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        const mostRecent = sortedReports[0];
        
        setReportData(mostRecent.reportData);
        setMarketInsights(mostRecent.marketInsights || '');
        setLearningPaths(mostRecent.learningPaths || '');
        setLoading(false);
      } else {
        setError('No saved reports found. Please complete an assessment first.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load saved reports');
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData?.reportContent) {
      setError('No report data available for export.');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Helper function to check page break
      const checkPageBreak = (requiredSpace = 20) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Helper function to clean text and fix character encoding
      const cleanText = (text) => {
        if (!text) return '';
        return text
          .replace(/â†'/g, '->')  // Fix arrow symbols
          .replace(/â€"/g, '-')   // Fix em dash
          .replace(/â€™/g, "'")   // Fix apostrophe
          .replace(/â€œ/g, '"')   // Fix opening quote
          .replace(/â€/g, '"')    // Fix closing quote
          .replace(/â€¢/g, '•')   // Fix bullet point
          .replace(/â/g, '')      // Remove any remaining â characters
          .replace(/'/g, "'")     // Fix any weird apostrophes
          .replace(/"/g, '"')     // Fix any weird quotes
          .trim();
      };

      // Helper function to add wrapped text
      const addWrappedText = (text, fontSize = 11, isBold = false, indent = 0) => {
        if (!text || text.trim() === '') return;
        
        // Clean the text first
        const cleanedText = cleanText(text);
        
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, isBold ? 'bold' : 'normal');
        
        const effectiveWidth = maxLineWidth - indent;
        
        // Check if text fits on one line first
        const textWidth = pdf.getTextWidth(cleanedText);
        if (textWidth <= effectiveWidth) {
          // Text fits on one line, don't split it
          checkPageBreak(8);
          pdf.text(cleanedText, margin + indent, currentY);
          currentY += fontSize * 0.4 + 2;
        } else {
          // Text needs to be split, but do it manually to avoid spacing issues
          const words = cleanedText.split(' ');
          let currentLine = '';
          
          words.forEach((word, index) => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = pdf.getTextWidth(testLine);
            
            if (testWidth <= effectiveWidth) {
              currentLine = testLine;
            } else {
              // Current line is full, print it and start new line
              if (currentLine) {
                checkPageBreak(8);
                pdf.text(currentLine, margin + indent, currentY);
                currentY += fontSize * 0.4 + 2;
              }
              currentLine = word;
            }
            
            // Print the last line
            if (index === words.length - 1 && currentLine) {
              checkPageBreak(8);
              pdf.text(currentLine, margin + indent, currentY);
              currentY += fontSize * 0.4 + 2;
            }
          });
        }
        
        if (!isBold) currentY += 2;
      };

      // Title Page
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('CAREER ASSESSMENT REPORT', pageWidth/2, currentY + 10, { align: 'center' });
      currentY += 25;

      // Student Info Box
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, currentY, maxLineWidth, 40, 'S');
      currentY += 10;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Student Name: ${reportData.studentData?.name || 'N/A'}`, margin + 5, currentY);
      currentY += 8;
      pdf.text(`Class: ${reportData.studentData?.class || 'N/A'}`, margin + 5, currentY);
      currentY += 8;
      pdf.text(`School: ${reportData.studentData?.school || 'N/A'}`, margin + 5, currentY);
      currentY += 8;
      pdf.text(`Report Date: ${new Date(reportData.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })}`, margin + 5, currentY);
      currentY += 20;

      // PART 1: CAREER PROFILE
      pdf.addPage();
      currentY = margin;
      
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('PART 1: CAREER PROFILE', margin, currentY);
      currentY += 12;
      
      // Parse and add Career Profile sections
      const profileSections = reportData.reportContent.match(/SECTION \d+: ([^\n]+)\n([\s\S]*?)(?=SECTION \d+:|$)/g) || [];
      
      profileSections.forEach((section, index) => {
        const sectionMatch = section.match(/SECTION (\d+): ([^\n]+)\n([\s\S]*)/);
        if (!sectionMatch) return;
        
        const [, sectionNum, sectionTitle, sectionContent] = sectionMatch;
        
        checkPageBreak(25);
        
        // Section header
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        addWrappedText(`${sectionNum}. ${sectionTitle}`, 14, true);
        currentY += 3;
        
        // Process section content
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(11);
        
        const contentLines = sectionContent.trim().split('\n');
        contentLines.forEach(line => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;
          
          // Handle subsection headers (ending with colon)
          if (trimmedLine.endsWith(':') && trimmedLine.length < 50 && !trimmedLine.includes('.')) {
            currentY += 2;
            addWrappedText(trimmedLine, 12, true);
            currentY += 1;
          }
          // Handle numbered items
          else if (/^\d+\./.test(trimmedLine)) {
            addWrappedText(`• ${trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim()}`, 11, false, 5);
          }
          // Handle bullet points
          else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
            addWrappedText(`• ${trimmedLine.replace(/^[-•]\s*/, '')}`, 11, false, 5);
          }
          // Regular text
          else {
            addWrappedText(trimmedLine, 11, false);
          }
        });
        
        currentY += 5;
      });

      // Add Market Insights and Learning Paths sections if available
      if (marketInsights) {
        pdf.addPage();
        currentY = margin;
        
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('PART 2: MARKET INSIGHTS', margin, currentY);
        currentY += 12;
        
        addWrappedText(marketInsights, 11, false);
      }

      if (learningPaths) {
        pdf.addPage();
        currentY = margin;
        
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('PART 3: LEARNING PATHS', margin, currentY);
        currentY += 12;
        
        addWrappedText(learningPaths, 11, false);
      }

      // Add page numbers to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      pdf.save(`${reportData.studentData?.name || 'Student'}_Career_Report_Saved.pdf`);
      
    } catch (err) {
      console.error('PDF Export Error:', err);
      setError('Failed to export PDF. Please try again.');
    }
  };

  const parseCareerProfile = (content) => {
    if (!content || typeof content !== 'string') {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No content available for this section.</p>
        </div>
      );
    }
    
    // Parse sections with proper regex
    const sections = {};
    const sectionRegex = /SECTION (\d+): ([^\n]+)\n([\s\S]*?)(?=SECTION \d+:|$)/g;
    let match;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const [, number, title, sectionContent] = match;
      sections[number] = {
        title: title.trim(),
        content: sectionContent.trim()
      };
    }
    
    // If no sections found, return error message
    if (Object.keys(sections).length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Unable to parse report sections. Please regenerate the report.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {Object.entries(sections)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([number, sectionData]) => (
            <div key={number} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-lg">{number}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{sectionData.title}</h3>
              </div>
              <div className="space-y-4">
                {sectionData.content.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                  const trimmed = line.trim();
                  
                  // Handle section headers within content
                  if (trimmed.endsWith(':') && trimmed.length < 50 && !trimmed.includes('.')) {
                    return (
                      <h4 key={lineIndex} className="font-semibold text-lg text-gray-800 mt-4 mb-2">
                        {trimmed}
                      </h4>
                    );
                  }
                  
                  // Handle numbered lists (1., 2., etc.)
                  if (/^\d+\./.test(trimmed)) {
                    return (
                      <div key={lineIndex} className="flex items-start space-x-3 ml-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{trimmed}</p>
                      </div>
                    );
                  }
                  
                  // Handle bullet points
                  if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                    return (
                      <div key={lineIndex} className="flex items-start space-x-3 ml-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{trimmed.replace(/^[-•]\s*/, '')}</p>
                      </div>
                    );
                  }
                  
                  // Regular paragraphs
                  return (
                    <p key={lineIndex} className="text-gray-700 leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    );
  };

  const parseMarketInsightsFixed = (content) => {
    if (!content || content.trim() === '') return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Market insights not available for this report.</p>
      </div>
    );
    
    return (
      <div className="space-y-8">
        <div className="bg-emerald-50 rounded-lg p-6 border-l-4 border-emerald-500">
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  };

  const parseLearningPaths = (content) => {
    if (!content || content.trim() === '') return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Learning paths not available for this report.</p>
      </div>
    );
    
    return (
      <div className="space-y-8">
        <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Archive className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Loading Saved Report</h2>
              <p className="text-gray-600">Please wait while we retrieve your career report...</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              <p className="text-gray-600 font-medium">Retrieving your saved report...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Saved Reports Found</h2>
          <p className="text-gray-600 mb-6">You haven't completed any career assessments yet. Take the assessment first to generate and save your personalized career report.</p>
          <div className="flex space-x-3 justify-center">
            <button 
              onClick={() => navigate('/SchoolAssessment')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Take Assessment
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if report data is not loaded yet
  if (!reportData || !reportData.reportContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Report Data</h2>
          <p className="text-gray-600 mb-6">The saved report appears to be empty or corrupted.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Saved Career Report</h1>
              <p className="text-gray-600">
                Report generated on {new Date(reportData.timestamp).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'profile' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Career Profile</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'insights' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Market Insights</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('learning')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'learning' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Learning Paths</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'profile' && (
          <div className="space-y-12">
            {/* Student Info Header */}
            {reportData?.studentData && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-medium text-gray-800">{reportData.studentData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium text-gray-800">{reportData.studentData.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <School className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">School</p>
                      <p className="font-medium text-gray-800">{reportData.studentData.school}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Report Date</p>
                      <p className="font-medium text-gray-800">
                        {new Date(reportData.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report Sections */}
            {parseCareerProfile(reportData.reportContent)}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Market Insights</h2>
                <p className="text-gray-600">Current opportunities and industry trends</p>
              </div>
            </div>
            {marketInsights ? (
              <div className="space-y-12">
                {parseMarketInsightsFixed(marketInsights)}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Market insights not available for this report.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Learning Paths</h2>
                <p className="text-gray-600">Educational pathways and skill development</p>
              </div>
            </div>
            {learningPaths ? (
              <div className="space-y-8">
                {parseLearningPaths(learningPaths)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Learning paths not available for this report.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSavedReport;