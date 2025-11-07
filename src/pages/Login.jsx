// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DASHBOARD_URL = createPageUrl("Dashboard");
const RECOVER_URL = createPageUrl("RecuperarSenha");

const initialForm = {
  email: "",
  password: "",
  code: "",
};

export default function Login() {
  const navigate = useNavigate();
  const {
    login,
    verifyTwoFactor,
    resendTwoFactor,
    twoFactorChallenge,
    authError,
    isAuthenticated,
    isLoadingAuth,
    logout,
  } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState("credentials");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(DASHBOARD_URL, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (twoFactorChallenge && step !== "twoFactor") {
      setStep("twoFactor");
    }
  }, [twoFactorChallenge, step]);

  const maskedEmail = useMemo(
    () => twoFactorChallenge?.emailMask ?? null,
    [twoFactorChallenge]
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setLocalError(null);
  };

  const resetToCredentials = () => {
    setForm(initialForm);
    setLocalError(null);
    setStep("credentials");
    setVerificationSuccess(false);
    logout();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) return;

    setLoading(true);
    setLocalError(null);

    try {
      const result = await login({ email: form.email, password: form.password });

      if (result?.requiresTwoFactor) {
        setStep("twoFactor");
      } else {
        navigate(DASHBOARD_URL, { replace: true });
      }
    } catch (error) {
      setLocalError(error?.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    if (!form.code) return;

    setLoading(true);
    setLocalError(null);

    try {
      await verifyTwoFactor(form.code.trim());
      setVerificationSuccess(true);
      setTimeout(() => {
        navigate(DASHBOARD_URL, { replace: true });
      }, 500);
    } catch (error) {
      setLocalError(error?.message || "Código inválido ou expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await resendTwoFactor();
    } catch (error) {
      setLocalError(error?.message || "Não foi possível reenviar o código agora");
    } finally {
      setLoading(false);
    }
  };

  const renderLoader = (
    <div className="flex items-center gap-2 justify-center text-sm text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      Validando sessão...
    </div>
  );

  const renderError = (message) => (
    <Alert className="bg-red-50 border-red-200">
      <AlertCircle className="w-4 h-4 text-red-600" />
      <AlertTitle className="text-red-900">Algo deu errado</AlertTitle>
      <AlertDescription className="text-red-800 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );

  const sharedHeader = (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8"
    >
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
          <Zap className="w-9 h-9 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        {step === "credentials" ? "Bem-vindo de volta" : "Verifique sua conta"}
      </h1>
      <p className="text-slate-600">
        {step === "credentials"
          ? "Acesse sua conta Print Post usando seu e-mail corporativo"
          : "Enviamos um código de verificação para confirmar seu acesso"}
      </p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {isLoadingAuth ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4"
            >
              {renderLoader}
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              {sharedHeader}

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white/85 backdrop-blur-xl">
                <CardContent className="p-8">
                  {step === "credentials" && (
                    <form onSubmit={handleLogin} className="space-y-6">
                      {localError && renderError(localError)}
                      {!localError && authError?.message && renderError(authError.message)}

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-semibold">
                          E-mail corporativo
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={form.email}
                            onChange={handleChange("email")}
                            className="pl-10 h-12"
                            autoComplete="email"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-slate-700 font-semibold">
                            Senha
                          </Label>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate(RECOVER_URL)}
                            className="text-cyan-600 hover:text-cyan-700 text-xs font-semibold px-0"
                          >
                            Esqueci minha senha
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange("password")}
                            className="pl-10 pr-12 h-12"
                            autoComplete="current-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </Button>

                      <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-600" />
                        Seus dados estão protegidos com criptografia de ponta a ponta
                      </div>
                    </form>
                  )}

                  {step === "twoFactor" && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                      {verificationSuccess ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <AlertTitle className="text-green-900">Código validado</AlertTitle>
                          <AlertDescription className="text-green-700 text-sm">
                            Aguarde um instante, redirecionando para o painel...
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          {localError && renderError(localError)}
                          {!localError && authError?.message && renderError(authError.message)}
                        </>
                      )}

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                        <div className="flex items-start gap-3">
                          <KeyRound className="w-5 h-5 mt-1 text-blue-600" />
                          <div>
                            <p className="font-semibold">
                              Enviamos um código temporário para {maskedEmail || "seu e-mail"}
                            </p>
                            <p className="text-xs text-blue-800 mt-1">
                              Digite o código de 6 dígitos para confirmar sua identidade.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-slate-700 font-semibold">
                          Código de verificação
                        </Label>
                        <div className="relative">
                          <Input
                            id="code"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="••••••"
                            value={form.code}
                            onChange={handleChange("code")}
                            className="h-12 text-center tracking-[0.5em] text-lg font-semibold"
                            autoFocus
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || verificationSuccess}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Validando código...
                          </>
                        ) : (
                          "Confirmar acesso"
                        )}
                      </Button>

                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={resetToCredentials}
                          className="text-slate-600 hover:text-slate-900 px-0"
                          disabled={loading}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar ao login
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleResendCode}
                          className="text-cyan-600 hover:text-cyan-700"
                          disabled={loading || verificationSuccess}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reenviar código
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {step === "credentials" && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-sm text-slate-600"
          >
            Acessando pela primeira vez? Use as credenciais fornecidas pelo suporte Print Post.
          </motion.p>
        )}
      </div>
    </div>
  );
}
