import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "../lib/auth";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/workspace";

  useEffect(() => {
    const handleCredentialResponse = async (response: any) => {
      setError("");
      setSubmitting(true);
      try {
        await auth.loginGoogle(response.credential);
        navigate(from, { replace: true });
      } catch (err: any) {
        setError(err.response?.data?.detail || "Google Sign-In failed.");
      } finally {
        setSubmitting(false);
      }
    };

    const initGoogle = () => {
      const google = (window as any).google;
      if (google) {
        google.accounts.id.initialize({
          client_id: "188815481005-4ruqi9omoshlnqsqmturucnmnvh1fbfu.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        const loginBtn = document.getElementById("google-signin-btn-login");
        if (loginBtn) {
          google.accounts.id.renderButton(loginBtn, {
            theme: document.documentElement.classList.contains("dark") ? "filled_black" : "outline",
            size: "large",
            width: 396,
          });
        }

        const registerBtn = document.getElementById("google-signin-btn-register");
        if (registerBtn) {
          google.accounts.id.renderButton(registerBtn, {
            theme: document.documentElement.classList.contains("dark") ? "filled_black" : "outline",
            size: "large",
            width: 396,
          });
        }
      }
    };

    const google = (window as any).google;
    if (google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        const g = (window as any).google;
        if (g) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [mode, navigate, from, auth]);

  if (auth.user) {
    return <Navigate to={from} replace />;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await auth.register(name, email, password);
      } else {
        await auth.login(email, password);
      }
      navigate(from, { replace: true });
    } catch {
      setError(mode === "register" ? "Could not create account." : "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  // Fast login mock for user demonstration/testing to match the screenshot
  const handleGoogleMockLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      // Register or Login as Anupam Singh
      try {
        await auth.login("anupamsingh8095@gmail.com", "password123");
      } catch {
        // If not registered yet in sqlite db, register first
        await auth.register("Anupam Singh", "anupamsingh8095@gmail.com", "password123");
      }
      navigate(from, { replace: true });
    } catch {
      setError("Mock Google login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-145px)] items-center justify-center bg-background px-4 py-12 text-foreground lg:min-h-[calc(100vh-105px)] overflow-hidden">
      {/* Premium Medical/Biotech Theme Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="medical-grid-overlay" />
        <div className="floating-cell-1" />
        <div className="floating-cell-2" />
        <div className="floating-cell-3" />
        
        {/* Glowing Heartbeat / ECG Wave SVG */}
        <svg
          className="absolute bottom-0 left-0 w-full h-40 opacity-20 dark:opacity-10"
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="ecg-line"
            d="M0 100h300l15-30 20 60 25-110 20 100 15-20h400l15-30 20 60 25-110 20 100 15-20h600"
            stroke="#0d9488"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 3D Perspective Card Container */}
      <div className="perspective-1000 relative z-10 w-full max-w-[460px] min-h-[580px]">
        <div className={`card-flip-container w-full h-full ${mode === "register" ? "flipped" : ""}`}>
          
          {/* FRONT FACE: SIGN IN */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0a0f20]/90 p-8 shadow-2xl backdrop-blur-md premium-glow flex flex-col justify-between text-slate-800 dark:text-slate-100">
            <div>
              {/* Header / Selector */}
              <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="flex-1 pb-3 text-center text-sm font-semibold tracking-wide border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="flex-1 pb-3 text-center text-sm font-semibold tracking-wide text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              <form
                onSubmit={submit}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060a16] px-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      required={mode === "login"}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060a16] px-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      required={mode === "login"}
                      minLength={8}
                    />
                  </div>
                </div>

                {error && mode === "login" && (
                  <p className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-teal-100 dark:shadow-teal-950"
                >
                  {submitting ? "Please wait..." : "Sign In"}
                </button>
              </form>

              {/* Toggle text link */}
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Sign Up here
                </button>
              </p>
            </div>

            <div>
              {/* OR Separator */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute w-full border-t border-slate-200 dark:border-slate-800/80"></div>
                <span className="relative bg-white dark:bg-[#0a0f20] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Or
                </span>
              </div>

              {/* Google Sign-In */}
              <div className="space-y-3">
                <div className="flex w-full justify-center">
                  <div id="google-signin-btn-login" className="w-full flex justify-center min-h-[44px]" />
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleMockLogin}
                  className="w-full text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                >
                  Or quick sign-in as developer (Anupam)
                </button>
              </div>
            </div>
          </div>

          {/* BACK FACE: SIGN UP */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0a0f20]/90 p-8 shadow-2xl backdrop-blur-md premium-glow flex flex-col justify-between text-slate-800 dark:text-slate-100">
            <div>
              {/* Header / Selector */}
              <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="flex-1 pb-3 text-center text-sm font-semibold tracking-wide text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="flex-1 pb-3 text-center text-sm font-semibold tracking-wide border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 transition-colors"
                >
                  Sign Up
                </button>
              </div>

              {/* Registration Form */}
              <form
                onSubmit={submit}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060a16] px-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      required={mode === "register"}
                      minLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060a16] px-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      required={mode === "register"}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060a16] px-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      required={mode === "register"}
                      minLength={8}
                    />
                  </div>
                </div>

                {error && mode === "register" && (
                  <p className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-teal-700 active:bg-teal-850 disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-teal-100 dark:shadow-teal-950"
                >
                  {submitting ? "Please wait..." : "Sign Up"}
                </button>
              </form>

              {/* Toggle text link */}
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Sign In here
                </button>
              </p>
            </div>

            <div>
              {/* OR Separator */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute w-full border-t border-slate-200 dark:border-slate-800/80"></div>
                <span className="relative bg-white dark:bg-[#0a0f20] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Or
                </span>
              </div>

              {/* Google Sign-In */}
              <div className="space-y-3">
                <div className="flex w-full justify-center">
                  <div id="google-signin-btn-register" className="w-full flex justify-center min-h-[44px]" />
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleMockLogin}
                  className="w-full text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                >
                  Or quick sign-in as developer (Anupam)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







