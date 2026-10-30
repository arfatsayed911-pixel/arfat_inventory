import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

const AUTH_STORAGE_KEY = "arfat_auth_user_session_v1";

export class AuthService {
  static getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  static async login(email: string, pass: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check credentials against admin account
    const isPrimaryAdmin = cleanEmail === "arfatsayed911@gmail.com" && cleanPass === "Arfat@3000";

    // Attempt Supabase Auth signIn if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!error && data?.user) {
          const userObj: AuthUser = {
            email: data.user.email || cleanEmail,
            name: "Arfat Sayed",
            role: "Owner / Admin",
          };
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
          }
          return { success: true, user: userObj };
        }
      } catch (err) {
        console.warn("Supabase auth attempted:", err);
      }
    }

    // Direct Admin validation (guaranteed to work even if Supabase email confirmation is pending)
    if (isPrimaryAdmin) {
      const userObj: AuthUser = {
        email: "arfatsayed911@gmail.com",
        name: "Arfat Sayed",
        role: "Owner / Admin",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      }
      return { success: true, user: userObj };
    }

    return {
      success: false,
      error: "Invalid email or password. Please use authorized credentials.",
    };
  }

  static async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}
