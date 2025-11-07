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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Building2,
  User,
  Pencil,
  Trash2
} from "lucide-react";

export default function CentroDeCusto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    tipo: "pessoa_juridica",
    nome: "",
    razao_social: "",
    cnpj: "",
    inscricao_estadual: "",
    isento_inscricao: false,
    cpf: "",
    cep: "",
    endereco: "",
    telefone_fixo: "",
    telefone_celular: "",
    email: ""
  });

  const { data: centros = [] } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: () => base44.entities.CentroDeCusto.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingItem 
      ? base44.entities.CentroDeCusto.update(editingItem.id, data)
      : base44.entities.CentroDeCusto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centros-custo'] });
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CentroDeCusto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centros-custo'] });
    },
  });

  const resetForm = () => {
    setFormData({
      tipo: "pessoa_juridica",
      nome: "",
      razao_social: "",
      cnpj: "",
      inscricao_estadual: "",
      isento_inscricao: false,
      cpf: "",
      cep: "",
      endereco: "",
      telefone_fixo: "",
      telefone_celular: "",
      email: ""
    });
  };

  const handleEdit = (centro) => {
    setEditingItem(centro);
    setFormData(centro);
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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Centro de Custo</h1>
            <p className="text-slate-600 text-lg">Gerencie seus centros de custo</p>
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
            Novo Centro de Custo
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
                <CardTitle>{editingItem ? "Editar" : "Novo"} Centro de Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Tipo de Pessoa *</Label>
                    <RadioGroup value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2 border-2 border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-purple-300">
                          <RadioGroupItem value="pessoa_juridica" id="pj" />
                          <Label htmlFor="pj" className="cursor-pointer flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Pessoa Jurídica
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border-2 border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-purple-300">
                          <RadioGroupItem value="pessoa_fisica" id="pf" />
                          <Label htmlFor="pf" className="cursor-pointer flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Pessoa Física
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.tipo === "pessoa_juridica" ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
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
                    </>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
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
                  )}

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

                  <div className="grid md:grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-2"
                    />
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centros.map((centro, index) => (
          <motion.div
            key={centro.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      centro.tipo === "pessoa_juridica" ? "bg-purple-100" : "bg-blue-100"
                    }`}>
                      {centro.tipo === "pessoa_juridica" ? (
                        <Building2 className="w-6 h-6 text-purple-600" />
                      ) : (
                        <User className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{centro.nome}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {centro.tipo === "pessoa_juridica" ? "PJ" : "PF"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(centro)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(centro.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {centro.tipo === "pessoa_juridica" ? (
                  <>
                    {centro.cnpj && <p className="text-slate-600">CNPJ: {centro.cnpj}</p>}
                    {centro.razao_social && <p className="text-slate-600">Razão: {centro.razao_social}</p>}
                  </>
                ) : (
                  <>
                    {centro.cpf && <p className="text-slate-600">CPF: {centro.cpf}</p>}
                  </>
                )}
                {centro.email && <p className="text-slate-600">Email: {centro.email}</p>}
                {centro.telefone_celular && <p className="text-slate-600">Tel: {centro.telefone_celular}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {centros.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum centro de custo cadastrado</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Centro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}