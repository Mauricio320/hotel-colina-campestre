import { supabase } from "@/config/supabase";
import { AuthErrorType, AuthResponse, LoginCredentials } from "./types";

/**
 * Handles authentication errors and converts them to standard error types
 */
export const handleSupabaseError = (error: any): AuthErrorType => {
  if (
    error.code === "PGRST116" ||
    error.message.includes('relation "public.employees"')
  ) {
    return AuthErrorType.DATABASE_NOT_READY;
  }
  if (
    error.message.includes("Invalid login") ||
    error.message.includes("Invalid credentials")
  ) {
    return AuthErrorType.INVALID_CREDENTIALS;
  }
  if (error.message.includes("Network") || error.message.includes("fetch")) {
    return AuthErrorType.NETWORK_ERROR;
  }
  if (
    error.message.includes("Unauthorized") ||
    error.message.includes("Token")
  ) {
    return AuthErrorType.UNAUTHORIZED;
  }
  return AuthErrorType.NETWORK_ERROR;
};

/**
 * Authenticates user with email and password
 */
export const signIn = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    const errorType = handleSupabaseError(error);
    throw new Error(errorType);
  }
};

/**
 * Signs out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    const errorType = handleSupabaseError(error);
    throw new Error(errorType);
  }
};

/**
 * Gets the current session
 */
export const getCurrentSession = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.session?.user ?? null,
      session: data.session,
    };
  } catch (error) {
    const errorType = handleSupabaseError(error);
    throw new Error(errorType);
  }
};

/**
 * Gets the current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  } catch (error) {
    const errorType = handleSupabaseError(error);
    throw new Error(errorType);
  }
};

/**
 * Sets up authentication state change listener
 */
export const onAuthStateChange = (
  callback: (event: string, session: any) => void,
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};
