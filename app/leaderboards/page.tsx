"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type LeaderboardEntry = {
  user_id: string
  full_name: string | null
  email: string
  total_score: number
  quiz_count: number
  average_score: number
  best_score: number
}

type QuizLeaderboard = {
  quiz_id: string
  quiz_title: string
  entries: {
    user_id: string
    full_name: string | null
    email: string
    score: number
    percentage: number
    time_taken: number | null
    submitted_at: string
  }[]
}

export default function LeaderboardsPage() {
  const { user } = useAuth()
  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([])
  const [quizLeaderboards, setQuizLeaderboards] = useState<QuizLeaderboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLeaderboards()
    }
  }, [user])

  const fetchLeaderboards = async () => {
    await Promise.all([fetchOverallLeaderboard(), fetchQuizLeaderboards()])
    setLoading(false)
  }

  const fetchOverallLeaderboard = async () => {
    const { data, error } = await supabase.from("quiz_submissions").select(`
        user_id,
        score,
        total_possible,
        percentage,
        profiles!inner(full_name, email)
      `)

    if (!error && data) {
      // Group by user and calculate stats
      const userStats = data.reduce((acc: any, submission: any) => {
        const userId = submission.user_id
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            full_name: submission.profiles.full_name,
            email: submission.profiles.email,
            total_score: 0,
            quiz_count: 0,
            scores: [],
          }
        }
        acc[userId].total_score += submission.score
        acc[userId].quiz_count += 1
        acc[userId].scores.push(submission.score)
        return acc
      }, {})

      const leaderboard = Object.values(userStats)
        .map((user: any) => ({
          ...user,
          average_score: user.total_score / user.quiz_count,
          best_score: Math.max(...user.scores),
        }))
        .sort((a: any, b: any) => b.total_score - a.total_score)

      setOverallLeaderboard(leaderboard)
    }
  }

  const fetchQuizLeaderboards = async () => {
    // First get all quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title")
      .eq("is_active", true)

    if (quizzesError || !quizzes) return

    // Then get submissions for each quiz
    const quizLeaderboards = await Promise.all(
      quizzes.map(async (quiz) => {
        const { data: submissions, error } = await supabase
          .from("quiz_submissions")
          .select(`
            user_id,
            score,
            percentage,
            time_taken,
            submitted_at,
            profiles!inner(full_name, email)
          `)
          .eq("quiz_id", quiz.id)
          .order("score", { ascending: false })
          .limit(10)

        if (error || !submissions) {
          return {
            quiz_id: quiz.id,
            quiz_title: quiz.title,
            entries: [],
          }
        }

        return {
          quiz_id: quiz.id,
          quiz_title: quiz.title,
          entries: submissions.map((sub: any) => ({
            user_id: sub.user_id,
            full_name: sub.profiles.full_name,
            email: sub.profiles.email,
            score: sub.score,
            percentage: sub.percentage,
            time_taken: sub.time_taken,
            submitted_at: sub.submitted_at,
          })),
        }
      }),
    )

    setQuizLeaderboards(quizLeaderboards)
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to view leaderboards.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Overall Leaderboard
                </CardTitle>
                <CardDescription>Rankings based on total scores across all quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                {overallLeaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No submissions yet. Be the first to take a quiz!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overallLeaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          entry.user_id === user.id ? "bg-blue-50 border-blue-200" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                          <div>
                            <div className="font-medium">
                              {entry.full_name || entry.email}
                              {entry.user_id === user.id && (
                                <Badge variant="secondary" className="ml-2">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {entry.quiz_count} quiz{entry.quiz_count !== 1 ? "es" : ""} completed
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{entry.total_score}</div>
                          <div className="text-sm text-gray-600">Avg: {entry.average_score.toFixed(1)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <div className="space-y-6">
              {quizLeaderboards.map((quizBoard) => (
                <Card key={quizBoard.quiz_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{quizBoard.quiz_title}</span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/leaderboards/${quizBoard.quiz_id}`}>View Full Board</Link>
                      </Button>
                    </CardTitle>
                    <CardDescription>Top performers for this quiz</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quizBoard.entries.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600">No submissions yet for this quiz.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {quizBoard.entries.slice(0, 5).map((entry, index) => (
                          <div
                            key={entry.user_id}
                            className={`flex items-center justify-between p-3 rounded border ${
                              entry.user_id === user.id ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-6">{getRankIcon(index + 1)}</div>
                              <div>
                                <div className="font-medium text-sm">
                                  {entry.full_name || entry.email}
                                  {entry.user_id === user.id && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">{formatTime(entry.time_taken)}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{entry.score}</div>
                              <div className="text-xs text-gray-600">{entry.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
