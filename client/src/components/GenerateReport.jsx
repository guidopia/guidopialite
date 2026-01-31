import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  generateSchoolReport, 
  generateMarketInsights, 
  generateLearningPaths,
  validateAPIKey 
} from '../services/school-Report';
import { 
  Download, 
  Home, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Brain,
  Target,
  TrendingUp,
  Clock,
  User,
  School,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';

const GenerateReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [marketInsights, setMarketInsights] = useState('');
  const [learningPaths, setLearningPaths] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  useEffect(() => {
    const answers = JSON.parse(sessionStorage.getItem('assessmentAnswers') || 'null');
    const assessmentType = sessionStorage.getItem('assessmentType');
    
    if (answers && assessmentType === 'school') {
      generateAllReports(answers);
    } else {
      setError('No assessment data found. Please complete the assessment first.');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [navigate]);

  const generateAllReports = async (answers) => {
    try {
      console.log('🚀 GenerateReport: Starting report generation...');
      console.log('📊 GenerateReport: Answers received:', answers?.length || 0);
      validateAPIKey();
      setLoading(true);
      setError('');

      // Import questions dynamically
      const { default: schoolQuestions } = await import('../data/schoolQuestions');

      // Generate main report
      setCurrentTask('Analyzing your responses...');
      setGenerationProgress(20);
      
      console.log('📝 GenerateReport: Calling generateSchoolReport...');
      const mainReport = await generateSchoolReport(answers, schoolQuestions);
      console.log('✅ GenerateReport: Main report received:', mainReport?.reportContent?.length || 0);
      setReportData(mainReport);
      
      setCurrentTask('Gathering market insights...');
      setGenerationProgress(60);
      
      // Generate market insights
      const insights = await generateMarketInsights(answers, schoolQuestions, mainReport.studentData);
      setMarketInsights(insights);
      
      setCurrentTask('Creating learning pathways...');
      setGenerationProgress(90);
      
      // Generate learning paths
      const paths = await generateLearningPaths(answers, schoolQuestions, mainReport.studentData);
      setLearningPaths(paths);
      
      setCurrentTask('Finalizing your report...');
      setGenerationProgress(100);
      
      // Automatically save the report
      setTimeout(() => {
        autoSaveReport(mainReport, insights, paths);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('❌ GenerateReport: Report generation error:', err);
      console.error('🔍 GenerateReport: Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      setError(err.message || 'An error occurred while generating your report.');
      setLoading(false);
    }
  };

  const autoSaveReport = (mainReport, insights, paths) => {
    try {
      const reportToSave = {
        id: `report_${Date.now()}`,
        reportData: mainReport,
        marketInsights: insights,
        learningPaths: paths,
        savedAt: new Date().toISOString(),
        timestamp: mainReport.timestamp
      };

      // Get existing saved reports
      const existingReports = JSON.parse(localStorage.getItem('savedCareerReports') || '[]');
      
      // Add new report at the beginning
      existingReports.unshift(reportToSave);
      
      // Keep only last 10 reports to avoid localStorage getting too large
      if (existingReports.length > 10) {
        existingReports.splice(10);
      }
      
      // Save to localStorage
      localStorage.setItem('savedCareerReports', JSON.stringify(existingReports));
      
    } catch (err) {
      console.error('Error auto-saving report:', err);
    }
  };

  const handleExportPDF = () => {
    if (!reportData?.reportContent) {
      setError('Please wait for the report to be generated before exporting.');
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

      // PART 2: MARKET INSIGHTS
      pdf.addPage();
      currentY = margin;
      
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('PART 2: MARKET INSIGHTS', margin, currentY);
      currentY += 12;
      
      if (marketInsights) {
        // Clean the content
        const cleanInsights = cleanText(marketInsights)
          .replace(/###\s*/g, '')
          .replace(/####\s*/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '');
        
        const insightSections = ['CAREER FIELD ANALYSIS', 'SKILL REQUIREMENTS', 'EDUCATION PATHWAYS'];
        
        insightSections.forEach((sectionHeader, idx) => {
          const sectionIndex = cleanInsights.indexOf(sectionHeader);
          if (sectionIndex === -1) return;
          
          const nextSectionIndex = idx < insightSections.length - 1 
            ? cleanInsights.indexOf(insightSections[idx + 1])
            : cleanInsights.length;
          
          const sectionContent = cleanInsights
            .substring(sectionIndex + sectionHeader.length, nextSectionIndex)
            .trim();
          
          checkPageBreak(20);
          
          // Section header
          pdf.setFontSize(14);
          pdf.setFont(undefined, 'bold');
          addWrappedText(`${idx + 1}. ${sectionHeader}`, 14, true);
          currentY += 3;
          
          // Section content
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(11);
          
          const paragraphs = sectionContent.split('\n\n').filter(p => p.trim());
          paragraphs.forEach(para => {
            const lines = para.split('\n');
            lines.forEach(line => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return;
              
              // Handle subsections
              if (trimmedLine.includes(':') && trimmedLine.indexOf(':') < 40) {
                currentY += 2;
                addWrappedText(trimmedLine, 12, true);
                currentY += 1;
              }
              // Handle numbered items
              else if (/^\d+\./.test(trimmedLine)) {
                addWrappedText(`• ${trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim()}`, 11, false, 5);
              }
              // Handle bullet points
              else if (trimmedLine.startsWith('-')) {
                addWrappedText(`• ${trimmedLine.substring(1).trim()}`, 11, false, 5);
              }
              // Regular text
              else {
                addWrappedText(trimmedLine, 11, false);
              }
            });
          });
          
          currentY += 5;
        });
      }

      // PART 3: LEARNING PATHS
      pdf.addPage();
      currentY = margin;
      
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('PART 3: LEARNING PATHS', margin, currentY);
      currentY += 12;
      
      if (learningPaths) {
        // Clean the content
        const cleanPaths = cleanText(learningPaths)
          .replace(/###\s*/g, '')
          .replace(/####\s*/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/\#/g, '');
        
        const pathSections = ['ACADEMIC IMPROVEMENT PLAN', 'SKILL DEVELOPMENT ROADMAP', 'RESOURCE RECOMMENDATIONS', 'TIMELINE'];
        
        pathSections.forEach((sectionHeader, idx) => {
          const sectionIndex = cleanPaths.indexOf(sectionHeader);
          if (sectionIndex === -1) return;
          
          const nextSectionIndex = idx < pathSections.length - 1 
            ? cleanPaths.indexOf(pathSections[idx + 1])
            : cleanPaths.length;
          
          const sectionContent = cleanPaths
            .substring(sectionIndex + sectionHeader.length, nextSectionIndex)
            .trim();
          
          checkPageBreak(20);
          
          // Section header
          pdf.setFontSize(14);
          pdf.setFont(undefined, 'bold');
          addWrappedText(`${idx + 1}. ${sectionHeader}`, 14, true);
          currentY += 3;
          
          // Section content
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(11);
          
          const paragraphs = sectionContent.split('\n\n').filter(p => p.trim());
          paragraphs.forEach(para => {
            const lines = para.split('\n');
            lines.forEach(line => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return;
              
              // Handle Month entries in Timeline
              if (trimmedLine.includes('Month 1:') || trimmedLine.includes('Month 2:') || trimmedLine.includes('Month 3:')) {
                currentY += 2;
                addWrappedText(trimmedLine, 12, true);
                currentY += 1;
              }
              // Handle subsections
              else if (trimmedLine.includes(':') && trimmedLine.indexOf(':') < 40) {
                currentY += 2;
                addWrappedText(trimmedLine, 12, true);
                currentY += 1;
              }
              // Handle numbered items
              else if (/^\d+\./.test(trimmedLine)) {
                addWrappedText(`• ${trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim()}`, 11, false, 5);
              }
              // Handle bullet points
              else if (trimmedLine.startsWith('-')) {
                addWrappedText(`• ${trimmedLine.substring(1).trim()}`, 11, false, 5);
              }
              // Regular text
              else {
                addWrappedText(trimmedLine, 11, false);
              }
            });
          });
          
          currentY += 5;
        });
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
      pdf.save(`${reportData.studentData?.name || 'Student'}_Career_Report.pdf`);
      
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
    if (!content || content.trim() === '') return null;
    
    // Clean content - remove formatting symbols
    let cleanContent = content.replace(/###\s*/g, '').replace(/####\s*/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
    
    // Define the expected sections
    const sectionHeaders = [
      'CAREER FIELD ANALYSIS',
      'SKILL REQUIREMENTS',
      'EDUCATION PATHWAYS'
    ];
    
    const sections = {};
    
    // Split content by section headers
    sectionHeaders.forEach((header, index) => {
      const headerIndex = cleanContent.indexOf(header);
      if (headerIndex !== -1) {
        const nextHeaderIndex = index < sectionHeaders.length - 1 
          ? cleanContent.indexOf(sectionHeaders[index + 1])
          : cleanContent.length;
        
        const sectionContent = cleanContent.substring(
          headerIndex + header.length, 
          nextHeaderIndex !== -1 ? nextHeaderIndex : cleanContent.length
        ).trim();
        
        sections[header] = sectionContent;
      }
    });
    
    // If no sections found, create a fallback
    if (Object.keys(sections).length === 0) {
      sections['MARKET INSIGHTS'] = cleanContent;
    }
    
    return (
      <div className="space-y-8">
        {Object.entries(sections).map(([title, content], index) => (
          <div key={index} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">{index + 1}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            </div>
            <div className="space-y-4">
              {content.split('\n\n').filter(para => para.trim()).map((paragraph, pIndex) => {
                const trimmed = paragraph.trim();
                
                // Handle subsections (lines ending with colon)
                if (trimmed.includes(':') && trimmed.split('\n')[0].length < 50) {
                  const lines = trimmed.split('\n');
                  const subTitle = lines[0];
                  const subContent = lines.slice(1).join('\n');
                  
                  return (
                    <div key={pIndex} className="bg-emerald-50 rounded-lg p-6 border-l-4 border-emerald-500">
                      <h4 className="font-semibold text-emerald-800 mb-3">{subTitle}</h4>
                      {subContent && (
                        <div className="space-y-2">
                          {subContent.split('\n').filter(line => line.trim()).map((line, lineIndex) => (
                            <p key={lineIndex} className="text-gray-700 leading-relaxed">
                              {line.trim()}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Regular paragraphs
                return (
                  <p key={pIndex} className="text-gray-700 leading-relaxed text-lg">
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

  const parseLearningPaths = (content) => {
    if (!content || content.trim() === '') return null;
    
    // Clean content - remove all formatting symbols
    let cleanContent = content
      .replace(/###\s*/g, '')
      .replace(/####\s*/g, '')
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\#/g, '');
    
    // Define the expected sections
    const sectionHeaders = [
      'ACADEMIC IMPROVEMENT PLAN',
      'SKILL DEVELOPMENT ROADMAP',
      'RESOURCE RECOMMENDATIONS',
      'TIMELINE'
    ];
    
    const sections = {};
    
    // Split content by section headers
    sectionHeaders.forEach((header, index) => {
      const headerIndex = cleanContent.indexOf(header);
      if (headerIndex !== -1) {
        const nextHeaderIndex = index < sectionHeaders.length - 1 
          ? cleanContent.indexOf(sectionHeaders[index + 1])
          : cleanContent.length;
        
        const sectionContent = cleanContent.substring(
          headerIndex + header.length, 
          nextHeaderIndex !== -1 ? nextHeaderIndex : cleanContent.length
        ).trim();
        
        sections[header] = sectionContent;
      }
    });
    
    // If no sections found, create a fallback
    if (Object.keys(sections).length === 0) {
      sections['LEARNING PATHS'] = cleanContent;
    }
    
    return (
      <div className="space-y-8">
        {Object.entries(sections).map(([title, content], index) => (
          <div key={index} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">{index + 1}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            </div>
            <div className="space-y-4">
              {content.split('\n\n').filter(para => para.trim()).map((paragraph, pIndex) => {
                const trimmed = paragraph.trim();
                
                // Special handling for Timeline section
                if (title === 'TIMELINE') {
                  // Handle monthly goals with beautiful formatting
                  if (trimmed.includes('Month 1:') || trimmed.includes('Month 2:') || trimmed.includes('Month 3:')) {
                    const monthlyGoals = trimmed.split(/Month \d+:/g).filter(goal => goal.trim());
                    const months = trimmed.match(/Month \d+:/g) || [];
                    
                    return (
                      <div key={pIndex} className="space-y-4">
                        {months.map((month, monthIndex) => (
                          <div key={monthIndex} className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                            <h5 className="font-semibold text-green-800 mb-3 text-lg">{month}</h5>
                            <p className="text-gray-700 leading-relaxed">{monthlyGoals[monthIndex]?.trim()}</p>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  // Handle Academic Year Planning
                  if (trimmed.includes('Academic Year Planning:')) {
                    return (
                      <div key={pIndex} className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                        <h5 className="font-semibold text-green-800 mb-3 text-lg">Academic Year Planning:</h5>
                        <p className="text-gray-700 leading-relaxed">{trimmed.replace('Academic Year Planning:', '').trim()}</p>
                      </div>
                    );
                  }
                }
                
                // Handle subsections (lines ending with colon)
                if (trimmed.includes(':') && trimmed.split('\n')[0].length < 50) {
                  const lines = trimmed.split('\n');
                  const subTitle = lines[0];
                  const subContent = lines.slice(1).join('\n');
                  
                  return (
                    <div key={pIndex} className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3">{subTitle}</h4>
                      {subContent && (
                        <div className="space-y-2">
                          {subContent.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                            const trimmedLine = line.trim();
                            
                            // Handle numbered points (1., 2., 3., etc.)
                            if (/^\d+\./.test(trimmedLine)) {
                              return (
                                <div key={lineIndex} className="flex items-start space-x-3 mb-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-gray-700">{trimmedLine}</p>
                                </div>
                              );
                            }
                            
                            // Handle bullet points
                            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                              return (
                                <div key={lineIndex} className="flex items-start space-x-3 mb-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-gray-700">{trimmedLine.replace(/^[-•]\s*/, '')}</p>
                                </div>
                              );
                            }
                            
                            return (
                              <p key={lineIndex} className="text-gray-700">{trimmedLine}</p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Handle lines that start with numbers or bullets
                if (/^\d+\./.test(trimmed) || trimmed.startsWith('-') || trimmed.startsWith('•')) {
                  return (
                    <div key={pIndex} className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <p className="text-gray-800 font-medium">{trimmed}</p>
                    </div>
                  );
                }
                
                // Regular paragraphs
                return (
                  <p key={pIndex} className="text-gray-700 leading-relaxed text-lg">
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Brain className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Generating Your Career Report</h2>
              <p className="text-gray-600">Our AI is analyzing your responses to create personalized recommendations</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-emerald-600 font-medium mt-3">{generationProgress}% Complete</p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              <p className="text-gray-600 font-medium">{currentTask}</p>
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
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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

  // Don't render if report data is not loaded yet
  if (!reportData || !reportData.reportContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Loading Report</h2>
          <p className="text-gray-600 mb-6">Please wait while we generate your personalized career report...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">Your Personalized Career Report</h1>
              <p className="text-gray-600">
                Based on your assessment completed on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
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
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-800">
                        {new Date(reportData.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report Sections - Direct parse and render */}
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
                <p className="text-gray-500">Market insights are being generated...</p>
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
                <p className="text-gray-500">Learning paths are being generated...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateReport;