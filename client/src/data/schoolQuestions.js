// Career Guidance Assessment Questions for School Students (Grades 9-12)
const schoolQuestions = [
    // Basic Information
    {
      id: 1,
      question: "Name:",
      type: "text",
      category: "basic_info"
    },
    {
      id: 2,
      question: "Class/Grade:",
      type: "radio",
      options: ["9th", "10th", "11th", "12th"],
      category: "basic_info"
    },
    {
      id: 3,
      question: "School Name:",
      type: "text",
      category: "basic_info"
    },
    
    // Part A: Personality Type (6 Questions)
    {
      id: 4,
      question: "When working in a group, you usually:",
      type: "radio",
      options: [
        "Prefer to take the lead and organize tasks",
        "Support others and maintain harmony",
        "Share creative ideas and out-of-the-box solutions",
        "Stick to completing your part independently"
      ],
      category: "personality"
    },
    {
      id: 5,
      question: "You make decisions mostly based on:",
      type: "radio",
      options: [
        "Logic and facts",
        "Personal values and emotions"
      ],
      category: "personality"
    },
    {
      id: 6,
      question: "Which environment energizes you more?",
      type: "radio",
      options: [
        "Talking with many people, networking",
        "Quiet time, thinking alone"
      ],
      category: "personality"
    },
    {
      id: 7,
      question: "If given a project deadline, you are more likely to:",
      type: "radio",
      options: [
        "Plan well in advance and stick to schedule",
        "Work last minute, but pull it off"
      ],
      category: "personality"
    },
    {
      id: 8,
      question: "You are more comfortable with:",
      type: "radio",
      options: [
        "Clear rules and structure",
        "Flexibility and freedom"
      ],
      category: "personality"
    },
    {
      id: 9,
      question: "You solve problems by:",
      type: "radio",
      options: [
        "Following step-by-step methods",
        "Trying new creative approaches"
      ],
      category: "personality"
    },
    
    // Part B: Intelligence Type (6 Questions)
    {
      id: 10,
      question: "You remember things best when you:",
      type: "radio",
      options: [
        "Hear them explained",
        "See diagrams or pictures",
        "Do it practically",
        "Write/read notes"
      ],
      category: "intelligence"
    },
    {
      id: 11,
      question: "You enjoy:",
      type: "radio",
      options: [
        "Solving puzzles or math challenges",
        "Writing poems/stories",
        "Playing sports or physical activities",
        "Playing music/singing",
        "Observing nature/animals",
        "Working in groups/leading friends"
      ],
      category: "intelligence"
    },
    {
      id: 12,
      question: "Which activity excites you most?",
      type: "radio",
      options: [
        "Coding a program",
        "Acting in a drama",
        "Painting/sketching",
        "Organizing an event",
        "Doing a science experiment"
      ],
      category: "intelligence"
    },
    {
      id: 13,
      question: "People usually praise you for:",
      type: "radio",
      options: [
        "Being logical and smart",
        "Being helpful and kind",
        "Being creative/artistic",
        "Being confident leader"
      ],
      category: "intelligence"
    },
    {
      id: 14,
      question: "If you had free time, you'd rather:",
      type: "radio",
      options: [
        "Read about new scientific discoveries",
        "Learn a new musical instrument",
        "Participate in debate/quiz",
        "Help in social causes",
        "Play sports/games"
      ],
      category: "intelligence"
    },
    
    {
      id: 15,
      question: "Which stream you prefer?",
      type: "radio",
      options: [
        "non-medical",
        "medical",
        "commerce",
        "arts",
        "not decided yet (help me to decide)"
      ],
      category: "intelligence"
    },
    
    // Part C: Aptitude (6 Questions)
    {
      id: 16,
      question: "What is the next number in the series: 2, 4, 8, 16, ?",
      type: "radio",
      options: ["18", "24", "32", "64"],
      category: "aptitude"
    },
    {
      id: 17,
      question: "If APPLE = 50, and BALL = 27, then CAT = ?",
      type: "radio",
      options: ["24", "30", "35", "40"],
      category: "aptitude"
    },
    {
      id: 18,
      question: "Which shape completes the sequence?",
      type: "radio",
      options: ["Square", "Triangle", "Hexagon", "Circle"],
      category: "aptitude"
    },
    {
      id: 19,
      question: "A train moves at 60 km/h. How far will it travel in 2.5 hours?",
      type: "radio",
      options: ["100 km", "120 km", "150 km", "180 km"],
      category: "aptitude"
    },
    {
      id: 20,
      question: "Choose the pair that relates the same way as: Book : Reading",
      type: "radio",
      options: [
        "Pen : Drawing",
        "Knife : Cutting",
        "Teacher : School",
        "Car : Driving"
      ],
      category: "aptitude"
    },
    {
      id: 21,
      question: "If 5 workers make 20 items in 2 hours, how many workers needed for 100 items in 2 hours?",
      type: "radio",
      options: ["10", "15", "20", "25"],
      category: "aptitude"
    },
    
    // Part D: Interests & Hobbies (6 Questions)
    {
      id: 22,
      question: "Which activity excites you more?",
      type: "radio",
      options: [
        "Conducting science experiments",
        "Designing posters or art",
        "Participating in debate/quiz",
        "Playing sports",
        "Playing Video Games",
        "Volunteering/social service",
        "Listening to music",
        "Socializing with friends"
      ],
      category: "interests"
    },
    {
      id: 23,
      question: "If you had to choose a summer program, you'd pick:",
      type: "radio",
      options: [
        "Robotics/Coding camp",
        "Theatre/Film workshop",
        "Business/Entrepreneurship",
        "Environmental project",
        "Literature/Creative writing"
      ],
      category: "interests"
    },
    {
      id: 24,
      question: "What do you enjoy in your free time?",
      type: "radio",
      options: [
        "Reading books/articles",
        "Writing poems/stories",
        "Playing video games/sports",
        "Listening/creating music",
        "Hanging out with friends"
      ],
      category: "interests"
    },
    {
      id: 25,
      question: "Which club would you join in school?",
      type: "radio",
      options: [
        "Science club",
        "Drama club",
        "Student council",
        "Music/Dance club",
        "Environment club"
      ],
      category: "interests"
    },
    {
      id: 26,
      question: "Which career area attracts you most right now? (Select up to 3):",
      type: "checkbox",
      options: [
        "Technology/Engineering",
        "Business/Finance",
        "Medicine/Healthcare",
        "Arts/Design",
        "Government/Policy/Law",
        "Teaching/Education",
        "Hospitality/Tourism",
        "IT/Programming",
        "Science/Research",
        "Media/Communication"
      ],
      max: 3,
      category: "interests"
    },
    {
      id: 27,
      question: "When you are faced with a tight deadline and multiple tasks, what is your most likely response?",
      type: "radio",
      options: [
        "Break down the tasks, prioritize, and tackle them step by step",
        "Seek support or delegate tasks where possible",
        "Feel anxious but push through by working extra hours",
        "Procrastinate or avoid the tasks until the last moment"
      ],
      category: "interests"
    },
    
    // Part E: Subject & Values (6 Questions)
    {
      id: 28,
      question: "Favorite subject in school? (Select up to 2):",
      type: "checkbox",
      options: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Commerce",
        "Economics",
        "History",
        "Geography",
        "Political Science",
        "Arts",
        "Computer Science",
        "English"
      ],
      max: 2,
      category: "academics"
    },
    {
      id: 29,
      question: "Subjects you find challenging (Select up to 2):",
      type: "checkbox",
      options: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Commerce",
        "Economics",
        "History",
        "Geography",
        "Political Science",
        "Arts",
        "Computer Science",
        "English"
      ],
      max: 2,
      category: "academics"
    },
    {
      id: 30,
      question: "Which exam do you enjoy more?",
      type: "radio",
      options: [
        "Multiple-choice problem-solving",
        "Long essay-type answers"
      ],
      category: "academics"
    },
    {
      id: 31,
      question: "In a future career, what matters most?",
      type: "radio",
      options: [
        "High salary",
        "Job security",
        "Helping others",
        "Fame/recognition",
        "Creativity/freedom"
      ],
      category: "career_values"
    },
    {
      id: 32,
      question: "You would prefer a job that:",
      type: "radio",
      options: [
        "Works with technology and innovation",
        "Helps and heals people",
        "Leads and manages teams",
        "Creates designs/media/art",
        "Works outdoors/in nature"
      ],
      category: "career_values"
    },
    {
      id: 33,
      question: "If forced to choose, you'd rather:",
      type: "radio",
      options: [
        "Work with numbers/data",
        "Work with people",
        "Work with machines/tools",
        "Work with ideas/creativity"
      ],
      category: "career_values"
    },
    {
      id: 34,
      question: "What kind of work environment do you prefer?",
      type: "radio",
      options: [
        "Office Based",
        "Remote/WFH",
        "Field work",
        "Hybrid"
      ],
      category: "work_style"
    }
  ];
  
  export default schoolQuestions;