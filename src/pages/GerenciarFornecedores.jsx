import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Truck,
  Pencil,
  Trash2,
  Search,
  X
} from "lucide-react";

export default function GerenciarFornecedores() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    nome_razao_social: "",
    cnpj: "",
    email: "",
    telefone: "",
    nome_fantasia: "",
    habilitar_nota_debito: false,
    produto: "",
    subproduto: "",
    ciclo_fatura: 1,
    vencimento_fatura: 15,
    valor_unitario: 0,
    valor_por_faixa: [],
    contato_comercial: { nome: "", telefone: "", email: "" },
    contato_operacional: { nome: "", telefone: "", email: "" },
    contato_financeiro: { nome: "", telefone: "", email: "" },
    inscricao_estadual: "",
    ativo: true
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.Fornecedor.update(editingItem.id, data)
      : base44.entities.Fornecedor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Fornecedor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
    },
  });

  const resetForm = () => {
    setFormData({
      nome_razao_social: "",
      cnpj: "",
      email: "",
      telefone: "",
      nome_fantasia: "",
      habilitar_nota_debito: false,
      produto: "",
      subproduto: "",
      ciclo_fatura: 1,
      vencimento_fatura: 15,
      valor_unitario: 0,
      valor_por_faixa: [],
      contato_comercial: { nome: "", telefone: "", email: "" },
      contato_operacional: { nome: "", telefone: "", email: "" },
      contato_financeiro: { nome: "", telefone: "", email: "" },
      inscricao_estadual: "",
      ativo: true
    });
  };

  const handleEdit = (fornecedor) => {
    setEditingItem(fornecedor);
    setFormData(fornecedor);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addFaixaVolumetria = () => {
    setFormData({
      ...formData,
      valor_por_faixa: [
        ...formData.valor_por_faixa,
        { faixa_inicial: 0, faixa_final: 0, valor: 0 }
      ]
    });
  };

  const removeFaixaVolumetria = (index) => {
    setFormData({
      ...formData,
      valor_por_faixa: formData.valor_por_faixa.filter((_, i) => i !== index)
    });
  };

  const updateFaixaVolumetria = (index, field, value) => {
    const faixas = [...formData.valor_por_faixa];
    faixas[index][field] = value;
    setFormData({ ...formData, valor_por_faixa: faixas });
  };

  const filteredFornecedores = fornecedores.filter(f =>
    f.nome_razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cnpj?.includes(searchTerm)
  );

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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Gerenciar Fornecedores</h1>
            <p className="text-slate-600 text-lg">Cadastre e gerencie fornecedores</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white mb-6">
              <CardHeader>
                <CardTitle>{editingItem ? "Editar" : "Novo"} Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Básicos */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome_razao_social">Nome / Razão Social *</Label>
                      <Input
                        id="nome_razao_social"
                        value={formData.nome_razao_social}
                        onChange={(e) => setFormData({...formData, nome_razao_social: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                      <Input
                        id="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
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
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="mt-2"
                      />
                    </div>
                  </div>

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

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Switch
                      checked={formData.habilitar_nota_debito}
                      onCheckedChange={(checked) => setFormData({...formData, habilitar_nota_debito: checked})}
                    />
                    <Label className="cursor-pointer">Habilitar Nota de Débito</Label>
                  </div>

                  {/* Produtos e Preços */}
                  <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                    <h3 className="font-semibold">Produtos e Preços</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="produto">Produto</Label>
                        <Input
                          id="produto"
                          value={formData.produto}
                          onChange={(e) => setFormData({...formData, produto: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subproduto">Subproduto</Label>
                        <Input
                          id="subproduto"
                          value={formData.subproduto}
                          onChange={(e) => setFormData({...formData, subproduto: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ciclo_fatura">Ciclo da Fatura (1-30)</Label>
                        <Input
                          id="ciclo_fatura"
                          type="number"
                          min="1"
                          max="30"
                          value={formData.ciclo_fatura}
                          onChange={(e) => setFormData({...formData, ciclo_fatura: parseInt(e.target.value)})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vencimento_fatura">Vencimento (Mês Subsequente)</Label>
                        <Input
                          id="vencimento_fatura"
                          type="number"
                          value={formData.vencimento_fatura}
                          onChange={(e) => setFormData({...formData, vencimento_fatura: parseInt(e.target.value)})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
                        <Input
                          id="valor_unitario"
                          type="number"
                          step="0.01"
                          value={formData.valor_unitario}
                          onChange={(e) => setFormData({...formData, valor_unitario: parseFloat(e.target.value)})}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* Faixas de Volumetria */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Valor por Faixa de Volumetria</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFaixaVolumetria}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Faixa
                        </Button>
                      </div>
                      {formData.valor_por_faixa.map((faixa, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            type="number"
                            placeholder="De"
                            value={faixa.faixa_inicial}
                            onChange={(e) => updateFaixaVolumetria(index, 'faixa_inicial', parseInt(e.target.value))}
                          />
                          <Input
                            type="number"
                            placeholder="Até"
                            value={faixa.faixa_final}
                            onChange={(e) => updateFaixaVolumetria(index, 'faixa_final', parseInt(e.target.value))}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Valor (R$)"
                            value={faixa.valor}
                            onChange={(e) => updateFaixaVolumetria(index, 'valor', parseFloat(e.target.value))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFaixaVolumetria(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contatos */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold mb-4">Contato Comercial</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Nome"
                          value={formData.contato_comercial.nome}
                          onChange={(e) => setFormData({...formData, contato_comercial: {...formData.contato_comercial, nome: e.target.value}})}
                        />
                        <Input
                          placeholder="Telefone"
                          value={formData.contato_comercial.telefone}
                          onChange={(e) => setFormData({...formData, contato_comercial: {...formData.contato_comercial, telefone: e.target.value}})}
                        />
                        <Input
                          placeholder="E-mail"
                          type="email"
                          value={formData.contato_comercial.email}
                          onChange={(e) => setFormData({...formData, contato_comercial: {...formData.contato_comercial, email: e.target.value}})}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold mb-4">Contato Operacional</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Nome"
                          value={formData.contato_operacional.nome}
                          onChange={(e) => setFormData({...formData, contato_operacional: {...formData.contato_operacional, nome: e.target.value}})}
                        />
                        <Input
                          placeholder="Telefone"
                          value={formData.contato_operacional.telefone}
                          onChange={(e) => setFormData({...formData, contato_operacional: {...formData.contato_operacional, telefone: e.target.value}})}
                        />
                        <Input
                          placeholder="E-mail"
                          type="email"
                          value={formData.contato_operacional.email}
                          onChange={(e) => setFormData({...formData, contato_operacional: {...formData.contato_operacional, email: e.target.value}})}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold mb-4">Contato Financeiro</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Nome"
                          value={formData.contato_financeiro.nome}
                          onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, nome: e.target.value}})}
                        />
                        <Input
                          placeholder="Telefone"
                          value={formData.contato_financeiro.telefone}
                          onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, telefone: e.target.value}})}
                        />
                        <Input
                          placeholder="E-mail"
                          type="email"
                          value={formData.contato_financeiro.email}
                          onChange={(e) => setFormData({...formData, contato_financeiro: {...formData.contato_financeiro, email: e.target.value}})}
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
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600"
                    >
                      {createMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Fornecedores */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar fornecedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFornecedores.map((fornecedor, index) => (
          <motion.div
            key={fornecedor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{fornecedor.nome_fantasia || fornecedor.nome_razao_social}</CardTitle>
                      <Badge variant="outline" className={fornecedor.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(fornecedor)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(fornecedor.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-600">CNPJ: {fornecedor.cnpj}</p>
                <p className="text-slate-600">Email: {fornecedor.email}</p>
                {fornecedor.telefone && <p className="text-slate-600">Tel: {fornecedor.telefone}</p>}
                {fornecedor.produto && <p className="text-slate-600">Produto: {fornecedor.produto}</p>}
                <p className="text-slate-600">Valor Unit.: R$ {fornecedor.valor_unitario?.toFixed(2)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredFornecedores.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum fornecedor encontrado</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Fornecedor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}