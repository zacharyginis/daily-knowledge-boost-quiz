
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Trophy, Brain, DollarSign, Code, Globe } from 'lucide-react';

interface WordData {
  english: { word: string; definition: string; example: string; };
  spanish: { word: string; definition: string; example: string; };
  coding: { term: string; definition: string; example: string; };
  finance: { term: string; definition: string; example: string; };
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
    finance: { term: "Compound Interest", definition: "Interest calculated on initial principal and accumulated interest", example: "Compound interest helps your savings grow exponentially." }
  },
  {
    english: { word: "Ephemeral", definition: "Lasting for a very short time", example: "The beauty of cherry blossoms is ephemeral." },
    spanish: { word: "Sobremesa", definition: "Time spent at table after a meal in conversation", example: "Disfrutamos una larga sobremesa con la familia." },
    coding: { term: "API", definition: "Application Programming Interface - a way for programs to communicate", example: "The weather API provides real-time data." },
    finance: { term: "Diversification", definition: "Spreading investments across various assets to reduce risk", example: "Diversification protects your portfolio from market volatility." }
  },
  {
    english: { word: "Ubiquitous", definition: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern society." },
    spanish: { word: "Antier", definition: "The day before yesterday", example: "Antier fui al mercado con mi abuela." },
    coding: { term: "Debugging", definition: "The process of finding and fixing errors in code", example: "Debugging took most of my afternoon yesterday." },
    finance: { term: "Inflation", definition: "The rate at which prices for goods and services rise", example: "Inflation affects the purchasing power of your money." }
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
    }
  ];
};

const Index = () => {
  const [currentDay, setCurrentDay] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalDays: 1, streak: 1, correctAnswers: 0, totalQuestions: 0 });
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    const savedDay = localStorage.getItem('currentDay');
    const savedStats = localStorage.getItem('learningStats');
    
    if (savedDay) {
      setCurrentDay(parseInt(savedDay));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentDay', currentDay.toString());
    localStorage.setItem('learningStats', JSON.stringify(stats));
  }, [currentDay, stats]);

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
    localStorage.removeItem('currentDay');
    localStorage.removeItem('learningStats');
  };

  const today = dailyWords[currentDay];
  const accuracyRate = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;

  if (showQuiz && !quizComplete) {
    const question = quizQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Quiz</h1>
            <Badge variant="outline" className="text-lg px-4 py-1">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </Badge>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                {question.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">{question.question}</p>
              
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full text-left justify-start h-auto p-4 ${
                      showAnswer 
                        ? index === question.correct 
                          ? "bg-green-100 border-green-500 text-green-800" 
                          : selectedAnswer === index 
                            ? "bg-red-100 border-red-500 text-red-800" 
                            : "opacity-50"
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
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="w-full">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
            <p className="text-xl text-gray-600">Great job on today's review!</p>
          </div>

          <Card className="shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.correctAnswers}/{stats.totalQuestions}
                  </p>
                  <p className="text-gray-600">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{accuracyRate}%</p>
                  <p className="text-gray-600">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={nextDay} size="lg" className="px-8">
            Continue to Next Day
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Learning</h1>
          <p className="text-xl text-gray-600">Expand your vocabulary across four domains</p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Calendar className="h-4 w-4 mr-1" />
              Day {currentDay + 1}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              🔥 {stats.streak} day streak
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDays}</p>
                <p className="text-sm text-gray-600">Days Learned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{accuracyRate}%</p>
                <p className="text-sm text-gray-600">Quiz Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.correctAnswers}</p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.streak}</p>
                <p className="text-sm text-gray-600">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* English Word */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                English Word
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">{today.english.word}</h3>
              <p className="text-gray-700 mb-3">{today.english.definition}</p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 italic">"{today.english.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Spanish Word */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Spanish Word
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-red-700 mb-2">{today.spanish.word}</h3>
              <p className="text-gray-700 mb-3">{today.spanish.definition}</p>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800 italic">"{today.spanish.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Coding Term */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Coding Term
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-green-700 mb-2">{today.coding.term}</h3>
              <p className="text-gray-700 mb-3">{today.coding.definition}</p>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800 italic">"{today.coding.example}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Finance Term */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Finance Term
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-yellow-700 mb-2">{today.finance.term}</h3>
              <p className="text-gray-700 mb-3">{today.finance.definition}</p>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 italic">"{today.finance.example}"</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentDay > 0 && (
            <Button onClick={startQuiz} size="lg" className="px-8">
              <BookOpen className="h-5 w-5 mr-2" />
              Take Yesterday's Quiz
            </Button>
          )}
          
          {currentDay < dailyWords.length - 1 && (
            <Button onClick={nextDay} variant="outline" size="lg" className="px-8">
              Skip to Next Day
            </Button>
          )}
          
          <Button onClick={resetProgress} variant="destructive" size="lg" className="px-8">
            Reset Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
