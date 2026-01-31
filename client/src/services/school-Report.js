import openaiService from './openai-service';

// Enhanced school report prompt for highly personalized career reports
const createSchoolReportPrompt = (studentData) => `
You are an expert career counselor specializing in Indian school students (grades 9-12). Your task is to analyze comprehensive assessment responses and generate a highly personalized career report.

STUDENT INFORMATION:
Name: ${studentData.name}
Class: ${studentData.class}
School: ${studentData.school}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

CRITICAL FORMATTING INSTRUCTIONS - FOLLOW EXACTLY:
- Generate EXACTLY 7 sections, no more, no less
- Use EXACTLY this structure with clear section headers
- Each section must be clearly separated by exactly "SECTION X: TITLE"
- Make every recommendation specific to this student's responses
- Reference their actual answers, not generic advice
- Use consistent formatting and proper line breaks
- DO NOT create any additional sections
- DO NOT create any "CAREER PROFILE" section
- DO NOT create any nested headings or sub-sections
- Use clean, professional formatting without excessive punctuation (single exclamation marks only)
- Format recommendations as: "Trait leads to Career path" (use simple text, no special symbols)

Generate a report with EXACTLY these 7 sections and NO OTHERS:

SECTION 1: INTRODUCTION

Welcome, ${studentData.name}! As a student in ${studentData.class} at ${studentData.school}, you are at a critical juncture in your academic journey. This report aims to guide you in your stream selection, based on your unique interests and strengths. We've analyzed your responses in the comprehensive assessment and will be providing personalized recommendations catering to your preferences in [mention their specific interests from responses].

SECTION 2: STUDENT PROFILE SUMMARY

Core Personality: [Analyze their personality responses - be specific about their type]

Key Strengths: 
1. [Specific strength 1 from their aptitude and responses]
2. [Specific strength 2 from their aptitude and responses]
3. [Specific strength 3 from their aptitude and responses]
4. [Specific strength 4 from their aptitude and responses]

Dominant Aptitude: [Based on their academic preferences and performance]

Main Interests: [From their interests and hobbies responses]

Recommendations:
1. [Personality Trait] leads to [Career field connection]
2. [Key Aptitude] leads to [Career paths this leads to]
3. [Leadership/Social Quality] leads to [Management/entrepreneurial opportunities]
4. [Interest Area] leads to [Specific aligned careers]

Note: Format each recommendation as "Trait leads to Career path" with clean, professional text. Avoid special symbols or characters.

SECTION 3: STREAM RECOMMENDATION

We recommend the [Science/Commerce/Arts] stream for you. Here's why:

1. [Reason based on their intelligence-type]
2. [Reason based on their career interests]  
3. [Reason based on their aptitude answer results]
4. [Reason based on their personality and goals]

SECTION 4: CAREER RECOMMENDATIONS

Top Career Matches:

1. [Career Title] — [Why it matches their specific responses and interests]
2. [Career Title] — [Why it matches their specific responses and interests]
3. [Career Title] — [Why it matches their specific responses and interests]
4. [Career Title] — [Why it matches their specific responses and interests]

SECTION 5: SUGGESTED ACTION PLAN

Immediate steps you can take:

1. [Specific action based on their current class and interests]
2. [Specific action for skill development]
3. [Specific action for academic focus]
4. [Specific action for extracurricular activities]
5. [Specific action for career exploration]

SECTION 6: SUMMARY SNAPSHOT

Recommended Stream: [Specific stream recommendation]

Best Career Paths: 
1. [Career path 1]
2. [Career path 2]
3. [Career path 3]
4. [Career path 4]

Why It Fits: [2-3 sentence summary explaining the perfect alignment with their responses]

SECTION 7: FINAL NOTE

Instead of trying to "fit everywhere," ${studentData.name} should focus on [specific area] careers where your natural abilities in [their strength] and interest in [their interest] will give you the strongest advantage. Your [personality trait] combined with [aptitude] makes you naturally suited for [career field].

FINAL REMINDER:
- Generate EXACTLY 7 sections, no more, no less
- DO NOT create any "CAREER PROFILE" section
- DO NOT create any additional sections
- Follow the structure above exactly
- Base everything on their specific assessment responses
- Make it feel like you personally analyzed ${studentData.name}'s responses
- Use only simple text formatting, no special symbols or arrows
`;

// Enhanced market insights prompt for school students
const createMarketInsightsPrompt = (studentData) => `
You are a career market expert for Indian school students. Create structured, actionable market insights.

STUDENT PROFILE:
- Name: ${studentData.name}
- Class: ${studentData.class}
- Interests: ${studentData.interests?.join(', ') || 'General'}
- Career Areas: ${studentData.careerInterests?.join(', ') || 'Exploring'}

CRITICAL FORMATTING: Structure your response EXACTLY like this with clear section breaks and proper formatting:

CAREER FIELD ANALYSIS

[Write 3-4 detailed sentences about growth trends in their interest areas, current job market demand in India, and salary expectations from entry-level to senior positions. Be specific with numbers and trends.]

SKILL REQUIREMENTS

Current Skills:
1. [Current skill 1 needed in their interest areas]
2. [Current skill 2 needed in their interest areas]
3. [Current skill 3 needed in their interest areas]
4. [Current skill 4 needed in their interest areas]

Emerging Skills:
1. [Emerging skill 1 for next 5 years]
2. [Emerging skill 2 for next 5 years]
3. [Emerging skill 3 for next 5 years]

Development Methods:
1. [Specific method 1 to develop these skills during school]
2. [Specific method 2 to develop these skills during school]
3. [Specific method 3 to develop these skills during school]

EDUCATION PATHWAYS

Top Colleges:
1. [Specific college/university 1 for their interests]
2. [Specific college/university 2 for their interests]
3. [Specific college/university 3 for their interests]
4. [Specific college/university 4 for their interests]

Key Entrance Exams:
1. [Relevant entrance exam 1 they should prepare for]
2. [Relevant entrance exam 2 they should prepare for]

Academic Timeline:
1. [Specific timeline item 1 for academic planning from their current class]
2. [Specific timeline item 2 for academic planning from their current class]

IMPORTANT:
- Use consistent numbering (1., 2., 3.) for all lists
- Keep each section clearly separated
- Make all recommendations specific and actionable
- Avoid generic advice
- Use proper line breaks between sections
`;

// Enhanced learning paths prompt for school students
const createLearningPathsPrompt = (studentData) => `
You are an education counselor for Indian school students. Create actionable, personalized learning pathways.

STUDENT PROFILE:
- Name: ${studentData.name}
- Class: ${studentData.class}
- Favorite Subjects: ${studentData.favoriteSubjects?.join(', ') || 'Not specified'}
- Challenging Subjects: ${studentData.challengingSubjects?.join(', ') || 'Not specified'}
- Career Interests: ${studentData.careerInterests?.join(', ') || 'Exploring'}

CRITICAL FORMATTING: Structure your response EXACTLY like this with clear section breaks and proper formatting:

ACADEMIC IMPROVEMENT PLAN

For Challenging Subjects:
1. [Specific strategy 1 for their challenging subjects]
2. [Specific strategy 2 for their challenging subjects]
3. [Specific strategy 3 for their challenging subjects]

For Favorite Subjects:
1. [Way to excel further in favorite subjects]
2. [Advanced opportunities in favorite subjects]

SKILL DEVELOPMENT ROADMAP

Technical Skills:
1. [Technical skill 1 relevant to their career interests]
2. [Technical skill 2 relevant to their career interests]
3. [Technical skill 3 relevant to their career interests]

Soft Skills:
1. [Soft skill 1 they should develop]
2. [Soft skill 2 they should develop]

RESOURCE RECOMMENDATIONS

Online Courses:
- [Platform 1]: [Specific course recommendation]
- [Platform 2]: [Specific course recommendation]

Books:
- [Book title 1] by [Author]
- [Book title 2] by [Author]

Competitions:
- [Competition 1 relevant to their interests]
- [Competition 2 relevant to their interests]

TIMELINE

Month 1: [Specific goal for month 1]
Month 2: [Specific goal for month 2]
Month 3: [Specific goal for month 3]

Academic Year Planning: [Yearly goals and milestones for their current class]

IMPORTANT: 
- Use consistent numbering (1., 2., 3.) for lists
- Keep subsections clearly separated with colons
- Make all recommendations specific to their current grade level and interests
- Ensure everything is actionable and practical
- Use proper line breaks between sections
`;

// Function to extract student data from assessment responses
const extractStudentData = (answers, questions) => {
  const studentData = {
    name: answers[0] || "Student",
    class: answers[1] || "Not specified",
    school: answers[2] || "Not specified",
    interests: [],
    favoriteSubjects: [],
    challengingSubjects: [],
    careerInterests: [],
    personalityTraits: [],
    aptitudeResults: [],
    stream: "Not determined"
  };

  // Extract interests from questions 22-27 (interests section)
  for (let i = 21; i <= 26; i++) {
    if (answers[i]) {
      if (i === 25) { // Career areas question (checkbox)
        studentData.careerInterests = answers[i].split(', ');
      } else {
        studentData.interests.push(answers[i]);
      }
    }
  }

  // Extract favorite and challenging subjects (questions 28-29)
  if (answers[27]) studentData.favoriteSubjects = answers[27].split(', ');
  if (answers[28]) studentData.challengingSubjects = answers[28].split(', ');

  // Extract personality traits from questions 4-9
  for (let i = 3; i <= 8; i++) {
    if (answers[i]) {
      studentData.personalityTraits.push(answers[i]);
    }
  }

  // Extract aptitude results from questions 16-21
  for (let i = 15; i <= 20; i++) {
    if (answers[i]) {
      studentData.aptitudeResults.push(answers[i]);
    }
  }

  return studentData;
};

// Function to format assessment responses for AI processing
const formatAssessmentData = (answers, questions) => {
  const formattedData = [];
  
  answers.forEach((answer, index) => {
    if (index < questions.length && answer && answer.trim() !== '') {
      const question = questions[index];
      formattedData.push({
        category: question.category,
        question: question.question,
        answer: answer,
        type: question.type
      });
    }
  });

  return formattedData;
};

// Main function to generate personalized school report
export const generateSchoolReport = async (answers, questions) => {
  try {
    // Extract student data for personalization
    const studentData = extractStudentData(answers, questions);
    
    // Format assessment data
    const formattedData = formatAssessmentData(answers, questions);
    const assessmentContext = formattedData
      .map(item => `${item.category.toUpperCase()}: ${item.question}\nAnswer: ${item.answer}`)
      .join('\n\n');

    // Create personalized prompt
    const prompt = createSchoolReportPrompt(studentData);
    
    // Prepare messages for OpenAI
    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `Generate a highly personalized career report for ${studentData.name} based on their assessment responses:\n\n${assessmentContext}`,
      },
    ];

    // Call backend OpenAI service
    const response = await openaiService.generateSchoolReport(messages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 4000
    });

    return {
      studentData,
      reportContent: response.reportContent,
      timestamp: response.timestamp
    };
  } catch (error) {
    console.error("❌ Error generating school report:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
    
    // Enhanced error handling
    if (error.status === 429) {
      throw new Error("API rate limit exceeded. Please try again in a few minutes.");
    } else if (error.status === 401) {
      throw new Error("API key error. Please check your OpenAI API key.");
    } else if (error.status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(error.message || "An unexpected error occurred while generating the report.");
    }
  }
};

// Function to generate market insights
export const generateMarketInsights = async (answers, questions, studentData) => {
  try {
    const prompt = createMarketInsightsPrompt(studentData || extractStudentData(answers, questions));
    const formattedData = formatAssessmentData(answers, questions);
    const assessmentContext = formattedData
      .map(item => `${item.category.toUpperCase()}: ${item.question}\nAnswer: ${item.answer}`)
      .join('\n\n');

    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `Generate market insights based on assessment responses:\n\n${assessmentContext}`,
      },
    ];

    const response = await openaiService.generateMarketInsights(messages, {
      model: "gpt-3.5-turbo-16k",
      temperature: 0.7,
      max_tokens: 3000
    });

    return response.insights;
  } catch (error) {
    console.error("Error generating market insights:", error);
    throw error;
  }
};

// Function to generate learning paths
export const generateLearningPaths = async (answers, questions, studentData) => {
  try {
    const prompt = createLearningPathsPrompt(studentData || extractStudentData(answers, questions));
    const formattedData = formatAssessmentData(answers, questions);
    const assessmentContext = formattedData
      .map(item => `${item.category.toUpperCase()}: ${item.question}\nAnswer: ${item.answer}`)
      .join('\n\n');

    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `Generate learning paths based on assessment responses:\n\n${assessmentContext}`,
      },
    ];

    const response = await openaiService.generateLearningPaths(messages, {
      model: "gpt-3.5-turbo-16k",
      temperature: 0.7,
      max_tokens: 3000
    });

    return response.learningPaths;
  } catch (error) {
    console.error("Error generating learning paths:", error);
    throw error;
  }
};

// Utility function to validate API key
export const validateAPIKey = async () => {
  try {
    return await openaiService.validateAPIKey();
  } catch (error) {
    throw new Error("OpenAI service is not available. Please check backend configuration.");
  }
};

// Utility function to estimate token usage
export const estimateTokenUsage = (text) => {
  return openaiService.estimateTokenUsage(text);
};

export default {
  generateSchoolReport,
  generateMarketInsights,
  generateLearningPaths,
  validateAPIKey,
  estimateTokenUsage
};