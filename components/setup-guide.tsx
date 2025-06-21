"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, Database, Key, Settings } from "lucide-react"

export function SetupGuide() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Platform Setup</h1>
          <p className="text-lg text-gray-600">Welcome! Let's get your quiz platform configured with Supabase.</p>
        </div>

        <div className="space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              This quiz platform requires Supabase for authentication and database functionality. Follow the steps below
              to get started.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Step 1: Create Supabase Project
              </CardTitle>
              <CardDescription>Set up your Supabase project and get your credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    supabase.com
                  </a>{" "}
                  and create a new account
                </li>
                <li>Click "New Project" and fill in your project details</li>
                <li>Wait for your project to be set up (this takes a few minutes)</li>
                <li>Go to Settings → API to find your project credentials</li>
              </ol>
              <Button variant="outline" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Open Supabase Dashboard
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Step 2: Configure Environment Variables
              </CardTitle>
              <CardDescription>Add your Supabase credentials to your environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create a <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in your project root and
                add:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here</div>
              </div>
              <Alert>
                <AlertDescription>
                  Replace <code>your_supabase_url_here</code> and <code>your_supabase_anon_key_here</code> with your
                  actual Supabase project URL and anonymous key from the API settings page.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Set Up Database</CardTitle>
              <CardDescription>Run the SQL scripts to create your database tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>
                  Run the SQL scripts provided in the <code>scripts/</code> folder
                </li>
                <li>
                  Start with <code>01-create-tables.sql</code> then <code>02-seed-data.sql</code>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Create Admin User</CardTitle>
              <CardDescription>Set up your first admin account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>After setting up environment variables, refresh this page</li>
                <li>Register a new account using the sign-up form</li>
                <li>Go to Supabase dashboard → Authentication → Users</li>
                <li>Find your user and note the User ID</li>
                <li>Go to Table Editor → profiles table</li>
                <li>Update your user's role from 'student' to 'admin'</li>
              </ol>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => window.location.reload()}>Refresh Page After Setup</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
