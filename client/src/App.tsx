import { useState } from 'react';
import axios from 'axios';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

function App() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<QuizQuestion[]>('http://localhost:5000/generate-quiz', {
        topic,
        difficulty
      });
      setQuiz(res.data);
      setUserAnswers(Array(res.data.length).fill(null));
      setIsSubmitted(false);
      setScore(null);
    } catch (err: any) {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIdx: number, option: string) => {
    if (isSubmitted) return;
    const updated = [...userAnswers];
    updated[qIdx] = option;
    setUserAnswers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correct++;
    });
    setScore(correct);
    setIsSubmitted(true);
  };

  return (
    <div className="container">
      <h1 className="main-title">Quiz Generator</h1>
      <div className="card quiz-form">
        <input
          type="text"
          placeholder="Enter a topic"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="input"
        />
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="input"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={generateQuiz} className="button" disabled={loading || !topic}>
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
        {error && <div className="error-msg">{error}</div>}
      </div>

      {quiz && (
        <form className="card quiz-area" onSubmit={handleSubmit}>
          {quiz.map((q, idx) => (
            <div key={idx} className="question-block">
              <div className="question-text">{q.question}</div>
              <div className="options">
                {q.options.map((opt, i) => (
                  <label key={i} className="option-label">
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      value={opt}
                      checked={userAnswers[idx] === opt}
                      disabled={isSubmitted}
                      onChange={() => handleSelect(idx, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              {isSubmitted && (
                <div className="feedback">
                  {userAnswers[idx] === q.answer ? (
                    <span className="correct">Correct!</span>
                  ) : (
                    <span className="incorrect">Incorrect. Correct answer: {q.answer}</span>
                  )}
                  <div className="explanation">{q.explanation}</div>
                </div>
              )}
            </div>
          ))}
          {!isSubmitted && (
            <button
              type="submit"
              className="button submit-btn"
              disabled={userAnswers.some(ans => ans === null)}
            >
              Submit Quiz
            </button>
          )}
          {isSubmitted && score !== null && (
            <div className="score">Your Score: {score} / {quiz.length}</div>
          )}
        </form>
      )}
    </div>
  );
}

export default App;
