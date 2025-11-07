import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search, Users, Sparkles } from "lucide-react";

export default function ListasContatos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const { data: listas = [] } = useQuery({
    queryKey: ['listas-contatos'],
    queryFn: () => base44.entities.ListaContatos.list('-created_date'),
    initialData: [],
  });

  const filteredListas = listas.filter(lista =>
    lista.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Listas de Contatos</h1>
            <p className="text-slate-600 text-lg">Gerencie suas listas de contatos</p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-green-600">
            <Plus className="w-5 h-5 mr-2" />
            Nova Lista
          </Button>
        </div>
      </motion.div>

      {/* Busca com IA */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Busca Inteligente com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Quero apenas as mensagens entregues das listas: prospecção de contadores, clientes ativos, prospecção de médicos dos últimos 6 meses."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
            <Sparkles className="w-4 h-4 mr-2" />
            Buscar com IA
          </Button>
        </CardContent>
      </Card>

      {/* Busca tradicional */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar listas por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListas.map((lista, index) => (
          <motion.div
            key={lista.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{lista.nome}</CardTitle>
                    <Badge className="mt-1">{lista.total_contatos} contatos</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">{lista.descricao}</p>
                {lista.tags && lista.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {lista.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredListas.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhuma lista encontrada</p>
            <Button className="bg-gradient-to-r from-green-500 to-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Lista
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}