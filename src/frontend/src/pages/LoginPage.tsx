import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { cn, getRoleBadgeColor, getRoleDisplayName } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  HardHat,
  Home,
  Shield,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentType, useState } from "react";

type AuthTab = "login" | "signup";

interface RoleOption {
  role: UserRole;
  displayName: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "governmentAuthority",
    displayName: "Government Authority",
    description: "Budget approvals & oversight",
    icon: Shield,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    role: "projectManager",
    displayName: "Project Manager",
    description: "Plan projects & assign tasks",
    icon: Briefcase,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    role: "siteEngineer",
    displayName: "Site Engineer",
    description: "Daily logs & progress updates",
    icon: Zap,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
  },
  {
    role: "contractor",
    displayName: "Contractor",
    description: "Manage workforce & resources",
    icon: Wrench,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    role: "worker",
    displayName: "Worker",
    description: "Attendance, tasks & payments",
    icon: HardHat,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    role: "auditor",
    displayName: "Auditor",
    description: "Audit logs & fraud detection",
    icon: ClipboardCheck,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
  },
  {
    role: "community",
    displayName: "Community",
    description: "Weekly progress & site visits",
    icon: Users,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    role: "public",
    displayName: "Public",
    description: "View nearby constructions",
    icon: Home,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
  },
];

const DEMO_EMAILS: Record<UserRole, string> = {
  governmentAuthority: "smeetd29@gmail.com",
  projectManager: "manager@example.com",
  siteEngineer: "engineer@infrasetu.in",
  contractor: "contractor@infrasetu.in",
  worker: "worker@infrasetu.in",
  auditor: "investor@example.com",
  community: "community@infrasetu.in",
  public: "public@infrasetu.in",
};

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  async function handleLogin() {
    if (!selectedRole || !loginEmail || !loginPassword) return;
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate({ to: "/site-selection" });
    } catch (e) {
      console.error(e);
      alert("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole || !signupName || !signupEmail || !signupPassword) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSignupSuccess(true);
    setTimeout(() => {
      setSignupSuccess(false);
      setActiveTab("login");
    }, 2500);
  }

  function fillDemoCredentials() {
    if (!selectedRole) return;
    setLoginEmail(DEMO_EMAILS[selectedRole]);
    setLoginPassword("demo1234");
  }

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.role === selectedRole);

  return (
    <div className="min-h-screen flex bg-amber-50">
      {/* ─── Left branding panel (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 -right-16 w-80 h-80 rounded-full bg-amber-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-yellow-200/30 blur-2xl" />

        <div className="relative z-10 flex flex-col flex-1 p-10 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl tracking-tight">
              InfraSetu
            </span>
          </div>

          {/* Center content */}
          <div className="flex flex-col items-start">
            <div className="w-16 h-1.5 rounded-full bg-white/50 mb-8" />
            <h2 className="font-display font-bold text-white text-4xl xl:text-5xl leading-tight mb-5">
              Bharat ke
              <br />
              Nirmaan ko
              <br />
              <span className="text-yellow-100">Digital Setu</span>
            </h2>
            <p className="text-white/80 text-base leading-relaxed max-w-xs mb-8">
              A unified platform for Government Construction Projects —
              connecting authority, engineers, workers, and communities.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-3">
              {[
                "8 role-based dashboards",
                "Real-time site monitoring",
                "GPS attendance & SOS alerts",
                "Audit logs & fraud detection",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/50 text-xs">
            InfraSetu © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* ─── Right auth panel ─── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-5 py-4 border-b border-amber-100 bg-white">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-slate-800 text-lg">
            InfraSetu
          </span>
        </div>

        <div className="flex-1 flex items-start justify-center py-8 px-4 sm:px-6">
          <div className="w-full max-w-xl">
            {/* Page heading (desktop) */}
            <div className="hidden lg:block mb-7">
              <h1 className="font-display font-bold text-slate-800 text-2xl mb-1">
                {t("login.welcome")}
              </h1>
              <p className="text-slate-500 text-sm">
                {t("login.subtitle")}
              </p>
            </div>

            {/* Tab switcher */}
            <div
              className="flex bg-slate-100 rounded-2xl p-1 mb-6"
              data-ocid="auth.tab_switcher"
            >
              {(["login", "signup"] as AuthTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  data-ocid={`auth.${tab}_tab`}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-smooth capitalize",
                    activeTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab === "login" ? t("login.tab.login") : t("login.tab.signup")}
                </button>
              ))}
            </div>

            {/* ─── Role selection grid ─── */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {t("login.role.title")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = selectedRole === opt.role;
                  return (
                    <motion.button
                      key={opt.role}
                      type="button"
                      onClick={() => {
                        if (opt.role === "public") {
                          navigate({ to: "/public" });
                          return;
                        }
                        setSelectedRole(opt.role);
                      }}
                      data-ocid={`role.card.${opt.role}`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-center transition-smooth",
                        active
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/40",
                      )}
                    >
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center",
                          opt.iconBg,
                        )}
                      >
                        <Icon className={cn("w-4 h-4", opt.iconColor)} />
                      </div>
                      <div className="min-w-0 w-full">
                        <p
                          className={cn(
                            "text-xs font-semibold leading-tight truncate",
                            active ? "text-amber-700" : "text-slate-700",
                          )}
                        >
                          {t(`role.${opt.role}`)}
                        </p>
                        <p className="text-slate-400 text-[10px] leading-tight mt-0.5 line-clamp-2">
                          {t(`role.desc.${opt.role}`)}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ─── Auth form area ─── */}
            <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="p-6"
                  >
                    {/* Selected role indicator */}
                    {selectedRole && selectedRoleOption && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-5"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center",
                              selectedRoleOption.iconBg,
                            )}
                          >
                            <selectedRoleOption.icon
                              className={cn(
                                "w-3.5 h-3.5",
                                selectedRoleOption.iconColor,
                              )}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {getRoleDisplayName(selectedRole)}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full border",
                            getRoleBadgeColor(selectedRole),
                          )}
                        >
                          {t("login.role.selected")}
                        </span>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="login-email"
                          className="text-sm font-medium text-slate-700 mb-1.5 block"
                        >
                          {t("login.email")}
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          data-ocid="login.email_input"
                          className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="login-password"
                          className="text-sm font-medium text-slate-700 mb-1.5 block"
                        >
                          {t("login.password")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            data-ocid="login.password_input"
                            className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Demo credentials hint */}
                      {selectedRole && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"
                        >
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">
                              {t("login.demo.hint")}
                            </p>
                            <p className="text-xs font-mono text-amber-700">
                              {DEMO_EMAILS[selectedRole]}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={fillDemoCredentials}
                            data-ocid="login.fill_demo_button"
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                          >
                            {t("login.demo.fill")}
                          </button>
                        </motion.div>
                      )}

                      <Button
                        className="w-full h-11 font-semibold text-sm rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-amber transition-smooth mt-1"
                        onClick={handleLogin}
                        disabled={!selectedRole || loading}
                        data-ocid="login.submit_button"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                            {t("login.btn.logging_in")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {t("login.btn.login")}
                            {selectedRole
                              ? ` as ${getRoleDisplayName(selectedRole)}`
                              : ""}
                          </span>
                        )}
                      </Button>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-4">
                      {t("login.demo.footer")} (Default password: <b>password123</b>)
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="p-6"
                  >
                    <AnimatePresence mode="wait">
                      {signupSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center justify-center py-10 text-center"
                          data-ocid="signup.success_state"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <h3 className="font-display font-bold text-slate-800 text-lg mb-2">
                            Account Created!
                          </h3>
                          <p className="text-slate-500 text-sm">
                            Redirecting you to login...
                          </p>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSignup}
                        >
                          {/* Selected role indicator */}
                          {selectedRole && selectedRoleOption && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-5"
                            >
                              <div
                                className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center",
                                  selectedRoleOption.iconBg,
                                )}
                              >
                                <selectedRoleOption.icon
                                  className={cn(
                                    "w-3.5 h-3.5",
                                    selectedRoleOption.iconColor,
                                  )}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">
                                Registering as:{" "}
                                {getRoleDisplayName(selectedRole)}
                              </span>
                            </motion.div>
                          )}

                          {!selectedRole && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-5 text-xs text-amber-700 font-medium">
                              ↑ Please select a role above to continue
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                              <Label
                                htmlFor="signup-name"
                                className="text-sm font-medium text-slate-700 mb-1.5 block"
                              >
                                Full Name
                              </Label>
                              <Input
                                id="signup-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                required
                                data-ocid="signup.name_input"
                                className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="signup-email"
                                className="text-sm font-medium text-slate-700 mb-1.5 block"
                              >
                                Email Address
                              </Label>
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                required
                                data-ocid="signup.email_input"
                                className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="signup-phone"
                                className="text-sm font-medium text-slate-700 mb-1.5 block"
                              >
                                Phone Number
                              </Label>
                              <Input
                                id="signup-phone"
                                type="tel"
                                placeholder="+91-9800000000"
                                value={signupPhone}
                                onChange={(e) => setSignupPhone(e.target.value)}
                                data-ocid="signup.phone_input"
                                className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="signup-password"
                                className="text-sm font-medium text-slate-700 mb-1.5 block"
                              >
                                Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="signup-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Min. 8 characters"
                                  value={signupPassword}
                                  onChange={(e) =>
                                    setSignupPassword(e.target.value)
                                  }
                                  required
                                  data-ocid="signup.password_input"
                                  className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                  aria-label="Toggle password"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <Label
                                htmlFor="signup-confirm"
                                className="text-sm font-medium text-slate-700 mb-1.5 block"
                              >
                                Confirm Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="signup-confirm"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Re-enter password"
                                  value={signupConfirm}
                                  onChange={(e) =>
                                    setSignupConfirm(e.target.value)
                                  }
                                  required
                                  data-ocid="signup.confirm_password_input"
                                  className="h-11 rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-200 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                  aria-label="Toggle confirm password"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full h-11 font-semibold text-sm rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-amber transition-smooth mt-5"
                            disabled={!selectedRole || loading}
                            data-ocid="signup.submit_button"
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                                Creating account...
                              </span>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Back to Home + Footer */}
            <div className="flex flex-col items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => navigate({ to: "/landing" })}
                data-ocid="auth.back_to_home_link"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("login.nav.back")}
              </button>
              <p className="text-center text-xs text-slate-400">
                © {new Date().getFullYear()}. Built with love using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                  className="text-amber-600 hover:text-amber-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
