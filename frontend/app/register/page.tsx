"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { registerUser } from "../services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Lock, Mail, User, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await registerUser(username, email, password);
      localStorage.setItem("token", data.jwt);
      document.cookie = `token=${data.jwt}; path=/; max-age=604800; SameSite=Lax`;
      toast.success("Registration successful! Welcome to TaskFlow.");
      router.push("/");
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative bg-radial from-slate-900 via-slate-950 to-black overflow-hidden select-none">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-6000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 animate-pulse duration-8000"></div>

      <Card className="w-full max-w-md border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-2xl text-slate-100">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center items-center gap-2 text-primary mb-1">
            <Sparkles className="size-6 animate-pulse text-blue-300" />
            <span className="text-2xl font-bold tracking-tight text-blue-400 bg-clip-text">
              TaskFlow
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">
            Create an Account
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Sign up to start organizing your tasks today
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Username
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary text-slate-100 focus:ring-1 focus:ring-primary rounded-lg transition-colors h-11"
                    required
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Email Address
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary text-slate-100 focus:ring-1 focus:ring-primary rounded-lg transition-colors h-11"
                    required
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 bg-slate-900/50 border-slate-800 focus:border-primary text-slate-100 focus:ring-1 focus:ring-primary rounded-lg transition-colors h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1.5 z-10 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Confirm Password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-12 bg-slate-900/50 border-slate-800 focus:border-primary text-slate-100 focus:ring-1 focus:ring-primary rounded-lg transition-colors h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1.5 z-10 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </FieldContent>
            </Field>

            <Button
              type="submit"
              className="w-full h-11 mt-2 text-sm font-semibold rounded-lg bg-linear-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg cursor-pointer transition-all duration-300 transform active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pb-6 border-t border-slate-900/60 mt-4 text-center text-xs">
          <p className="text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-blue-500 font-medium underline underline-offset-4 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
