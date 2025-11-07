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
  UserPlus,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function GerenciarVendedores() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    cargo_funcao: "",
    email: "",
    telefone: "",
    cpf: "",
    comissao_lucro_liquido: 0,
    comissao_setup: 0,
    comissao_servico_avulso: 0,
    ativo: true
  });

  const { data: vendedores = [] } = useQuery({
    queryKey: ['vendedores'],
    queryFn: () => base44.entities.Vendedor.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.Vendedor.update(editingItem.id, data)
      : base44.entities.Vendedor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vendedor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, ativo }) => base44.entities.Vendedor.update(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cargo_funcao: "",
      email: "",
      telefone: "",
      cpf: "",
      comissao_lucro_liquido: 0,
      comissao_setup: 0,
      comissao_servico_avulso: 0,
      ativo: true
    });
  };

  const handleEdit = (vendedor) => {
    setEditingItem(vendedor);
    setFormData(vendedor);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredVendedores = vendedores.filter(v =>
    v.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cargo_funcao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Gerenciar Vendedores</h1>
            <p className="text-slate-600 text-lg">Cadastre e gerencie vendedores e comissionados</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-green-500 to-green-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Vendedor
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
                <CardTitle>{editingItem ? "Editar" : "Novo"} Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Dados Pessoais</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          required
                          className="mt-2"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cargo_funcao">Cargo / Função</Label>
                        <Input
                          id="cargo_funcao"
                          value={formData.cargo_funcao}
                          onChange={(e) => setFormData({...formData, cargo_funcao: e.target.value})}
                          className="mt-2"
                          placeholder="Ex: Gerente de Vendas"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                          className="mt-2"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                          className="mt-2"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="mt-2"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comissões */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg space-y-4 border-2 border-green-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-lg text-green-900">Estrutura de Comissões</h3>
                    </div>
                    <p className="text-sm text-green-700">Configure os percentuais de comissão para diferentes tipos de operação</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                        <Label htmlFor="comissao_lucro_liquido" className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Lucro Líquido
                        </Label>
                        <div className="relative">
                          <Input
                            id="comissao_lucro_liquido"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.comissao_lucro_liquido}
                            onChange={(e) => setFormData({...formData, comissao_lucro_liquido: parseFloat(e.target.value)})}
                            className="pr-8"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">%</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Comissão sobre o lucro líquido das operações</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                        <Label htmlFor="comissao_setup" className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          SETUP
                        </Label>
                        <div className="relative">
                          <Input
                            id="comissao_setup"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.comissao_setup}
                            onChange={(e) => setFormData({...formData, comissao_setup: parseFloat(e.target.value)})}
                            className="pr-8"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">%</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Comissão sobre valores de setup</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                        <Label htmlFor="comissao_servico_avulso" className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          Serviço Avulso
                        </Label>
                        <div className="relative">
                          <Input
                            id="comissao_servico_avulso"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.comissao_servico_avulso}
                            onChange={(e) => setFormData({...formData, comissao_servico_avulso: parseFloat(e.target.value)})}
                            className="pr-8"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">%</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Comissão sobre serviços avulsos</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Switch
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                    />
                    <Label className="cursor-pointer font-semibold">
                      {formData.ativo ? "Vendedor Ativo" : "Vendedor Inativo"}
                    </Label>
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
                      className="bg-gradient-to-r from-green-500 to-green-600"
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

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar vendedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Vendedores */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendedores.map((vendedor, index) => (
          <motion.div
            key={vendedor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      vendedor.ativo ? "bg-green-100" : "bg-slate-100"
                    }`}>
                      <UserPlus className={`w-6 h-6 ${vendedor.ativo ? "text-green-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vendedor.nome}</CardTitle>
                      {vendedor.cargo_funcao && (
                        <p className="text-sm text-slate-600">{vendedor.cargo_funcao}</p>
                      )}
                      <Badge variant="outline" className={`mt-1 ${vendedor.ativo ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {vendedor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(vendedor)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(vendedor.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendedor.email && (
                  <p className="text-sm text-slate-600">Email: {vendedor.email}</p>
                )}
                {vendedor.telefone && (
                  <p className="text-sm text-slate-600">Tel: {vendedor.telefone}</p>
                )}
                
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Comissões</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-slate-600">Lucro Líq.</p>
                      <p className="text-sm font-bold text-green-700">{vendedor.comissao_lucro_liquido}%</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600">Setup</p>
                      <p className="text-sm font-bold text-blue-700">{vendedor.comissao_setup}%</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-slate-600">Avulso</p>
                      <p className="text-sm font-bold text-purple-700">{vendedor.comissao_servico_avulso}%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Cadastrado em: {new Date(vendedor.created_date).toLocaleDateString('pt-BR')}
                  </span>
                  <Switch
                    checked={vendedor.ativo}
                    onCheckedChange={(checked) => toggleStatusMutation.mutate({ id: vendedor.id, ativo: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredVendedores.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum vendedor encontrado</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Vendedor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}