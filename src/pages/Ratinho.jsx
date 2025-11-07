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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  UserCheck,
  Pencil,
  Trash2,
  Info,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Ratinho() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    ativo: true
  });

  const { data: ratinhos = [] } = useQuery({
    queryKey: ['ratinhos'],
    queryFn: () => base44.entities.Ratinho.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.Ratinho.update(editingItem.id, data)
      : base44.entities.Ratinho.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratinhos'] });
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ratinho.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratinhos'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, ativo }) => base44.entities.Ratinho.update(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratinhos'] });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      endereco: "",
      ativo: true
    });
  };

  const handleEdit = (ratinho) => {
    setEditingItem(ratinho);
    setFormData(ratinho);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Ferramentas"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Cadastrar Ratinho</h1>
            <p className="text-slate-600 text-lg">Configure aprovadores de ações da plataforma</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-amber-500 to-amber-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Ratinho
          </Button>
        </div>
      </motion.div>

      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Info className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>O que é Ratinho?</strong> É um aprovador que receberá notificações de todas as ações aprovadas na plataforma para avaliação. 
          Cadastre um e-mail, telefone ou endereço para que as aprovações sejam enviadas para análise.
        </AlertDescription>
      </Alert>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white mb-6">
              <CardHeader>
                <CardTitle>{editingItem ? "Editar" : "Novo"} Ratinho</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                      className="mt-2"
                      placeholder="Nome do aprovador"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="mt-2"
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Switch
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                    />
                    <Label className="cursor-pointer">
                      {formData.ativo ? "Ativo" : "Inativo"}
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
                      className="bg-gradient-to-r from-amber-500 to-amber-600"
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

      <div className="grid md:grid-cols-2 gap-6">
        {ratinhos.map((ratinho, index) => (
          <motion.div
            key={ratinho.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      ratinho.ativo ? "bg-green-100" : "bg-slate-100"
                    }`}>
                      <UserCheck className={`w-6 h-6 ${ratinho.ativo ? "text-green-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ratinho.nome}</CardTitle>
                      <Badge variant="outline" className={ratinho.ativo ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                        {ratinho.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(ratinho)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(ratinho.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {ratinho.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span>{ratinho.email}</span>
                  </div>
                )}
                {ratinho.telefone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{ratinho.telefone}</span>
                  </div>
                )}
                {ratinho.endereco && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{ratinho.endereco}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Cadastrado em: {format(new Date(ratinho.created_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <Switch
                    checked={ratinho.ativo}
                    onCheckedChange={(checked) => toggleStatusMutation.mutate({ id: ratinho.id, ativo: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {ratinhos.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum ratinho cadastrado</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Ratinho
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}