import { supabase, isSupabaseConfigured } from "./supabase"

export async function signUp(email: string, password: string, fullName: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: { message: "Supabase is not configured" } }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: { message: "Supabase is not configured" } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: { message: "Supabase is not configured" } }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: { message: "Supabase is not configured" } }
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return { data, error }
}
