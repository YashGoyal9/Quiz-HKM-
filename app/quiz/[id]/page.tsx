"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type Quiz = {
  id: string
  title: string
  description: string | null
  questions: any[]
  total_points: number
  time_limit: number | null
}

type QuizResult = {
  score: number
  totalPossible: number
  percentage: number
  correctAnswers: number[]
  userAnswers: (number | null)[]
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (user) {
      fetchQuiz()
    }
  }, [user, params.id])

  useEffect(() => {
    if (quiz?.time_limit && timeLeft === null) {
      setTimeLeft(quiz.time_limit * 60) // Convert minutes to seconds
    }
  }, [quiz])

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft, result])

  const fetchQuiz = async () => {
    // Check if user already submitted this quiz
    const { data: existingSubmission } = await supabase
      .from("quiz_submissions")
      .select("id")
      .eq("quiz_id", params.id)
      .eq("user_id", user!.id)
      .single()

    if (existingSubmission) {
      toast({
        title: "Quiz Already Completed",
        description: "You have already submitted this quiz.",
        variant: "destructive",
      })
      router.push("/quizzes")
      return
    }

    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", params.id)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      toast({
        title: "Quiz Not Found",
        description: "The quiz you're looking for doesn't exist or is no longer active.",
        variant: "destructive",
      })
      router.push("/quizzes")
      return
    }

    setQuiz(data)
    setAnswers(new Array(data.questions.length).fill(null))
    setLoading(false)
  }

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const calculateScore = () => {
    if (!quiz) return { score: 0, totalPossible: 0, percentage: 0, correctAnswers: [], userAnswers: answers }

    let score = 0
    const correctAnswers: number[] = []

    quiz.questions.forEach((question, index) => {
      correctAnswers.push(question.correct_answer)
      if (answers[index] === question.correct_answer) {
        score += question.points || 0
      }
    })

    const percentage = quiz.total_points > 0 ? (score / quiz.total_points) * 100 : 0

    return {
      score,
      totalPossible: quiz.total_points,
      percentage,
      correctAnswers,
      userAnswers: answers,
    }
  }

  const handleSubmit = async () => {
    if (!quiz || !user) return

    setSubmitting(true)
    const result = calculateScore()
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    const { error } = await supabase.from("quiz_submissions").insert({
      quiz_id: quiz.id,
      user_id: user.id,
      answers: answers,
      score: result.score,
      total_possible: result.totalPossible,
      percentage: result.percentage,
      time_taken: timeTaken,
    })

    if (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your quiz. Please try again.",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    setResult(result)
    setSubmitting(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to take this quiz.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Quiz not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/quizzes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{quiz.title} - Complete!</CardTitle>
                <CardDescription>Here are your results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">
                    {result.score}/{result.totalPossible}
                  </div>
                  <div className="text-xl text-gray-600">{result.percentage.toFixed(1)}%</div>
                  <Progress value={result.percentage} className="w-full" />

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.correctAnswers.filter((_, i) => answers[i] === result.correctAnswers[i]).length}
                      </div>
                      <div className="text-sm text-gray-600">Correct Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{quiz.questions.length}</div>
                      <div className="text-sm text-gray-600">Total Questions</div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-6">
                    <Button asChild>
                      <Link href={`/leaderboards/${quiz.id}`}>View Leaderboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/quizzes">Take Another Quiz</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review answers */}
            <Card>
              <CardHeader>
                <CardTitle>Review Your Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers[index]
                    const correctAnswer = question.correct_answer
                    const isCorrect = userAnswer === correctAnswer

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <span className={`text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <p className="mb-3">{question.question}</p>
                        <div className="space-y-2">
                          {question.options.map((option: string, optionIndex: number) => {
                            const isUserAnswer = userAnswer === optionIndex
                            const isCorrectOption = correctAnswer === optionIndex

                            return (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded text-sm ${
                                  isCorrectOption
                                    ? "bg-green-100 text-green-800 font-medium"
                                    : isUserAnswer
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {option}
                                {isCorrectOption && " ✓"}
                                {isUserAnswer && !isCorrectOption && " ✗"}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/quizzes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Quiz
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center space-x-2 text-lg font-medium">
                <Clock className="h-5 w-5" />
                <span className={timeLeft < 60 ? "text-red-600" : "text-gray-900"}>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm text-gray-600">{currentQ.points} points</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion, Number.parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQ.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={submitting || answers.some((answer) => answer === null)}>
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                    disabled={answers[currentQuestion] === null}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question navigation */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Question Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestion === index ? "default" : answers[index] !== null ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestion(index)}
                    className="aspect-square"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
