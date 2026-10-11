USE ai_adaptive_learning;

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DESCRIBE students;
SELECT * FROM students;

USE ai_adaptive_learning;

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DESCRIBE admins;
CREATE TABLE exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE topics (
    topic_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    topic_name VARCHAR(150) NOT NULL,
    description TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE quiz_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2) DEFAULT 0,
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE quiz_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES options(option_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
CREATE TABLE student_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    topic_id INT NOT NULL,
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    mastery_level DECIMAL(5,2) DEFAULT 0,
    last_attempted_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE study_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    plan_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Active', 'Completed', 'Paused') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE study_plan_topics (
    plan_topic_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    topic_id INT NOT NULL,
    planned_date DATE,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (plan_id) REFERENCES study_plans(plan_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE daily_challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    xp_reward INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
CREATE TABLE challenge_attempts (
    challenge_attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    challenge_id INT NOT NULL,
    proof TEXT,
    completed BOOLEAN DEFAULT FALSE,
    xp_earned INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(challenge_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE badges (
    badge_id INT AUTO_INCREMENT PRIMARY KEY,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    xp_required INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE student_badges (
    student_badge_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE streaks (
    streak_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE learning_timeline (
    timeline_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
SHOW TABLES;
USE ai_adaptive_learning;

SHOW TABLES;
SELECT * FROM exams;

USE ai_adaptive_learning;

INSERT INTO exams (exam_name, description)
VALUES
(
    'ESIC UDC',
    'Employees State Insurance Corporation Upper Division Clerk competitive examination.'
),
(
    'OICL Assistant',
    'Oriental Insurance Company Limited Assistant competitive examination.'
),
(
    'NIACL Assistant',
    'New India Assurance Company Limited Assistant competitive examination.'
);
SELECT * FROM exams;
USE ai_adaptive_learning;

INSERT INTO subjects (exam_id, subject_name, description)
VALUES
-- ESIC UDC
(1, 'Reasoning Ability', 'Logical reasoning and analytical ability topics.'),
(1, 'Quantitative Aptitude', 'Numerical ability and mathematical aptitude topics.'),
(1, 'English Language', 'English grammar, vocabulary and comprehension topics.'),

-- OICL Assistant
(2, 'Reasoning Ability', 'Logical reasoning and analytical ability topics.'),
(2, 'Quantitative Aptitude', 'Numerical ability and mathematical aptitude topics.'),
(2, 'English Language', 'English grammar, vocabulary and comprehension topics.'),

-- NIACL Assistant
(3, 'Reasoning Ability', 'Logical reasoning and analytical ability topics.'),
(3, 'Quantitative Aptitude', 'Numerical ability and mathematical aptitude topics.'),
(3, 'English Language', 'English grammar, vocabulary and comprehension topics.');
SELECT * FROM subjects;
INSERT INTO topics (subject_id, topic_name, description)
VALUES

-- ESIC UDC - Reasoning
(1, 'Coding-Decoding', 'Questions based on coding and decoding patterns.'),
(1, 'Blood Relations', 'Problems involving family and blood relationships.'),
(1, 'Syllogism', 'Logical reasoning using statements and conclusions.'),

-- ESIC UDC - Quantitative Aptitude
(2, 'Percentage', 'Problems involving percentages and percentage change.'),
(2, 'Profit and Loss', 'Problems involving cost price, selling price and profit or loss.'),
(2, 'Time and Work', 'Problems involving work efficiency and completion time.'),

-- ESIC UDC - English
(3, 'Grammar', 'Basic English grammar and sentence structure.'),
(3, 'Vocabulary', 'Word meanings, synonyms and antonyms.'),
(3, 'Reading Comprehension', 'Understanding and answering questions from passages.'),

-- OICL Assistant - Reasoning
(4, 'Coding-Decoding', 'Questions based on coding and decoding patterns.'),
(4, 'Blood Relations', 'Problems involving family and blood relationships.'),
(4, 'Syllogism', 'Logical reasoning using statements and conclusions.'),

-- OICL Assistant - Quantitative Aptitude
(5, 'Percentage', 'Problems involving percentages and percentage change.'),
(5, 'Profit and Loss', 'Problems involving cost price, selling price and profit or loss.'),
(5, 'Time and Work', 'Problems involving work efficiency and completion time.'),

-- OICL Assistant - English
(6, 'Grammar', 'Basic English grammar and sentence structure.'),
(6, 'Vocabulary', 'Word meanings, synonyms and antonyms.'),
(6, 'Reading Comprehension', 'Understanding and answering questions from passages.'),

-- NIACL Assistant - Reasoning
(7, 'Coding-Decoding', 'Questions based on coding and decoding patterns.'),
(7, 'Blood Relations', 'Problems involving family and blood relationships.'),
(7, 'Syllogism', 'Logical reasoning using statements and conclusions.'),

-- NIACL Assistant - Quantitative Aptitude
(8, 'Percentage', 'Problems involving percentages and percentage change.'),
(8, 'Profit and Loss', 'Problems involving cost price, selling price and profit or loss.'),
(8, 'Time and Work', 'Problems involving work efficiency and completion time.'),

-- NIACL Assistant - English
(9, 'Grammar', 'Basic English grammar and sentence structure.'),
(9, 'Vocabulary', 'Word meanings, synonyms and antonyms.'),
(9, 'Reading Comprehension', 'Understanding and answering questions from passages.');

INSERT INTO questions
(topic_id, question_text, difficulty, explanation)
VALUES

-- Coding-Decoding
(1, 'If CAT is coded as DBU, how is DOG coded?', 'Easy',
 'Each letter is shifted one position forward in the alphabet.'),
(10, 'If CAT is coded as DBU, how is DOG coded?', 'Easy',
 'Each letter is shifted one position forward in the alphabet.'),
(19, 'If CAT is coded as DBU, how is DOG coded?', 'Easy',
 'Each letter is shifted one position forward in the alphabet.'),

-- Blood Relations
(2, 'A is the brother of B. B is the sister of C. How is A related to C?', 'Easy',
 'A and C are siblings, so A is the brother of C.'),
(11, 'A is the brother of B. B is the sister of C. How is A related to C?', 'Easy',
 'A and C are siblings, so A is the brother of C.'),
(20, 'A is the brother of B. B is the sister of C. How is A related to C?', 'Easy',
 'A and C are siblings, so A is the brother of C.'),

-- Syllogism
(3, 'Statements: All cats are animals. All animals need food. Which conclusion follows?', 'Medium',
 'Since cats are animals and animals need food, cats need food.'),
(12, 'Statements: All cats are animals. All animals need food. Which conclusion follows?', 'Medium',
 'Since cats are animals and animals need food, cats need food.'),
(21, 'Statements: All cats are animals. All animals need food. Which conclusion follows?', 'Medium',
 'Since cats are animals and animals need food, cats need food.'),

-- Percentage
(4, 'What is 20% of 250?', 'Easy',
 '20 divided by 100 multiplied by 250 equals 50.'),
(13, 'What is 20% of 250?', 'Easy',
 '20 divided by 100 multiplied by 250 equals 50.'),
(22, 'What is 20% of 250?', 'Easy',
 '20 divided by 100 multiplied by 250 equals 50.'),

-- Profit and Loss
(5, 'An item is bought for Rs. 500 and sold for Rs. 600. What is the profit percentage?', 'Easy',
 'Profit is Rs. 100. Profit percentage is 100/500 multiplied by 100 = 20%.'),
(14, 'An item is bought for Rs. 500 and sold for Rs. 600. What is the profit percentage?', 'Easy',
 'Profit is Rs. 100. Profit percentage is 20%.'),
(23, 'An item is bought for Rs. 500 and sold for Rs. 600. What is the profit percentage?', 'Easy',
 'Profit is Rs. 100. Profit percentage is 20%.'),

-- Time and Work
(6, 'A person completes a job in 10 days. What fraction of the job is completed in one day?', 'Easy',
 'One day work is 1/10 of the total work.'),
(15, 'A person completes a job in 10 days. What fraction of the job is completed in one day?', 'Easy',
 'One day work is 1/10 of the total work.'),
(24, 'A person completes a job in 10 days. What fraction of the job is completed in one day?', 'Easy',
 'One day work is 1/10 of the total work.'),

-- Grammar
(7, 'Choose the correct sentence.', 'Easy',
 'The sentence using "has" with a singular subject is grammatically correct.'),
(16, 'Choose the correct sentence.', 'Easy',
 'The sentence using "has" with a singular subject is grammatically correct.'),
(25, 'Choose the correct sentence.', 'Easy',
 'The sentence using "has" with a singular subject is grammatically correct.'),

-- Vocabulary
(8, 'Choose the synonym of "Rapid".', 'Easy',
 'Rapid means fast or quick.'),
(17, 'Choose the synonym of "Rapid".', 'Easy',
 'Rapid means fast or quick.'),
(26, 'Choose the synonym of "Rapid".', 'Easy',
 'Rapid means fast or quick.'),

-- Reading Comprehension
(9, 'A passage states that regular practice improves performance. What is the main idea?', 'Medium',
 'The passage emphasizes the importance of regular practice.'),
(18, 'A passage states that regular practice improves performance. What is the main idea?', 'Medium',
 'The passage emphasizes the importance of regular practice.'),
(27, 'A passage states that regular practice improves performance. What is the main idea?', 'Medium',
 'The passage emphasizes the importance of regular practice.');

INSERT INTO options
(question_id, option_text, is_correct)
VALUES

-- Q1
(1, 'EPH', FALSE),
(1, 'EPH', FALSE),
(1, 'EPH', FALSE),
(1, 'EPH', FALSE),

-- Q2
(2, 'Brother', TRUE),
(2, 'Father', FALSE),
(2, 'Uncle', FALSE),
(2, 'Cousin', FALSE),

-- Q3
(3, 'Cats need food', TRUE),
(3, 'Cats cannot eat food', FALSE),
(3, 'Animals are cats', FALSE),
(3, 'No conclusion', FALSE);

SELECT question_id, topic_id, question_text
FROM questions
ORDER BY question_id;

USE ai_adaptive_learning;

INSERT INTO options (question_id, option_text, is_correct)
VALUES
-- Q1 Coding-Decoding
(1, 'EPH', TRUE),
(1, 'EPG', FALSE),
(1, 'FPH', FALSE),
(1, 'FOH', FALSE),

-- Q2 Blood Relations
(2, 'Brother', TRUE),
(2, 'Father', FALSE),
(2, 'Uncle', FALSE),
(2, 'Cousin', FALSE),

-- Q3 Syllogism
(3, 'Cats need food', TRUE),
(3, 'Cats cannot eat food', FALSE),
(3, 'Animals are cats', FALSE),
(3, 'No conclusion', FALSE),

-- Q4 Percentage
(4, '50', TRUE),
(4, '25', FALSE),
(4, '40', FALSE),
(4, '60', FALSE),

-- Q5 Profit and Loss
(5, '20%', TRUE),
(5, '10%', FALSE),
(5, '15%', FALSE),
(5, '25%', FALSE),

-- Q6 Time and Work
(6, '1/10', TRUE),
(6, '1/5', FALSE),
(6, '1/20', FALSE),
(6, '10', FALSE),

-- Q7 Grammar
(7, 'She has a book.', TRUE),
(7, 'She have a book.', FALSE),
(7, 'She having a book.', FALSE),
(7, 'She are a book.', FALSE),

-- Q8 Vocabulary
(8, 'Fast', TRUE),
(8, 'Slow', FALSE),
(8, 'Weak', FALSE),
(8, 'Late', FALSE),

-- Q9 Reading Comprehension
(9, 'Regular practice improves performance.', TRUE),
(9, 'Practice has no effect.', FALSE),
(9, 'Performance always decreases.', FALSE),
(9, 'Learning should be avoided.', FALSE),

-- Q10 Coding-Decoding
(10, 'EPH', TRUE),
(10, 'EPG', FALSE),
(10, 'FPH', FALSE),
(10, 'FOH', FALSE),

-- Q11 Blood Relations
(11, 'Brother', TRUE),
(11, 'Father', FALSE),
(11, 'Uncle', FALSE),
(11, 'Cousin', FALSE),

-- Q12 Syllogism
(12, 'Cats need food', TRUE),
(12, 'Cats cannot eat food', FALSE),
(12, 'Animals are cats', FALSE),
(12, 'No conclusion', FALSE),

-- Q13 Percentage
(13, '50', TRUE),
(13, '25', FALSE),
(13, '40', FALSE),
(13, '60', FALSE),

-- Q14 Profit and Loss
(14, '20%', TRUE),
(14, '10%', FALSE),
(14, '15%', FALSE),
(14, '25%', FALSE),

-- Q15 Time and Work
(15, '1/10', TRUE),
(15, '1/5', FALSE),
(15, '1/20', FALSE),
(15, '10', FALSE),

-- Q16 Grammar
(16, 'She has a book.', TRUE),
(16, 'She have a book.', FALSE),
(16, 'She having a book.', FALSE),
(16, 'She are a book.', FALSE),

-- Q17 Vocabulary
(17, 'Fast', TRUE),
(17, 'Slow', FALSE),
(17, 'Weak', FALSE),
(17, 'Late', FALSE),

-- Q18 Reading Comprehension
(18, 'Regular practice improves performance.', TRUE),
(18, 'Practice has no effect.', FALSE),
(18, 'Performance always decreases.', FALSE),
(18, 'Learning should be avoided.', FALSE),

-- Q19 Coding-Decoding
(19, 'EPH', TRUE),
(19, 'EPG', FALSE),
(19, 'FPH', FALSE),
(19, 'FOH', FALSE),

-- Q20 Blood Relations
(20, 'Brother', TRUE),
(20, 'Father', FALSE),
(20, 'Uncle', FALSE),
(20, 'Cousin', FALSE),

-- Q21 Syllogism
(21, 'Cats need food', TRUE),
(21, 'Cats cannot eat food', FALSE),
(21, 'Animals are cats', FALSE),
(21, 'No conclusion', FALSE),

-- Q22 Percentage
(22, '50', TRUE),
(22, '25', FALSE),
(22, '40', FALSE),
(22, '60', FALSE),

-- Q23 Profit and Loss
(23, '20%', TRUE),
(23, '10%', FALSE),
(23, '15%', FALSE),
(23, '25%', FALSE),

-- Q24 Time and Work
(24, '1/10', TRUE),
(24, '1/5', FALSE),
(24, '1/20', FALSE),
(24, '10', FALSE),

-- Q25 Grammar
(25, 'She has a book.', TRUE),
(25, 'She have a book.', FALSE),
(25, 'She having a book.', FALSE),
(25, 'She are a book.', FALSE),

-- Q26 Vocabulary
(26, 'Fast', TRUE),
(26, 'Slow', FALSE),
(26, 'Weak', FALSE),
(26, 'Late', FALSE),

-- Q27 Reading Comprehension
(27, 'Regular practice improves performance.', TRUE),
(27, 'Practice has no effect.', FALSE),
(27, 'Performance always decreases.', FALSE),
(27, 'Learning should be avoided.', FALSE);

SELECT COUNT(*) AS total_options
FROM options;

INSERT INTO badges (badge_name, description, icon, xp_required)
VALUES
('First Step', 'Complete your first quiz.', 'first-step', 0),
('Quiz Starter', 'Complete 3 quizzes.', 'quiz-starter', 50),
('Quick Learner', 'Earn 100 XP.', 'quick-learner', 100),
('Focused Student', 'Earn 250 XP.', 'focused-student', 250),
('Knowledge Builder', 'Earn 500 XP.', 'knowledge-builder', 500),
('Consistency King', 'Maintain a 7-day learning streak.', 'consistency', 100);

INSERT INTO daily_challenges
(topic_id, title, description, xp_reward)
VALUES
(1, 'Coding Challenge', 'Solve a coding-decoding question in 5 minutes.', 10),
(2, 'Relation Challenge', 'Solve a blood-relation problem in 5 minutes.', 10),
(3, 'Logic Challenge', 'Solve a syllogism problem in 5 minutes.', 15),

(4, 'Percentage Challenge', 'Solve a percentage problem in 5 minutes.', 10),
(5, 'Profit Challenge', 'Solve a profit and loss problem in 5 minutes.', 10),
(6, 'Work Challenge', 'Solve a time and work problem in 5 minutes.', 15),

(7, 'Grammar Challenge', 'Correct three English grammar sentences.', 10),
(8, 'Vocabulary Challenge', 'Learn five new vocabulary words.', 10),
(9, 'Reading Challenge', 'Read a short passage and identify its main idea.', 15),

(10, 'Coding Challenge', 'Solve a coding-decoding question in 5 minutes.', 10),
(11, 'Relation Challenge', 'Solve a blood-relation problem in 5 minutes.', 10),
(12, 'Logic Challenge', 'Solve a syllogism problem in 5 minutes.', 15),

(13, 'Percentage Challenge', 'Solve a percentage problem in 5 minutes.', 10),
(14, 'Profit Challenge', 'Solve a profit and loss problem in 5 minutes.', 10),
(15, 'Work Challenge', 'Solve a time and work problem in 5 minutes.', 15),

(16, 'Grammar Challenge', 'Correct three English grammar sentences.', 10),
(17, 'Vocabulary Challenge', 'Learn five new vocabulary words.', 10),
(18, 'Reading Challenge', 'Read a short passage and identify its main idea.', 15),

(19, 'Coding Challenge', 'Solve a coding-decoding question in 5 minutes.', 10),
(20, 'Relation Challenge', 'Solve a blood-relation problem in 5 minutes.', 10),
(21, 'Logic Challenge', 'Solve a syllogism problem in 5 minutes.', 15),

(22, 'Percentage Challenge', 'Solve a percentage problem in 5 minutes.', 10),
(23, 'Profit Challenge', 'Solve a profit and loss problem in 5 minutes.', 10),
(24, 'Work Challenge', 'Solve a time and work problem in 5 minutes.', 15),

(25, 'Grammar Challenge', 'Correct three English grammar sentences.', 10),
(26, 'Vocabulary Challenge', 'Learn five new vocabulary words.', 10),
(27, 'Reading Challenge', 'Read a short passage and identify its main idea.', 15);


SELECT COUNT(*) AS exams FROM exams;

SELECT COUNT(*) AS subjects FROM subjects;

SELECT COUNT(*) AS topics FROM topics;

SELECT COUNT(*) AS questions FROM questions;

SELECT COUNT(*) AS options FROM options;

SELECT COUNT(*) AS badges FROM badges;

SELECT COUNT(*) AS daily_challenges FROM daily_challenges;

USE ai_adaptive_learning;

SELECT * FROM quiz_attempts
ORDER BY attempt_id DESC
LIMIT 5;

SELECT * FROM quiz_answers
ORDER BY attempt_id DESC
LIMIT 20;

SELECT * FROM student_progress
ORDER BY last_attempted_at DESC
LIMIT 20;

SELECT * FROM learning_timeline
ORDER BY timeline_id DESC
LIMIT 10;

SELECT student_id, name, xp, streak
FROM students;


USE ai_adaptive_learning;

SELECT * FROM study_plans
ORDER BY plan_id DESC;

SELECT * FROM study_plan_topics
ORDER BY plan_topic_id DESC;

SELECT * FROM notifications
ORDER BY notification_id DESC;

SELECT * FROM feedback
ORDER BY feedback_id DESC;

SELECT * FROM student_badges
ORDER BY student_badge_id DESC;

USE ai_adaptive_learning;
SHOW TABLES;

USE ai_adaptive_learning;
INSERT INTO subjects (exam_id, subject_name, description)
SELECT e.exam_id,
       'General Awareness',
       'Current affairs, general knowledge, banking and insurance awareness.'
FROM exams e
WHERE NOT EXISTS (
    SELECT 1
    FROM subjects s
    WHERE s.exam_id = e.exam_id
      AND s.subject_name = 'General Awareness'
);

INSERT INTO topics (subject_id, topic_name, description)
SELECT s.subject_id,
       'Average',
       'Problems involving averages and average calculations.'
FROM subjects s
WHERE s.subject_name = 'Quantitative Aptitude'
  AND NOT EXISTS (
      SELECT 1
      FROM topics t
      WHERE t.subject_id = s.subject_id
        AND t.topic_name = 'Average'
  );
  
  INSERT INTO topics (subject_id, topic_name, description)
SELECT s.subject_id,
       'Cloze Test',
       'Questions based on vocabulary, grammar and contextual understanding.'
FROM subjects s
WHERE s.subject_name = 'English Language'
  AND NOT EXISTS (
      SELECT 1
      FROM topics t
      WHERE t.subject_id = s.subject_id
        AND t.topic_name = 'Cloze Test'
  );

INSERT INTO topics (subject_id, topic_name, description)
SELECT s.subject_id,
       'Direction Sense',
       'Problems involving directions, distances and spatial reasoning.'
FROM subjects s
WHERE s.subject_name = 'Reasoning Ability'
  AND NOT EXISTS (
      SELECT 1
      FROM topics t
      WHERE t.subject_id = s.subject_id
        AND t.topic_name = 'Direction Sense'
  );
  
  INSERT INTO topics (subject_id, topic_name, description)
SELECT s.subject_id,
       x.topic_name,
       x.description
FROM subjects s
CROSS JOIN (
    SELECT
        'Current Affairs' AS topic_name,
        'Recent national and international events and important current information.' AS description

    UNION ALL

    SELECT
        'Banking Awareness',
        'Basic banking concepts, institutions, terminology and financial awareness.'

    UNION ALL

    SELECT
        'Insurance Awareness',
        'Insurance concepts, companies, policies and important insurance terminology.'

    UNION ALL

    SELECT
        'Static GK',
        'Important static general knowledge including history, geography, polity and other facts.'
) x
WHERE s.subject_name = 'General Awareness'
  AND NOT EXISTS (
      SELECT 1
      FROM topics t
      WHERE t.subject_id = s.subject_id
        AND t.topic_name = x.topic_name
  );
  
  SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name
FROM exams e
JOIN subjects s
    ON e.exam_id = s.exam_id
JOIN topics t
    ON s.subject_id = t.subject_id
ORDER BY
    e.exam_id,
    s.subject_id,
    t.topic_id;

SELECT
    e.exam_name,
    COUNT(DISTINCT s.subject_id) AS subject_count,
    COUNT(t.topic_id) AS topic_count
FROM exams e
LEFT JOIN subjects s
    ON e.exam_id = s.exam_id
LEFT JOIN topics t
    ON s.subject_id = t.subject_id
GROUP BY e.exam_id, e.exam_name
ORDER BY e.exam_id;

SELECT
    question_id,
    option_text,
    COUNT(*) AS duplicate_count
FROM options
GROUP BY question_id, option_text
HAVING COUNT(*) > 1
ORDER BY question_id, option_text;

SELECT
    option_id,
    question_id,
    option_text,
    is_correct
FROM options
ORDER BY question_id, option_id;
SET SQL_SAFE_UPDATES = 0;
DELETE o1
FROM options o1
JOIN options o2
    ON o1.question_id = o2.question_id
    AND o1.option_text = o2.option_text
    AND o1.option_id > o2.option_id;

SET SQL_SAFE_UPDATES = 1;
SELECT
    question_id,
    option_text,
    COUNT(*) AS option_count
FROM options
GROUP BY question_id, option_text
HAVING COUNT(*) > 1;

SELECT
    question_id,
    COUNT(*) AS option_count
FROM options
GROUP BY question_id
ORDER BY question_id;

USE ai_adaptive_learning;

DESCRIBE quiz_attempts;
USE ai_adaptive_learning;

SELECT *
FROM quiz_attempts
ORDER BY attempt_id DESC
LIMIT 1;

SELECT *
FROM quiz_answers
ORDER BY answer_id DESC
LIMIT 10;
SELECT *
FROM student_progress
ORDER BY progress_id DESC
LIMIT 5;

SELECT
    a.attempt_id,
    a.student_id,
    a.exam_id,
    a.score,
    a.total_questions,
    a.correct_answers,
    a.completed_at,
    COUNT(qa.answer_id) AS saved_answers
FROM quiz_attempts a
LEFT JOIN quiz_answers qa
    ON a.attempt_id = qa.attempt_id
GROUP BY
    a.attempt_id,
    a.student_id,
    a.exam_id,
    a.score,
    a.total_questions,
    a.correct_answers,
    a.completed_at
ORDER BY a.attempt_id DESC
LIMIT 1;

SELECT *
FROM study_plans
ORDER BY plan_id DESC;

SELECT
    spt.plan_topic_id,
    spt.plan_id,
    t.topic_name,
    s.subject_name,
    spt.planned_date,
    spt.priority,
    spt.completed
FROM study_plan_topics spt
JOIN topics t
    ON spt.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
ORDER BY spt.plan_topic_id DESC;

USE ai_adaptive_learning;

START TRANSACTION;

-- Remove the currently incorrect options
-- for the seeded question set
DELETE FROM options
WHERE question_id BETWEEN 1 AND 27;


-- =========================================================
-- CODING-DECODING
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(1, 'EPH', TRUE),
(1, 'EPG', FALSE),
(1, 'FPH', FALSE),
(1, 'FOH', FALSE),

(10, 'EPH', TRUE),
(10, 'EPG', FALSE),
(10, 'FPH', FALSE),
(10, 'FOH', FALSE),

(19, 'EPH', TRUE),
(19, 'EPG', FALSE),
(19, 'FPH', FALSE),
(19, 'FOH', FALSE);


-- =========================================================
-- BLOOD RELATIONS
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(2, 'Brother', TRUE),
(2, 'Father', FALSE),
(2, 'Uncle', FALSE),
(2, 'Cousin', FALSE),

(11, 'Brother', TRUE),
(11, 'Father', FALSE),
(11, 'Uncle', FALSE),
(11, 'Cousin', FALSE),

(20, 'Brother', TRUE),
(20, 'Father', FALSE),
(20, 'Uncle', FALSE),
(20, 'Cousin', FALSE);


-- =========================================================
-- SYLLOGISM
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(3, 'Cats need food', TRUE),
(3, 'Cats cannot eat food', FALSE),
(3, 'Animals are cats', FALSE),
(3, 'No conclusion', FALSE),

(12, 'Cats need food', TRUE),
(12, 'Cats cannot eat food', FALSE),
(12, 'Animals are cats', FALSE),
(12, 'No conclusion', FALSE),

(21, 'Cats need food', TRUE),
(21, 'Cats cannot eat food', FALSE),
(21, 'Animals are cats', FALSE),
(21, 'No conclusion', FALSE);


-- =========================================================
-- PERCENTAGE
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(4, '50', TRUE),
(4, '25', FALSE),
(4, '40', FALSE),
(4, '60', FALSE),

(13, '50', TRUE),
(13, '25', FALSE),
(13, '40', FALSE),
(13, '60', FALSE),

(22, '50', TRUE),
(22, '25', FALSE),
(22, '40', FALSE),
(22, '60', FALSE);


-- =========================================================
-- PROFIT AND LOSS
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(5, '20%', TRUE),
(5, '10%', FALSE),
(5, '15%', FALSE),
(5, '25%', FALSE),

(14, '20%', TRUE),
(14, '10%', FALSE),
(14, '15%', FALSE),
(14, '25%', FALSE),

(23, '20%', TRUE),
(23, '10%', FALSE),
(23, '15%', FALSE),
(23, '25%', FALSE);


-- =========================================================
-- TIME AND WORK
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(6, '1/10', TRUE),
(6, '1/5', FALSE),
(6, '1/20', FALSE),
(6, '10', FALSE),

(15, '1/10', TRUE),
(15, '1/5', FALSE),
(15, '1/20', FALSE),
(15, '10', FALSE),

(24, '1/10', TRUE),
(24, '1/5', FALSE),
(24, '1/20', FALSE),
(24, '10', FALSE);


-- =========================================================
-- GRAMMAR
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(7, 'She has a book.', TRUE),
(7, 'She have a book.', FALSE),
(7, 'She having a book.', FALSE),
(7, 'She are a book.', FALSE),

(16, 'She has a book.', TRUE),
(16, 'She have a book.', FALSE),
(16, 'She having a book.', FALSE),
(16, 'She are a book.', FALSE),

(25, 'She has a book.', TRUE),
(25, 'She have a book.', FALSE),
(25, 'She having a book.', FALSE),
(25, 'She are a book.', FALSE);


-- =========================================================
-- VOCABULARY
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(8, 'Fast', TRUE),
(8, 'Slow', FALSE),
(8, 'Weak', FALSE),
(8, 'Late', FALSE),

(17, 'Fast', TRUE),
(17, 'Slow', FALSE),
(17, 'Weak', FALSE),
(17, 'Late', FALSE),

(26, 'Fast', TRUE),
(26, 'Slow', FALSE),
(26, 'Weak', FALSE),
(26, 'Late', FALSE);


-- =========================================================
-- READING COMPREHENSION
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(9, 'Regular practice improves performance.', TRUE),
(9, 'Practice has no effect.', FALSE),
(9, 'Performance always decreases.', FALSE),
(9, 'Learning should be avoided.', FALSE),

(18, 'Regular practice improves performance.', TRUE),
(18, 'Practice has no effect.', FALSE),
(18, 'Performance always decreases.', FALSE),
(18, 'Learning should be avoided.', FALSE),

(27, 'Regular practice improves performance.', TRUE),
(27, 'Practice has no effect.', FALSE),
(27, 'Performance always decreases.', FALSE),
(27, 'Learning should be avoided.', FALSE);


COMMIT;

SELECT
    q.question_id,
    q.question_text,
    t.topic_name,
    o.option_text,
    o.is_correct
FROM questions q
JOIN topics t
    ON t.topic_id = q.topic_id
JOIN options o
    ON o.question_id = q.question_id
WHERE q.question_id IN (6, 15, 24)
ORDER BY q.question_id, o.option_id;

USE ai_adaptive_learning;

START TRANSACTION;

-- Remove options belonging to the currently seeded questions
DELETE FROM options
WHERE question_id IN (
    SELECT question_id
    FROM questions
    WHERE question_text IN (
        'If CAT is coded as DBU, how is DOG coded?',
        'A is the brother of B. B is the sister of C. How is A related to C?',
        'Statements: All cats are animals. All animals need food. Which conclusion follows?',
        'What is 20% of 250?',
        'An item is bought for Rs. 500 and sold for Rs. 600. What is the profit percentage?',
        'A person completes a job in 10 days. What fraction of the job is completed in one day?',
        'Choose the correct sentence.',
        'Choose the synonym of "Rapid".',
        'A passage states that regular practice improves performance. What is the main idea?'
    )
);


-- =========================================================
-- CODING-DECODING
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'EPH', TRUE
FROM questions
WHERE question_text =
'If CAT is coded as DBU, how is DOG coded?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'EPG', FALSE
FROM questions
WHERE question_text =
'If CAT is coded as DBU, how is DOG coded?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'FPH', FALSE
FROM questions
WHERE question_text =
'If CAT is coded as DBU, how is DOG coded?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'FOH', FALSE
FROM questions
WHERE question_text =
'If CAT is coded as DBU, how is DOG coded?';


-- =========================================================
-- BLOOD RELATIONS
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Brother', TRUE
FROM questions
WHERE question_text =
'A is the brother of B. B is the sister of C. How is A related to C?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Father', FALSE
FROM questions
WHERE question_text =
'A is the brother of B. B is the sister of C. How is A related to C?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Uncle', FALSE
FROM questions
WHERE question_text =
'A is the brother of B. B is the sister of C. How is A related to C?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Cousin', FALSE
FROM questions
WHERE question_text =
'A is the brother of B. B is the sister of C. How is A related to C?';


-- =========================================================
-- SYLLOGISM
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Cats need food', TRUE
FROM questions
WHERE question_text LIKE
'Statements: All cats are animals. All animals need food%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Cats cannot eat food', FALSE
FROM questions
WHERE question_text LIKE
'Statements: All cats are animals. All animals need food%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Animals are cats', FALSE
FROM questions
WHERE question_text LIKE
'Statements: All cats are animals. All animals need food%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'No conclusion', FALSE
FROM questions
WHERE question_text LIKE
'Statements: All cats are animals. All animals need food%';


-- =========================================================
-- PERCENTAGE
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '50', TRUE
FROM questions
WHERE question_text =
'What is 20% of 250?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '25', FALSE
FROM questions
WHERE question_text =
'What is 20% of 250?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '40', FALSE
FROM questions
WHERE question_text =
'What is 20% of 250?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '60', FALSE
FROM questions
WHERE question_text =
'What is 20% of 250?';


-- =========================================================
-- PROFIT AND LOSS
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '20%', TRUE
FROM questions
WHERE question_text LIKE
'An item is bought for Rs. 500 and sold for Rs. 600%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '10%', FALSE
FROM questions
WHERE question_text LIKE
'An item is bought for Rs. 500 and sold for Rs. 600%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '15%', FALSE
FROM questions
WHERE question_text LIKE
'An item is bought for Rs. 500 and sold for Rs. 600%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '25%', FALSE
FROM questions
WHERE question_text LIKE
'An item is bought for Rs. 500 and sold for Rs. 600%';


-- =========================================================
-- TIME AND WORK
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '1/10', TRUE
FROM questions
WHERE question_text =
'A person completes a job in 10 days. What fraction of the job is completed in one day?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '1/5', FALSE
FROM questions
WHERE question_text =
'A person completes a job in 10 days. What fraction of the job is completed in one day?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '1/20', FALSE
FROM questions
WHERE question_text =
'A person completes a job in 10 days. What fraction of the job is completed in one day?';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, '10', FALSE
FROM questions
WHERE question_text =
'A person completes a job in 10 days. What fraction of the job is completed in one day?';


-- =========================================================
-- GRAMMAR
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'She has a book.', TRUE
FROM questions
WHERE question_text =
'Choose the correct sentence.';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'She have a book.', FALSE
FROM questions
WHERE question_text =
'Choose the correct sentence.';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'She having a book.', FALSE
FROM questions
WHERE question_text =
'Choose the correct sentence.';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'She are a book.', FALSE
FROM questions
WHERE question_text =
'Choose the correct sentence.';


-- =========================================================
-- VOCABULARY
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Fast', TRUE
FROM questions
WHERE question_text =
'Choose the synonym of "Rapid".';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Slow', FALSE
FROM questions
WHERE question_text =
'Choose the synonym of "Rapid".';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Weak', FALSE
FROM questions
WHERE question_text =
'Choose the synonym of "Rapid".';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id, 'Late', FALSE
FROM questions
WHERE question_text =
'Choose the synonym of "Rapid".';


-- =========================================================
-- READING COMPREHENSION
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id,
       'Regular practice improves performance.',
       TRUE
FROM questions
WHERE question_text LIKE
'A passage states that regular practice improves performance%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id,
       'Practice has no effect.',
       FALSE
FROM questions
WHERE question_text LIKE
'A passage states that regular practice improves performance%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id,
       'Performance always decreases.',
       FALSE
FROM questions
WHERE question_text LIKE
'A passage states that regular practice improves performance%';

INSERT INTO options (question_id, option_text, is_correct)
SELECT question_id,
       'Learning should be avoided.',
       FALSE
FROM questions
WHERE question_text LIKE
'A passage states that regular practice improves performance%';


COMMIT;

USE ai_adaptive_learning;

SELECT
    q.question_id,
    e.exam_name,
    s.subject_name,
    t.topic_name,
    q.question_text
FROM questions q
JOIN topics t
    ON t.topic_id = q.topic_id
JOIN subjects s
    ON s.subject_id = t.subject_id
JOIN exams e
    ON e.exam_id = s.exam_id
ORDER BY q.question_id;
USE ai_adaptive_learning;

START TRANSACTION;

-- Remove the incorrect options
DELETE FROM options
WHERE question_id BETWEEN 1 AND 27;


-- =========================================================
-- 1-3 CODING-DECODING
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(1, 'EPH', 1),
(1, 'EPG', 0),
(1, 'FPH', 0),
(1, 'FOH', 0),

(2, 'EPH', 1),
(2, 'EPG', 0),
(2, 'FPH', 0),
(2, 'FOH', 0),

(3, 'EPH', 1),
(3, 'EPG', 0),
(3, 'FPH', 0),
(3, 'FOH', 0);


-- =========================================================
-- 4-6 BLOOD RELATIONS
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(4, 'Brother', 1),
(4, 'Father', 0),
(4, 'Uncle', 0),
(4, 'Cousin', 0),

(5, 'Brother', 1),
(5, 'Father', 0),
(5, 'Uncle', 0),
(5, 'Cousin', 0),

(6, 'Brother', 1),
(6, 'Father', 0),
(6, 'Uncle', 0),
(6, 'Cousin', 0);


-- =========================================================
-- 7-9 SYLLOGISM
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(7, 'Cats need food', 1),
(7, 'Cats cannot eat food', 0),
(7, 'Animals are cats', 0),
(7, 'No conclusion', 0),

(8, 'Cats need food', 1),
(8, 'Cats cannot eat food', 0),
(8, 'Animals are cats', 0),
(8, 'No conclusion', 0),

(9, 'Cats need food', 1),
(9, 'Cats cannot eat food', 0),
(9, 'Animals are cats', 0),
(9, 'No conclusion', 0);


-- =========================================================
-- 10-12 PERCENTAGE
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(10, '50', 1),
(10, '25', 0),
(10, '40', 0),
(10, '60', 0),

(11, '50', 1),
(11, '25', 0),
(11, '40', 0),
(11, '60', 0),

(12, '50', 1),
(12, '25', 0),
(12, '40', 0),
(12, '60', 0);


-- =========================================================
-- 13-15 PROFIT AND LOSS
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(13, '20%', 1),
(13, '10%', 0),
(13, '15%', 0),
(13, '25%', 0),

(14, '20%', 1),
(14, '10%', 0),
(14, '15%', 0),
(14, '25%', 0),

(15, '20%', 1),
(15, '10%', 0),
(15, '15%', 0),
(15, '25%', 0);


-- =========================================================
-- 16-18 TIME AND WORK
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(16, '1/10', 1),
(16, '1/5', 0),
(16, '1/20', 0),
(16, '10', 0),

(17, '1/10', 1),
(17, '1/5', 0),
(17, '1/20', 0),
(17, '10', 0),

(18, '1/10', 1),
(18, '1/5', 0),
(18, '1/20', 0),
(18, '10', 0);


-- =========================================================
-- 19-21 GRAMMAR
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(19, 'She has a book.', 1),
(19, 'She have a book.', 0),
(19, 'She having a book.', 0),
(19, 'She are a book.', 0),

(20, 'She has a book.', 1),
(20, 'She have a book.', 0),
(20, 'She having a book.', 0),
(20, 'She are a book.', 0),

(21, 'She has a book.', 1),
(21, 'She have a book.', 0),
(21, 'She having a book.', 0),
(21, 'She are a book.', 0);


-- =========================================================
-- 22-24 VOCABULARY
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(22, 'Fast', 1),
(22, 'Slow', 0),
(22, 'Weak', 0),
(22, 'Late', 0),

(23, 'Fast', 1),
(23, 'Slow', 0),
(23, 'Weak', 0),
(23, 'Late', 0),

(24, 'Fast', 1),
(24, 'Slow', 0),
(24, 'Weak', 0),
(24, 'Late', 0);


-- =========================================================
-- 25-27 READING COMPREHENSION
-- =========================================================

INSERT INTO options (question_id, option_text, is_correct)
VALUES
(25, 'Regular practice improves performance.', 1),
(25, 'Practice has no effect.', 0),
(25, 'Performance always decreases.', 0),
(25, 'Learning should be avoided.', 0),

(26, 'Regular practice improves performance.', 1),
(26, 'Practice has no effect.', 0),
(26, 'Performance always decreases.', 0),
(26, 'Learning should be avoided.', 0),

(27, 'Regular practice improves performance.', 1),
(27, 'Practice has no effect.', 0),
(27, 'Performance always decreases.', 0),
(27, 'Learning should be avoided.', 0);

COMMIT;

SELECT
    q.question_id,
    e.exam_name,
    s.subject_name,
    t.topic_name,
    q.question_text,
    o.option_text,
    o.is_correct
FROM questions q
JOIN topics t
    ON t.topic_id = q.topic_id
JOIN subjects s
    ON s.subject_id = t.subject_id
JOIN exams e
    ON e.exam_id = s.exam_id
JOIN options o
    ON o.question_id = q.question_id
WHERE q.question_id IN (16,17,18,19,20,21,22,23,24)
ORDER BY q.question_id, o.option_id;

USE ai_adaptive_learning;

INSERT INTO admins
(name, email, password)
VALUES
(
    'System Administrator',
    'admin@adaptivelearn.com',
    '$2b$10$/tXZFBdCC319Jqkfh1rI5Ou8Nlzo9nLh3uafRhOJPFbWeALUCzBFy'
);

USE ai_adaptive_learning;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'students'
      AND COLUMN_NAME = 'target_exam'
);

SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE students ADD COLUMN target_exam VARCHAR(100) NULL AFTER email',
    'SELECT "target_exam column already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DESCRIBE students;

INSERT INTO admins (name, email, password)
VALUES (
    'System Administrator',
    'admin@adaptivelearn.com',
    '$2b$10$ldZFHJaKWQ3fl/eJuDWhjuhN.bvFFJLZTfzOwarYtUaf1LQXO20jG'
);

SELECT admin_id, name, email, password
FROM admins
WHERE email = 'admin@adaptivelearn.com';

UPDATE admins
SET password = '$2b$10$ckMb4/ZO.UZeE7poGNCoL.vEN/RwBCuHlNwM75PeaLvXc4teT5Uaq'
WHERE email = 'admin@adaptivelearn.com';

USE ai_adaptive_learning;

DROP TEMPORARY TABLE IF EXISTS question_seed;

CREATE TEMPORARY TABLE question_seed (
    topic_name VARCHAR(150) NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('Easy','Medium','Hard') NOT NULL,
    explanation TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_index TINYINT NOT NULL
);

INSERT INTO question_seed
(
    topic_name,
    question_text,
    difficulty,
    explanation,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_index
)
VALUES

/* =========================
   AVERAGE
========================= */

(
    'Average',
    'What is the average of 10, 20, 30, 40 and 50?',
    'Easy',
    'The total is 150 and there are 5 numbers. Average = 150 / 5 = 30.',
    '20',
    '25',
    '30',
    '35',
    2
),

(
    'Average',
    'The average of 8 and 12 is:',
    'Easy',
    'Add the numbers and divide by 2: (8 + 12) / 2 = 10.',
    '8',
    '10',
    '12',
    '20',
    1
),

/* =========================
   CLOZE TEST
========================= */

(
    'Cloze Test',
    'Fill in the blank: Regular practice is essential ___ improving accuracy.',
    'Easy',
    'The correct preposition is "for".',
    'for',
    'at',
    'by',
    'from',
    0
),

(
    'Cloze Test',
    'Fill in the blank: The candidate was confident ___ the examination.',
    'Easy',
    'The correct preposition is "about".',
    'about',
    'between',
    'under',
    'during',
    0
),

/* =========================
   DIRECTION SENSE
========================= */

(
    'Direction Sense',
    'Riya walks 5 km north and then 3 km east. In which direction is she from her starting point?',
    'Easy',
    'Moving north and then east places Riya to the north-east of the starting point.',
    'North-West',
    'North-East',
    'South-East',
    'South-West',
    1
),

(
    'Direction Sense',
    'A person faces east and turns right. Which direction is the person facing now?',
    'Easy',
    'A right turn from east points toward south.',
    'North',
    'South',
    'West',
    'North-East',
    1
),

/* =========================
   CURRENT AFFAIRS
========================= */

(
    'Current Affairs',
    'Which institution is responsible for conducting the Census of India?',
    'Easy',
    'The Office of the Registrar General and Census Commissioner conducts the Census of India.',
    'Reserve Bank of India',
    'Office of the Registrar General',
    'Election Commission',
    'NITI Aayog',
    1
),

(
    'Current Affairs',
    'Which organization is India''s central bank?',
    'Easy',
    'The Reserve Bank of India is the central bank of India.',
    'SEBI',
    'RBI',
    'NABARD',
    'SBI',
    1
),

/* =========================
   BANKING AWARENESS
========================= */

(
    'Banking Awareness',
    'What does ATM stand for?',
    'Easy',
    'ATM stands for Automated Teller Machine.',
    'Automatic Transfer Machine',
    'Automated Teller Machine',
    'Account Transfer Machine',
    'Automatic Transaction Method',
    1
),

(
    'Banking Awareness',
    'What is the full form of RBI?',
    'Easy',
    'RBI stands for Reserve Bank of India.',
    'Reserve Bank of India',
    'Regional Bank of India',
    'Rural Bank of India',
    'Reserve Banking Institution',
    0
),

/* =========================
   INSURANCE AWARENESS
========================= */

(
    'Insurance Awareness',
    'What is a premium in insurance?',
    'Easy',
    'A premium is the amount paid by the policyholder to keep an insurance policy active.',
    'Insurance claim amount',
    'Amount paid for insurance coverage',
    'Bank interest',
    'Loan repayment',
    1
),

(
    'Insurance Awareness',
    'What is the main purpose of insurance?',
    'Easy',
    'Insurance provides financial protection against specified risks and losses.',
    'To provide financial protection',
    'To increase taxes',
    'To provide loans only',
    'To reduce salaries',
    0
),

/* =========================
   STATIC GK
========================= */

(
    'Static GK',
    'What is the capital of India?',
    'Easy',
    'New Delhi is the capital of India.',
    'Mumbai',
    'New Delhi',
    'Kolkata',
    'Chennai',
    1
),

(
    'Static GK',
    'Which is the largest state in India by area?',
    'Easy',
    'Rajasthan is the largest Indian state by area.',
    'Maharashtra',
    'Rajasthan',
    'Madhya Pradesh',
    'Gujarat',
    1
);


/* =========================================================
   INSERT QUESTIONS FOR EVERY MATCHING TOPIC
   WITHOUT DUPLICATING EXISTING QUESTIONS
========================================================= */

INSERT INTO questions
(
    topic_id,
    question_text,
    difficulty,
    explanation
)
SELECT
    t.topic_id,
    qs.question_text,
    qs.difficulty,
    qs.explanation
FROM question_seed qs
INNER JOIN topics t
    ON LOWER(TRIM(t.topic_name)) = LOWER(TRIM(qs.topic_name))
WHERE NOT EXISTS (
    SELECT 1
    FROM questions q
    WHERE q.topic_id = t.topic_id
      AND q.question_text = qs.question_text
);


/* =========================================================
   STORE QUESTION IDs FOR INSERTING OPTIONS
========================================================= */

DROP TEMPORARY TABLE IF EXISTS inserted_questions;

CREATE TEMPORARY TABLE inserted_questions AS
SELECT
    q.question_id,
    q.topic_id,
    qs.option_a,
    qs.option_b,
    qs.option_c,
    qs.option_d,
    qs.correct_index
FROM questions q
INNER JOIN question_seed qs
    ON q.question_text = qs.question_text
INNER JOIN topics t
    ON t.topic_id = q.topic_id
   AND LOWER(TRIM(t.topic_name)) = LOWER(TRIM(qs.topic_name));


/* =========================================================
   INSERT OPTIONS
   Avoid duplicate options
========================================================= */

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    iq.question_id,
    x.option_text,
    x.is_correct
FROM inserted_questions iq
JOIN (
    SELECT 0 AS idx, 'A' AS letter
    UNION ALL
    SELECT 1, 'B'
    UNION ALL
    SELECT 2, 'C'
    UNION ALL
    SELECT 3, 'D'
) letters
JOIN (
    SELECT
        question_id,
        option_a AS option_text,
        0 AS idx,
        correct_index
    FROM inserted_questions

    UNION ALL

    SELECT
        question_id,
        option_b,
        1,
        correct_index
    FROM inserted_questions

    UNION ALL

    SELECT
        question_id,
        option_c,
        2,
        correct_index
    FROM inserted_questions

    UNION ALL

    SELECT
        question_id,
        option_d,
        3,
        correct_index
    FROM inserted_questions
) x
    ON x.question_id = iq.question_id
   AND x.idx = letters.idx
WHERE NOT EXISTS (
    SELECT 1
    FROM options o
    WHERE o.question_id = x.question_id
      AND o.option_text = x.option_text
);


/* =========================================================
   CHECK FINAL QUESTION COUNT
========================================================= */

SELECT COUNT(*) AS total_questions
FROM questions;


/* =========================================================
   QUESTION DISTRIBUTION BY TOPIC
========================================================= */

SELECT
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM topics t
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
GROUP BY t.topic_id, t.topic_name
ORDER BY t.topic_name;

USE ai_adaptive_learning;


/* =========================================================
   OPTION A
========================================================= */

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,
    qs.option_a,
    CASE
        WHEN qs.correct_index = 0 THEN 1
        ELSE 0
    END
FROM questions q
INNER JOIN topics t
    ON t.topic_id = q.topic_id
INNER JOIN question_seed qs
    ON LOWER(TRIM(qs.topic_name)) = LOWER(TRIM(t.topic_name))
   AND qs.question_text = q.question_text
WHERE NOT EXISTS (
    SELECT 1
    FROM options o
    WHERE o.question_id = q.question_id
      AND o.option_text = qs.option_a
);


/* =========================================================
   OPTION B
========================================================= */

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,
    qs.option_b,
    CASE
        WHEN qs.correct_index = 1 THEN 1
        ELSE 0
    END
FROM questions q
INNER JOIN topics t
    ON t.topic_id = q.topic_id
INNER JOIN question_seed qs
    ON LOWER(TRIM(qs.topic_name)) = LOWER(TRIM(t.topic_name))
   AND qs.question_text = q.question_text
WHERE NOT EXISTS (
    SELECT 1
    FROM options o
    WHERE o.question_id = q.question_id
      AND o.option_text = qs.option_b
);


/* =========================================================
   OPTION C
========================================================= */

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,
    qs.option_c,
    CASE
        WHEN qs.correct_index = 2 THEN 1
        ELSE 0
    END
FROM questions q
INNER JOIN topics t
    ON t.topic_id = q.topic_id
INNER JOIN question_seed qs
    ON LOWER(TRIM(qs.topic_name)) = LOWER(TRIM(t.topic_name))
   AND qs.question_text = q.question_text
WHERE NOT EXISTS (
    SELECT 1
    FROM options o
    WHERE o.question_id = q.question_id
      AND o.option_text = qs.option_c
);


/* =========================================================
   OPTION D
========================================================= */

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,
    qs.option_d,
    CASE
        WHEN qs.correct_index = 3 THEN 1
        ELSE 0
    END
FROM questions q
INNER JOIN topics t
    ON t.topic_id = q.topic_id
INNER JOIN question_seed qs
    ON LOWER(TRIM(qs.topic_name)) = LOWER(TRIM(t.topic_name))
   AND qs.question_text = q.question_text
WHERE NOT EXISTS (
    SELECT 1
    FROM options o
    WHERE o.question_id = q.question_id
      AND o.option_text = qs.option_d
);


/* =========================================================
   CHECK QUESTION COUNT
========================================================= */

SELECT COUNT(*) AS total_questions
FROM questions;


/* =========================================================
   CHECK OPTION COUNT
========================================================= */

SELECT COUNT(*) AS total_options
FROM options;


/* =========================================================
   CHECK QUESTIONS WITHOUT 4 OPTIONS
========================================================= */

SELECT
    q.question_id,
    q.question_text,
    COUNT(o.option_id) AS option_count
FROM questions q
LEFT JOIN options o
    ON o.question_id = q.question_id
GROUP BY
    q.question_id,
    q.question_text
HAVING COUNT(o.option_id) <> 4
ORDER BY q.question_id;

USE ai_adaptive_learning;

DROP PROCEDURE IF EXISTS fill_all_topics;

DELIMITER $$

CREATE PROCEDURE fill_all_topics()
BEGIN

    DECLARE done INT DEFAULT 0;

    DECLARE v_topic_id INT;
    DECLARE v_topic_name VARCHAR(150);
    DECLARE v_existing INT;
    DECLARE v_needed INT;
    DECLARE v_i INT;

    DECLARE v_question_id INT;
    DECLARE v_difficulty VARCHAR(50);

    DECLARE topic_cursor CURSOR FOR
        SELECT
            topic_id,
            topic_name
        FROM topics
        ORDER BY topic_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;


    OPEN topic_cursor;


    topic_loop: LOOP

        FETCH topic_cursor
        INTO v_topic_id, v_topic_name;


        IF done = 1 THEN
            LEAVE topic_loop;
        END IF;


        /* =====================================================
           COUNT EXISTING QUESTIONS FOR THIS TOPIC
        ===================================================== */

        SELECT COUNT(*)
        INTO v_existing
        FROM questions
        WHERE topic_id = v_topic_id;


        /*
           We want AT LEAST 10 QUESTIONS PER TOPIC.
        */

        SET v_needed =
            GREATEST(
                0,
                10 - v_existing
            );


        SET v_i = 1;


        /* =====================================================
           ADD MISSING QUESTIONS
        ===================================================== */

        WHILE v_i <= v_needed DO


            /* -------------------------------------------------
               VARY DIFFICULTY
            ------------------------------------------------- */

            SET v_difficulty =
                CASE MOD(v_i, 3)

                    WHEN 1 THEN 'Easy'

                    WHEN 2 THEN 'Medium'

                    ELSE 'Hard'

                END;


            /* -------------------------------------------------
               INSERT QUESTION
               
               Question text is generated from the actual
               topic name, so every question remains linked
               to the correct topic.
            ------------------------------------------------- */

            INSERT INTO questions
            (
                topic_id,
                question_text,
                difficulty,
                explanation
            )
            VALUES
            (
                v_topic_id,

                CONCAT(
                    'Practice Question ',
                    v_i,
                    ' for ',
                    v_topic_name,
                    ': Which approach is most appropriate when solving a problem related to ',
                    v_topic_name,
                    '?'
                ),

                v_difficulty,

                CONCAT(
                    'This question is categorized under ',
                    v_topic_name,
                    '. The learner should apply the concepts and problem-solving methods associated with this topic.'
                )
            );


            SET v_question_id =
                LAST_INSERT_ID();


            /* =================================================
               ADD FOUR OPTIONS
               
               Correct answer changes position so that the
               correct option is not always Option A.
            ================================================= */

            CASE MOD(v_i, 4)

                /* ---------------------------------------------
                   CORRECT = A
                --------------------------------------------- */

                WHEN 1 THEN

                    INSERT INTO options
                    (
                        question_id,
                        option_text,
                        is_correct
                    )
                    VALUES
                    (
                        v_question_id,
                        CONCAT(
                            'Apply the concepts and methods of ',
                            v_topic_name
                        ),
                        1
                    ),
                    (
                        v_question_id,
                        'Ignore the topic and select an unrelated method',
                        0
                    ),
                    (
                        v_question_id,
                        'Use only memorization without understanding',
                        0
                    ),
                    (
                        v_question_id,
                        'Skip the problem without analysing it',
                        0
                    );


                /* ---------------------------------------------
                   CORRECT = B
                --------------------------------------------- */

                WHEN 2 THEN

                    INSERT INTO options
                    (
                        question_id,
                        option_text,
                        is_correct
                    )
                    VALUES
                    (
                        v_question_id,
                        'Choose an unrelated method',
                        0
                    ),
                    (
                        v_question_id,
                        CONCAT(
                            'Apply the concepts and methods of ',
                            v_topic_name
                        ),
                        1
                    ),
                    (
                        v_question_id,
                        'Avoid analysing the given information',
                        0
                    ),
                    (
                        v_question_id,
                        'Use a random answer',
                        0
                    );


                /* ---------------------------------------------
                   CORRECT = C
                --------------------------------------------- */

                WHEN 3 THEN

                    INSERT INTO options
                    (
                        question_id,
                        option_text,
                        is_correct
                    )
                    VALUES
                    (
                        v_question_id,
                        'Ignore the relevant concepts',
                        0
                    ),
                    (
                        v_question_id,
                        'Select an unrelated topic',
                        0
                    ),
                    (
                        v_question_id,
                        CONCAT(
                            'Apply the concepts and methods of ',
                            v_topic_name
                        ),
                        1
                    ),
                    (
                        v_question_id,
                        'Answer without considering the problem',
                        0
                    );


                /* ---------------------------------------------
                   CORRECT = D
                --------------------------------------------- */

                WHEN 0 THEN

                    INSERT INTO options
                    (
                        question_id,
                        option_text,
                        is_correct
                    )
                    VALUES
                    (
                        v_question_id,
                        'Use an unrelated approach',
                        0
                    ),
                    (
                        v_question_id,
                        'Ignore the question details',
                        0
                    ),
                    (
                        v_question_id,
                        'Guess without applying the topic',
                        0
                    ),
                    (
                        v_question_id,
                        CONCAT(
                            'Apply the concepts and methods of ',
                            v_topic_name
                        ),
                        1
                    );

            END CASE;


            SET v_i = v_i + 1;

        END WHILE;


    END LOOP;


    CLOSE topic_cursor;

END$$

DELIMITER ;


CALL fill_all_topics();


/* ============================================================
   REMOVE PROCEDURE AFTER USE
   ============================================================ */

DROP PROCEDURE IF EXISTS fill_all_topics;


/* ============================================================
   FINAL QUESTION COUNT
   ============================================================ */

SELECT
    e.exam_name AS examination,
    s.subject_name AS subject,
    t.topic_id,
    t.topic_name AS topic,
    COUNT(q.question_id) AS question_count
FROM topics t

INNER JOIN subjects s
    ON s.subject_id = t.subject_id

INNER JOIN exams e
    ON e.exam_id = s.exam_id

LEFT JOIN questions q
    ON q.topic_id = t.topic_id

GROUP BY
    e.exam_id,
    e.exam_name,
    s.subject_id,
    s.subject_name,
    t.topic_id,
    t.topic_name

ORDER BY
    e.exam_id,
    s.subject_id,
    t.topic_id;


/* ============================================================
   CHECK FOR TOPICS WITH LESS THAN 10 QUESTIONS
   ============================================================ */

SELECT
    e.exam_name AS examination,
    s.subject_name AS subject,
    t.topic_name AS topic,
    COUNT(q.question_id) AS question_count
FROM topics t

INNER JOIN subjects s
    ON s.subject_id = t.subject_id

INNER JOIN exams e
    ON e.exam_id = s.exam_id

LEFT JOIN questions q
    ON q.topic_id = t.topic_id

GROUP BY
    e.exam_id,
    e.exam_name,
    s.subject_id,
    s.subject_name,
    t.topic_id,
    t.topic_name

HAVING COUNT(q.question_id) < 10

ORDER BY
    e.exam_id,
    s.subject_id,
    t.topic_id;


/* ============================================================
   CHECK QUESTIONS WITH INCORRECT OPTION COUNT
   ============================================================ */

SELECT
    q.question_id,
    q.question_text,
    COUNT(o.option_id) AS option_count
FROM questions q

LEFT JOIN options o
    ON o.question_id = q.question_id

GROUP BY
    q.question_id,
    q.question_text

HAVING COUNT(o.option_id) <> 4

ORDER BY
    q.question_id;