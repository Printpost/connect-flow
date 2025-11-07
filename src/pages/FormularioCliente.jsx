
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  CheckCircle2,
  Loader2,
  Zap
} from "lucide-react";

export default function FormularioCliente() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    tipo_pessoa: "pessoa_juridica",
    perfil: "USUARIO",
    status_preenchimento: "pendente",
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    inscricao_estadual: "",
    isento_inscricao: false,
    cpf: "",
    nome_completo: "",
    email: "",
    telefone_fixo: "",
    telefone_celular: "",
    cep: "",
    endereco: "",
    contato_tecnico: { nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
    contato_financeiro: { nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
    responsavel_contrato: { cpf: "", nome: "", cargo: "", telefone_fixo: "", telefone_celular: "", email: "" },
    testemunha_contrato: { cpf: "", nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
    produtos_contratados: [],
    status: "ativo"
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Cliente.create(data),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white max-w-md">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Cadastro Enviado!</h2>
              <p className="text-slate-600 mb-6">
                Seus dados foram recebidos com sucesso. Nossa equipe entrará em contato em breve para finalizar o cadastro e definir as informações financeiras.
              </p>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900">
                  Você receberá um e-mail de confirmação em <strong>{formData.email}</strong>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69015e3875e36824538e7d64/af6022d55_Printpostlogo.png" 
              alt="Print Post Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold text-slate-900">Print Post</h1>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cadastro de Cliente</h2>
          <p className="text-slate-600">Preencha os dados abaixo para iniciar seu cadastro</p>
        </motion.div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Pessoa */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Tipo de Pessoa *</Label>
                <RadioGroup value={formData.tipo_pessoa} onValueChange={(value) => setFormData({...formData, tipo_pessoa: value})}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2 border-2 border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-cyan-300">
                      <RadioGroupItem value="pessoa_juridica" id="pj" />
                      <Label htmlFor="pj" className="cursor-pointer flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Pessoa Jurídica
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border-2 border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-cyan-300">
                      <RadioGroupItem value="pessoa_fisica" id="pf" />
                      <Label htmlFor="pf" className="cursor-pointer flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Pessoa Física
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Dados Básicos */}
              {formData.tipo_pessoa === "pessoa_juridica" ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                      <Input
                        id="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="razao_social">Razão Social *</Label>
                      <Input
                        id="razao_social"
                        value={formData.razao_social}
                        onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                        required
                        placeholder="00.000.000/0000-00"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                      <Input
                        id="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
                        disabled={formData.isento_inscricao}
                        className="mt-2"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          checked={formData.isento_inscricao}
                          onCheckedChange={(checked) => setFormData({...formData, isento_inscricao: checked})}
                        />
                        <Label>Isento</Label>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_completo">Nome Completo *</Label>
                    <Input
                      id="nome_completo"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      required
                      placeholder="000.000.000-00"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_fixo">Telefone Fixo</Label>
                  <Input
                    id="telefone_fixo"
                    value={formData.telefone_fixo}
                    onChange={(e) => setFormData({...formData, telefone_fixo: e.target.value})}
                    placeholder="(00) 0000-0000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_celular">Telefone Celular</Label>
                  <Input
                    id="telefone_celular"
                    value={formData.telefone_celular}
                    onChange={(e) => setFormData({...formData, telefone_celular: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({...formData, cep: e.target.value})}
                    placeholder="00000-000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Contatos */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-4">Contato Técnico / Planejamento</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome"
                    value={formData.contato_tecnico.nome}
                    onChange={(e) => setFormData({...formData, contato_tecnico: {...formData.contato_tecnico, nome: e.target.value}})}
                  />
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={formData.contato_tecnico.email}
                    onChange={(e) => setFormData({...formData, contato_tecnico: {...formData.contato_tecnico, email: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Fixo"
                    value={formData.contato_tecnico.telefone_fixo}
                    onChange={(e) => setFormData({...formData, contato_tecnico: {...formData.contato_tecnico, telefone_fixo: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Celular"
                    value={formData.contato_tecnico.telefone_celular}
                    onChange={(e) => setFormData({...formData, contato_tecnico: {...formData.contato_tecnico, telefone_celular: e.target.value}})}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-4">Contato Financeiro</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome"
                    value={formData.contato_financeiro.nome}
                    onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, nome: e.target.value}})}
                  />
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={formData.contato_financeiro.email}
                    onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, email: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Fixo"
                    value={formData.contato_financeiro.telefone_fixo}
                    onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, telefone_fixo: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Celular"
                    value={formData.contato_financeiro.telefone_celular}
                    onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, telefone_celular: e.target.value}})}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold mb-4 text-blue-900">Responsável pela Assinatura do Contrato</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome *"
                    value={formData.responsavel_contrato.nome}
                    onChange={(e) => setFormData({...formData, responsavel_contrato: {...formData.responsavel_contrato, nome: e.target.value}})}
                    required
                  />
                  <Input
                    placeholder="CPF *"
                    value={formData.responsavel_contrato.cpf}
                    onChange={(e) => setFormData({...formData, responsavel_contrato: {...formData.responsavel_contrato, cpf: e.target.value}})}
                    required
                  />
                  <Input
                    placeholder="Cargo"
                    value={formData.responsavel_contrato.cargo}
                    onChange={(e) => setFormData({...formData, responsavel_contrato: {...formData.responsavel_contrato, cargo: e.target.value}})}
                  />
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={formData.responsavel_contrato.email}
                    onChange={(e) => setFormData({...formData, responsavel_contrato: {...formData.responsavel_contrato, email: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Fixo"
                    value={formData.responsavel_contrato.telefone_fixo}
                    onChange={(e) => setFormData({...formData, responsavel_contrato: {...formData.responsavel_contrato, telefone_fixo: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Celular"
                    value={formData.responsavel_contrato.telefone_celular}
                    onChange={(e) => setFormData({...formData, responsavel_contrato: {...formData.responsavel_contrato, telefone_celular: e.target.value}})}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold mb-4 text-purple-900">Testemunha da Assinatura do Contrato</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome"
                    value={formData.testemunha_contrato.nome}
                    onChange={(e) => setFormData({...formData, testemunha_contrato: {...formData.testemunha_contrato, nome: e.target.value}})}
                  />
                  <Input
                    placeholder="CPF"
                    value={formData.testemunha_contrato.cpf}
                    onChange={(e) => setFormData({...formData, testemunha_contrato: {...formData.testemunha_contrato, cpf: e.target.value}})}
                  />
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={formData.testemunha_contrato.email}
                    onChange={(e) => setFormData({...formData, testemunha_contrato: {...formData.testemunha_contrato, email: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Fixo"
                    value={formData.testemunha_contrato.telefone_fixo}
                    onChange={(e) => setFormData({...formData, testemunha_contrato: {...formData.testemunha_contrato, telefone_fixo: e.target.value}})}
                  />
                  <Input
                    placeholder="Telefone Celular"
                    value={formData.testemunha_contrato.telefone_celular}
                    onChange={(e) => setFormData({...formData, testemunha_contrato: {...formData.testemunha_contrato, telefone_celular: e.target.value}})}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 text-lg font-semibold shadow-lg shadow-cyan-500/30"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Cadastro"
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Ao enviar este formulário, você concorda que nossa equipe entre em contato para finalizar seu cadastro.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
