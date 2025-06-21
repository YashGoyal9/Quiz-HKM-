"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Users, BarChart3, ArrowLeft, Edit, Trash2, Eye } from "lucide-react"
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
  is_active: boolean
  created_at: string
  submission_count?: number
  avg_score?: number
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalSubmissions: 0,
    totalUsers: 0,
    avgScore: 0,
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/")
      return
    }

    if (user && profile?.role === "admin") {
      fetchAdminData()
    }
  }, [user, profile, loading, router])

  const fetchAdminData = async () => {
    await Promise.all([fetchQuizzes(), fetchStats()])
    setLoadingData(false)
  }

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        quiz_submissions(count)
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      // Get submission stats for each quiz
      const quizzesWithStats = await Promise.all(
        data.map(async (quiz) => {
          const { data: submissions } = await supabase
            .from("quiz_submissions")
            .select("score, total_possible")
            .eq("quiz_id", quiz.id)

          const submissionCount = submissions?.length || 0
          const avgScore =
            submissionCount > 0
              ? submissions!.reduce((sum, sub) => sum + (sub.score / sub.total_possible) * 100, 0) / submissionCount
              : 0

          return {
            ...quiz,
            submission_count: submissionCount,
            avg_score: avgScore,
          }
        }),
      )

      setQuizzes(quizzesWithStats)
    }
  }

  const fetchStats = async () => {
    // Get total quizzes
    const { count: totalQuizzes } = await supabase.from("quizzes").select("*", { count: "exact", head: true })

    // Get total submissions
    const { count: totalSubmissions } = await supabase
      .from("quiz_submissions")
      .select("*", { count: "exact", head: true })

    // Get total users
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Get average score
    const { data: submissions } = await supabase.from("quiz_submissions").select("percentage")

    const avgScore =
      submissions && submissions.length > 0
        ? submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length
        : 0

    setStats({
      totalQuizzes: totalQuizzes || 0,
      totalSubmissions: totalSubmissions || 0,
      totalUsers: totalUsers || 0,
      avgScore,
    })
  }

  const toggleQuizStatus = async (quizId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("quizzes").update({ is_active: !currentStatus }).eq("id", quizId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update quiz status",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Quiz ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })
      fetchQuizzes()
    }
  }

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return
    }

    const { error } = await supabase.from("quizzes").delete().eq("id", quizId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      })
      fetchQuizzes()
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || profile?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button asChild>
              <Link href="/admin/quiz/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalSubmissions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.avgScore.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quizzes Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Management</CardTitle>
            <CardDescription>Manage your quizzes, view statistics, and control access</CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes yet</h3>
                <p className="text-gray-600 mb-4">Create your first quiz to get started</p>
                <Button asChild>
                  <Link href="/admin/quiz/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                        <Badge variant={quiz.is_active ? "default" : "secondary"}>
                          {quiz.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {quiz.description && <p className="text-gray-600 mb-2">{quiz.description}</p>}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>{quiz.questions.length} questions</span>
                        <span>{quiz.total_points} points</span>
                        <span>{quiz.submission_count || 0} submissions</span>
                        {quiz.submission_count && quiz.submission_count > 0 && (
                          <span>Avg: {quiz.avg_score?.toFixed(1)}%</span>
                        )}
                        {quiz.time_limit && <span>{quiz.time_limit} min limit</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/leaderboards/${quiz.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/quiz/${quiz.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleQuizStatus(quiz.id, quiz.is_active)}>
                        {quiz.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuiz(quiz.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
