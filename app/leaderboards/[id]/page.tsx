"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type QuizLeaderboardEntry = {
  user_id: string
  full_name: string | null
  email: string
  score: number
  percentage: number
  time_taken: number | null
  submitted_at: string
  rank: number
}

type Quiz = {
  id: string
  title: string
  description: string | null
  total_points: number
}

export default function QuizLeaderboardPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([])
  const [userEntry, setUserEntry] = useState<QuizLeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchQuizLeaderboard()
    }
  }, [user, params.id])

  const fetchQuizLeaderboard = async () => {
    // Fetch quiz details
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title, description, total_points")
      .eq("id", params.id)
      .single()

    if (quizError || !quizData) {
      setLoading(false)
      return
    }

    setQuiz(quizData)

    // Fetch leaderboard entries
    const { data: submissions, error: submissionsError } = await supabase
      .from("quiz_submissions")
      .select(`
        user_id,
        score,
        percentage,
        time_taken,
        submitted_at,
        profiles!inner(full_name, email)
      `)
      .eq("quiz_id", params.id)
      .order("score", { ascending: false })
      .order("time_taken", { ascending: true, nullsLast: true })

    if (submissionsError || !submissions) {
      setLoading(false)
      return
    }

    // Process leaderboard with ranks
    const processedLeaderboard = submissions.map((sub: any, index: number) => ({
      user_id: sub.user_id,
      full_name: sub.profiles.full_name,
      email: sub.profiles.email,
      score: sub.score,
      percentage: sub.percentage,
      time_taken: sub.time_taken,
      submitted_at: sub.submitted_at,
      rank: index + 1,
    }))

    setLeaderboard(processedLeaderboard)

    // Find user's entry
    const userSubmission = processedLeaderboard.find((entry) => entry.user_id === user?.id)
    setUserEntry(userSubmission || null)

    setLoading(false)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>
    }
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to view the leaderboard.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/leaderboards">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leaderboards
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">Leaderboard</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{leaderboard.length}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{quiz.total_points}</div>
                    <div className="text-sm text-gray-600">Max Points</div>
                  </div>
                  {leaderboard.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.max(...leaderboard.map((e) => e.score))}
                      </div>
                      <div className="text-sm text-gray-600">Highest Score</div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={`/quiz/${quiz.id}`}>Take Quiz</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Performance */}
          {userEntry && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">#{userEntry.rank}</div>
                    <div className="text-sm text-gray-600">Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{userEntry.score}</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userEntry.percentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Percentage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatTime(userEntry.time_taken)}</div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Rankings
              </CardTitle>
              <CardDescription>All participants ranked by score and completion time</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions yet. Be the first to take this quiz!</p>
                  <Button asChild className="mt-4">
                    <Link href={`/quiz/${quiz.id}`}>Take Quiz Now</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        entry.user_id === user.id
                          ? "bg-blue-50 border-blue-200"
                          : entry.rank <= 3
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>
                        <div>
                          <div className="font-medium flex items-center">
                            {entry.full_name || entry.email}
                            {entry.user_id === user.id && (
                              <Badge variant="secondary" className="ml-2">
                                You
                              </Badge>
                            )}
                            {entry.rank === 1 && <Badge className="ml-2 bg-yellow-500 text-white">Champion</Badge>}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(entry.time_taken)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(entry.submitted_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{entry.score}</div>
                        <div className="text-sm text-gray-600">{entry.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
