"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            last_login: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (userError) throw userError;
        
        toast.success("Successfully logged in");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0],
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Then create the user record in our users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            full_name: email.split('@')[0],
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          // If we fail to create the user record, we should still show success
          // as the auth account was created successfully
        }

        toast.success("Account created! Please check your email to verify your account.");
        
        // Don't redirect yet as they need to verify their email
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center">Welcome back</h2>
          <p className="text-muted-foreground text-center mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Loading..." : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleSignUp}
              className="w-full"
            >
              Create account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}