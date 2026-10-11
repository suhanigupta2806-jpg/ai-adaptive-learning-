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
    
    
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- ADAPTIVELEARN COMPLETE DATABASE CONTENT
-- ============================================================
-- 3 Exams
-- 4 Subjects per Exam
-- 4 Topics per Subject
-- 10 Different Questions per Topic
-- 480 Questions Total
-- ============================================================


-- ============================================================
-- 1. KEEP ONLY THE REQUIRED 3 EXAMS
-- ============================================================

DELETE FROM exams
WHERE exam_name NOT IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


-- ============================================================
-- 2. REMOVE OLD SUBJECT/TOPIC/QUESTION CONTENT
-- ============================================================
-- This removes the old incorrect 3-topic structure and
-- repetitive question bank.
-- ============================================================

DELETE s
FROM subjects s
INNER JOIN exams e ON e.exam_id = s.exam_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


-- ============================================================
-- 3. CREATE EXACTLY 4 SUBJECTS FOR EACH EXAM
-- ============================================================

INSERT INTO subjects
(
    exam_id,
    subject_name,
    description
)
SELECT
    e.exam_id,
    x.subject_name,
    x.description
FROM exams e
CROSS JOIN
(
    SELECT
        'Reasoning Ability' AS subject_name,
        'Logical reasoning and analytical ability.' AS description

    UNION ALL

    SELECT
        'Quantitative Aptitude',
        'Numerical ability and mathematical aptitude.'

    UNION ALL

    SELECT
        'English Language',
        'Grammar, vocabulary and reading comprehension.'

    UNION ALL

    SELECT
        'General Awareness',
        'Current affairs, banking, insurance and static general knowledge.'
) x
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


-- ============================================================
-- 4. CREATE EXACTLY 4 TOPICS UNDER EACH SUBJECT
-- ============================================================

INSERT INTO topics
(
    subject_id,
    topic_name,
    description
)
SELECT
    s.subject_id,
    x.topic_name,
    x.description
FROM subjects s
INNER JOIN exams e
    ON e.exam_id = s.exam_id
INNER JOIN
(
    SELECT
        'Reasoning Ability' AS subject_name,
        'Coding-Decoding' AS topic_name,
        'Coding and decoding patterns.' AS description

    UNION ALL

    SELECT
        'Reasoning Ability',
        'Blood Relations',
        'Family and blood relationship problems.'

    UNION ALL

    SELECT
        'Reasoning Ability',
        'Syllogism',
        'Statements and logical conclusions.'

    UNION ALL

    SELECT
        'Reasoning Ability',
        'Direction Sense',
        'Directions, distance and spatial reasoning.'


    UNION ALL


    SELECT
        'Quantitative Aptitude',
        'Percentage',
        'Percentage calculations and percentage change.'

    UNION ALL

    SELECT
        'Quantitative Aptitude',
        'Profit and Loss',
        'Cost price, selling price, profit, loss and discount.'

    UNION ALL

    SELECT
        'Quantitative Aptitude',
        'Ratio',
        'Ratios, proportions and sharing problems.'

    UNION ALL

    SELECT
        'Quantitative Aptitude',
        'Average',
        'Average and mean-based calculations.'


    UNION ALL


    SELECT
        'English Language',
        'Grammar',
        'Grammar rules and sentence structure.'

    UNION ALL

    SELECT
        'English Language',
        'Error Detection',
        'Finding grammatical errors in sentences.'

    UNION ALL

    SELECT
        'English Language',
        'Vocabulary',
        'Synonyms, antonyms and word usage.'

    UNION ALL

    SELECT
        'English Language',
        'Reading Comprehension',
        'Understanding and answering questions from passages.'


    UNION ALL


    SELECT
        'General Awareness',
        'Current Affairs',
        'Important national and international current events.'

    UNION ALL

    SELECT
        'General Awareness',
        'Banking Awareness',
        'Banking concepts, institutions and terminology.'

    UNION ALL

    SELECT
        'General Awareness',
        'Insurance Awareness',
        'Insurance concepts, terminology and principles.'

    UNION ALL

    SELECT
        'General Awareness',
        'Static GK',
        'Important general knowledge facts.'
) x
    ON x.subject_name = s.subject_name
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


-- ============================================================
-- 5. QUESTION SEED TABLE
-- ============================================================

CREATE TEMPORARY TABLE question_seed
(
    topic_name VARCHAR(100),
    question_text TEXT,
    difficulty VARCHAR(20),
    explanation TEXT,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_index INT
);


-- ============================================================
-- 6. REASONING — CODING DECODING
-- ============================================================

INSERT INTO question_seed VALUES

(
'Coding-Decoding',
'If CAT is coded as DBU, how is DOG coded?',
'Easy',
'Each letter is shifted one position forward.',
'EPH','EPG','DOH','FQI',0
),

(
'Coding-Decoding',
'If PEN is coded as QFO, how is MAP coded?',
'Easy',
'Each letter is shifted one position forward.',
'NBQ','MBQ','NCP','LBQ',0
),

(
'Coding-Decoding',
'If BOOK is coded as CPPL, how is PAGE coded?',
'Easy',
'Each letter is replaced by the next alphabet letter.',
'QBHF','QAGF','PBHF','RBHF',0
),

(
'Coding-Decoding',
'If SUN is coded as TVO, how is MOON coded?',
'Easy',
'Each letter is shifted one position forward.',
'NPPO','NQPO','MPPO','NPOP',0
),

(
'Coding-Decoding',
'If ROAD is coded as SPBE, how is TREE coded?',
'Medium',
'Every letter is moved one position forward.',
'USFF','USFE','TSFF','URFF',0
),

(
'Coding-Decoding',
'If KING is coded as LJOH, how is QUEEN coded?',
'Medium',
'Each letter is shifted one position forward.',
'RVFFO','RVFEO','QUFFO','SWFFO',0
),

(
'Coding-Decoding',
'If MILK is coded as NJML, how is RICE coded?',
'Easy',
'Each letter is shifted one position forward.',
'SJDF','SJCE','RPDF','TJDF',0
),

(
'Coding-Decoding',
'If HOME is coded as IPNF, how is WORK coded?',
'Easy',
'Each letter is shifted one position forward.',
'XPSL','XPRL','WPSL','YPSL',0
),

(
'Coding-Decoding',
'If TABLE is coded as UBCMF, how is CHAIR coded?',
'Medium',
'Each letter is shifted one position forward.',
'DIBJS','DHBJS','DIBIR','CHBJS',0
),

(
'Coding-Decoding',
'If FISH is coded as GJTI, how is BIRD coded?',
'Easy',
'Each letter is shifted one position forward.',
'CJSE','BJSE','CIRD','DKSE',0
);


-- ============================================================
-- 7. BLOOD RELATIONS
-- ============================================================

INSERT INTO question_seed VALUES

(
'Blood Relations',
'Ravi is the son of Meena. Meena is the daughter of Sita. How is Sita related to Ravi?',
'Easy',
'Sita is Meena''s mother and therefore Ravi''s grandmother.',
'Grandmother','Mother','Aunt','Sister',0
),

(
'Blood Relations',
'A is the brother of B. B is the sister of C. How is A related to C?',
'Easy',
'A and C are siblings.',
'Brother','Father','Uncle','Cousin',0
),

(
'Blood Relations',
'P is the mother of Q. Q is the father of R. How is P related to R?',
'Easy',
'P is the father''s mother.',
'Grandmother','Mother','Aunt','Sister',0
),

(
'Blood Relations',
'X is the father of Y. Y is the sister of Z. How is X related to Z?',
'Easy',
'X is the parent of both Y and Z.',
'Father','Brother','Uncle','Grandfather',0
),

(
'Blood Relations',
'M is the sister of N. N is the father of O. How is M related to O?',
'Medium',
'M is the sister of O''s father.',
'Aunt','Mother','Sister','Cousin',0
),

(
'Blood Relations',
'K is the son of L. L is the brother of M. How is M related to K?',
'Medium',
'M is K''s uncle or aunt depending on gender; here M is represented as male.',
'Uncle','Father','Brother','Cousin',0
),

(
'Blood Relations',
'Rina is the daughter of Arun. Arun is the brother of Sunil. How is Sunil related to Rina?',
'Easy',
'Sunil is Arun''s brother and therefore Rina''s uncle.',
'Uncle','Father','Brother','Cousin',0
),

(
'Blood Relations',
'A is the mother of B and B is the mother of C. How is A related to C?',
'Easy',
'A is the mother of C''s mother.',
'Grandmother','Mother','Aunt','Sister',0
),

(
'Blood Relations',
'V is the brother of W. W is the mother of X. How is V related to X?',
'Medium',
'V is the brother of X''s mother.',
'Uncle','Father','Brother','Grandfather',0
),

(
'Blood Relations',
'Neha is the sister of Rahul. Rahul is the father of Priya. How is Neha related to Priya?',
'Easy',
'Neha is Priya''s paternal aunt.',
'Aunt','Mother','Sister','Cousin',0
);


-- ============================================================
-- 8. SYLLOGISM
-- ============================================================

INSERT INTO question_seed VALUES

(
'Syllogism',
'Statements: All cats are animals. All animals need food. Conclusion: All cats need food.',
'Easy',
'Cats belong to animals and all animals need food.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: All books are papers. Some papers are white. Conclusion: Some books are white.',
'Medium',
'The fact that some papers are white does not prove those papers are books.',
'Does not follow','Follows','Both','None',0
),

(
'Syllogism',
'Statements: All roses are flowers. All flowers need water. Conclusion: Roses need water.',
'Easy',
'Roses are flowers and flowers need water.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: Some students are athletes. All athletes are fit. Conclusion: Some students are fit.',
'Easy',
'The students who are athletes must be fit.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: All cars are vehicles. Some vehicles are buses. Conclusion: Some cars are buses.',
'Medium',
'There is no information that the buses are cars.',
'Does not follow','Follows','Both','None',0
),

(
'Syllogism',
'Statements: No fish are birds. All sparrows are birds. Conclusion: No sparrows are fish.',
'Easy',
'Sparrows are birds and no fish are birds.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: All doctors are educated. Ravi is a doctor. Conclusion: Ravi is educated.',
'Easy',
'Ravi belongs to the group of doctors.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: Some pens are blue. All blue things are colorful. Conclusion: Some pens are colorful.',
'Easy',
'The blue pens are colorful.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: All fruits are healthy. Some apples are fruits. Conclusion: Some apples are healthy.',
'Easy',
'The apples that are fruits are healthy.',
'Follows','Does not follow','Cannot say','None',0
),

(
'Syllogism',
'Statements: No teachers are students. Ravi is a teacher. Conclusion: Ravi is not a student.',
'Easy',
'Teachers and students are mutually exclusive in the statement.',
'Follows','Does not follow','Cannot say','None',0
);


-- ============================================================
-- 9. DIRECTION SENSE
-- ============================================================

INSERT INTO question_seed VALUES

(
'Direction Sense',
'Ravi walks 5 km north and then 3 km east. In which direction is he from the starting point?',
'Easy',
'Moving north and then east places him northeast.',
'North-East','North-West','South-East','South-West',0
),

(
'Direction Sense',
'A person walks 4 km south and then 4 km east. What is the final direction from the starting point?',
'Easy',
'South followed by east gives south-east.',
'South-East','North-East','South-West','North-West',0
),

(
'Direction Sense',
'If you face north and turn right, which direction are you facing?',
'Easy',
'A right turn from north is east.',
'East','West','South','North',0
),

(
'Direction Sense',
'If you face east and turn left, which direction are you facing?',
'Easy',
'A left turn from east is north.',
'North','South','West','East',0
),

(
'Direction Sense',
'A man walks west and then turns left. Which direction is he facing?',
'Easy',
'Left from west is south.',
'South','North','East','West',0
),

(
'Direction Sense',
'Priya walks 6 km east and then 6 km west. Where is she compared with her starting point?',
'Easy',
'Equal distances in opposite directions return her to the start.',
'Same position','6 km east','6 km west','12 km east',0
),

(
'Direction Sense',
'A person walks north, turns right, then turns right again. Which direction is he facing?',
'Easy',
'North → east → south.',
'South','East','West','North',0
),

(
'Direction Sense',
'A person facing south turns left. Which direction does he face?',
'Easy',
'Left from south is east.',
'East','West','North','South',0
),

(
'Direction Sense',
'Rahul travels 3 km north and 3 km south. What is his displacement?',
'Easy',
'Opposite equal movements cancel each other.',
'0 km','3 km','6 km','9 km',0
),

(
'Direction Sense',
'A person walks east, turns left, then turns left again. Which direction is he facing?',
'Easy',
'East → north → west.',
'West','North','South','East',0
);


-- ============================================================
-- 10. PERCENTAGE
-- ============================================================

INSERT INTO question_seed VALUES

(
'Percentage',
'What is 20% of 250?',
'Easy',
'20/100 × 250 = 50.',
'50','40','60','45',0
),

(
'Percentage',
'What is 15% of 200?',
'Easy',
'15/100 × 200 = 30.',
'30','25','35','40',0
),

(
'Percentage',
'What is 25% of 400?',
'Easy',
'One-fourth of 400 is 100.',
'100','80','120','90',0
),

(
'Percentage',
'What is 10% of 750?',
'Easy',
'10/100 × 750 = 75.',
'75','70','65','80',0
),

(
'Percentage',
'A number increases from 100 to 120. What is the percentage increase?',
'Easy',
'Increase is 20 on base 100, so 20%.',
'20%','10%','25%','15%',0
),

(
'Percentage',
'A price decreases from 500 to 450. What is the percentage decrease?',
'Easy',
'Decrease is 50 out of 500, which is 10%.',
'10%','5%','15%','20%',0
),

(
'Percentage',
'30 is what percentage of 150?',
'Easy',
'30/150 × 100 = 20%.',
'20%','15%','25%','30%',0
),

(
'Percentage',
'What is 12.5% of 800?',
'Medium',
'12.5% is one-eighth, and 800/8 = 100.',
'100','80','120','90',0
),

(
'Percentage',
'A student scores 360 out of 500. What is the percentage?',
'Easy',
'360/500 × 100 = 72%.',
'72%','70%','75%','68%',0
),

(
'Percentage',
'If a number is increased by 25% from 80, what is the new number?',
'Easy',
'25% of 80 is 20, so the new value is 100.',
'100','95','105','90',0
);


-- ============================================================
-- 11. PROFIT AND LOSS
-- ============================================================

INSERT INTO question_seed VALUES

(
'Profit and Loss',
'An item costs ₹500 and is sold for ₹600. What is the profit?',
'Easy',
'Profit = 600 - 500 = ₹100.',
'₹100','₹50','₹150','₹200',0
),

(
'Profit and Loss',
'An item costs ₹800 and is sold for ₹720. What is the loss?',
'Easy',
'Loss = 800 - 720 = ₹80.',
'₹80','₹60','₹100','₹120',0
),

(
'Profit and Loss',
'An article costing ₹400 is sold for ₹500. What is the profit percentage?',
'Easy',
'Profit = 100; profit percentage = 100/400 × 100 = 25%.',
'25%','20%','30%','15%',0
),

(
'Profit and Loss',
'An article costs ₹1000 and is sold at a 10% loss. Find the selling price.',
'Easy',
'10% of ₹1000 is ₹100, so SP = ₹900.',
'₹900','₹950','₹800','₹850',0
),

(
'Profit and Loss',
'An item is sold for ₹1200 at a profit of ₹200. Find its cost price.',
'Easy',
'CP = SP - Profit = ₹1000.',
'₹1000','₹900','₹1100','₹1200',0
),

(
'Profit and Loss',
'An item bought for ₹600 is sold for ₹720. Find the profit percentage.',
'Easy',
'Profit = ₹120; 120/600 × 100 = 20%.',
'20%','15%','25%','10%',0
),

(
'Profit and Loss',
'An article with cost price ₹900 is sold for ₹810. Find the loss percentage.',
'Easy',
'Loss = ₹90; 90/900 × 100 = 10%.',
'10%','5%','15%','20%',0
),

(
'Profit and Loss',
'A shopkeeper buys an item for ₹250 and sells it for ₹300. Find the profit percentage.',
'Easy',
'Profit = ₹50; 50/250 × 100 = 20%.',
'20%','15%','25%','10%',0
),

(
'Profit and Loss',
'An article marked ₹1000 is sold after a ₹100 discount. Find its selling price.',
'Easy',
'SP = ₹1000 - ₹100 = ₹900.',
'₹900','₹800','₹950','₹850',0
),

(
'Profit and Loss',
'An item is sold for ₹450 after a 10% discount. What was its marked price?',
'Medium',
'90% of marked price is ₹450, so marked price is ₹500.',
'₹500','₹550','₹450','₹400',0
);


-- ============================================================
-- 12. RATIO
-- ============================================================

INSERT INTO question_seed VALUES

(
'Ratio',
'What is the simplest form of the ratio 20:30?',
'Easy',
'Divide both terms by 10.',
'2:3','3:2','1:2','4:5',0
),

(
'Ratio',
'Divide ₹600 in the ratio 2:3. What is the first share?',
'Easy',
'Total parts = 5; first share = 600 × 2/5 = ₹240.',
'₹240','₹300','₹200','₹360',0
),

(
'Ratio',
'If A:B = 3:4 and B = 20, find A.',
'Easy',
'4 parts = 20, so 3 parts = 15.',
'15','12','18','16',0
),

(
'Ratio',
'The ratio of boys to girls is 2:3. If there are 20 boys, how many girls are there?',
'Easy',
'20 corresponds to 2 parts; 3 parts = 30.',
'30','25','35','40',0
),

(
'Ratio',
'What is the ratio of 45 minutes to 1 hour?',
'Easy',
'1 hour = 60 minutes, so 45:60 = 3:4.',
'3:4','4:3','2:3','1:2',0
),

(
'Ratio',
'If 5 pens cost ₹100, what is the ratio of cost of 1 pen to ₹100?',
'Easy',
'One pen costs ₹20, giving 20:100 = 1:5.',
'1:5','1:4','2:5','5:1',0
),

(
'Ratio',
'Two numbers are in the ratio 4:5 and their sum is 45. Find the smaller number.',
'Easy',
'Total parts = 9; one part = 5; smaller = 20.',
'20','25','15','18',0
),

(
'Ratio',
'If x:y = 7:2 and y = 10, find x.',
'Easy',
'2 parts = 10, so 7 parts = 35.',
'35','30','25','40',0
),

(
'Ratio',
'The ratio 8:12 is equivalent to which ratio?',
'Easy',
'Dividing both terms by 4 gives 2:3.',
'2:3','3:2','4:5','1:3',0
),

(
'Ratio',
'A sum is divided between A and B in ratio 5:7. If total is ₹1200, what is B''s share?',
'Medium',
'B gets 7/12 of ₹1200 = ₹700.',
'₹700','₹500','₹600','₹800',0
);


-- ============================================================
-- 13. AVERAGE
-- ============================================================

INSERT INTO question_seed VALUES

(
'Average',
'Find the average of 10, 20 and 30.',
'Easy',
'Sum = 60 and 60/3 = 20.',
'20','15','25','30',0
),

(
'Average',
'Find the average of 5, 10, 15 and 20.',
'Easy',
'Sum = 50 and 50/4 = 12.5.',
'12.5','10','15','11.5',0
),

(
'Average',
'The average of 5 numbers is 20. What is their total?',
'Easy',
'Total = average × number of values = 20 × 5.',
'100','80','120','90',0
),

(
'Average',
'The average of 4 numbers is 15. If three numbers total 40, find the fourth.',
'Medium',
'Total = 60; fourth = 60 - 40 = 20.',
'20','15','25','10',0
),

(
'Average',
'Find the average of 12 and 18.',
'Easy',
'(12 + 18)/2 = 15.',
'15','14','16','12',0
),

(
'Average',
'The average of 6 numbers is 25. Find their sum.',
'Easy',
'25 × 6 = 150.',
'150','125','175','100',0
),

(
'Average',
'Find the average of 8, 12, 16 and 20.',
'Easy',
'Sum = 56; 56/4 = 14.',
'14','12','16','15',0
),

(
'Average',
'The average age of 3 students is 18 years. What is their total age?',
'Easy',
'18 × 3 = 54.',
'54','48','60','52',0
),

(
'Average',
'The average of 7 and 13 is:',
'Easy',
'(7 + 13)/2 = 10.',
'10','9','11','12',0
),

(
'Average',
'Five numbers have an average of 30. If one number is removed, the average of the remaining four is 28. What number was removed?',
'Medium',
'Original total = 150; remaining total = 112; removed = 38.',
'38','36','40','42',0
);


-- ============================================================
-- 14. GRAMMAR
-- ============================================================

INSERT INTO question_seed VALUES

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'The verb agrees with the singular subject.',
'She goes to school every day.','She go to school every day.','She going to school every day.','She gone to school every day.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'The plural subject requires the plural verb.',
'They are playing cricket.','They is playing cricket.','They was playing cricket.','They be playing cricket.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'An article is required before a singular countable noun.',
'He is an honest man.','He is honest man.','He an honest man.','He is the honest man always.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'The past form of go is went.',
'I went to Mumbai yesterday.','I go to Mumbai yesterday.','I gone to Mumbai yesterday.','I going to Mumbai yesterday.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'The correct preposition is interested in.',
'She is interested in music.','She is interested on music.','She is interested at music.','She is interested by music.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'Use has with a singular subject.',
'He has completed his work.','He have completed his work.','He having completed his work.','He has complete his work.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'An adverb correctly modifies the verb.',
'She sings beautifully.','She sings beautiful.','She beautifully sing.','She singing beautifully.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'The comparative form of good is better.',
'This book is better than that one.','This book is gooder than that one.','This book is best than that one.','This book better that one.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'Use were with the plural subject.',
'The children were happy.','The children was happy.','The children is happy.','The children be happy.',0
),

(
'Grammar',
'Choose the correct sentence.',
'Easy',
'The infinitive form follows want.',
'I want to learn English.','I want learning English.','I want learn English.','I wanting to learn English.',0
);


-- ============================================================
-- 15. ERROR DETECTION
-- ============================================================

INSERT INTO question_seed VALUES

(
'Error Detection',
'Identify the incorrect part: He go to school every day.',
'Easy',
'The singular subject He requires goes.',
'He','go','to school','every day',1
),

(
'Error Detection',
'Identify the incorrect part: She have a new book.',
'Easy',
'She requires has.',
'She','have','a new book','.',1
),

(
'Error Detection',
'Identify the incorrect part: They was late.',
'Easy',
'They requires were.',
'They','was','late','.',1
),

(
'Error Detection',
'Identify the incorrect part: I has completed the work.',
'Easy',
'I requires have.',
'I','has','completed the work','.',1
),

(
'Error Detection',
'Identify the incorrect part: He is good in mathematics.',
'Medium',
'The standard expression is good at mathematics.',
'He','is good','in mathematics','.',2
),

(
'Error Detection',
'Identify the incorrect part: She is senior than me.',
'Medium',
'Senior is normally followed by to, not than.',
'She','is senior','than me','.',2
),

(
'Error Detection',
'Identify the incorrect part: Each students has a book.',
'Medium',
'Each takes a singular noun: student.',
'Each','students','has a book','.',1
),

(
'Error Detection',
'Identify the incorrect part: The news are interesting.',
'Medium',
'News is treated as singular.',
'The news','are','interesting','.',1
),

(
'Error Detection',
'Identify the incorrect part: Mathematics are my favorite subject.',
'Medium',
'Mathematics is singular when referring to the subject.',
'Mathematics','are','my favorite subject','.',1
),

(
'Error Detection',
'Identify the incorrect part: Neither of the answers are correct.',
'Medium',
'Neither is singular and takes is.',
'Neither','of the answers','are correct','.',2
);


-- ============================================================
-- 16. VOCABULARY
-- ============================================================

INSERT INTO question_seed VALUES

(
'Vocabulary',
'Choose the synonym of Rapid.',
'Easy',
'Rapid means very fast.',
'Fast','Slow','Weak','Late',0
),

(
'Vocabulary',
'Choose the antonym of Ancient.',
'Easy',
'Ancient means very old; modern is its opposite.',
'Modern','Old','Historic','Past',0
),

(
'Vocabulary',
'Choose the synonym of Happy.',
'Easy',
'Joyful means happy.',
'Joyful','Angry','Sad','Tired',0
),

(
'Vocabulary',
'Choose the antonym of Expand.',
'Easy',
'Contract means become smaller.',
'Contract','Increase','Grow','Extend',0
),

(
'Vocabulary',
'Choose the synonym of Difficult.',
'Easy',
'Hard is a synonym of difficult.',
'Hard','Easy','Simple','Light',0
),

(
'Vocabulary',
'Choose the antonym of Victory.',
'Easy',
'Defeat is the opposite of victory.',
'Defeat','Success','Win','Triumph',0
),

(
'Vocabulary',
'Choose the synonym of Intelligent.',
'Easy',
'Smart means intelligent.',
'Smart','Weak','Lazy','Slow',0
),

(
'Vocabulary',
'Choose the antonym of Generous.',
'Easy',
'Stingy means unwilling to give.',
'Stingy','Kind','Helpful','Giving',0
),

(
'Vocabulary',
'Choose the synonym of Begin.',
'Easy',
'Start means begin.',
'Start','End','Stop','Finish',0
),

(
'Vocabulary',
'Choose the antonym of Honest.',
'Easy',
'Dishonest is the opposite of honest.',
'Dishonest','Truthful','Fair','Sincere',0
);


-- ============================================================
-- 17. READING COMPREHENSION
-- ============================================================

INSERT INTO question_seed VALUES

(
'Reading Comprehension',
'Passage: Regular exercise improves physical fitness and helps maintain a healthy lifestyle. What is the main idea?',
'Easy',
'The passage focuses on the benefits of exercise.',
'Exercise supports good health.','Exercise is unnecessary.','Exercise is only for athletes.','Exercise causes illness.',0
),

(
'Reading Comprehension',
'Passage: Reading books improves vocabulary and develops concentration. Which benefit is mentioned?',
'Easy',
'The passage directly mentions vocabulary and concentration.',
'Better vocabulary','Poor memory','Less concentration','Reduced knowledge',0
),

(
'Reading Comprehension',
'Passage: Saving water is important because freshwater resources are limited. Why should water be saved?',
'Easy',
'Freshwater resources are limited.',
'Water resources are limited.','Water is unlimited.','Water has no use.','Water is always available.',0
),

(
'Reading Comprehension',
'Passage: Trees provide oxygen, reduce pollution and support wildlife. What is one benefit of trees?',
'Easy',
'Trees help reduce pollution.',
'They increase pollution.','They reduce oxygen.','They destroy wildlife.','They create waste.',0
),

(
'Reading Comprehension',
'Passage: Time management allows students to complete tasks efficiently. What does time management help students do?',
'Easy',
'It helps students complete tasks efficiently.',
'Complete tasks efficiently','Avoid all work','Waste time','Stop studying',0
),

(
'Reading Comprehension',
'Passage: Healthy food provides nutrients needed by the body. What does healthy food provide?',
'Easy',
'Healthy food provides nutrients.',
'Nutrients','Pollution','Stress','Noise',0
),

(
'Reading Comprehension',
'Passage: Public transport can reduce the number of private vehicles on roads. What can public transport reduce?',
'Easy',
'It can reduce private vehicle use.',
'Private vehicles','Roads','Passengers','Public transport',0
),

(
'Reading Comprehension',
'Passage: Teamwork combines the abilities of different people to achieve a common goal. What is the purpose of teamwork?',
'Easy',
'Teamwork helps people achieve a shared goal.',
'Achieve a common goal','Avoid cooperation','Work alone','Create conflict',0
),

(
'Reading Comprehension',
'Passage: Learning from mistakes helps people improve their future decisions. What does learning from mistakes encourage?',
'Easy',
'It encourages improvement in future decisions.',
'Better decisions','Repeated mistakes','Ignoring experience','Avoiding learning',0
),

(
'Reading Comprehension',
'Passage: Technology makes communication faster and allows people to connect across long distances. What does technology improve according to the passage?',
'Easy',
'Technology makes communication faster.',
'Communication','Distance','Isolation','Travel',0
);


-- ============================================================
-- 18. CURRENT AFFAIRS
-- ============================================================

INSERT INTO question_seed VALUES

(
'Current Affairs',
'Which type of event is generally covered under current affairs?',
'Easy',
'Current affairs includes recent national and international developments.',
'Recent events','Ancient history','Basic arithmetic','Grammar rules',0
),

(
'Current Affairs',
'Which category is commonly included in current affairs preparation?',
'Easy',
'Government policies are a common current-affairs topic.',
'Government policies','Only grammar','Only mathematics','Only literature',0
),

(
'Current Affairs',
'International summits are relevant to which preparation area?',
'Easy',
'International summits are current events.',
'Current Affairs','Grammar','Ratio','Coding',0
),

(
'Current Affairs',
'Which area commonly forms part of current affairs?',
'Easy',
'Economic developments are commonly reported.',
'Economic developments','Sentence structure','Blood relations','Averages',0
),

(
'Current Affairs',
'Sports tournaments are commonly studied under which section?',
'Easy',
'Sports events are part of current affairs.',
'Current Affairs','Quantitative Aptitude','Grammar','Syllogism',0
),

(
'Current Affairs',
'New government schemes are relevant to:',
'Easy',
'Government schemes are current developments.',
'Current Affairs','Vocabulary','Profit and Loss','Direction Sense',0
),

(
'Current Affairs',
'Major national appointments are generally covered in:',
'Easy',
'Important appointments are current events.',
'Current Affairs','Grammar','Ratio','Average',0
),

(
'Current Affairs',
'Recent awards and honours are usually part of:',
'Easy',
'Awards are commonly included in current affairs.',
'Current Affairs','Coding-Decoding','Percentage','Blood Relations',0
),

(
'Current Affairs',
'Important national and international reports are useful for:',
'Easy',
'Reports are commonly studied for current affairs.',
'Current Affairs','Grammar','Syllogism','Profit and Loss',0
),

(
'Current Affairs',
'Recent environmental developments are covered under:',
'Easy',
'Environmental developments are current events.',
'Current Affairs','Vocabulary','Ratio','Average',0
);


-- ============================================================
-- 19. BANKING AWARENESS
-- ============================================================

INSERT INTO question_seed VALUES

(
'Banking Awareness',
'What does ATM stand for?',
'Easy',
'ATM stands for Automated Teller Machine.',
'Automated Teller Machine','Automatic Transfer Money','Account Transfer Machine','Any Time Money',0
),

(
'Banking Awareness',
'What does RBI stand for?',
'Easy',
'RBI stands for Reserve Bank of India.',
'Reserve Bank of India','Regional Bank of India','Reserve Banking Institution','Rural Bank of India',0
),

(
'Banking Awareness',
'Which institution is the central bank of India?',
'Easy',
'The Reserve Bank of India is India''s central bank.',
'RBI','SBI','SEBI','LIC',0
),

(
'Banking Awareness',
'What is a savings account primarily used for?',
'Easy',
'It is used to safely keep personal savings and earn interest.',
'Saving money','Issuing passports','Buying insurance only','Paying taxes only',0
),

(
'Banking Awareness',
'What does KYC commonly stand for?',
'Easy',
'KYC means Know Your Customer.',
'Know Your Customer','Keep Your Cash','Know Your Credit','Keep Your Customer',0
),

(
'Banking Awareness',
'Which document is commonly used as identity proof for KYC?',
'Easy',
'An officially accepted identity document can be used for KYC.',
'Identity document','Movie ticket','Shopping list','Newspaper',0
),

(
'Banking Awareness',
'What is a bank loan?',
'Easy',
'A loan is money provided by a lender that is repaid according to agreed terms.',
'Borrowed money','Free money','A deposit only','A tax',0
),

(
'Banking Awareness',
'What is interest?',
'Easy',
'Interest is the cost of borrowing or return on deposited money.',
'Cost or return on money','A bank branch','A cheque book','A password',0
),

(
'Banking Awareness',
'What is a fixed deposit?',
'Easy',
'A fixed deposit keeps money deposited for a specified period at agreed terms.',
'Deposit for a fixed period','Daily shopping account','Insurance policy','Credit card',0
),

(
'Banking Awareness',
'What is a cheque?',
'Easy',
'A cheque is a written instruction to a bank to make a payment.',
'Written payment instruction','Loan agreement','Insurance contract','Tax receipt',0
);


-- ============================================================
-- 20. INSURANCE AWARENESS
-- ============================================================

INSERT INTO question_seed VALUES

(
'Insurance Awareness',
'What is insurance primarily used for?',
'Easy',
'Insurance provides financial protection against specified risks.',
'Risk protection','Entertainment','Education only','Currency exchange',0
),

(
'Insurance Awareness',
'What is a premium?',
'Easy',
'A premium is the amount paid for insurance coverage.',
'Amount paid for insurance','Claim amount only','Bank balance','Tax refund',0
),

(
'Insurance Awareness',
'What is a policy?',
'Easy',
'A policy is the insurance contract containing its terms and conditions.',
'Insurance contract','Bank cheque','Loan receipt','Identity card',0
),

(
'Insurance Awareness',
'What is an insurance claim?',
'Easy',
'A claim is a request for payment under an insurance policy.',
'Request for policy benefit','Bank deposit','Loan application','Tax payment',0
),

(
'Insurance Awareness',
'Which type of insurance protects against risks related to a vehicle?',
'Easy',
'Motor insurance covers specified vehicle-related risks.',
'Motor insurance','Travel ticket','Savings account','Fixed deposit',0
),

(
'Insurance Awareness',
'Life insurance primarily provides financial protection related to:',
'Easy',
'Life insurance provides protection linked to life risks.',
'Life risk','Bank interest','Shopping','Currency',0
),

(
'Insurance Awareness',
'Health insurance mainly helps cover:',
'Easy',
'Health insurance helps cover eligible medical expenses.',
'Medical expenses','School fees only','Travel tickets','Bank charges',0
),

(
'Insurance Awareness',
'What is the insured?',
'Easy',
'The insured is the person or entity covered by an insurance policy.',
'Covered person or entity','Insurance company only','Bank manager','Agent only',0
),

(
'Insurance Awareness',
'What is the insurer?',
'Easy',
'The insurer is the company providing insurance coverage.',
'Insurance provider','Policy holder only','Bank customer','Borrower',0
),

(
'Insurance Awareness',
'Why is insurance important?',
'Easy',
'Insurance helps reduce the financial impact of covered risks.',
'Financial risk protection','To increase risk','To avoid saving','To replace banking',0
);


-- ============================================================
-- 21. STATIC GK
-- ============================================================

INSERT INTO question_seed VALUES

(
'Static GK',
'What is the capital of India?',
'Easy',
'New Delhi is the capital of India.',
'New Delhi','Mumbai','Kolkata','Chennai',0
),

(
'Static GK',
'Which is the largest planet in the Solar System?',
'Easy',
'Jupiter is the largest planet.',
'Jupiter','Saturn','Earth','Mars',0
),

(
'Static GK',
'Which planet is known as the Red Planet?',
'Easy',
'Mars appears reddish because of iron minerals on its surface.',
'Mars','Venus','Mercury','Jupiter',0
),

(
'Static GK',
'What is the currency of Japan?',
'Easy',
'Japan uses the yen.',
'Yen','Won','Dollar','Baht',0
),

(
'Static GK',
'Which is the longest river in India?',
'Medium',
'The Ganga is generally regarded as India''s longest river.',
'Ganga','Yamuna','Godavari','Narmada',0
),

(
'Static GK',
'Which gas is most abundant in Earth''s atmosphere?',
'Easy',
'Nitrogen makes up about 78% of Earth''s atmosphere.',
'Nitrogen','Oxygen','Carbon dioxide','Hydrogen',0
),

(
'Static GK',
'Who wrote the Indian national anthem?',
'Easy',
'Rabindranath Tagore wrote Jana Gana Mana.',
'Rabindranath Tagore','Bankim Chandra Chattopadhyay','Sarojini Naidu','Subhas Chandra Bose',0
),

(
'Static GK',
'Which is the largest ocean on Earth?',
'Easy',
'The Pacific Ocean is the largest ocean.',
'Pacific Ocean','Atlantic Ocean','Indian Ocean','Arctic Ocean',0
),

(
'Static GK',
'How many continents are there?',
'Easy',
'There are seven commonly recognized continents.',
'7','5','6','8',0
),

(
'Static GK',
'Which is the smallest continent by land area?',
'Easy',
'Australia is the smallest continent by land area.',
'Australia','Europe','Antarctica','South America',0
);


-- ============================================================
-- 22. INSERT QUESTIONS FOR ALL 48 TOPICS
-- ============================================================

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
FROM topics t
INNER JOIN question_seed qs
    ON qs.topic_name = t.topic_name;


-- ============================================================
-- 23. INSERT FOUR OPTIONS FOR EVERY QUESTION
-- ============================================================

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,

    CASE n.n
        WHEN 0 THEN qs.option_a
        WHEN 1 THEN qs.option_b
        WHEN 2 THEN qs.option_c
        ELSE qs.option_d
    END,

    CASE n.n
        WHEN 0 THEN qs.correct_index = 0
        WHEN 1 THEN qs.correct_index = 1
        WHEN 2 THEN qs.correct_index = 2
        ELSE qs.correct_index = 3
    END

FROM questions q

INNER JOIN topics t
    ON t.topic_id = q.topic_id

INNER JOIN question_seed qs
    ON qs.topic_name = t.topic_name
    AND qs.question_text = q.question_text

CROSS JOIN
(
    SELECT 0 AS n
    UNION ALL SELECT 1
    UNION ALL SELECT 2
    UNION ALL SELECT 3
) n

WHERE NOT EXISTS
(
    SELECT 1
    FROM options o
    WHERE o.question_id = q.question_id
);


-- ============================================================
-- 24. VERIFY EXAMS AND SUBJECTS
-- ============================================================

SELECT
    e.exam_name,
    COUNT(s.subject_id) AS subject_count
FROM exams e
LEFT JOIN subjects s
    ON s.exam_id = e.exam_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
)
GROUP BY
    e.exam_id,
    e.exam_name
ORDER BY
    e.exam_id;


-- ============================================================
-- 25. VERIFY TOPICS
-- ============================================================

SELECT
    e.exam_name,
    s.subject_name,
    COUNT(t.topic_id) AS topic_count
FROM exams e
INNER JOIN subjects s
    ON s.exam_id = e.exam_id
LEFT JOIN topics t
    ON t.subject_id = s.subject_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
)
GROUP BY
    e.exam_id,
    s.subject_id,
    e.exam_name,
    s.subject_name
ORDER BY
    e.exam_id,
    s.subject_id;


-- ============================================================
-- 26. VERIFY QUESTIONS
-- ============================================================

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM exams e
INNER JOIN subjects s
    ON s.exam_id = e.exam_id
INNER JOIN topics t
    ON t.subject_id = s.subject_id
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
)
GROUP BY
    e.exam_id,
    s.subject_id,
    t.topic_id,
    e.exam_name,
    s.subject_name,
    t.topic_name
ORDER BY
    e.exam_id,
    s.subject_id,
    t.topic_id;


-- ============================================================
-- 27. VERIFY TOTALS
-- ============================================================

SELECT
    COUNT(*) AS total_exams
FROM exams
WHERE exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


SELECT
    COUNT(*) AS total_subjects
FROM subjects s
INNER JOIN exams e
    ON e.exam_id = s.exam_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


SELECT
    COUNT(*) AS total_topics
FROM topics t
INNER JOIN subjects s
    ON s.subject_id = t.subject_id
INNER JOIN exams e
    ON e.exam_id = s.exam_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


SELECT
    COUNT(*) AS total_questions
FROM questions q
INNER JOIN topics t
    ON t.topic_id = q.topic_id
INNER JOIN subjects s
    ON s.subject_id = t.subject_id
INNER JOIN exams e
    ON e.exam_id = s.exam_id
WHERE e.exam_name IN (
    'ESIC UDC',
    'OICL Assistant',
    'NIACL Assistant'
);


-- ============================================================
-- EXPECTED:
--
-- total_exams     = 3
-- total_subjects  = 12
-- total_topics    = 48
-- total_questions = 480
-- ============================================================


DROP TEMPORARY TABLE question_seed;

 
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;  

USE ai_adaptive_learning;

SELECT COUNT(*) AS total_exams
FROM exams
WHERE exam_name IN ('ESIC UDC','OICL Assistant','NIACL Assistant');

SELECT COUNT(*) AS total_subjects
FROM subjects s
JOIN exams e ON e.exam_id = s.exam_id
WHERE e.exam_name IN ('ESIC UDC','OICL Assistant','NIACL Assistant');

SELECT COUNT(*) AS total_topics
FROM topics t
JOIN subjects s ON s.subject_id = t.subject_id
JOIN exams e ON e.exam_id = s.exam_id
WHERE e.exam_name IN ('ESIC UDC','OICL Assistant','NIACL Assistant');

SELECT COUNT(*) AS total_questions
FROM questions q
JOIN topics t ON t.topic_id = q.topic_id
JOIN subjects s ON s.subject_id = t.subject_id
JOIN exams e ON e.exam_id = s.exam_id
WHERE e.exam_name IN ('ESIC UDC','OICL Assistant','NIACL Assistant');

USE ai_adaptive_learning;

SELECT
    student_id,
    topic_id,
    questions_attempted,
    questions_correct,
    accuracy,
    mastery_level
FROM student_progress
WHERE student_id = 6;

SELECT
    attempt_id,
    student_id,
    exam_id,
    score,
    total_questions,
    correct_answers,
    completed_at
FROM quiz_attempts
WHERE student_id = 6
ORDER BY attempt_id DESC;

USE ai_adaptive_learning;

SELECT
    s.subject_name,
    COUNT(sp.topic_id) AS topic_records,
    SUM(sp.questions_attempted) AS attempted,
    SUM(sp.questions_correct) AS correct,
    ROUND(
        SUM(sp.questions_correct) /
        NULLIF(SUM(sp.questions_attempted), 0) * 100,
        2
    ) AS accuracy
FROM student_progress sp
JOIN topics t
    ON sp.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
WHERE sp.student_id = 6
GROUP BY s.subject_name
ORDER BY s.subject_name;

USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- REBUILD STUDENT PROGRESS FOR ALL STUDENTS
-- FROM ACTUAL COMPLETED QUIZ ANSWERS
-- ============================================================

DELETE FROM student_progress;

INSERT INTO student_progress
(
    student_id,
    topic_id,
    questions_attempted,
    questions_correct,
    accuracy,
    mastery_level,
    last_attempted_at
)
SELECT
    qa.student_id,
    qa.topic_id,
    qa.questions_attempted,
    qa.questions_correct,

    ROUND(
        qa.questions_correct /
        NULLIF(qa.questions_attempted, 0) * 100,
        2
    ) AS accuracy,

    ROUND(
        qa.questions_correct /
        NULLIF(qa.questions_attempted, 0) * 100,
        2
    ) AS mastery_level,

    qa.last_attempted_at

FROM
(
    SELECT
        a.student_id,
        q.topic_id,

        COUNT(
            CASE
                WHEN ans.selected_option_id IS NOT NULL
                THEN 1
            END
        ) AS questions_attempted,

        SUM(
            CASE
                WHEN ans.selected_option_id IS NOT NULL
                     AND ans.is_correct = 1
                THEN 1
                ELSE 0
            END
        ) AS questions_correct,

        MAX(a.completed_at) AS last_attempted_at

    FROM quiz_attempts a

    INNER JOIN quiz_answers ans
        ON a.attempt_id = ans.attempt_id

    INNER JOIN questions q
        ON ans.question_id = q.question_id

    WHERE a.completed_at IS NOT NULL

    GROUP BY
        a.student_id,
        q.topic_id

) AS qa

WHERE qa.questions_attempted > 0;


SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
SELECT
    s.student_id,
    s.name,
    COUNT(sp.topic_id) AS topics_with_progress,
    SUM(sp.questions_attempted) AS questions_attempted,
    SUM(sp.questions_correct) AS questions_correct,
    ROUND(
        SUM(sp.questions_correct) /
        NULLIF(SUM(sp.questions_attempted), 0) * 100,
        2
    ) AS overall_accuracy
FROM students s
LEFT JOIN student_progress sp
    ON s.student_id = sp.student_id
GROUP BY
    s.student_id,
    s.name
ORDER BY s.student_id;

SELECT
    sp.student_id,
    s.name,
    sub.subject_name,
    SUM(sp.questions_attempted) AS attempted,
    SUM(sp.questions_correct) AS correct,
    ROUND(
        SUM(sp.questions_correct) /
        NULLIF(SUM(sp.questions_attempted), 0) * 100,
        2
    ) AS accuracy
FROM student_progress sp
JOIN topics t
    ON sp.topic_id = t.topic_id
JOIN subjects sub
    ON t.subject_id = sub.subject_id
JOIN students s
    ON sp.student_id = s.student_id
GROUP BY
    sp.student_id,
    s.name,
    sub.subject_name
ORDER BY
    sp.student_id,
    sub.subject_name;
    
    USE ai_adaptive_learning;

SELECT
    sp.student_id,
    s.name,
    sub.subject_name,
    SUM(sp.questions_attempted) AS attempted,
    SUM(sp.questions_correct) AS correct,
    ROUND(
        SUM(sp.questions_correct) /
        NULLIF(SUM(sp.questions_attempted), 0) * 100,
        2
    ) AS accuracy
FROM student_progress sp
JOIN topics t
    ON sp.topic_id = t.topic_id
JOIN subjects sub
    ON t.subject_id = sub.subject_id
JOIN students s
    ON sp.student_id = s.student_id
GROUP BY
    sp.student_id,
    s.name,
    sub.subject_name
ORDER BY
    sp.student_id,
    sub.subject_name;
    
USE ai_adaptive_learning;

SELECT
    a.attempt_id,
    a.student_id,
    qa.question_id,
    q.question_id AS current_question_id,
    q.topic_id AS current_topic_id,
    t.topic_name,
    s.subject_name
FROM quiz_answers qa

JOIN quiz_attempts a
    ON qa.attempt_id = a.attempt_id

LEFT JOIN questions q
    ON qa.question_id = q.question_id

LEFT JOIN topics t
    ON q.topic_id = t.topic_id

LEFT JOIN subjects s
    ON t.subject_id = s.subject_id

ORDER BY
    a.student_id,
    a.attempt_id;
    
USE ai_adaptive_learning;

SELECT
    subject_id,
    exam_id,
    subject_name
FROM subjects
ORDER BY exam_id, subject_id;

SELECT
    t.topic_id,
    t.subject_id,
    t.topic_name,
    s.subject_id AS matched_subject_id,
    s.subject_name
FROM topics t
LEFT JOIN subjects s
    ON t.subject_id = s.subject_id
ORDER BY t.subject_id, t.topic_id;    

USE ai_adaptive_learning;

CREATE TABLE IF NOT EXISTS topics_backup_before_progress_fix AS
SELECT * FROM topics;

USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;

UPDATE topics t
JOIN subjects s
    ON
    (
        t.topic_name IN (
            'Coding-Decoding',
            'Blood Relations',
            'Syllogism',
            'Direction Sense'
        )
        AND s.subject_name = 'Reasoning Ability'
    )
    OR
    (
        t.topic_name IN (
            'Percentage',
            'Profit and Loss',
            'Profit & Loss',
            'Ratio',
            'Average'
        )
        AND s.subject_name = 'Quantitative Aptitude'
    )
    OR
    (
        t.topic_name IN (
            'Grammar',
            'Error Detection',
            'Vocabulary',
            'Reading Comprehension'
        )
        AND s.subject_name = 'English Language'
    )
    OR
    (
        t.topic_name IN (
            'Current Affairs',
            'Banking Awareness',
            'Insurance Awareness',
            'Static GK'
        )
        AND s.subject_name = 'General Awareness'
    )
SET t.subject_id = s.subject_id;

SET SQL_SAFE_UPDATES = 1;

SELECT
    subject_id,
    exam_id,
    subject_name
FROM subjects
ORDER BY exam_id, subject_id;

USE ai_adaptive_learning;

SELECT
    subject_id,
    COUNT(*) AS topic_count,
    GROUP_CONCAT(topic_name ORDER BY topic_id SEPARATOR ' | ') AS topics
FROM topics_backup_before_progress_fix
GROUP BY subject_id
ORDER BY subject_id;
USE ai_adaptive_learning;
SELECT
    subject_id,
    topic_id,
    topic_name
FROM topics_backup_before_progress_fix
ORDER BY subject_id, topic_id;
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- ============================================================
-- STEP 1: RESTORE TOPICS TO THE STATE BEFORE THE BAD UPDATE
-- ============================================================

UPDATE topics t
JOIN topics_backup_before_progress_fix b
    ON t.topic_id = b.topic_id
SET t.subject_id = b.subject_id;


-- ============================================================
-- STEP 2: MAP OLD SUBJECT IDs TO THE CURRENT 12 SUBJECT IDs
--
-- ESIC UDC
-- old 1  -> current 15  Reasoning Ability
-- old 2  -> current 18  Quantitative Aptitude
-- old 3  -> current 21  English Language
-- old 10 -> current 24  General Awareness
--
-- OICL Assistant
-- old 4  -> current 14  Reasoning Ability
-- old 5  -> current 17  Quantitative Aptitude
-- old 6  -> current 20  English Language
-- old 11 -> current 23  General Awareness
--
-- NIACL Assistant
-- old 7  -> current 13  Reasoning Ability
-- old 8  -> current 16  Quantitative Aptitude
-- old 9  -> current 19  English Language
-- old 12 -> current 22  General Awareness
-- ============================================================

UPDATE topics
SET subject_id =
    CASE subject_id

        -- ESIC UDC
        WHEN 1  THEN 15
        WHEN 2  THEN 18
        WHEN 3  THEN 21
        WHEN 10 THEN 24

        -- OICL Assistant
        WHEN 4  THEN 14
        WHEN 5  THEN 17
        WHEN 6  THEN 20
        WHEN 11 THEN 23

        -- NIACL Assistant
        WHEN 7  THEN 13
        WHEN 8  THEN 16
        WHEN 9  THEN 19
        WHEN 12 THEN 22

        ELSE subject_id
    END
WHERE subject_id IN
(
    1,2,3,4,5,6,7,8,9,10,11,12
);


-- ============================================================
-- STEP 3: CLEAR OLD DERIVED STUDENT PROGRESS
-- ============================================================

DELETE FROM student_progress;


-- ============================================================
-- STEP 4: REBUILD STUDENT PROGRESS FROM REAL QUIZ ANSWERS
-- FOR ALL STUDENTS
-- ============================================================

INSERT INTO student_progress
(
    student_id,
    topic_id,
    questions_attempted,
    questions_correct,
    accuracy,
    mastery_level,
    last_attempted_at
)
SELECT
    x.student_id,
    x.topic_id,
    x.questions_attempted,
    x.questions_correct,

    ROUND(
        x.questions_correct /
        NULLIF(x.questions_attempted, 0) * 100,
        2
    ) AS accuracy,

    ROUND(
        x.questions_correct /
        NULLIF(x.questions_attempted, 0) * 100,
        2
    ) AS mastery_level,

    x.last_attempted_at

FROM
(
    SELECT
        a.student_id,
        q.topic_id,

        COUNT(*) AS questions_attempted,

        SUM(
            CASE
                WHEN qa.is_correct = 1 THEN 1
                ELSE 0
            END
        ) AS questions_correct,

        MAX(a.completed_at) AS last_attempted_at

    FROM quiz_answers qa

    INNER JOIN quiz_attempts a
        ON qa.attempt_id = a.attempt_id

    INNER JOIN questions q
        ON qa.question_id = q.question_id

    WHERE a.completed_at IS NOT NULL

    GROUP BY
        a.student_id,
        q.topic_id

) AS x

WHERE x.questions_attempted > 0;


-- ============================================================
-- STEP 5: FINISH
-- ============================================================

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
USE ai_adaptive_learning;

SELECT
    sp.student_id,
    s.name,
    sub.subject_name,
    SUM(sp.questions_attempted) AS attempted,
    SUM(sp.questions_correct) AS correct,
    ROUND(
        SUM(sp.questions_correct) /
        NULLIF(SUM(sp.questions_attempted), 0) * 100,
        2
    ) AS accuracy
FROM student_progress sp
JOIN topics t
    ON sp.topic_id = t.topic_id
JOIN subjects sub
    ON t.subject_id = sub.subject_id
JOIN students s
    ON sp.student_id = s.student_id
GROUP BY
    sp.student_id,
    s.name,
    sub.subject_name
ORDER BY
    sp.student_id,
    sub.subject_name;
    
USE ai_adaptive_learning;

SELECT
    s.exam_id,
    s.subject_name,
    COUNT(t.topic_id) AS topic_count,
    GROUP_CONCAT(t.topic_name ORDER BY t.topic_id SEPARATOR ' | ') AS topics
FROM subjects s
LEFT JOIN topics t
    ON t.subject_id = s.subject_id
WHERE s.exam_id IN (1,2,3)
GROUP BY s.exam_id, s.subject_id, s.subject_name
ORDER BY s.exam_id, s.subject_id;    
    
    USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =========================================================
-- 1. BACKUP CURRENT DATA BEFORE CLEANING
-- =========================================================

DROP TABLE IF EXISTS topics_backup_before_duplicate_cleanup;
CREATE TABLE topics_backup_before_duplicate_cleanup AS
SELECT * FROM topics;

DROP TABLE IF EXISTS questions_backup_before_duplicate_cleanup;
CREATE TABLE questions_backup_before_duplicate_cleanup AS
SELECT * FROM questions;

DROP TABLE IF EXISTS options_backup_before_duplicate_cleanup;
CREATE TABLE options_backup_before_duplicate_cleanup AS
SELECT * FROM options;

DROP TABLE IF EXISTS student_progress_backup_before_duplicate_cleanup;
CREATE TABLE student_progress_backup_before_duplicate_cleanup AS
SELECT * FROM student_progress;


-- =========================================================
-- 2. CREATE A TEMPORARY MAP:
--    duplicate topic -> topic that we KEEP
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS topic_cleanup_map;

CREATE TEMPORARY TABLE topic_cleanup_map AS
SELECT
    t.topic_id AS old_topic_id,
    (
        SELECT MIN(t2.topic_id)
        FROM topics t2
        WHERE t2.subject_id = t.subject_id
          AND t2.topic_name = t.topic_name
    ) AS keep_topic_id,
    t.subject_id,
    t.topic_name
FROM topics t;


-- =========================================================
-- 3. MOVE QUESTIONS FROM DUPLICATE TOPICS
-- =========================================================

UPDATE questions q
JOIN topic_cleanup_map m
    ON q.topic_id = m.old_topic_id
SET q.topic_id = m.keep_topic_id
WHERE m.old_topic_id <> m.keep_topic_id;


-- =========================================================
-- 4. REMOVE OLD STUDENT PROGRESS
--    It will be rebuilt from actual quiz answers.
-- =========================================================

DELETE FROM student_progress;


-- =========================================================
-- 5. DELETE DUPLICATE TOPICS
-- =========================================================

DELETE t
FROM topics t
JOIN topic_cleanup_map m
    ON t.topic_id = m.old_topic_id
WHERE m.old_topic_id <> m.keep_topic_id;


-- =========================================================
-- 6. REMOVE "TIME AND WORK"
--    It is NOT part of our final 4 Quant topics.
--
--    Questions belonging to it were moved nowhere because
--    Time and Work is not one of the required topics.
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS obsolete_questions;

CREATE TEMPORARY TABLE obsolete_questions AS
SELECT q.question_id
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
WHERE t.topic_name = 'Time and Work';


-- Delete quiz answers referring to obsolete questions
DELETE qa
FROM quiz_answers qa
JOIN obsolete_questions oq
    ON qa.question_id = oq.question_id;


-- Delete options of obsolete questions
DELETE o
FROM options o
JOIN obsolete_questions oq
    ON o.question_id = oq.question_id;


-- Delete obsolete questions
DELETE q
FROM questions q
JOIN obsolete_questions oq
    ON q.question_id = oq.question_id;


-- Delete obsolete Time and Work topics
DELETE FROM topics
WHERE topic_name = 'Time and Work';


-- =========================================================
-- 7. REBUILD STUDENT PROGRESS FROM REAL QUIZ DATA
-- =========================================================

INSERT INTO student_progress
(
    student_id,
    topic_id,
    questions_attempted,
    questions_correct,
    accuracy,
    mastery_level,
    last_attempted_at
)
SELECT
    x.student_id,
    x.topic_id,
    x.questions_attempted,
    x.questions_correct,
    ROUND(
        x.questions_correct /
        NULLIF(x.questions_attempted, 0) * 100,
        2
    ),
    ROUND(
        x.questions_correct /
        NULLIF(x.questions_attempted, 0) * 100,
        2
    ),
    x.last_attempted_at
FROM
(
    SELECT
        a.student_id,
        q.topic_id,
        COUNT(*) AS questions_attempted,
        SUM(
            CASE
                WHEN qa.is_correct = 1 THEN 1
                ELSE 0
            END
        ) AS questions_correct,
        MAX(a.completed_at) AS last_attempted_at
    FROM quiz_answers qa
    INNER JOIN quiz_attempts a
        ON qa.attempt_id = a.attempt_id
    INNER JOIN questions q
        ON qa.question_id = q.question_id
    WHERE a.completed_at IS NOT NULL
    GROUP BY a.student_id, q.topic_id
) AS x
WHERE x.questions_attempted > 0;


COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

USE ai_adaptive_learning;

SELECT
    s.exam_id,
    s.subject_name,
    COUNT(t.topic_id) AS topic_count,
    GROUP_CONCAT(
        t.topic_name
        ORDER BY t.topic_id
        SEPARATOR ' | '
    ) AS topics
FROM subjects s
LEFT JOIN topics t
    ON t.subject_id = s.subject_id
WHERE s.exam_id IN (1,2,3)
GROUP BY
    s.exam_id,
    s.subject_id,
    s.subject_name
ORDER BY
    s.exam_id,
    s.subject_id;
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- Backup Cloze Test data
DROP TABLE IF EXISTS cloze_test_questions_backup;
CREATE TABLE cloze_test_questions_backup AS
SELECT q.*
FROM questions q
JOIN topics t ON q.topic_id = t.topic_id
WHERE t.topic_name = 'Cloze Test';

-- Remove quiz answers belonging to Cloze Test questions
DELETE qa
FROM quiz_answers qa
JOIN questions q ON qa.question_id = q.question_id
JOIN topics t ON q.topic_id = t.topic_id
WHERE t.topic_name = 'Cloze Test';

-- Remove options belonging to Cloze Test questions
DELETE o
FROM options o
JOIN questions q ON o.question_id = q.question_id
JOIN topics t ON q.topic_id = t.topic_id
WHERE t.topic_name = 'Cloze Test';

-- Remove Cloze Test questions
DELETE q
FROM questions q
JOIN topics t ON q.topic_id = t.topic_id
WHERE t.topic_name = 'Cloze Test';

-- Remove Cloze Test topic
DELETE FROM topics
WHERE topic_name = 'Cloze Test';

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;    

SELECT
    s.exam_id,
    s.subject_name,
    COUNT(t.topic_id) AS topic_count,
    GROUP_CONCAT(
        t.topic_name
        ORDER BY t.topic_id
        SEPARATOR ' | '
    ) AS topics
FROM subjects s
LEFT JOIN topics t
    ON t.subject_id = s.subject_id
WHERE s.exam_id IN (1,2,3)
GROUP BY s.exam_id, s.subject_id, s.subject_name
ORDER BY s.exam_id, s.subject_id;    
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- 1. Permanently remove the generic question generator
DROP PROCEDURE IF EXISTS fill_all_topics;

-- 2. Remove ONLY the generic questions created by that generator
--    Keep all real/topic-specific questions.
DELETE FROM quiz_answers
WHERE question_id IN (
    SELECT question_id
    FROM (
        SELECT q.question_id
        FROM questions q
        WHERE q.question_text LIKE 'Practice Question % for %: Which approach is most appropriate when solving a problem related to %?'
    ) x
);

DELETE FROM options
WHERE question_id IN (
    SELECT question_id
    FROM (
        SELECT q.question_id
        FROM questions q
        WHERE q.question_text LIKE 'Practice Question % for %: Which approach is most appropriate when solving a problem related to %?'
    ) x
);

DELETE FROM questions
WHERE question_text LIKE
'Practice Question % for %: Which approach is most appropriate when solving a problem related to %?';

-- 3. Rebuild progress from the remaining real questions
DELETE FROM student_progress;

INSERT INTO student_progress
(
    student_id,
    topic_id,
    questions_attempted,
    questions_correct,
    accuracy,
    mastery_level,
    last_attempted_at
)
SELECT
    a.student_id,
    q.topic_id,
    COUNT(*) AS questions_attempted,
    SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) AS questions_correct,
    ROUND(
        SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END)
        / COUNT(*) * 100,
        2
    ) AS accuracy,
    ROUND(
        SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END)
        / COUNT(*) * 100,
        2
    ) AS mastery_level,
    MAX(a.completed_at)
FROM quiz_answers qa
JOIN quiz_attempts a
    ON qa.attempt_id = a.attempt_id
JOIN questions q
    ON qa.question_id = q.question_id
WHERE a.completed_at IS NOT NULL
GROUP BY
    a.student_id,
    q.topic_id;

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

SELECT
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM topics t
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
GROUP BY t.topic_id, t.topic_name
ORDER BY t.topic_id;

USE ai_adaptive_learning;

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM exams e
JOIN subjects s
    ON s.exam_id = e.exam_id
JOIN topics t
    ON t.subject_id = s.subject_id
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
WHERE e.exam_id IN (1,2,3)
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
    
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- Backup questions before deduplication
DROP TABLE IF EXISTS questions_backup_before_final_dedup;

CREATE TABLE questions_backup_before_final_dedup AS
SELECT * FROM questions;


-- Find duplicate questions and keep the lowest question_id.
-- If a duplicate has already been used in a quiz attempt,
-- keep it instead of deleting historical data.

CREATE TEMPORARY TABLE question_delete_list AS
SELECT q.question_id
FROM questions q
WHERE EXISTS (
    SELECT 1
    FROM questions q2
    WHERE q2.topic_id = q.topic_id
      AND TRIM(q2.question_text) = TRIM(q.question_text)
      AND q2.question_id < q.question_id
)
AND NOT EXISTS (
    SELECT 1
    FROM quiz_answers qa
    WHERE qa.question_id = q.question_id
);


-- Delete options belonging to duplicate unused questions
DELETE o
FROM options o
JOIN question_delete_list d
    ON d.question_id = o.question_id;


-- Delete duplicate unused questions
DELETE q
FROM questions q
JOIN question_delete_list d
    ON d.question_id = q.question_id;


COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM exams e
JOIN subjects s
    ON s.exam_id = e.exam_id
JOIN topics t
    ON t.subject_id = s.subject_id
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
WHERE e.exam_id IN (1,2,3)
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
    
    USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- Backup before final question-count cleanup
DROP TABLE IF EXISTS questions_backup_before_10_question_cleanup;

CREATE TABLE questions_backup_before_10_question_cleanup AS
SELECT * FROM questions;


-- =========================================================
-- FIND QUESTIONS ABOVE THE FIRST 10 FOR EACH TOPIC
--
-- Used questions get priority so existing student history
-- is preserved.
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS question_rankings;

CREATE TEMPORARY TABLE question_rankings AS
SELECT
    q.question_id,
    q.topic_id,
    ROW_NUMBER() OVER (
        PARTITION BY q.topic_id
        ORDER BY
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM quiz_answers qa
                    WHERE qa.question_id = q.question_id
                )
                THEN 0
                ELSE 1
            END,
            q.question_id
    ) AS rn
FROM questions q;


-- =========================================================
-- QUESTIONS TO DELETE
--
-- Only delete questions beyond the first 10 that have
-- NEVER been used in a quiz answer.
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS questions_to_delete;

CREATE TEMPORARY TABLE questions_to_delete AS
SELECT r.question_id
FROM question_rankings r
WHERE r.rn > 10
AND NOT EXISTS (
    SELECT 1
    FROM quiz_answers qa
    WHERE qa.question_id = r.question_id
);


-- =========================================================
-- REMOVE OPTIONS OF THOSE QUESTIONS
-- =========================================================

DELETE o
FROM options o
JOIN questions_to_delete d
    ON d.question_id = o.question_id;


-- =========================================================
-- REMOVE THE EXTRA QUESTIONS
-- =========================================================

DELETE q
FROM questions q
JOIN questions_to_delete d
    ON d.question_id = q.question_id;


COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM exams e
JOIN subjects s
    ON s.exam_id = e.exam_id
JOIN topics t
    ON t.subject_id = s.subject_id
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
WHERE e.exam_id IN (1,2,3)
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
    
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- Find the extra Grammar question(s) beyond the first 10.
-- Keep any question already used in a quiz attempt.
DELETE o
FROM options o
JOIN (
    SELECT q.question_id
    FROM questions q
    JOIN topics t ON q.topic_id = t.topic_id
    JOIN subjects s ON t.subject_id = s.subject_id
    WHERE s.exam_id = 1
      AND s.subject_name = 'English Language'
      AND t.topic_name = 'Grammar'
      AND q.question_id NOT IN (
          SELECT question_id
          FROM quiz_answers
      )
    ORDER BY q.question_id DESC
    LIMIT 1
) x ON o.question_id = x.question_id;

DELETE q
FROM questions q
JOIN topics t ON q.topic_id = t.topic_id
JOIN subjects s ON t.subject_id = s.subject_id
WHERE s.exam_id = 1
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'
  AND q.question_id NOT IN (
      SELECT question_id
      FROM quiz_answers
  )
AND q.question_id = (
    SELECT question_id
    FROM (
        SELECT q2.question_id
        FROM questions q2
        JOIN topics t2 ON q2.topic_id = t2.topic_id
        JOIN subjects s2 ON t2.subject_id = s2.subject_id
        WHERE s2.exam_id = 1
          AND s2.subject_name = 'English Language'
          AND t2.topic_name = 'Grammar'
          AND q2.question_id NOT IN (
              SELECT question_id
              FROM quiz_answers
          )
        ORDER BY q2.question_id DESC
        LIMIT 1
    ) z
);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;    

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(q.question_id) AS question_count
FROM exams e
JOIN subjects s ON s.exam_id = e.exam_id
JOIN topics t ON t.subject_id = s.subject_id
LEFT JOIN questions q ON q.topic_id = t.topic_id
WHERE e.exam_id = 1
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'
GROUP BY e.exam_name, s.subject_name, t.topic_name;

USE ai_adaptive_learning;

SELECT
    q.question_id,
    q.question_text,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM quiz_answers qa
            WHERE qa.question_id = q.question_id
        )
        THEN 'USED'
        ELSE 'NOT USED'
    END AS status
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
WHERE s.exam_id = 1
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'
ORDER BY q.question_id;


USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =========================================================
-- CLEAN GRAMMAR QUESTION SET FOR ALL 3 EXAMS
-- Existing quiz history is NOT deleted.
-- =========================================================

-- ESIC Grammar = subject_id 21
-- OICL Grammar = subject_id 20
-- NIACL Grammar = subject_id 19

DROP TEMPORARY TABLE IF EXISTS grammar_seed;

CREATE TEMPORARY TABLE grammar_seed (
    subject_id INT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('Easy','Medium','Hard') DEFAULT 'Easy',
    explanation TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    wrong_1 TEXT NOT NULL,
    wrong_2 TEXT NOT NULL,
    wrong_3 TEXT NOT NULL
);

INSERT INTO grammar_seed
(subject_id, question_text, difficulty, explanation,
 correct_option, wrong_1, wrong_2, wrong_3)
VALUES

(21, 'Choose the sentence with correct subject-verb agreement.', 'Easy',
 'A singular subject takes the singular verb "goes".',
 'She goes to school every day.',
 'She go to school every day.',
 'She going to school every day.',
 'She gone to school every day.'),

(21, 'Choose the correct form of the verb.', 'Easy',
 'The subject "They" takes the plural verb "are".',
 'They are playing cricket.',
 'They is playing cricket.',
 'They was playing cricket.',
 'They be playing cricket.'),

(21, 'Choose the sentence with the correct article.', 'Easy',
 'The word "umbrella" begins with a vowel sound, so "an" is correct.',
 'She bought an umbrella.',
 'She bought a umbrella.',
 'She bought the umbrella an.',
 'She bought umbrella an.'),

(21, 'Choose the correct past tense sentence.', 'Easy',
 'The past form of "go" is "went".',
 'He went to the market yesterday.',
 'He go to the market yesterday.',
 'He goes to the market yesterday.',
 'He going to the market yesterday.'),

(21, 'Choose the sentence with the correct preposition.', 'Easy',
 'The correct expression is "interested in".',
 'She is interested in music.',
 'She is interested on music.',
 'She is interested at music.',
 'She is interested by music.'),

(21, 'Choose the grammatically correct sentence.', 'Medium',
 'The singular subject "Each student" takes "has".',
 'Each student has a notebook.',
 'Each student have a notebook.',
 'Each student having a notebook.',
 'Each student are a notebook.'),

(21, 'Choose the correct pronoun.', 'Medium',
 'After "between", the objective pronoun "him" is correct.',
 'Between you and him, this is the better choice.',
 'Between you and he, this is the better choice.',
 'Between you and his, this is the better choice.',
 'Between you and himself, this is the better choice.'),

(21, 'Choose the sentence with the correct conjunction.', 'Medium',
 'The conjunction "because" correctly shows the reason.',
 'I stayed home because it was raining.',
 'I stayed home but it was raining.',
 'I stayed home or it was raining.',
 'I stayed home and because it was raining.'),

(21, 'Choose the correct comparative form.', 'Easy',
 'The comparative form of "good" is "better".',
 'This book is better than that one.',
 'This book is gooder than that one.',
 'This book is best than that one.',
 'This book is more good than that one.'),

(21, 'Choose the sentence with correct tense usage.', 'Medium',
 'The present perfect form "has finished" is correct with "She".',
 'She has finished her work.',
 'She have finished her work.',
 'She has finish her work.',
 'She finishing her work.'),


(20, 'Choose the sentence with correct subject-verb agreement.', 'Easy',
 'A singular subject takes the singular verb "goes".',
 'She goes to school every day.',
 'She go to school every day.',
 'She going to school every day.',
 'She gone to school every day.'),

(20, 'Choose the correct form of the verb.', 'Easy',
 'The subject "They" takes the plural verb "are".',
 'They are playing cricket.',
 'They is playing cricket.',
 'They was playing cricket.',
 'They be playing cricket.'),

(20, 'Choose the correct article.', 'Easy',
 'The word "honest" begins with a vowel sound, so "an" is correct.',
 'He is an honest man.',
 'He is a honest man.',
 'He is the honest an man.',
 'He is honest an man.'),

(20, 'Choose the correct past tense sentence.', 'Easy',
 'The past form of "write" is "wrote".',
 'She wrote a letter yesterday.',
 'She write a letter yesterday.',
 'She writes a letter yesterday.',
 'She writing a letter yesterday.'),

(20, 'Choose the correct preposition.', 'Easy',
 'The correct expression is "good at".',
 'He is good at mathematics.',
 'He is good in mathematics.',
 'He is good on mathematics.',
 'He is good by mathematics.'),

(20, 'Choose the grammatically correct sentence.', 'Medium',
 'The singular subject "Every student" takes "has".',
 'Every student has a uniform.',
 'Every student have a uniform.',
 'Every student are a uniform.',
 'Every student having a uniform.'),

(20, 'Choose the correct pronoun.', 'Easy',
 'The pronoun "her" correctly functions as an object.',
 'The teacher praised her.',
 'The teacher praised she.',
 'The teacher praised hers.',
 'The teacher praised herselfs.'),

(20, 'Choose the correct conjunction.', 'Easy',
 'The conjunction "although" correctly introduces a contrast.',
 'Although it was raining, we went outside.',
 'Although it was raining but we went outside.',
 'Although it was raining or we went outside.',
 'Although it was raining and but we went outside.'),

(20, 'Choose the correct comparative sentence.', 'Easy',
 'The correct comparative form is "smarter".',
 'Riya is smarter than Tina.',
 'Riya is smartest than Tina.',
 'Riya is more smarter than Tina.',
 'Riya is smart than Tina.'),

(20, 'Choose the sentence with correct tense usage.', 'Medium',
 'The past perfect "had left" correctly describes an earlier past action.',
 'The train had left before we arrived.',
 'The train has left before we arrived.',
 'The train had leave before we arrived.',
 'The train leaving before we arrived.'),


(19, 'Choose the sentence with correct subject-verb agreement.', 'Easy',
 'A singular subject takes the singular verb "runs".',
 'The boy runs fast.',
 'The boy run fast.',
 'The boy running fast.',
 'The boy are fast.'),

(19, 'Choose the correct form of the verb.', 'Easy',
 'The plural subject "We" takes "are".',
 'We are ready for the exam.',
 'We is ready for the exam.',
 'We was ready for the exam.',
 'We be ready for the exam.'),

(19, 'Choose the correct article.', 'Easy',
 'The word "apple" begins with a vowel sound, so "an" is correct.',
 'I ate an apple.',
 'I ate a apple.',
 'I ate apple an.',
 'I ate the an apple.'),

(19, 'Choose the correct past tense sentence.', 'Easy',
 'The past form of "see" is "saw".',
 'I saw him yesterday.',
 'I see him yesterday.',
 'I seen him yesterday.',
 'I seeing him yesterday.'),

(19, 'Choose the correct preposition.', 'Easy',
 'The correct expression is "afraid of".',
 'The child is afraid of the dark.',
 'The child is afraid from the dark.',
 'The child is afraid at the dark.',
 'The child is afraid on the dark.'),

(19, 'Choose the grammatically correct sentence.', 'Medium',
 'The singular subject "Neither" takes the singular verb "is".',
 'Neither of the answers is correct.',
 'Neither of the answers are correct.',
 'Neither of the answers were correct.',
 'Neither of the answers be correct.'),

(19, 'Choose the correct pronoun.', 'Easy',
 'The pronoun "they" correctly refers to the plural subject "students".',
 'The students completed their work.',
 'The students completed his work.',
 'The students completed her work.',
 'The students completed its work.'),

(19, 'Choose the correct conjunction.', 'Easy',
 'The conjunction "and" joins two related actions.',
 'She studied hard and passed the exam.',
 'She studied hard but passed the exam and.',
 'She studied hard or passed the exam and.',
 'She studied hard because passed the exam.'),

(19, 'Choose the correct comparative sentence.', 'Easy',
 'The comparative form of "beautiful" is "more beautiful".',
 'This garden is more beautiful than that one.',
 'This garden is beautifuler than that one.',
 'This garden is most beautiful than that one.',
 'This garden is more beautifully than that one.'),

(19, 'Choose the sentence with correct tense usage.', 'Medium',
 'The present continuous "is reading" is correct for an action happening now.',
 'She is reading a book now.',
 'She are reading a book now.',
 'She is read a book now.',
 'She reading a book now.');


-- =========================================================
-- INSERT QUESTIONS
-- =========================================================

INSERT INTO questions
(
    topic_id,
    question_text,
    difficulty,
    explanation
)
SELECT
    t.topic_id,
    g.question_text,
    g.difficulty,
    g.explanation
FROM grammar_seed g
JOIN topics t
    ON t.subject_id = g.subject_id
WHERE t.topic_name = 'Grammar';


-- =========================================================
-- INSERT EXACTLY 4 OPTIONS FOR THE NEW QUESTIONS
-- =========================================================

INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,
    g.correct_option,
    TRUE
FROM questions q
JOIN grammar_seed g
    ON q.question_text = g.question_text
WHERE q.topic_id IN (
    SELECT topic_id
    FROM topics
    WHERE topic_name = 'Grammar'
)
AND q.question_id >= (
    SELECT COALESCE(MAX(question_id), 0)
    FROM questions_backup_before_final_dedup
)

UNION ALL

SELECT
    q.question_id,
    g.wrong_1,
    FALSE
FROM questions q
JOIN grammar_seed g
    ON q.question_text = g.question_text
WHERE q.topic_id IN (
    SELECT topic_id
    FROM topics
    WHERE topic_name = 'Grammar'
)
AND q.question_id >= (
    SELECT COALESCE(MAX(question_id), 0)
    FROM questions_backup_before_final_dedup
)

UNION ALL

SELECT
    q.question_id,
    g.wrong_2,
    FALSE
FROM questions q
JOIN grammar_seed g
    ON q.question_text = g.question_text
WHERE q.topic_id IN (
    SELECT topic_id
    FROM topics
    WHERE topic_name = 'Grammar'
)
AND q.question_id >= (
    SELECT COALESCE(MAX(question_id), 0)
    FROM questions_backup_before_final_dedup
)

UNION ALL

SELECT
    q.question_id,
    g.wrong_3,
    FALSE
FROM questions q
JOIN grammar_seed g
    ON q.question_text = g.question_text
WHERE q.topic_id IN (
    SELECT topic_id
    FROM topics
    WHERE topic_name = 'Grammar'
)
AND q.question_id >= (
    SELECT COALESCE(MAX(question_id), 0)
    FROM questions_backup_before_final_dedup
);


COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

ROLLBACK;

USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =========================================================
-- 1. REMOVE ALL CURRENT GRAMMAR QUESTIONS
--    Only Grammar is affected.
-- =========================================================

DELETE o
FROM options o
JOIN questions q
    ON o.question_id = q.question_id
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar';


DELETE q
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar';


-- =========================================================
-- 2. TEMPORARY GRAMMAR QUESTION DATA
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS grammar_seed;

CREATE TEMPORARY TABLE grammar_seed (
    exam_id INT NOT NULL,
    question_no INT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('Easy','Medium','Hard') NOT NULL,
    explanation TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    wrong_1 TEXT NOT NULL,
    wrong_2 TEXT NOT NULL,
    wrong_3 TEXT NOT NULL
);


-- =========================================================
-- ESIC UDC GRAMMAR - 10 QUESTIONS
-- =========================================================

INSERT INTO grammar_seed VALUES

(1,1,
'Choose the sentence with correct subject-verb agreement.',
'Easy',
'A singular subject takes the singular verb "goes".',
'She goes to school every day.',
'She go to school every day.',
'She going to school every day.',
'She gone to school every day.'),

(1,2,
'Choose the correct form of the verb.',
'Easy',
'The subject "They" takes the plural verb "are".',
'They are playing cricket.',
'They is playing cricket.',
'They was playing cricket.',
'They be playing cricket.'),

(1,3,
'Choose the sentence with the correct article.',
'Easy',
'"Umbrella" begins with a vowel sound, so "an" is correct.',
'She bought an umbrella.',
'She bought a umbrella.',
'She bought the umbrella an.',
'She bought umbrella an.'),

(1,4,
'Choose the correct past tense sentence.',
'Easy',
'The past form of "go" is "went".',
'He went to the market yesterday.',
'He go to the market yesterday.',
'He goes to the market yesterday.',
'He going to the market yesterday.'),

(1,5,
'Choose the sentence with the correct preposition.',
'Easy',
'The correct expression is "interested in".',
'She is interested in music.',
'She is interested on music.',
'She is interested at music.',
'She is interested by music.'),

(1,6,
'Choose the grammatically correct sentence.',
'Medium',
'The singular subject "Each student" takes "has".',
'Each student has a notebook.',
'Each student have a notebook.',
'Each student having a notebook.',
'Each student are a notebook.'),

(1,7,
'Choose the correct pronoun.',
'Easy',
'After "between", the objective pronoun "him" is correct.',
'Between you and him, this is the better choice.',
'Between you and he, this is the better choice.',
'Between you and his, this is the better choice.',
'Between you and herself, this is the better choice.'),

(1,8,
'Choose the sentence with the correct conjunction.',
'Easy',
'"Because" correctly introduces the reason.',
'I stayed home because it was raining.',
'I stayed home but it was raining.',
'I stayed home or it was raining.',
'I stayed home and because it was raining.'),

(1,9,
'Choose the correct comparative form.',
'Easy',
'The comparative form of "good" is "better".',
'This book is better than that one.',
'This book is gooder than that one.',
'This book is best than that one.',
'This book is more good than that one.'),

(1,10,
'Choose the sentence with correct tense usage.',
'Medium',
'"Has finished" is the correct present perfect form.',
'She has finished her work.',
'She have finished her work.',
'She has finish her work.',
'She finishing her work.');


-- =========================================================
-- OICL ASSISTANT GRAMMAR - 10 QUESTIONS
-- =========================================================

INSERT INTO grammar_seed VALUES

(2,1,
'Choose the sentence with correct subject-verb agreement.',
'Easy',
'A singular subject takes the singular verb "goes".',
'She goes to school every day.',
'She go to school every day.',
'She going to school every day.',
'She gone to school every day.'),

(2,2,
'Choose the correct form of the verb.',
'Easy',
'The subject "They" takes the plural verb "are".',
'They are playing cricket.',
'They is playing cricket.',
'They was playing cricket.',
'They be playing cricket.'),

(2,3,
'Choose the correct article.',
'Easy',
'"Honest" begins with a vowel sound, so "an" is correct.',
'He is an honest man.',
'He is a honest man.',
'He is the honest an man.',
'He is honest an man.'),

(2,4,
'Choose the correct past tense sentence.',
'Easy',
'The past form of "write" is "wrote".',
'She wrote a letter yesterday.',
'She write a letter yesterday.',
'She writes a letter yesterday.',
'She writing a letter yesterday.'),

(2,5,
'Choose the correct preposition.',
'Easy',
'The correct expression is "good at".',
'He is good at mathematics.',
'He is good in mathematics.',
'He is good on mathematics.',
'He is good by mathematics.'),

(2,6,
'Choose the grammatically correct sentence.',
'Medium',
'The singular subject "Every student" takes "has".',
'Every student has a uniform.',
'Every student have a uniform.',
'Every student are a uniform.',
'Every student having a uniform.'),

(2,7,
'Choose the correct pronoun.',
'Easy',
'"Her" correctly functions as an object.',
'The teacher praised her.',
'The teacher praised she.',
'The teacher praised hers.',
'The teacher praised herselfs.'),

(2,8,
'Choose the correct conjunction.',
'Easy',
'"Although" correctly introduces a contrast.',
'Although it was raining, we went outside.',
'Although it was raining but we went outside.',
'Although it was raining or we went outside.',
'Although it was raining and but we went outside.'),

(2,9,
'Choose the correct comparative sentence.',
'Easy',
'The correct comparative form is "smarter".',
'Riya is smarter than Tina.',
'Riya is smartest than Tina.',
'Riya is more smarter than Tina.',
'Riya is smart than Tina.'),

(2,10,
'Choose the sentence with correct tense usage.',
'Medium',
'"Had left" correctly describes an earlier past action.',
'The train had left before we arrived.',
'The train has left before we arrived.',
'The train had leave before we arrived.',
'The train leaving before we arrived.');


-- =========================================================
-- NIACL ASSISTANT GRAMMAR - 10 QUESTIONS
-- =========================================================

INSERT INTO grammar_seed VALUES

(3,1,
'Choose the sentence with correct subject-verb agreement.',
'Easy',
'A singular subject takes the singular verb "runs".',
'The boy runs fast.',
'The boy run fast.',
'The boy running fast.',
'The boy are fast.'),

(3,2,
'Choose the correct form of the verb.',
'Easy',
'The plural subject "We" takes "are".',
'We are ready for the exam.',
'We is ready for the exam.',
'We was ready for the exam.',
'We be ready for the exam.'),

(3,3,
'Choose the correct article.',
'Easy',
'"Apple" begins with a vowel sound, so "an" is correct.',
'I ate an apple.',
'I ate a apple.',
'I ate apple an.',
'I ate the an apple.'),

(3,4,
'Choose the correct past tense sentence.',
'Easy',
'The past form of "see" is "saw".',
'I saw him yesterday.',
'I see him yesterday.',
'I seen him yesterday.',
'I seeing him yesterday.'),

(3,5,
'Choose the correct preposition.',
'Easy',
'The correct expression is "afraid of".',
'The child is afraid of the dark.',
'The child is afraid from the dark.',
'The child is afraid at the dark.',
'The child is afraid on the dark.'),

(3,6,
'Choose the grammatically correct sentence.',
'Medium',
'The singular subject "Neither" takes the singular verb "is".',
'Neither of the answers is correct.',
'Neither of the answers are correct.',
'Neither of the answers were correct.',
'Neither of the answers be correct.'),

(3,7,
'Choose the correct pronoun.',
'Easy',
'"Their" correctly refers to the plural subject "students".',
'The students completed their work.',
'The students completed his work.',
'The students completed her work.',
'The students completed its work.'),

(3,8,
'Choose the correct conjunction.',
'Easy',
'"And" correctly joins the two related actions.',
'She studied hard and passed the exam.',
'She studied hard but passed the exam and.',
'She studied hard or passed the exam and.',
'She studied hard because passed the exam.'),

(3,9,
'Choose the correct comparative sentence.',
'Easy',
'The correct comparative form is "more beautiful".',
'This garden is more beautiful than that one.',
'This garden is beautifuler than that one.',
'This garden is most beautiful than that one.',
'This garden is more beautifully than that one.'),

(3,10,
'Choose the sentence with correct tense usage.',
'Medium',
'"Is reading" is the correct present continuous form.',
'She is reading a book now.',
'She are reading a book now.',
'She is read a book now.',
'She reading a book now.');


-- =========================================================
-- 3. INSERT QUESTIONS INTO THE CORRECT GRAMMAR TOPIC
-- =========================================================

INSERT INTO questions
(
    topic_id,
    question_text,
    difficulty,
    explanation
)
SELECT
    t.topic_id,
    g.question_text,
    g.difficulty,
    g.explanation
FROM grammar_seed g
JOIN subjects s
    ON s.exam_id = g.exam_id
   AND s.subject_name = 'English Language'
JOIN topics t
    ON t.subject_id = s.subject_id
   AND t.topic_name = 'Grammar';


-- =========================================================
-- 4. INSERT EXACTLY 4 OPTIONS PER QUESTION
--    IMPORTANT: joined using question_id/topic,
--    NOT just question_text.
-- =========================================================

INSERT INTO options
(question_id, option_text, is_correct)

SELECT
    q.question_id,
    g.correct_option,
    TRUE
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
JOIN grammar_seed g
    ON g.exam_id = s.exam_id
   AND g.question_text = q.question_text
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'

UNION ALL

SELECT
    q.question_id,
    g.wrong_1,
    FALSE
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
JOIN grammar_seed g
    ON g.exam_id = s.exam_id
   AND g.question_text = q.question_text
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'

UNION ALL

SELECT
    q.question_id,
    g.wrong_2,
    FALSE
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
JOIN grammar_seed g
    ON g.exam_id = s.exam_id
   AND g.question_text = q.question_text
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'

UNION ALL

SELECT
    q.question_id,
    g.wrong_3,
    FALSE
FROM questions q
JOIN topics t
    ON q.topic_id = t.topic_id
JOIN subjects s
    ON t.subject_id = s.subject_id
JOIN grammar_seed g
    ON g.exam_id = s.exam_id
   AND g.question_text = q.question_text
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar';


COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

ROLLBACK;

USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =========================================================
-- REMOVE OLD GRAMMAR QUESTIONS ONLY
-- =========================================================

DELETE o
FROM options o
JOIN questions q ON q.question_id = o.question_id
JOIN topics t ON t.topic_id = q.topic_id
WHERE t.topic_name = 'Grammar';

DELETE q
FROM questions q
JOIN topics t ON t.topic_id = q.topic_id
WHERE t.topic_name = 'Grammar';


-- =========================================================
-- INSERT 10 CLEAN QUESTIONS FOR EVERY GRAMMAR TOPIC
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS grammar_seed;

CREATE TEMPORARY TABLE grammar_seed (
    subject_id INT,
    question_text TEXT,
    difficulty ENUM('Easy','Medium','Hard'),
    explanation TEXT,
    correct_option TEXT,
    wrong_1 TEXT,
    wrong_2 TEXT,
    wrong_3 TEXT
);

INSERT INTO grammar_seed VALUES

-- ESIC / OICL / NIACL Grammar questions
(21,'Choose the sentence with correct subject-verb agreement.','Easy',
'A singular subject takes the singular verb goes.',
'She goes to school every day.','She go to school every day.','She going to school every day.','She gone to school every day.'),

(21,'Choose the correct form of the verb.','Easy',
'They takes the plural verb are.',
'They are playing cricket.','They is playing cricket.','They was playing cricket.','They be playing cricket.'),

(21,'Choose the correct article.','Easy',
'An is used before a vowel sound.',
'She bought an umbrella.','She bought a umbrella.','She bought the umbrella an.','She bought umbrella an.'),

(21,'Choose the correct past tense sentence.','Easy',
'The past form of go is went.',
'He went to the market yesterday.','He go to the market yesterday.','He goes to the market yesterday.','He going to the market yesterday.'),

(21,'Choose the correct preposition.','Easy',
'The correct expression is interested in.',
'She is interested in music.','She is interested on music.','She is interested at music.','She is interested by music.'),

(21,'Choose the grammatically correct sentence.','Medium',
'Each student is singular and takes has.',
'Each student has a notebook.','Each student have a notebook.','Each student having a notebook.','Each student are a notebook.'),

(21,'Choose the correct pronoun.','Easy',
'Him is the correct object pronoun.',
'Between you and him, this is better.','Between you and he, this is better.','Between you and his, this is better.','Between you and they, this is better.'),

(21,'Choose the correct conjunction.','Easy',
'Because correctly gives the reason.',
'I stayed home because it was raining.','I stayed home but it was raining.','I stayed home or it was raining.','I stayed home and because it was raining.'),

(21,'Choose the correct comparative form.','Easy',
'The comparative form of good is better.',
'This book is better than that one.','This book is gooder than that one.','This book is best than that one.','This book is more good than that one.'),

(21,'Choose the sentence with correct tense usage.','Medium',
'Has finished is the correct present perfect form.',
'She has finished her work.','She have finished her work.','She has finish her work.','She finishing her work.'),


(20,'Identify the sentence with correct subject-verb agreement.','Easy',
'A singular subject takes goes.',
'Riya goes to college every day.','Riya go to college every day.','Riya going to college every day.','Riya gone to college every day.'),

(20,'Choose the correct verb form.','Easy',
'We takes the plural verb are.',
'We are ready for the examination.','We is ready for the examination.','We was ready for the examination.','We be ready for the examination.'),

(20,'Choose the correct article in the sentence.','Easy',
'An is used before a vowel sound.',
'He is an honest man.','He is a honest man.','He is the honest an man.','He is honest an man.'),

(20,'Choose the correct past tense.','Easy',
'The past form of write is wrote.',
'She wrote a letter yesterday.','She write a letter yesterday.','She writes a letter yesterday.','She writing a letter yesterday.'),

(20,'Choose the correct preposition.','Easy',
'The correct expression is good at.',
'He is good at mathematics.','He is good in mathematics.','He is good on mathematics.','He is good by mathematics.'),

(20,'Choose the grammatically correct sentence.','Medium',
'Every student is singular and takes has.',
'Every student has a uniform.','Every student have a uniform.','Every student are a uniform.','Every student having a uniform.'),

(20,'Choose the correct pronoun.','Easy',
'Her is the correct object pronoun.',
'The teacher praised her.','The teacher praised she.','The teacher praised hers.','The teacher praised they.'),

(20,'Choose the correct conjunction.','Easy',
'Although correctly introduces contrast.',
'Although it was raining, we went outside.','Although it was raining but we went outside.','Although it was raining or we went outside.','Although it was raining and but we went outside.'),

(20,'Choose the correct comparative sentence.','Easy',
'Smarter is the correct comparative form.',
'Riya is smarter than Tina.','Riya is smartest than Tina.','Riya is more smarter than Tina.','Riya is smart than Tina.'),

(20,'Choose the correct past perfect sentence.','Medium',
'Had left correctly describes the earlier past action.',
'The train had left before we arrived.','The train has left before we arrived.','The train had leave before we arrived.','The train leaving before we arrived.'),


(19,'Choose the sentence with correct subject-verb agreement.','Easy',
'A singular subject takes runs.',
'The boy runs fast.','The boy run fast.','The boy running fast.','The boy are fast.'),

(19,'Choose the correct verb form.','Easy',
'We takes are.',
'We are ready for the exam.','We is ready for the exam.','We was ready for the exam.','We be ready for the exam.'),

(19,'Choose the correct article.','Easy',
'An is used before the vowel sound in apple.',
'I ate an apple.','I ate a apple.','I ate apple an.','I ate the an apple.'),

(19,'Choose the correct past tense sentence.','Easy',
'The past form of see is saw.',
'I saw him yesterday.','I see him yesterday.','I seen him yesterday.','I seeing him yesterday.'),

(19,'Choose the correct preposition.','Easy',
'The correct expression is afraid of.',
'The child is afraid of the dark.','The child is afraid from the dark.','The child is afraid at the dark.','The child is afraid on the dark.'),

(19,'Choose the grammatically correct sentence.','Medium',
'Neither is singular and therefore takes is.',
'Neither of the answers is correct.','Neither of the answers are correct.','Neither of the answers were correct.','Neither of the answers be correct.'),

(19,'Choose the correct possessive pronoun usage.','Easy',
'Their correctly refers to the plural subject students.',
'The students completed their work.','The students completed his work.','The students completed her work.','The students completed its work.'),

(19,'Choose the correct conjunction.','Easy',
'And joins two related actions.',
'She studied hard and passed the exam.','She studied hard but passed the exam and.','She studied hard or passed the exam and.','She studied hard because passed the exam.'),

(19,'Choose the correct comparative sentence.','Easy',
'More beautiful is the correct comparative form.',
'This garden is more beautiful than that one.','This garden is beautifuler than that one.','This garden is most beautiful than that one.','This garden is more beautifully than that one.'),

(19,'Choose the sentence with correct tense usage.','Medium',
'Is reading is the correct present continuous form.',
'She is reading a book now.','She are reading a book now.','She is read a book now.','She reading a book now.');


-- =========================================================
-- INSERT QUESTIONS
-- =========================================================

INSERT INTO questions
(topic_id, question_text, difficulty, explanation)
SELECT
    t.topic_id,
    g.question_text,
    g.difficulty,
    g.explanation
FROM grammar_seed g
JOIN topics t
    ON t.topic_name = 'Grammar'
   AND t.subject_id = g.subject_id;


-- =========================================================
-- INSERT OPTIONS USING QUESTION_ID
-- This is the important fix.
-- =========================================================

INSERT INTO options
(question_id, option_text, is_correct)

SELECT q.question_id, g.correct_option, TRUE
FROM questions q
JOIN topics t ON t.topic_id = q.topic_id
JOIN grammar_seed g
  ON g.subject_id = t.subject_id
 AND g.question_text = q.question_text
WHERE t.topic_name = 'Grammar'

UNION ALL

SELECT q.question_id, g.wrong_1, FALSE
FROM questions q
JOIN topics t ON t.topic_id = q.topic_id
JOIN grammar_seed g
  ON g.subject_id = t.subject_id
 AND g.question_text = q.question_text
WHERE t.topic_name = 'Grammar'

UNION ALL

SELECT q.question_id, g.wrong_2, FALSE
FROM questions q
JOIN topics t ON t.topic_id = q.topic_id
JOIN grammar_seed g
  ON g.subject_id = t.subject_id
 AND g.question_text = q.question_text
WHERE t.topic_name = 'Grammar'

UNION ALL

SELECT q.question_id, g.wrong_3, FALSE
FROM questions q
JOIN topics t ON t.topic_id = q.topic_id
JOIN grammar_seed g
  ON g.subject_id = t.subject_id
 AND g.question_text = q.question_text
WHERE t.topic_name = 'Grammar';


COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;


-- =========================================================
-- VERIFY GRAMMAR
-- =========================================================

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(DISTINCT q.question_id) AS question_count,
    COUNT(o.option_id) AS option_count
FROM exams e
JOIN subjects s
    ON s.exam_id = e.exam_id
JOIN topics t
    ON t.subject_id = s.subject_id
LEFT JOIN questions q
    ON q.topic_id = t.topic_id
LEFT JOIN options o
    ON o.question_id = q.question_id
WHERE t.topic_name = 'Grammar'
  AND e.exam_id IN (1,2,3)
GROUP BY
    e.exam_name,
    s.subject_name,
    t.topic_name;
    
USE ai_adaptive_learning;

SET SQL_SAFE_UPDATES = 0;

DROP TEMPORARY TABLE IF EXISTS grammar_options_seed;

CREATE TEMPORARY TABLE grammar_options_seed AS
SELECT
    g.subject_id,
    g.question_text,
    g.correct_option,
    g.wrong_1,
    g.wrong_2,
    g.wrong_3
FROM grammar_seed g;


INSERT INTO options
(
    question_id,
    option_text,
    is_correct
)
SELECT
    q.question_id,
    CASE n.n
        WHEN 1 THEN gos.correct_option
        WHEN 2 THEN gos.wrong_1
        WHEN 3 THEN gos.wrong_2
        WHEN 4 THEN gos.wrong_3
    END AS option_text,
    CASE n.n
        WHEN 1 THEN 1
        ELSE 0
    END AS is_correct
FROM questions q
JOIN topics t
    ON t.topic_id = q.topic_id
JOIN grammar_options_seed gos
    ON gos.subject_id = t.subject_id
   AND gos.question_text = q.question_text
CROSS JOIN
(
    SELECT 1 AS n
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
) n
LEFT JOIN options existing
    ON existing.question_id = q.question_id
WHERE t.topic_name = 'Grammar'
  AND existing.question_id IS NULL;


DROP TEMPORARY TABLE IF EXISTS grammar_options_seed;

SET SQL_SAFE_UPDATES = 1;  

SELECT
    e.exam_name,
    s.subject_name,
    t.topic_name,
    COUNT(DISTINCT q.question_id) AS question_count,
    COUNT(o.option_id) AS option_count
FROM exams e
JOIN subjects s
    ON s.exam_id = e.exam_id
JOIN topics t
    ON t.subject_id = s.subject_id
JOIN questions q
    ON q.topic_id = t.topic_id
LEFT JOIN options o
    ON o.question_id = q.question_id
WHERE e.exam_id IN (1,2,3)
  AND t.topic_name = 'Grammar'
GROUP BY
    e.exam_name,
    s.subject_name,
    t.topic_name; 
USE ai_adaptive_learning;

SELECT
    q.question_id,
    q.question_text,
    COUNT(o.option_id) AS option_count
FROM questions q
JOIN topics t ON q.topic_id = t.topic_id
LEFT JOIN options o ON o.question_id = q.question_id
JOIN subjects s ON t.subject_id = s.subject_id
WHERE s.exam_id IN (1,2,3)
  AND s.subject_name = 'English Language'
  AND t.topic_name = 'Grammar'
GROUP BY q.question_id, q.question_text
ORDER BY s.exam_id, q.question_id; 

   