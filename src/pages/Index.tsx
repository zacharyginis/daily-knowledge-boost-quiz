import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Trophy, Brain, DollarSign, Code, Globe, Lightbulb, Users, Quote, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfile from '@/components/UserProfile';

interface WordData {
  english: { word: string; definition: string; example: string; };
  spanish: { word: string; definition: string; example: string; };
  coding: { term: string; definition: string; example: string; };
  finance: { term: string; definition: string; example: string; };
  philosophy: { term: string; definition: string; example: string; };
  politics: { term: string; definition: string; example: string; };
  stoicQuote: { quote: string; author: string; context: string; };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

interface Stats {
  totalDays: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
}

const dailyWords: WordData[] = [
  {
    english: { word: "Serendipity", definition: "The occurrence of events by chance in a happy way", example: "Finding that book was pure serendipity." },
    spanish: { word: "Madrugada", definition: "Early morning hours before dawn", example: "Me levanto en la madrugada para estudiar." },
    coding: { term: "Algorithm", definition: "A step-by-step procedure for solving a problem", example: "The sorting algorithm arranges data efficiently." },
    finance: { term: "Compound Interest", definition: "Interest calculated on initial principal and accumulated interest", example: "Compound interest helps your savings grow exponentially." },
    philosophy: { term: "Epistemology", definition: "The study of knowledge and how we come to know things", example: "Epistemology questions whether we can truly know anything with certainty." },
    politics: { term: "Sovereignty", definition: "Supreme power or authority within a territory", example: "National sovereignty means a country governs itself without external interference." },
    stoicQuote: { quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", context: "From Meditations, emphasizing the Stoic principle of focusing on what we can control." }
  },
  {
    english: { word: "Ephemeral", definition: "Lasting for a very short time", example: "The beauty of cherry blossoms is ephemeral." },
    spanish: { word: "Sobremesa", definition: "Time spent at table after a meal in conversation", example: "Disfrutamos una larga sobremesa con la familia." },
    coding: { term: "API", definition: "Application Programming Interface - a way for programs to communicate", example: "The weather API provides real-time data." },
    finance: { term: "Diversification", definition: "Spreading investments across various assets to reduce risk", example: "Diversification protects your portfolio from market volatility." },
    philosophy: { term: "Nihilism", definition: "The belief that life is without objective meaning or purpose", example: "Nihilism suggests that traditional values and moral principles are unfounded." },
    politics: { term: "Bureaucracy", definition: "A system of government through departments and subdivisions", example: "The bureaucracy can slow down policy implementation through red tape." },
    stoicQuote: { quote: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius", context: "Teaching that responding to hatred with virtue is more powerful than retaliation." }
  },
  {
    english: { word: "Ubiquitous", definition: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern society." },
    spanish: { word: "Antier", definition: "The day before yesterday", example: "Antier fui al mercado con mi abuela." },
    coding: { term: "Debugging", definition: "The process of finding and fixing errors in code", example: "Debugging took most of my afternoon yesterday." },
    finance: { term: "Inflation", definition: "The rate at which prices for goods and services rise", example: "Inflation affects the purchasing power of your money." },
    philosophy: { term: "Determinism", definition: "The doctrine that all events are the result of previously existing causes", example: "Hard determinism suggests that free will is an illusion." },
    politics: { term: "Populism", definition: "Political approach that appeals to ordinary people against the elite", example: "Populism often emerges during times of economic uncertainty." },
    stoicQuote: { quote: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius", context: "Emphasizing action over endless debate about virtue and morality." }
  }
];

const generateQuizQuestions = (day: number): QuizQuestion[] => {
  if (day === 0) return [];
  
  const previousDay = dailyWords[day - 1];
  return [
    {
      question: `What does "${previousDay.english.word}" mean?`,
      options: [previousDay.english.definition, "A type of food", "A musical instrument", "A weather pattern"],
      correct: 0,
      category: "English"
    },
    {
      question: `What does the Spanish word "${previousDay.spanish.word}" mean?`,
      options: ["A type of dance", previousDay.spanish.definition, "A color", "A building"],
      correct: 1,
      category: "Spanish"
    },
    {
      question: `In coding, what is ${previousDay.coding.term}?`,
      options: ["A type of computer", "A programming language", previousDay.coding.definition, "A software company"],
      correct: 2,
      category: "Coding"
    },
    {
      question: `What is ${previousDay.finance.term} in finance?`,
      options: ["A type of bank", "A stock exchange", "A currency", previousDay.finance.definition],
      correct: 3,
      category: "Finance"
    },
    {
      question: `In philosophy, what is ${previousDay.philosophy.term}?`,
      options: ["A type of government", "A mathematical concept", previousDay.philosophy.definition, "A literary genre"],
      correct: 2,
      category: "Philosophy"
    },
    {
      question: `In politics, what is ${previousDay.politics.term}?`,
      options: [previousDay.politics.definition, "A type of economy", "A philosophical theory", "A scientific method"],
      correct: 0,
      category: "Politics"
    },
    {
      question: `Who said: "${previousDay.stoicQuote.quote.substring(0, 30)}..."?`,
      options: ["Aristotle", "Plato", previousDay.stoicQuote.author, "Socrates"],
      correct: 2,
      category: "Stoic Quote"
    }
  ];
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalDays: 1, streak: 1, correctAnswers: 0, totalQuestions: 0 });
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      return; // Don't redirect, just show the login prompt
    }
    
    if (user) {
      const savedDay = localStorage.getItem(`currentDay_${user.id}`);
      const savedStats = localStorage.getItem(`learningStats_${user.id}`);
      
      if (savedDay) {
        setCurrentDay(parseInt(savedDay));
      }
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`currentDay_${user.id}`, currentDay.toString());
      localStorage.setItem(`learningStats_${user.id}`, JSON.stringify(stats));
    }
  }, [currentDay, stats, user]);

  const startQuiz = () => {
    const questions = generateQuizQuestions(currentDay);
    setQuizQuestions(questions);
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setQuizComplete(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    setShowAnswer(true);
    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correct;
    
    setStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalQuestions: prev.totalQuestions + 1
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setQuizComplete(true);
    }
  };

  const nextDay = () => {
    if (currentDay < dailyWords.length - 1) {
      setCurrentDay(currentDay + 1);
      setStats(prev => ({
        ...prev,
        totalDays: prev.totalDays + 1,
        streak: prev.streak + 1
      }));
    }
    setShowQuiz(false);
    setQuizComplete(false);
  };

  const resetProgress = () => {
    setCurrentDay(0);
    setStats({ totalDays: 1, streak: 1, correctAnswers: 0, totalQuestions: 0 });
    setShowQuiz(false);
    setQuizComplete(false);
    if (user) {
      localStorage.removeItem(`currentDay_${user.id}`);
      localStorage.removeItem(`learningStats_${user.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-slate-700 mb-4">Daily Learning</h1>
          <p className="text-xl text-slate-600 mb-8">Expand your knowledge across seven domains</p>
          <p className="text-lg text-slate-500 mb-8">Sign in to track your progress and start learning</p>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg" 
            className="px-8 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In to Start Learning
          </Button>
        </div>
      </div>
    );
  }

  const today = dailyWords[currentDay];
  const accuracyRate = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;

  if (showQuiz && !quizComplete) {
    const question = quizQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-slate-700 mb-2">Daily Quiz</h1>
              <Badge variant="outline" className="text-lg px-4 py-1 border-slate-300 text-slate-600">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </Badge>
            </div>
            <UserProfile />
          </div>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-100/50">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <Brain className="h-5 w-5 text-blue-400" />
                {question.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium text-slate-700">{question.question}</p>
              
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full text-left justify-start h-auto p-4 border-slate-200 text-slate-700 hover:bg-slate-50 ${
                      showAnswer 
                        ? index === question.correct 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                          : selectedAnswer === index 
                            ? "bg-rose-50 border-rose-200 text-rose-700" 
                            : "opacity-50"
                        : selectedAnswer === index 
                          ? "bg-blue-50 border-blue-200" 
                          : ""
                    }`}
                    onClick={() => !showAnswer && handleAnswerSelect(index)}
                    disabled={showAnswer}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              <div className="pt-4">
                {!showAnswer ? (
                  <Button 
                    onClick={submitAnswer} 
                    disabled={selectedAnswer === null}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-end mb-4">
            <UserProfile />
          </div>
          
          <div className="mb-8">
            <Trophy className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-slate-700 mb-2">Quiz Complete!</h1>
            <p className="text-xl text-slate-600">Great job on today's review!</p>
          </div>

          <Card className="shadow-sm border-slate-200 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-500">
                    {stats.correctAnswers}/{stats.totalQuestions}
                  </p>
                  <p className="text-slate-600">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{accuracyRate}%</p>
                  <p className="text-slate-600">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={nextDay} size="lg" className="px-8 bg-blue-500 hover:bg-blue-600 text-white">
            Continue to Next Day
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Profile */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-slate-700 mb-2">Daily Learning</h1>
            <p className="text-xl text-slate-600">Expand your knowledge across seven domains</p>
            
            <div className="flex justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-sm px-3 py-1 border-slate-300 text-slate-600">
                <Calendar className="h-4 w-4 mr-1" />
                Day {currentDay + 1}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 border-slate-300 text-slate-600">
                🔥 {stats.streak} day streak
              </Badge>
            </div>
          </div>
          <UserProfile />
        </div>

        {/* Stats */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-100/30">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Trophy className="h-5 w-5 text-amber-400" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.totalDays}</p>
                <p className="text-sm text-slate-600">Days Learned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">{accuracyRate}%</p>
                <p className="text-sm text-slate-600">Quiz Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.correctAnswers}</p>
                <p className="text-sm text-slate-600">Correct Answers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{stats.streak}</p>
                <p className="text-sm text-slate-600">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* English Word */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                English Word
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{today.english.word}</h3>
              <p className="text-slate-700 mb-3">{today.english.definition}</p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 italic">"{today.english.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Spanish Word */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Spanish Word
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-rose-600 mb-2">{today.spanish.word}</h3>
              <p className="text-slate-700 mb-3">{today.spanish.definition}</p>
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-sm text-rose-700 italic">"{today.spanish.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Coding Term */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Coding Term
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-emerald-600 mb-2">{today.coding.term}</h3>
              <p className="text-slate-700 mb-3">{today.coding.definition}</p>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <p className="text-sm text-emerald-700 italic">"{today.coding.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Finance Term */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Finance Term
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-amber-600 mb-2">{today.finance.term}</h3>
              <p className="text-slate-700 mb-3">{today.finance.definition}</p>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-700 italic">"{today.finance.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Philosophy Term */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Philosophy Term
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">{today.philosophy.term}</h3>
              <p className="text-slate-700 mb-3">{today.philosophy.definition}</p>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-700 italic">"{today.philosophy.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Politics Term */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Political Term
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-indigo-600 mb-2">{today.politics.term}</h3>
              <p className="text-slate-700 mb-3">{today.politics.definition}</p>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <p className="text-sm text-indigo-700 italic">"{today.politics.example}"</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stoic Quote Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow mb-8 border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5" />
              Daily Stoic Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <blockquote className="text-xl font-medium text-slate-700 mb-4 italic">
              "{today.stoicQuote.quote}"
            </blockquote>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-slate-600">— {today.stoicQuote.author}</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-600">{today.stoicQuote.context}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentDay > 0 && (
            <Button onClick={startQuiz} size="lg" className="px-8 bg-blue-500 hover:bg-blue-600 text-white">
              <BookOpen className="h-5 w-5 mr-2" />
              Take Yesterday's Quiz
            </Button>
          )}
          
          {currentDay < dailyWords.length - 1 && (
            <Button onClick={nextDay} variant="outline" size="lg" className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50">
              Skip to Next Day
            </Button>
          )}
          
          <Button onClick={resetProgress} variant="destructive" size="lg" className="px-8 bg-rose-500 hover:bg-rose-600 text-white">
            Reset Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
