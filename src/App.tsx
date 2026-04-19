/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Trophy, 
  ArrowRight,
} from 'lucide-react';
import { generateQuiz, Quiz } from './lib/gemini';

type View = 'home' | 'generating' | 'quiz' | 'results';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setError(null);
    setView('generating');
    try {
      const generatedQuiz = await generateQuiz(topic, questionCount, difficulty);
      setQuiz(generatedQuiz);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setView('quiz');
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please try again.');
      setView('home');
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setView('results');
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setTopic('');
    setView('home');
    setError(null);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return userAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header based on theme */}
      <header className="bg-white px-10 py-5 flex justify-between items-center border-b-4 border-primary sticky top-0 z-50">
        <div className="flex items-center gap-3 text-2xl font-extrabold text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          QuizGenie AI
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
             <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 p-8 h-full max-w-7xl mx-auto"
            >
              <aside className="theme-card p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] uppercase tracking-wider text-slate-500 font-bold">Topic & Subject</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Modern Web Architecture"
                    className="theme-input"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] uppercase tracking-wider text-slate-500 font-bold">Difficulty Level</label>
                  <div className="flex flex-wrap gap-2">
                    {['Beginner', 'Intermediate', 'Expert'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`theme-pill ${difficulty === d ? 'theme-pill-active' : ''}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] uppercase tracking-wider text-slate-500 font-bold">Question Count</label>
                  <div className="flex flex-wrap gap-2">
                    {[3, 5, 10, 15].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuestionCount(num)}
                        className={`theme-pill ${questionCount === num ? 'theme-pill-active' : ''}`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-danger text-sm font-bold flex items-center gap-1"><RefreshCw size={14} /> {error}</p>}

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className="theme-btn-primary mt-auto"
                >
                  Generate Test Set
                </button>
              </aside>

              <section className="flex flex-col gap-6">
                <div className="theme-card p-10 flex-1 flex flex-col justify-center items-center text-center">
                  <Sparkles size={64} className="text-secondary mb-6" />
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Create Your Assessment</h1>
                  <p className="text-slate-500 max-w-lg">
                    Define your topic on the left and our AI will curate a professional-grade test
                    to evaluate your knowledge or train your students.
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-8 max-w-2xl mx-auto w-full gap-8"
            >
              <div className="theme-card w-full p-8 flex flex-col gap-6">
                 <div className="flex justify-between items-center text-[13px] font-bold">
                    <span className="text-slate-500">GENERATION IN PROGRESS</span>
                    <span className="text-secondary tracking-widest uppercase">Initializing AI</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                 </div>
                 <div className="text-center">
                   <h2 className="text-2xl font-bold text-slate-800">Writing questions for you...</h2>
                   <p className="text-slate-500 mt-2 italic">"{topic}"</p>
                 </div>
              </div>
            </motion.div>
          )}

          {view === 'quiz' && quiz && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full h-full"
            >
              <div className="theme-card p-10 relative flex-1 flex flex-col">
                <span className="absolute top-8 right-8 theme-badge">AI GENERATED</span>
                
                <div className="text-[14px] font-bold text-primary mb-4 uppercase tracking-wider">
                  QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 mb-10 leading-[1.3]">
                  {quiz.questions[currentQuestionIndex].question}
                </h2>

                <div className="grid gap-4 flex-grow">
                  {quiz.questions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      className={`theme-option ${
                        userAnswers[currentQuestionIndex] === option
                          ? 'border-primary bg-[#F5F3FF]'
                          : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] transition-all ${
                        userAnswers[currentQuestionIndex] === option
                          ? 'bg-primary text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 text-left">{option}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex justify-between items-center pt-8 border-t border-slate-100">
                  <div className="flex-1 mr-8">
                     <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                       <span>Progress</span>
                       <span>{Math.round(((currentQuestionIndex) / quiz.questions.length) * 100)}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary transition-all duration-500" 
                          style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
                        />
                     </div>
                  </div>
                  <button
                    disabled={!userAnswers[currentQuestionIndex]}
                    onClick={nextQuestion}
                    className="theme-btn-primary whitespace-nowrap min-w-[160px]"
                  >
                    {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Test' : 'Next Question'}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'results' && quiz && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 max-w-5xl mx-auto w-full"
            >
              <div className="theme-card p-12 text-center mb-10 flex flex-col items-center">
                 <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-amber-100 transform rotate-3">
                   <Trophy size={40} className="text-white" />
                 </div>
                 <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Test Finalized!</h2>
                 <p className="text-slate-500 mb-8">Performance breakdown based on AI analysis</p>
                 
                 <div className="flex items-center gap-4 bg-surface px-8 py-4 rounded-2xl border border-slate-100">
                    <div className="text-5xl font-black text-primary">{calculateScore()}</div>
                    <div className="text-3xl font-bold text-slate-300">/</div>
                    <div className="text-3xl font-bold text-slate-500">{quiz.questions.length}</div>
                 </div>
              </div>

              <div className="grid gap-6 mb-12">
                {quiz.questions.map((q, i) => {
                  const isCorrect = userAnswers[i] === q.correctAnswer;
                  return (
                    <div
                      key={i}
                      className={`theme-card p-8 border-t-8 ${isCorrect ? 'border-secondary' : 'border-danger'}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.question}</h3>
                        {isCorrect ? (
                          <CheckCircle2 className="text-secondary flex-shrink-0" size={28} />
                        ) : (
                          <XCircle className="text-danger flex-shrink-0" size={28} />
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                         <div className={`p-4 rounded-xl flex-1 ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                           <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-50">Your Answer</span>
                           <p className="font-bold">{userAnswers[i]}</p>
                         </div>
                         {!isCorrect && (
                           <div className="p-4 rounded-xl flex-1 bg-emerald-50 text-emerald-700 border border-emerald-100">
                             <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-50">Correct Answer</span>
                             <p className="font-bold">{q.correctAnswer}</p>
                           </div>
                         )}
                      </div>

                      <div className="bg-surface p-6 rounded-2xl">
                         <p className="text-slate-600">
                           <span className="font-bold text-primary">Insight:</span> {q.explanation}
                         </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mb-20">
                <button onClick={resetQuiz} className="theme-btn-primary px-12">
                   Generate New Test Set
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
