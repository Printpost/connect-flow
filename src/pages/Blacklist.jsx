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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Upload,
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShieldBan
} from "lucide-react";

export default function Blacklist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("email");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "email",
    valor: "",
    motivo: ""
  });

  const { data: blacklist = [] } = useQuery({
    queryKey: ['blacklist'],
    queryFn: () => base44.entities.Blacklist.list('-data_bloqueio'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Blacklist.create({
      ...data,
      data_bloqueio: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      setShowAddForm(false);
      setFormData({ tipo: activeTab, valor: "", motivo: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Blacklist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
    },
  });

  const filteredBlacklist = blacklist
    .filter(item => item.tipo === activeTab)
    .filter(item => item.valor?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleBulkImport = () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      createMutation.mutate({
        tipo: activeTab,
        valor: line.trim(),
        motivo: "Importação em lote"
      });
    });
    setBulkText("");
    setShowBulkImport(false);
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => deleteMutation.mutate(id));
    setSelectedItems([]);
  };

  const handleExport = () => {
    const data = filteredBlacklist.map(item => item.valor).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blacklist-${activeTab}.txt`;
    a.click();
  };

  const tabConfig = {
    email: { icon: Mail, label: "E-mail", placeholder: "exemplo@email.com" },
    telefone: { icon: Phone, label: "Telefone", placeholder: "(00) 00000-0000" },
    endereco: { icon: MapPin, label: "Endereço", placeholder: "Rua, Número, Cidade" }
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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Cadastro de Blacklist</h1>
            <p className="text-slate-600 text-lg">Gerencie bloqueios de email, telefone e endereço</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-2 rounded-xl">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(tabConfig).map(tipo => (
          <TabsContent key={tipo} value={tipo} className="space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldBan className="w-5 h-5 text-red-600" />
                    Bloqueios de {tabConfig[tipo].label}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(!showAddForm);
                        setFormData({ tipo, valor: "", motivo: "" });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkImport(!showBulkImport)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      disabled={filteredBlacklist.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                    {selectedItems.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleDeleteSelected}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir ({selectedItems.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Formulário de adicionar */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200"
                    >
                      <h3 className="font-semibold mb-4">Adicionar Manualmente</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="valor">{tabConfig[tipo].label} *</Label>
                          <Input
                            id="valor"
                            value={formData.valor}
                            onChange={(e) => setFormData({...formData, valor: e.target.value})}
                            placeholder={tabConfig[tipo].placeholder}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="motivo">Motivo</Label>
                          <Input
                            id="motivo"
                            value={formData.motivo}
                            onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                            placeholder="Motivo do bloqueio"
                            className="mt-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => createMutation.mutate(formData)}
                            disabled={!formData.valor || createMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Adicionar à Blacklist
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddForm(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Formulário de importação em lote */}
                <AnimatePresence>
                  {showBulkImport && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200"
                    >
                      <h3 className="font-semibold mb-4">Importar em Lote</h3>
                      <Textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`Cole os ${tabConfig[tipo].label.toLowerCase()}s aqui, um por linha`}
                        className="min-h-[150px] mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleBulkImport}
                          disabled={!bulkText.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Importar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowBulkImport(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Consultar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredBlacklist.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.valor}</p>
                        {item.motivo && (
                          <p className="text-sm text-slate-600">{item.motivo}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Bloqueado em: {new Date(item.data_bloqueio).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}

                  {filteredBlacklist.length === 0 && (
                    <div className="text-center py-12">
                      <ShieldBan className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">
                        {searchTerm 
                          ? "Nenhum item encontrado" 
                          : `Nenhum ${tabConfig[tipo].label.toLowerCase()} bloqueado`
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <Badge variant="outline" className="text-base px-4 py-2">
                    Total: {filteredBlacklist.length} {filteredBlacklist.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}