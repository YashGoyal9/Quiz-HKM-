"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, BookOpen, BarChart3 } from "lucide-react"
import Link from "next/link"
import { AuthForm } from "@/components/auth-form"
import { SetupGuide } from "@/components/setup-guide"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function HomePage() {
  const { user, profile, loading } = useAuth()

  if (!isSupabaseConfigured()) {
    return <SetupGuide />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Quiz Platform</h1>
            <p className="text-xl text-gray-600 mb-8">
              Interactive quizzes with instant scoring and competitive leaderboards
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Interactive Quizzes</h3>
                    <p className="text-sm text-gray-600">Engaging quiz experience</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Leaderboards</h3>
                    <p className="text-sm text-gray-600">Compete with others</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Instant Results</h3>
                    <p className="text-sm text-gray-600">Get scores immediately</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Real-time Updates</h3>
                    <p className="text-sm text-gray-600">Live leaderboard updates</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Platform</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {profile?.full_name || profile?.email}</span>
              <Button variant="outline" asChild>
                <Link href="/auth/signout">Sign Out</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Manage quizzes and view analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Take Quizzes
              </CardTitle>
              <CardDescription>Browse and take available quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/quizzes">Browse Quizzes</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboards
              </CardTitle>
              <CardDescription>View rankings and compete with others</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/leaderboards">View Rankings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
