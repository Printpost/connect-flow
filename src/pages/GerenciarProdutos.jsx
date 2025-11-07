import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Package,
  Pencil,
  Trash2,
  Search
} from "lucide-react";

export default function GerenciarProdutos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    nome_produto: "",
    nome_subproduto: "",
    valor: 0,
    margem_negociacao: 0,
    tipo: "email",
    descricao: "",
    ativo: true
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.Produto.update(editingItem.id, data)
      : base44.entities.Produto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Produto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const resetForm = () => {
    setFormData({
      nome_produto: "",
      nome_subproduto: "",
      valor: 0,
      margem_negociacao: 0,
      tipo: "email",
      descricao: "",
      ativo: true
    });
  };

  const handleEdit = (produto) => {
    setEditingItem(produto);
    setFormData(produto);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredProdutos = produtos.filter(p =>
    p.nome_produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nome_subproduto?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Gerenciar Produtos</h1>
            <p className="text-slate-600 text-lg">Cadastre e gerencie produtos e serviços</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-purple-500 to-purple-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Produto
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
                <CardTitle>{editingItem ? "Editar" : "Novo"} Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome_produto">Nome do Produto *</Label>
                      <Input
                        id="nome_produto"
                        value={formData.nome_produto}
                        onChange={(e) => setFormData({...formData, nome_produto: e.target.value})}
                        required
                        className="mt-2"
                        placeholder="Ex: Email Marketing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nome_subproduto">Nome do Subproduto</Label>
                      <Input
                        id="nome_subproduto"
                        value={formData.nome_subproduto}
                        onChange={(e) => setFormData({...formData, nome_subproduto: e.target.value})}
                        className="mt-2"
                        placeholder="Ex: Envio Transacional"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo de Serviço *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="rcs">RCS</SelectItem>
                        <SelectItem value="carta">Carta</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      className="mt-2"
                      placeholder="Descrição detalhada do produto"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value)})}
                        required
                        className="mt-2"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="margem_negociacao">Margem de Negociação (%)</Label>
                      <Input
                        id="margem_negociacao"
                        type="number"
                        step="0.01"
                        value={formData.margem_negociacao}
                        onChange={(e) => setFormData({...formData, margem_negociacao: parseFloat(e.target.value)})}
                        className="mt-2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Switch
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                    />
                    <Label className="cursor-pointer">
                      {formData.ativo ? "Produto Ativo" : "Produto Inativo"}
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
                      className="bg-gradient-to-r from-purple-500 to-purple-600"
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

      {/* Lista de Produtos */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProdutos.map((produto, index) => (
          <motion.div
            key={produto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{produto.nome_produto}</CardTitle>
                      {produto.nome_subproduto && (
                        <p className="text-sm text-slate-600">{produto.nome_subproduto}</p>
                      )}
                      <Badge variant="outline" className="mt-1">
                        {produto.tipo}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(produto)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(produto.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-lg font-bold text-slate-900">R$ {produto.valor?.toFixed(2)}</p>
                {produto.margem_negociacao > 0 && (
                  <p className="text-slate-600">Margem: {produto.margem_negociacao}%</p>
                )}
                {produto.descricao && (
                  <p className="text-slate-600 line-clamp-2">{produto.descricao}</p>
                )}
                <Badge className={produto.ativo ? "bg-green-600" : "bg-slate-600"}>
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredProdutos.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum produto encontrado</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Produto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}