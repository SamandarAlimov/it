import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "Uppercase letter" },
  { regex: /[a-z]/, label: "Lowercase letter" },
  { regex: /[0-9]/, label: "Number" },
];

type AuthView = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<AuthView>("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { signUp, signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle password reset flow from URL
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "recovery") {
      setView("reset-password");
    }
  }, [searchParams]);

  // Redirect if already logged in (but not during password reset)
  useEffect(() => {
    if (!isLoading && user && view !== "reset-password") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate, view]);

  const getPasswordStrength = (password: string) => {
    const passed = passwordRequirements.filter(req => req.regex.test(password)).length;
    if (passed === 0) return { level: 0, label: "", color: "" };
    if (passed === 1) return { level: 1, label: "Weak", color: "bg-destructive" };
    if (passed === 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
    if (passed === 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect with Google. Please try again.",
        variant: "destructive",
      });
    }
    setGoogleLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.email || !z.string().email().safeParse(formData.email).success) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setView("sign-in");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({ password: formData.password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully reset.",
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (view === "sign-up") {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please sign in.",
              variant: "destructive",
            });
            setView("sign-in");
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Alsamos. You're now logged in.",
          });
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const switchView = (newView: AuthView) => {
    setView(newView);
    setErrors({});
    setFormData({ fullName: "", email: "", password: "" });
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTitle = () => {
    switch (view) {
      case "sign-up": return "Create Account";
      case "forgot-password": return "Reset Password";
      case "reset-password": return "Set New Password";
      default: return "Welcome Back";
    }
  };

  const getDescription = () => {
    switch (view) {
      case "sign-up": return "Join Alsamos to access your dashboard";
      case "forgot-password": return "Enter your email to receive a reset link";
      case "reset-password": return "Enter your new password below";
      default: return "Sign in to your Alsamos account";
    }
  };

  return (
    <>
      <Helmet>
        <title>{getTitle()} | Alsamos Corporation</title>
        <meta name="description" content={getDescription()} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="glass rounded-2xl p-8 border border-border/50">
                <div className="text-center mb-8">
                  {(view === "forgot-password" || view === "reset-password") && (
                    <button
                      onClick={() => switchView("sign-in")}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 mx-auto transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </button>
                  )}
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    {getTitle()}
                  </h1>
                  <p className="text-muted-foreground">
                    {getDescription()}
                  </p>
                </div>

                {/* Forgot Password Form */}
                {view === "forgot-password" && (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border ${errors.email ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground`}
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={loading}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : "Send Reset Link"}
                    </Button>
                  </form>
                )}

                {/* Reset Password Form */}
                {view === "reset-password" && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          className={`w-full pl-10 pr-12 py-3 rounded-lg bg-secondary border ${errors.password ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground`}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                      
                      {formData.password && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden flex gap-0.5">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`flex-1 h-full rounded-full transition-colors ${
                                    passwordStrength.level >= level ? passwordStrength.color : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            {passwordStrength.label && (
                              <span className={`text-xs font-medium ${
                                passwordStrength.level <= 1 ? 'text-destructive' :
                                passwordStrength.level === 2 ? 'text-orange-500' :
                                passwordStrength.level === 3 ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                                {passwordStrength.label}
                              </span>
                            )}
                          </div>
                          
                          {(passwordFocused || errors.password) && (
                            <ul className="space-y-1">
                              {passwordRequirements.map((req, i) => {
                                const passed = req.regex.test(formData.password);
                                return (
                                  <li key={i} className="flex items-center gap-2 text-xs">
                                    {passed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                    <span className={passed ? 'text-green-500' : 'text-muted-foreground'}>
                                      {req.label}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : "Update Password"}
                    </Button>
                  </form>
                )}

                {/* Sign In / Sign Up Form */}
                {(view === "sign-in" || view === "sign-up") && (
                  <>
                    {/* Google OAuth Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full mb-6"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                    >
                      {googleLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Continue with Google
                    </Button>

                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-muted-foreground">or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {view === "sign-up" && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="text"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className={`w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border ${errors.fullName ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground`}
                              placeholder="John Doe"
                              autoComplete="name"
                              disabled={loading}
                            />
                          </div>
                          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border ${errors.email ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground`}
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={loading}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">
                            Password
                          </label>
                          {view === "sign-in" && (
                            <button
                              type="button"
                              onClick={() => switchView("forgot-password")}
                              className="text-sm text-primary hover:underline"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className={`w-full pl-10 pr-12 py-3 rounded-lg bg-secondary border ${errors.password ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground`}
                            placeholder="••••••••"
                            autoComplete={view === "sign-up" ? "new-password" : "current-password"}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                        
                        {/* Password strength indicator for signup */}
                        {view === "sign-up" && formData.password && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden flex gap-0.5">
                                {[1, 2, 3, 4].map((level) => (
                                  <div
                                    key={level}
                                    className={`flex-1 h-full rounded-full transition-colors ${
                                      passwordStrength.level >= level ? passwordStrength.color : 'bg-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              {passwordStrength.label && (
                                <span className={`text-xs font-medium ${
                                  passwordStrength.level <= 1 ? 'text-destructive' :
                                  passwordStrength.level === 2 ? 'text-orange-500' :
                                  passwordStrength.level === 3 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                  {passwordStrength.label}
                                </span>
                              )}
                            </div>
                            
                            {(passwordFocused || errors.password) && (
                              <ul className="space-y-1">
                                {passwordRequirements.map((req, i) => {
                                  const passed = req.regex.test(formData.password);
                                  return (
                                    <li key={i} className="flex items-center gap-2 text-xs">
                                      {passed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                      ) : (
                                        <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                      )}
                                      <span className={passed ? 'text-green-500' : 'text-muted-foreground'}>
                                        {req.label}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        variant="hero" 
                        size="lg" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Please wait...
                          </>
                        ) : view === "sign-up" ? "Create Account" : "Sign In"}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {view === "sign-up" ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                          onClick={() => switchView(view === "sign-up" ? "sign-in" : "sign-up")}
                          className="text-primary hover:underline font-medium"
                          disabled={loading}
                        >
                          {view === "sign-up" ? "Sign In" : "Sign Up"}
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Auth;
