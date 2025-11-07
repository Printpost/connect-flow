import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Search,
  Upload,
  Eye,
  Copy,
  FileCheck,
  AlertCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function GerenciarContratos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [gerarContratoDialog, setGerarContratoDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variaveisEncontradas, setVariaveisEncontradas] = useState([]);
  const [dadosVariaveis, setDadosVariaveis] = useState({});
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    conteudo: "",
    arquivo_url: "",
    variaveis: [],
    tipo: "ambos",
    categoria: "servico",
    ativo: true
  });

  const { data: contratos = [] } = useQuery({
    queryKey: ['contratos'],
    queryFn: () => base44.entities.ContratoModelo.list('-created_date'),
    initialData: [],
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.ContratoModelo.update(editingItem.id, data)
      : base44.entities.ContratoModelo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContratoModelo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
  });

  const gerarContratoMutation = useMutation({
    mutationFn: (data) => base44.entities.ContratoGerado.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-gerados'] });
      setGerarContratoDialog(false);
      setSelectedTemplate(null);
      setDadosVariaveis({});
      alert("Contrato gerado com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      conteudo: "",
      arquivo_url: "",
      variaveis: [],
      tipo: "ambos",
      categoria: "servico",
      ativo: true
    });
  };

  const handleEdit = (contrato) => {
    setEditingItem(contrato);
    setFormData(contrato);
    setShowForm(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, arquivo_url: file_url });
    } catch (error) {
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploadingFile(false);
    }
  };

  const extrairVariaveis = (texto) => {
    const regex = /\[([^\]]+)\]/g;
    const matches = [...texto.matchAll(regex)];
    const variaveis = [...new Set(matches.map(m => m[1]))];
    return variaveis.map(v => ({
      nome: v,
      label: v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      tipo: detectarTipo(v),
      obrigatorio: true
    }));
  };

  const detectarTipo = (nomeVariavel) => {
    const nome = nomeVariavel.toLowerCase();
    if (nome.includes('email')) return 'email';
    if (nome.includes('cpf')) return 'cpf';
    if (nome.includes('cnpj')) return 'cnpj';
    if (nome.includes('telefone') || nome.includes('celular')) return 'telefone';
    if (nome.includes('data')) return 'data';
    if (nome.includes('valor') || nome.includes('preco')) return 'moeda';
    if (nome.includes('quantidade') || nome.includes('numero')) return 'numero';
    return 'texto';
  };

  const handleAnalisarVariaveis = () => {
    const vars = extrairVariaveis(formData.conteudo);
    setFormData({ ...formData, variaveis: vars });
    setVariaveisEncontradas(vars);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleGerarContrato = (template) => {
    setSelectedTemplate(template);
    setDadosVariaveis({});
    setGerarContratoDialog(true);
  };

  const handleConfirmarGeracao = () => {
    if (!selectedTemplate) return;

    let conteudoGerado = selectedTemplate.conteudo;
    
    // Substituir variáveis
    Object.entries(dadosVariaveis).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      conteudoGerado = conteudoGerado.replace(regex, value);
    });

    gerarContratoMutation.mutate({
      modelo_id: selectedTemplate.id,
      modelo_nome: selectedTemplate.nome,
      cliente_id: dadosVariaveis.cliente_id || "",
      cliente_nome: dadosVariaveis.cliente_nome || "",
      conteudo_gerado: conteudoGerado,
      dados_preenchidos: dadosVariaveis,
      status: "rascunho"
    });
  };

  const preencherDadosCliente = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    const dadosAuto = {
      cliente_id: cliente.id,
      cliente_nome: cliente.nome_fantasia || cliente.nome_completo,
      nome_cliente: cliente.nome_fantasia || cliente.nome_completo,
      razao_social: cliente.razao_social || "",
      cnpj: cliente.cnpj || "",
      cpf: cliente.cpf || "",
      email_cliente: cliente.email || "",
      telefone_cliente: cliente.telefone_celular || cliente.telefone_fixo || "",
      endereco_cliente: cliente.endereco || ""
    };

    setDadosVariaveis({ ...dadosVariaveis, ...dadosAuto });
  };

  const filteredContratos = contratos.filter(c =>
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPreviewConteudo = () => {
    if (!selectedTemplate) return "";
    let preview = selectedTemplate.conteudo;
    Object.entries(dadosVariaveis).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      preview = preview.replace(regex, `<strong class="text-blue-600">${value}</strong>`);
    });
    return preview;
  };

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
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Modelos de Contratos</h1>
            <p className="text-slate-600 text-lg">Gerencie templates com variáveis dinâmicas</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Modelo
          </Button>
        </div>
      </motion.div>

      {/* Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white mb-6">
              <CardHeader>
                <CardTitle>{editingItem ? "Editar" : "Novo"} Modelo de Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <strong>Como usar variáveis:</strong> Use <code className="bg-blue-100 px-2 py-1 rounded">[nome_variavel]</code> no texto do contrato. 
                      Exemplo: <code className="bg-blue-100 px-2 py-1 rounded">[nome_cliente]</code>, <code className="bg-blue-100 px-2 py-1 rounded">[valor_contrato]</code>
                    </AlertDescription>
                  </Alert>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome do Modelo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                        className="mt-2"
                        placeholder="Ex: Contrato de Prestação de Serviços"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="servico">Serviço</SelectItem>
                          <SelectItem value="produto">Produto</SelectItem>
                          <SelectItem value="parceria">Parceria</SelectItem>
                          <SelectItem value="confidencialidade">Confidencialidade</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      className="mt-2"
                      placeholder="Breve descrição do modelo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo de Cliente</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ambos">Ambos (PF e PJ)</SelectItem>
                        <SelectItem value="pessoa_juridica">Apenas Pessoa Jurídica</SelectItem>
                        <SelectItem value="pessoa_fisica">Apenas Pessoa Física</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="arquivo">Upload de Arquivo Original (Opcional)</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Input
                        id="arquivo"
                        type="file"
                        accept=".doc,.docx,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="flex-1"
                      />
                      {uploadingFile && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Enviando...</span>
                        </div>
                      )}
                      {formData.arquivo_url && (
                        <Badge className="bg-green-600">Arquivo carregado</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="conteudo">Conteúdo do Contrato *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAnalisarVariaveis}
                        disabled={!formData.conteudo}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Detectar Variáveis
                      </Button>
                    </div>
                    <Textarea
                      id="conteudo"
                      value={formData.conteudo}
                      onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                      required
                      className="mt-2 min-h-[300px] font-mono text-sm"
                      placeholder="Digite o texto do contrato aqui. Use [nome_variavel] para campos dinâmicos.&#10;&#10;Exemplo:&#10;Este contrato é celebrado entre [nome_empresa] e [nome_cliente], portador do CPF [cpf_cliente], para prestação de serviços no valor de R$ [valor_contrato]."
                    />
                  </div>

                  {/* Variáveis Detectadas */}
                  {variaveisEncontradas.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Variáveis Detectadas ({variaveisEncontradas.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {variaveisEncontradas.map((variavel, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                            <code className="text-blue-600 font-semibold">[{variavel.nome}]</code>
                            <p className="text-xs text-slate-600 mt-1">
                              Tipo: <Badge variant="outline" className="ml-1">{variavel.tipo}</Badge>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600"
                    >
                      {createMutation.isPending ? "Salvando..." : "Salvar Modelo"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar modelos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Modelos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContratos.map((contrato, index) => (
          <motion.div
            key={contrato.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{contrato.nome}</CardTitle>
                      {contrato.descricao && (
                        <p className="text-sm text-slate-600 truncate">{contrato.descricao}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{contrato.categoria}</Badge>
                        {contrato.variaveis?.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {contrato.variaveis.length} variáveis
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGerarContrato(contrato)}
                    className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Gerar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(contrato);
                      setPreviewDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contrato)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(contrato.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredContratos.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum modelo encontrado</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Modelo
            </Button>
          </div>
        )}
      </div>

      {/* Dialog - Preview */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.nome}</DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-slate-50 rounded-lg">
            <div className="prose max-w-none whitespace-pre-wrap font-serif">
              {selectedTemplate?.conteudo}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Gerar Contrato */}
      <Dialog open={gerarContratoDialog} onOpenChange={setGerarContratoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" />
              Gerar Contrato: {selectedTemplate?.nome}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Auto-preencher com cliente */}
            <div>
              <Label>Preencher automaticamente com dados do cliente (opcional)</Label>
              <Select onValueChange={preencherDadosCliente}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome_fantasia || cliente.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Formulário de Variáveis */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold mb-4">Preencher Variáveis</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedTemplate?.variaveis?.map((variavel, index) => (
                  <div key={index}>
                    <Label htmlFor={`var-${variavel.nome}`}>
                      {variavel.label}
                      {variavel.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={`var-${variavel.nome}`}
                      type={variavel.tipo === 'numero' ? 'number' : variavel.tipo === 'data' ? 'date' : 'text'}
                      value={dadosVariaveis[variavel.nome] || ""}
                      onChange={(e) => setDadosVariaveis({...dadosVariaveis, [variavel.nome]: e.target.value})}
                      required={variavel.obrigatorio}
                      className="mt-2"
                      placeholder={`Digite ${variavel.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview do Contrato Gerado */}
            {Object.keys(dadosVariaveis).length > 0 && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold mb-3 text-green-900 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Contrato
                </h3>
                <div 
                  className="prose max-w-none whitespace-pre-wrap font-serif text-sm bg-white p-4 rounded"
                  dangerouslySetInnerHTML={{ __html: getPreviewConteudo() }}
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setGerarContratoDialog(false);
                  setDadosVariaveis({});
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmarGeracao}
                disabled={gerarContratoMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {gerarContratoMutation.isPending ? "Gerando..." : "Gerar Contrato"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}