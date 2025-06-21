"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Quiz = {
  id: string
  title: string
  description: string | null
  questions: any[]
  total_points: number
  time_limit: number | null
  created_at: string
}

type Submission = {
  quiz_id: string
  score: number
  percentage: number
}

export default function QuizzesPage() {
  const { user, profile } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchQuizzes()
      fetchUserSubmissions()
    }
  }, [user])

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setQuizzes(data)
    }
    setLoading(false)
  }

  const fetchUserSubmissions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("quiz_submissions")
      .select("quiz_id, score, percentage")
      .eq("user_id", user.id)

    if (!error && data) {
      setSubmissions(data)
    }
  }

  const getSubmissionForQuiz = (quizId: string) => {
    return submissions.find((sub) => sub.quiz_id === quizId)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to view quizzes.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Available Quizzes</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes available</h3>
              <p className="text-gray-600">Check back later for new quizzes!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const submission = getSubmissionForQuiz(quiz.id)
              const isCompleted = !!submission

              return (
                <Card key={quiz.id} className={isCompleted ? "border-green-200 bg-green-50" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Trophy className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {quiz.questions.length} questions
                        </span>
                        <span>{quiz.total_points} points</span>
                      </div>

                      {quiz.time_limit && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {quiz.time_limit} minutes
                        </div>
                      )}

                      {isCompleted && submission && (
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm font-medium text-green-800">
                            Your Score: {submission.score}/{quiz.total_points} ({submission.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        {isCompleted ? (
                          <div className="space-y-2">
                            <Button variant="outline" className="w-full" disabled>
                              Already Completed
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="w-full">
                              <Link href={`/leaderboards/${quiz.id}`}>View Leaderboard</Link>
                            </Button>
                          </div>
                        ) : (
                          <Button asChild className="w-full">
                            <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
