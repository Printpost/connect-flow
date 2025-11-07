import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Zap,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldCheck
} from "lucide-react";

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(null);

  const validateEmail = (email) => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setEmailValid(false);
      return;
    }

    setLoading(true);
    
    try {
      // Aqui você integraria com o backend real
      // await base44.auth.requestPasswordReset(email);
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate(createPageUrl("Login"));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Verifique seu e-mail
                </h2>
                <p className="text-slate-600 mb-6">
                  Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, 
                  você receberá instruções para redefinir sua senha.
                </p>
                <Alert className="bg-blue-50 border-blue-200 mb-6">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900 text-left">
                    <strong>Por segurança:</strong><br />
                    • O link expira em 1 hora<br />
                    • Verifique também sua pasta de spam<br />
                    • Não compartilhe o link com ninguém
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleBackToLogin}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar ao Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <Zap className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recuperar Senha</h1>
          <p className="text-slate-600">
            Digite seu e-mail para receber instruções de redefinição
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Alerta Informativo */}
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Por questões de segurança, não informamos se o e-mail existe em nossa base de dados.
                  </AlertDescription>
                </Alert>

                {/* Campo E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">
                    E-mail Cadastrado
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`pl-10 h-12 transition-all ${
                        emailValid === false
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : emailValid === true
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                      }`}
                      required
                      autoFocus
                    />
                    {emailValid === true && (
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                    )}
                    {emailValid === false && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                    )}
                  </div>
                  <AnimatePresence>
                    {emailValid === false && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        E-mail inválido
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botões */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading || emailValid === false}
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Enviando...
                      </div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Instruções
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToLogin}
                    disabled={loading}
                    className="w-full h-12 border-slate-200 hover:bg-slate-50"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar ao Login
                  </Button>
                </div>

                {/* Nota de Segurança */}
                <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 text-center">
                    🔒 Suas informações estão protegidas e criptografadas
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Lembrou sua senha?{" "}
              <button
                onClick={handleBackToLogin}
                className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline"
              >
                Fazer login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}