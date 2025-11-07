import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Zap,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Clock,
  CheckCircle,
  GitBranch,
  TrendingUp,
  Filter,
  X,
  AlertCircle,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  rascunho: {
    color: "bg-slate-100 text-slate-800 border-slate-300",
    label: "Rascunho",
    icon: FileText,
    gradient: "from-slate-400 to-slate-500"
  },
  ativo: {
    color: "bg-green-100 text-green-800 border-green-300",
    label: "Ativo",
    icon: Play,
    gradient: "from-green-400 to-green-500"
  },
  pausado: {
    color: "bg-amber-100 text-amber-800 border-amber-300",
    label: "Pausado",
    icon: Pause,
    gradient: "from-amber-400 to-amber-500"
  },
  inativo: {
    color: "bg-red-100 text-red-800 border-red-300",
    label: "Inativo",
    icon: AlertCircle,
    gradient: "from-red-400 to-red-500"
  }
};

const triggerTypeLabels = {
  webhook: "Webhook",
  novo_contato: "Novo Contato",
  tag_adicionada: "Tag Adicionada",
  email_aberto: "Email Aberto",
  link_clicado: "Link Clicado",
  data_especifica: "Data Específica",
  aniversario: "Aniversário",
  carrinho_abandonado: "Carrinho Abandonado"
};

export default function Automacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [showFilters, setShowFilters] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: automacoes = [], isLoading } = useQuery({
    queryKey: ['automacoes'],
    queryFn: () => base44.entities.AutomacaoFluxo.list('-created_date'),
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AutomacaoFluxo.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes'] });
    },
  });

  const deleteAutomacaoMutation = useMutation({
    mutationFn: (id) => base44.entities.AutomacaoFluxo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes'] });
    },
  });

  const handleEdit = (automacao) => {
    navigate(`${createPageUrl("AutomationBuilder")}?id=${automacao.id}`);
  };

  const handleDuplicate = async (automacao) => {
    const newAutomacao = {
      ...automacao,
      nome: `${automacao.nome} (Cópia)`,
      status: 'rascunho'
    };
    delete newAutomacao.id;
    delete newAutomacao.created_date;
    delete newAutomacao.updated_date;
    delete newAutomacao.created_by;
    
    await base44.entities.AutomacaoFluxo.create(newAutomacao);
    queryClient.invalidateQueries({ queryKey: ['automacoes'] });
  };

  const handleToggleStatus = (automacao) => {
    const newStatus = automacao.status === 'ativo' ? 'pausado' : 'ativo';
    updateStatusMutation.mutate({ id: automacao.id, status: newStatus });
  };

  const handleDelete = (automacao) => {
    if (window.confirm(`Tem certeza que deseja excluir a automação "${automacao.nome}"?`)) {
      deleteAutomacaoMutation.mutate(automacao.id);
    }
  };

  const filteredAutomacoes = automacoes.filter(automacao => {
    const matchesSearch = !searchTerm ||
      automacao.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "todas" || automacao.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calcular estatísticas por status
  const statusStats = Object.keys(statusConfig).reduce((acc, status) => {
    const automacoesDoStatus = automacoes.filter(a => a.status === status);
    const totalExecucoes = automacoesDoStatus.reduce((sum, a) => sum + (a.execucoes_total || 0), 0);
    acc[status] = {
      count: automacoesDoStatus.length,
      total: totalExecucoes
    };
    return acc;
  }, {});

  const activeFiltersCount = [
    searchTerm,
    filterStatus !== "todas" ? filterStatus : null
  ].filter(Boolean).length;

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1800px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Automações</h1>
            <p className="text-slate-600 text-lg">Gerencie suas automações de comunicação</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-300 hover:bg-slate-100"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-cyan-600 text-white">{activeFiltersCount}</Badge>
              )}
            </Button>

            <Link to={createPageUrl("AutomationBuilder")}>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 px-6 py-6 text-base group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Nova Automação
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Status - Sempre Visíveis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([statusKey, config], index) => {
              const Icon = config.icon;
              const stats = statusStats[statusKey] || { count: 0, total: 0 };
              const isActive = filterStatus === statusKey;

              return (
                <motion.div
                  key={statusKey}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setFilterStatus(filterStatus === statusKey ? "todas" : statusKey)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      isActive
                        ? "border-transparent shadow-xl scale-105"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md bg-white"
                    }`}
                    style={isActive ? {
                      background: `linear-gradient(135deg, ${
                        config.gradient.includes('slate') ? '#F1F5F9' :
                        config.gradient.includes('green') ? '#D1FAE5' :
                        config.gradient.includes('amber') ? '#FEF3C7' : '#FEE2E2'
                      } 0%, white 100%)`
                    } : {}}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        {config.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.total.toLocaleString('pt-BR')} execuções
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Painel de Filtros Expansível */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white mb-6 overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-12 gap-4">
                    {/* Busca - 10 colunas */}
                    <div className="md:col-span-10">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          placeholder="Nome ou descrição da automação..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Botão Limpar - 2 colunas */}
                    <div className="md:col-span-2 flex items-end">
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("todas");
                          }}
                          className="w-full h-11 border-slate-300 hover:bg-slate-100"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Limpar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Indicador de Filtros Ativos */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-slate-600 font-semibold">Filtros ativos:</span>
                        {searchTerm && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300">
                            Busca: {searchTerm}
                          </Badge>
                        )}
                        {filterStatus !== "todas" && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300">
                            Status: {statusConfig[filterStatus]?.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando automações...</p>
        </div>
      ) : filteredAutomacoes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">Nenhuma automação encontrada</h3>
          <p className="text-slate-500 mb-6">
            {activeFiltersCount > 0
              ? "Tente ajustar os filtros de busca"
              : "Crie sua primeira automação para começar"}
          </p>
          {activeFiltersCount === 0 && (
            <Link to={createPageUrl("AutomationBuilder")}>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Criar Automação
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAutomacoes.map((automacao, index) => {
              const status = statusConfig[automacao.status] || statusConfig.rascunho;
              const StatusIcon = status.icon;
              const taxaSucesso = automacao.execucoes_total > 0
                ? ((automacao.execucoes_sucesso / automacao.execucoes_total) * 100).toFixed(1)
                : 0;

              return (
                <motion.div
                  key={automacao.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 bg-white overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className={`${status.color} border-2 font-semibold px-3 py-1.5 flex items-center gap-2`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                              <Zap className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(automacao)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(automacao)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(automacao)}>
                              {automacao.status === 'ativo' ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(automacao)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                        {automacao.nome}
                      </h3>

                      {automacao.descricao && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {automacao.descricao}
                        </p>
                      )}

                      <div className="space-y-3 mb-4">
                        {automacao.trigger_type && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <GitBranch className="w-4 h-4 text-slate-400" />
                            <span>Gatilho: {triggerTypeLabels[automacao.trigger_type] || automacao.trigger_type}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{automacao.execucoes_total || 0} execuções</span>
                        </div>

                        {automacao.ultima_execucao && (
                          <div className="text-xs text-slate-500">
                            Última execução: {format(new Date(automacao.ultima_execucao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        )}
                      </div>

                      {automacao.execucoes_total > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-600 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Taxa de Sucesso
                            </span>
                            <span className="font-semibold text-green-900">
                              {taxaSucesso}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${taxaSucesso}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}