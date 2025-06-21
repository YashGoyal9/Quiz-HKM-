-- Insert sample admin user (you'll need to register this user first)
-- This is just for reference - the actual user will be created through auth

-- Insert sample quizzes
INSERT INTO public.quizzes (title, description, questions, total_points, time_limit, created_by) VALUES
(
  'JavaScript Fundamentals',
  'Test your knowledge of JavaScript basics',
  '[
    {
      "id": 1,
      "question": "What is the correct way to declare a variable in JavaScript?",
      "type": "multiple_choice",
      "options": ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
      "correct_answer": 0,
      "points": 10
    },
    {
      "id": 2,
      "question": "Which method is used to add an element to the end of an array?",
      "type": "multiple_choice",
      "options": ["push()", "add()", "append()", "insert()"],
      "correct_answer": 0,
      "points": 10
    },
    {
      "id": 3,
      "question": "What does JSON stand for?",
      "type": "multiple_choice",
      "options": ["JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Oriented Notation", "Java Script Object Network"],
      "correct_answer": 0,
      "points": 10
    }
  ]'::jsonb,
  30,
  15,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  'React Basics',
  'Understanding React fundamentals',
  '[
    {
      "id": 1,
      "question": "What is JSX?",
      "type": "multiple_choice",
      "options": ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "JSON XML"],
      "correct_answer": 0,
      "points": 15
    },
    {
      "id": 2,
      "question": "Which hook is used for state management in functional components?",
      "type": "multiple_choice",
      "options": ["useEffect", "useState", "useContext", "useReducer"],
      "correct_answer": 1,
      "points": 15
    }
  ]'::jsonb,
  30,
  10,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);
