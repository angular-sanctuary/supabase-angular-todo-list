import {Injectable} from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Provider,
  Session,
  Subscription,
  SupabaseClient,
  User
} from '@supabase/supabase-js';
import {environment} from "../../environments/environment";

interface SignInResponse {
  session: Session | null;
  user: User | null;
  provider?: Provider;
  url?: string | null;
  error: Error | null;
  data: Session | null;
}

interface SignUpResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
  data: Session | User | null;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  token: string | undefined;
  constructor() {
    this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  getSession(): Session | null {
    return this.supabaseClient.auth.session();
  }

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    return this.supabaseClient.auth.signUp({email, password});
  }

  async signIn(email: string, password: string): Promise<SignInResponse> {
    return this.supabaseClient.auth.signIn({email, password});
  }

  async signInWithProvider(provider: Provider): Promise<SignInResponse> {
    return this.supabaseClient.auth.signIn({provider});
  }

  signOut(): void {
    this.supabaseClient.auth.signOut().catch(console.error);
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void): { data: Subscription | null; error: Error | null; } {
    return this.supabaseClient.auth.onAuthStateChange(callback);
  }

  async resetPassword(email: string): Promise<{ data: {} | null; error: Error | null }> {
    return this.supabaseClient.auth.api.resetPasswordForEmail(email);
  }

  async handleNewPassword(newPassword: string): Promise<{ user: User | null; data: User | null; error: Error | null }> {
    return this.supabaseClient.auth.api.updateUser(this.token as string, {
      password: newPassword,
    });
  }

  // some types aren't exposed at this time
  async fetchTodos(): Promise<any> {
    return this.supabaseClient
      .from("todos")
      .select("*")
      .order("id", {ascending: false});
  }

  // some types aren't exposed at this time
  async addTodo(task: string): Promise<any> {
    const userId = this.getSession()?.user?.id as string;
    return this.supabaseClient
      .from("todos")
      .insert({task, user_id: userId})
      .single();
  }

  // some types aren't exposed at this time
  async toggleComplete(id: string, isCompleted: boolean): Promise<any> {
    return this.supabaseClient
      .from("todos")
      .update({is_complete: !isCompleted})
      .eq("id", id)
      .single();
  }

  // some types aren't exposed at this time
  async deleteTodo(id: string): Promise<any> {
    return this.supabaseClient.from("todos").delete().eq("id", id);
  }
}
