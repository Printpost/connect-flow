import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Building2,
  User,
  Pencil,
  Trash2,
  Search,
  Users,
  DollarSign,
  Package,
  FileText,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  FlaskConical,
  Key,
  FileSignature,
  Mail,
  Send,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GerenciarClientes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Modals state
  const [pocDialogOpen, setPocDialogOpen] = useState(false);
  const [selectedClientePoc, setSelectedClientePoc] = useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedClienteLogin, setSelectedClienteLogin] = useState(null);
  const [contratoDialogOpen, setContratoDialogOpen] = useState(false);
  const [selectedClienteContrato, setSelectedClienteContrato] = useState(null);
  const [boasVindasDialogOpen, setBoasVindasDialogOpen] = useState(false);
  const [selectedClienteBoasVindas, setSelectedClienteBoasVindas] = useState(null);
  
  const [formData, setFormData] = useState({
    tipo_pessoa: "pessoa_juridica",
    perfil: "USUARIO",
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
    forma_pagamento: "pos_pago",
    ciclo_fatura: 1,
    vencimento_fatura: 10,
    limite_credito: 0,
    modalidade_fatura: "normal",
    contato_tecnico: { nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
    contato_financeiro: { nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
    responsavel_contrato: { cpf: "", nome: "", cargo: "", telefone_fixo: "", telefone_celular: "", email: "" },
    testemunha_contrato: { cpf: "", nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
    produtos_contratados: [],
    status: "ativo",
    status_preenchimento: "completo"
  });

  // POC Form
  const [pocForm, setPocForm] = useState({
    produto: "",
    quantidade_cortesia: 0,
    data_inicio: "",
    data_fim: ""
  });

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: "",
    senha: "",
    repetir_senha: ""
  });

  // Boas Vindas Form
  const [boasVindasForm, setBoasVindasForm] = useState({
    destinatario: "",
    enviar_email: true,
    enviar_sms: false,
    enviar_whatsapp: false
  });

  const [contratoSelecionado, setContratoSelecionado] = useState("");

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
    initialData: [],
  });

  const { data: vendedores = [] } = useQuery({
    queryKey: ['vendedores'],
    queryFn: () => base44.entities.Vendedor.list(),
    initialData: [],
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
    initialData: [],
  });

  const { data: contratos = [] } = useQuery({
    queryKey: ['contratos'],
    queryFn: () => base44.entities.ContratoModelo.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.Cliente.update(editingItem.id, data)
      : base44.entities.Cliente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditingItem(null);
      setCurrentStep(0);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Cliente.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const createPocMutation = useMutation({
    mutationFn: (data) => base44.entities.POC.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pocs'] });
      setPocDialogOpen(false);
      setPocForm({ produto: "", quantidade_cortesia: 0, data_inicio: "", data_fim: "" });
    },
  });

  const resetForm = () => {
    setFormData({
      tipo_pessoa: "pessoa_juridica",
      perfil: "USUARIO",
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
      forma_pagamento: "pos_pago",
      ciclo_fatura: 1,
      vencimento_fatura: 10,
      limite_credito: 0,
      modalidade_fatura: "normal",
      contato_tecnico: { nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
      contato_financeiro: { nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
      responsavel_contrato: { cpf: "", nome: "", cargo: "", telefone_fixo: "", telefone_celular: "", email: "" },
      testemunha_contrato: { cpf: "", nome: "", telefone_fixo: "", telefone_celular: "", email: "" },
      produtos_contratados: [],
      status: "ativo",
      status_preenchimento: "completo"
    });
  };

  const handleEdit = (cliente) => {
    setEditingItem(cliente);
    setFormData({ ...cliente, status_preenchimento: cliente.status_preenchimento || "completo" });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handlePocSubmit = () => {
    if (selectedClientePoc) {
      createPocMutation.mutate({
        cliente_id: selectedClientePoc.id,
        cliente_nome: selectedClientePoc.nome_fantasia || selectedClientePoc.nome_completo,
        ...pocForm,
        status: "ativa"
      });
    }
  };

  const handleLoginSubmit = () => {
    if (loginForm.senha !== loginForm.repetir_senha) {
      alert("As senhas não coincidem!");
      return;
    }
    alert("Login criado com sucesso!");
    setLoginDialogOpen(false);
    setLoginForm({ email: "", senha: "", repetir_senha: "" });
  };

  const handleContratoSubmit = () => {
    if (!contratoSelecionado) {
      alert("Selecione um contrato!");
      return;
    }
    alert("Contrato enviado com sucesso!");
    setContratoDialogOpen(false);
    setContratoSelecionado("");
  };

  const handleBoasVindasSubmit = () => {
    if (!boasVindasForm.destinatario) {
      alert("Preencha o destinatário!");
      return;
    }
    const canais = [];
    if (boasVindasForm.enviar_email) canais.push("Email");
    if (boasVindasForm.enviar_sms) canais.push("SMS");
    if (boasVindasForm.enviar_whatsapp) canais.push("WhatsApp");
    
    alert(`Boas-vindas enviadas via: ${canais.join(", ")}`);
    setBoasVindasDialogOpen(false);
    setBoasVindasForm({ destinatario: "", enviar_email: true, enviar_sms: false, enviar_whatsapp: false });
  };

  const addProduto = () => {
    setFormData({
      ...formData,
      produtos_contratados: [
        ...formData.produtos_contratados,
        {
          produto: "",
          tipo_envio: "",
          fornecedores: [],
          custo_envio: 0,
          por_volumetria: false,
          fornecedores_externos: [],
          vendedor: "",
          comissao_vendedor: 0,
          imposto: 0,
          adicionar_comissao: false,
          valor_venda: 0
        }
      ]
    });
  };

  const removeProduto = (index) => {
    setFormData({
      ...formData,
      produtos_contratados: formData.produtos_contratados.filter((_, i) => i !== index)
    });
  };

  const updateProduto = (index, field, value) => {
    const produtos = [...formData.produtos_contratados];
    produtos[index][field] = value;
    setFormData({ ...formData, produtos_contratados: produtos });
  };

  const handleCopyLink = () => {
    const formUrl = `${window.location.origin}${createPageUrl("FormularioCliente")}`;
    navigator.clipboard.writeText(formUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const clientesPendentes = filteredClientes.filter(c => c.status_preenchimento === "pendente");
  const clientesCompletos = filteredClientes.filter(c => c.status_preenchimento === "completo" || !c.status_preenchimento);

  const steps = [
    { title: "Dados Básicos", icon: User },
    { title: "Contatos", icon: Users },
    { title: "Financeiro", icon: DollarSign },
    { title: "Produtos", icon: Package }
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Admin"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Gerenciar Clientes</h1>
            <p className="text-slate-600 text-lg">Cadastre e gerencie clientes mensalistas</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
            >
              {linkCopied ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Gerar Link de Cadastro
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingItem(null);
                setCurrentStep(0);
                resetForm();
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Alert de Link Copiado */}
        <AnimatePresence>
          {linkCopied && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  Link copiado! Envie este link para seus clientes preencherem os dados básicos.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Formulário de Cliente */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle>{editingItem ? "Editar" : "Novo"} Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Tipo de Pessoa */}
                  <div className="mb-6">
                    <Label className="text-base font-semibold mb-3 block">Tipo de Pessoa *</Label>
                    <RadioGroup value={formData.tipo_pessoa} onValueChange={(value) => setFormData({...formData, tipo_pessoa: value})}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2 border-2 border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-blue-300">
                          <RadioGroupItem value="pessoa_juridica" id="pj" />
                          <Label htmlFor="pj" className="cursor-pointer flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Pessoa Jurídica
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border-2 border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-blue-300">
                          <RadioGroupItem value="pessoa_fisica" id="pf" />
                          <Label htmlFor="pf" className="cursor-pointer flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Pessoa Física
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Dados básicos */}
                  {formData.tipo_pessoa === "pessoa_juridica" ? (
                    <div className="space-y-4 mb-6">
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
                          <Label htmlFor="razao_social">Razão Social</Label>
                          <Input
                            id="razao_social"
                            value={formData.razao_social}
                            onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
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
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
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
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={formData.cpf}
                            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                            placeholder="000.000.000-00"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contatos */}
                  <div className="space-y-4 mb-6">
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
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-blue-600"
                    >
                      {createMutation.isPending ? "Salvando..." : "Salvar Cliente"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Clientes */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clientes Pendentes */}
      {clientesPendentes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Cadastros Pendentes</h2>
            <Badge className="bg-amber-500">{clientesPendentes.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientesPendentes.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-amber-200 shadow-xl shadow-amber-200/50 bg-white hover:shadow-2xl transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                          {cliente.tipo_pessoa === "pessoa_juridica" ? (
                            <Building2 className="w-6 h-6 text-amber-600" />
                          ) : (
                            <User className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{cliente.nome_fantasia || cliente.nome_completo}</CardTitle>
                          <Badge className="mt-1 bg-amber-500">Pendente</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cliente)}
                          title="Completar cadastro"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(cliente.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-slate-600">Email: {cliente.email}</p>
                    {cliente.telefone_celular && <p className="text-slate-600">Tel: {cliente.telefone_celular}</p>}
                    <p className="text-amber-700 font-medium text-xs">⚠ Aguardando dados financeiros e produtos</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Clientes Completos */}
      {clientesCompletos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Clientes Cadastrados</h2>
            <Badge className="bg-green-500">{clientesCompletos.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientesCompletos.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          cliente.tipo_pessoa === "pessoa_juridica" ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          {cliente.tipo_pessoa === "pessoa_juridica" ? (
                            <Building2 className="w-6 h-6 text-blue-600" />
                          ) : (
                            <User className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{cliente.nome_fantasia || cliente.nome_completo}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {cliente.perfil}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(cliente)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedClientePoc(cliente);
                            setPocDialogOpen(true);
                          }}>
                            <FlaskConical className="w-4 h-4 mr-2" />
                            Cadastrar POC
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedClienteLogin(cliente);
                            setLoginForm({ ...loginForm, email: cliente.email });
                            setLoginDialogOpen(true);
                          }}>
                            <Key className="w-4 h-4 mr-2" />
                            Gerenciar Login
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedClienteContrato(cliente);
                            setContratoDialogOpen(true);
                          }}>
                            <FileSignature className="w-4 h-4 mr-2" />
                            Enviar Contrato
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedClienteBoasVindas(cliente);
                            setBoasVindasForm({ ...boasVindasForm, destinatario: cliente.email });
                            setBoasVindasDialogOpen(true);
                          }}>
                            <Mail className="w-4 h-4 mr-2" />
                            Boas-Vindas
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(cliente.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-slate-600 truncate">Email: {cliente.email}</p>
                    {cliente.telefone_celular && <p className="text-slate-600">Tel: {cliente.telefone_celular}</p>}
                    <Badge className={cliente.status === "ativo" ? "bg-green-600" : "bg-red-600"}>
                      {cliente.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog - Cadastrar POC */}
      <Dialog open={pocDialogOpen} onOpenChange={setPocDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              Cadastrar POC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input value={selectedClientePoc?.nome_fantasia || selectedClientePoc?.nome_completo || ""} disabled className="mt-2" />
            </div>
            <div>
              <Label htmlFor="produto">Selecionar Produto *</Label>
              <Select value={pocForm.produto} onValueChange={(value) => setPocForm({...pocForm, produto: value})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome_produto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantidade">Quantidade de Cortesia *</Label>
              <Input
                id="quantidade"
                type="number"
                value={pocForm.quantidade_cortesia}
                onChange={(e) => setPocForm({...pocForm, quantidade_cortesia: parseInt(e.target.value)})}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={pocForm.data_inicio}
                  onChange={(e) => setPocForm({...pocForm, data_inicio: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="data_fim">Data Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={pocForm.data_fim}
                  onChange={(e) => setPocForm({...pocForm, data_fim: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>
            <Button onClick={handlePocSubmit} className="w-full bg-purple-600 hover:bg-purple-700">
              Cadastrar POC
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Gerenciar Login */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Gerenciar Login e Senha
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input value={selectedClienteLogin?.nome_fantasia || selectedClienteLogin?.nome_completo || ""} disabled className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email-login">Usuário (E-mail) *</Label>
              <Input
                id="email-login"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={loginForm.senha}
                onChange={(e) => setLoginForm({...loginForm, senha: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="repetir-senha">Repetir Senha *</Label>
              <Input
                id="repetir-senha"
                type="password"
                value={loginForm.repetir_senha}
                onChange={(e) => setLoginForm({...loginForm, repetir_senha: e.target.value})}
                className="mt-2"
              />
            </div>
            <Button onClick={handleLoginSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
              Salvar Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Selecionar Contrato */}
      <Dialog open={contratoDialogOpen} onOpenChange={setContratoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-green-600" />
              Selecionar Contrato para Envio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input value={selectedClienteContrato?.nome_fantasia || selectedClienteContrato?.nome_completo || ""} disabled className="mt-2" />
            </div>
            <div>
              <Label htmlFor="contrato">Modelo de Contrato *</Label>
              <Select value={contratoSelecionado} onValueChange={setContratoSelecionado}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {contratos.map((contrato) => (
                    <SelectItem key={contrato.id} value={contrato.id}>
                      {contrato.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleContratoSubmit} className="w-full bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Enviar Contrato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Boas-Vindas */}
      <Dialog open={boasVindasDialogOpen} onOpenChange={setBoasVindasDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-600" />
              Enviar E-mail de Boas-Vindas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input value={selectedClienteBoasVindas?.nome_fantasia || selectedClienteBoasVindas?.nome_completo || ""} disabled className="mt-2" />
            </div>
            <div>
              <Label htmlFor="destinatario">E-mail ou Telefone do Responsável *</Label>
              <Input
                id="destinatario"
                value={boasVindasForm.destinatario}
                onChange={(e) => setBoasVindasForm({...boasVindasForm, destinatario: e.target.value})}
                className="mt-2"
                placeholder="email@exemplo.com ou (00) 00000-0000"
              />
            </div>
            <div className="space-y-3">
              <Label>Canais de Envio</Label>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="email-canal"
                  checked={boasVindasForm.enviar_email}
                  onCheckedChange={(checked) => setBoasVindasForm({...boasVindasForm, enviar_email: checked})}
                />
                <Label htmlFor="email-canal" className="cursor-pointer flex-1">Disparar por E-mail</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="sms-canal"
                  checked={boasVindasForm.enviar_sms}
                  onCheckedChange={(checked) => setBoasVindasForm({...boasVindasForm, enviar_sms: checked})}
                />
                <Label htmlFor="sms-canal" className="cursor-pointer flex-1">Disparar por SMS</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="whatsapp-canal"
                  checked={boasVindasForm.enviar_whatsapp}
                  onCheckedChange={(checked) => setBoasVindasForm({...boasVindasForm, enviar_whatsapp: checked})}
                />
                <Label htmlFor="whatsapp-canal" className="cursor-pointer flex-1">Disparar por WhatsApp</Label>
              </div>
            </div>
            <Button onClick={handleBoasVindasSubmit} className="w-full bg-cyan-600 hover:bg-cyan-700">
              <Send className="w-4 h-4 mr-2" />
              Enviar Boas-Vindas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
}