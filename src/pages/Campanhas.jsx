import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { fetchCampaignIndicators, fetchCampaignsList } from "@/api/printpostClient";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  FileText,
  Calendar,
  Users,
  MoreVertical,
  Grid3x3,
  List,
  Eye,
  Download,
  Copy,
  PauseCircle,
  Trash2,
  Filter,
  X,
  Clock,
  Play,
  CheckCircle,
  AlertCircle
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

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  rcs: Radio,
  carta: FileText
};

const statusConfig = {
  em_analise: { 
    color: "bg-amber-100 text-amber-800 border-amber-300", 
    label: "Em Análise",
    icon: AlertCircle,
    gradient: "from-amber-400 to-amber-500"
  },
  em_execucao: { 
    color: "bg-blue-100 text-blue-800 border-blue-300", 
    label: "Em Execução",
    icon: Play,
    gradient: "from-blue-400 to-blue-500"
  },
  enviando: { 
    color: "bg-cyan-100 text-cyan-800 border-cyan-300", 
    label: "Enviando",
    icon: Clock,
    gradient: "from-cyan-400 to-cyan-500"
  },
  concluida: { 
    color: "bg-green-100 text-green-800 border-green-300", 
    label: "Concluído",
    icon: CheckCircle,
    gradient: "from-green-400 to-green-500"
  },
  pausada: { 
    color: "bg-red-100 text-red-800 border-red-300", 
    label: "Pausada",
    icon: PauseCircle,
    gradient: "from-red-400 to-red-500"
  },
  agendada: { 
    color: "bg-purple-100 text-purple-800 border-purple-300", 
    label: "Agendado",
    icon: Calendar,
    gradient: "from-purple-400 to-purple-500"
  }
};

// Map Printpost API status to internal status
const mapPrintpostStatus = (apiStatus) => {
  const statusMap = {
    'Análise': 'em_analise',
    'Execução': 'em_execucao',
    'Enviando': 'enviando',
    'Concluído': 'concluida',
    'Solicitado': 'agendada',
    'Pausado': 'pausada',
    'Agendado': 'agendada'
  };
  return statusMap[apiStatus] || 'em_analise';
};

export default function Campanhas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterChannel, setFilterChannel] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(true);

  const navigate = useNavigate();
  const { token: authToken } = useAuth();

  // Fetch campaign indicators
  const { data: indicators } = useQuery({
    queryKey: ['campaign-indicators', dataInicio],
    queryFn: () => fetchCampaignIndicators({
      token: authToken,
      from: dataInicio || format(new Date(), "yyyy-MM-dd") + "T00:00:00-03:00",
    }),
    enabled: !!authToken,
    initialData: { analise: { quantity: 0 }, execucao: { quantity: 0 }, solicitado: { quantity: 0 } },
  });

  // Fetch campaigns list
  const { data: campaignsResponse, isLoading } = useQuery({
    queryKey: ['campaigns-list', filterStatus, dataInicio],
    queryFn: () => fetchCampaignsList({
      token: authToken,
      from: dataInicio || format(new Date(), "yyyy-MM-dd") + "T00:00:00-03:00",
      status: filterStatus !== 'todas' ? filterStatus : undefined,
      limit: 100,
    }),
    enabled: !!authToken,
    initialData: { data: [], total: 0 },
  });

  // Normalize campaigns data from Printpost API
  const campaigns = useMemo(() => {
    if (!campaignsResponse?.data) return [];
    
    return campaignsResponse.data.map(campaign => ({
      id: campaign.number || campaign.id,
      name: campaign.title,
      status: mapPrintpostStatus(campaign.status),
      created_date: campaign.createdAt,
      numero_lote: campaign.number,
      channels: Object.keys(campaign.quantity || {}).filter(ch => campaign.quantity[ch] > 0),
      total_recipients: Object.values(campaign.quantity || {}).reduce((sum, val) => sum + val, 0),
      sent: campaign.sent,
      processing: campaign.processing,
      error: campaign.error,
      totalCost: campaign.totalCost,
      paymentStatus: campaign.paymentStatus,
      originalData: campaign // Keep original for reference
    }));
  }, [campaignsResponse]);

  const handleDuplicar = (campaign) => {
    alert(`Duplicar campanha: ${campaign.name}`);
  };

  const handlePausar = (campaign) => {
    alert(`Pausar campanha: ${campaign.name}`);
  };

  const handleExcluir = (campaign) => {
    if (window.confirm(`Tem certeza que deseja excluir a campanha "${campaign.name}"?`)) {
      alert(`Excluir campanha: ${campaign.name}`);
    }
  };

  const handleDetalhamento = (campaign) => {
    navigate(`${createPageUrl("DetalhamentoCampanha")}?id=${campaign.id}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm ||
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(campaign.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(campaign.numero_lote || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "todas" || campaign.status === filterStatus;
    const matchesChannel = filterChannel === "todos" ||
      (campaign.channels && campaign.channels.includes(filterChannel));

    const matchesDataInicio = !dataInicio ||
      (campaign.created_date && new Date(campaign.created_date) >= new Date(dataInicio));

    const matchesDataFim = !dataFim ||
      (campaign.created_date && new Date(campaign.created_date) <= new Date(dataFim + 'T23:59:59'));

    return matchesSearch && matchesStatus && matchesChannel && matchesDataInicio && matchesDataFim;
  });

  // Calcular estatísticas por status usando indicadores da API quando disponível
  const statusStats = useMemo(() => {
    const stats = {};
    
    // Use indicators from API if available
    if (indicators) {
      stats.em_analise = {
        count: indicators.analise?.quantity || 0,
        total: indicators.analise?.total || 0
      };
      stats.em_execucao = {
        count: indicators.execucao?.quantity || 0,
        total: indicators.execucao?.total || 0
      };
      stats.agendada = {
        count: indicators.solicitado?.quantity || 0,
        total: indicators.solicitado?.total || 0
      };
    }
    
    // Calculate from filtered campaigns for other statuses or as fallback
    Object.keys(statusConfig).forEach(status => {
      if (!stats[status]) {
        const campanhasDoStatus = campaigns.filter(c => c.status === status);
        stats[status] = {
          count: campanhasDoStatus.length,
          total: campanhasDoStatus.reduce((sum, c) => sum + (c.total_recipients || 0), 0)
        };
      }
    });
    
    return stats;
  }, [campaigns, indicators]);

  const activeFiltersCount = [
    searchTerm,
    filterStatus !== "todas" ? filterStatus : null,
    filterChannel !== "todos" ? filterChannel : null,
    dataInicio,
    dataFim
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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Campanhas</h1>
            <p className="text-slate-600 text-lg">Gerencie todas as suas campanhas multicanal</p>
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

            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-slate-200"}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-slate-200"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Link to={createPageUrl("NovaCampanha")}>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 px-6 py-6 text-base group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Nova Campanha
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                      background: `linear-gradient(135deg, ${config.gradient.includes('amber') ? '#FEF3C7' : 
                                   config.gradient.includes('blue') ? '#DBEAFE' :
                                   config.gradient.includes('cyan') ? '#CFFAFE' :
                                   config.gradient.includes('green') ? '#D1FAE5' :
                                   config.gradient.includes('red') ? '#FEE2E2' : '#F3E8FF'} 0%, white 100%)`
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
                        Total: {stats.total.toLocaleString('pt-BR')}
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
                    {/* Busca - 4 colunas */}
                    <div className="md:col-span-4">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          placeholder="Nome, ID ou Nº do lote..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Data Início - 2 colunas */}
                    <div className="md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Data Início</Label>
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="h-11 border-slate-300 focus:border-cyan-500"
                      />
                    </div>

                    {/* Data Fim - 2 colunas */}
                    <div className="md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Data Fim</Label>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="h-11 border-slate-300 focus:border-cyan-500"
                      />
                    </div>

                    {/* Produto/Canal - 2 colunas */}
                    <div className="md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Produto</Label>
                      <Select value={filterChannel} onValueChange={setFilterChannel}>
                        <SelectTrigger className="h-11 border-slate-300 focus:border-cyan-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="email">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              E-mail
                            </div>
                          </SelectItem>
                          <SelectItem value="sms">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              SMS
                            </div>
                          </SelectItem>
                          <SelectItem value="whatsapp">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4" />
                              WhatsApp
                            </div>
                          </SelectItem>
                          <SelectItem value="rcs">
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4" />
                              RCS
                            </div>
                          </SelectItem>
                          <SelectItem value="carta">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Carta
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botão Limpar - 2 colunas */}
                    <div className="md:col-span-2 flex items-end">
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("todas");
                            setFilterChannel("todos");
                            setDataInicio("");
                            setDataFim("");
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
                        {filterChannel !== "todos" && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300">
                            Produto: {filterChannel}
                          </Badge>
                        )}
                        {dataInicio && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300">
                            De: {format(new Date(dataInicio), "dd/MM/yyyy")}
                          </Badge>
                        )}
                        {dataFim && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300">
                            Até: {format(new Date(dataFim), "dd/MM/yyyy")}
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
          <p className="mt-4 text-slate-600">Carregando campanhas...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-slate-500 mb-6">
            {activeFiltersCount > 0
              ? "Tente ajustar os filtros de busca"
              : "Crie sua primeira campanha para começar"}
          </p>
          {activeFiltersCount === 0 && (
            <Link to={createPageUrl("NovaCampanha")}>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Criar Campanha
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCampaigns.map((campaign, index) => {
                  const status = statusConfig[campaign.status] || statusConfig.em_analise;
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card className="border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 bg-white overflow-hidden group cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="outline" className={`${status.color} border-2 font-semibold px-3 py-1.5 flex items-center gap-2`}>
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                                  <MoreVertical className="w-4 h-4 text-slate-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDetalhamento(campaign)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Detalhamento
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicar(campaign)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePausar(campaign)}>
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pausar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleExcluir(campaign)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2">
                            {campaign.name}
                          </h3>

                          <div className="space-y-3 mb-4">
                            {campaign.scheduled_date && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>
                                  {format(new Date(campaign.scheduled_date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span>{campaign.total_recipients || 0} destinatários</span>
                            </div>
                            {campaign.id && (
                              <div className="text-xs text-slate-500">
                                ID: {String(campaign.id).slice(0, 8)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Canais:</span>
                            <div className="flex gap-2">
                              {campaign.channels?.map((channel) => {
                                const Icon = channelIcons[channel];
                                return (
                                  <div
                                    key={channel}
                                    className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                                    title={channel}
                                  >
                                    <Icon className="w-4 h-4 text-slate-600" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {campaign.status === 'enviando' && campaign.total_recipients > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">Progresso</span>
                                <span className="font-semibold text-slate-900">
                                  {Math.round((campaign.sent_count / campaign.total_recipients) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(campaign.sent_count / campaign.total_recipients) * 100}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
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

          {/* List/Table View */}
          {viewMode === "list" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold text-slate-900">ID</TableHead>
                    <TableHead className="font-bold text-slate-900">Status</TableHead>
                    <TableHead className="font-bold text-slate-900">Nome</TableHead>
                    <TableHead className="font-bold text-slate-900">Canais</TableHead>
                    <TableHead className="font-bold text-slate-900">Arquivo</TableHead>
                    <TableHead className="font-bold text-slate-900">Data do Pedido</TableHead>
                    <TableHead className="font-bold text-slate-900">Data Finalização/Agendamento</TableHead>
                    <TableHead className="font-bold text-slate-900 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const status = statusConfig[campaign.status] || statusConfig.em_analise;
                    const StatusIcon = status.icon;

                    let completionOrScheduledDate = "-";
                    if (campaign.status === 'concluida' && campaign.updated_date) {
                      completionOrScheduledDate = format(new Date(campaign.updated_date), "dd/MM/yyyy HH:mm", { locale: ptBR });
                    } else if (campaign.scheduled_date) {
                      completionOrScheduledDate = format(new Date(campaign.scheduled_date), "dd/MM/yyyy HH:mm", { locale: ptBR });
                    }

                    return (
                      <TableRow key={campaign.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-600">
                          {campaign.id ? String(campaign.id).slice(0, 8) : "-"}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={`${status.color} border-2 font-semibold flex items-center gap-2 w-fit`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-semibold text-slate-900 max-w-xs">
                          <div className="truncate" title={campaign.name}>
                            {campaign.name}
                          </div>
                          {campaign.total_recipients > 0 && (
                            <div className="text-xs text-slate-500 mt-1">
                              {campaign.total_recipients} destinatários
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {campaign.channels?.length > 0 ? (
                              campaign.channels.map((channel, idx) => {
                                const ChannelIcon = channelIcons[channel] || FileText;
                                return (
                                  <div
                                    key={idx}
                                    className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center"
                                    title={channel}
                                  >
                                    <ChannelIcon className="w-4 h-4 text-slate-600" />
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {campaign.recipient_file_url ? (
                            <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700">
                              <Download className="w-4 h-4 mr-1" />
                              Baixar
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-sm text-slate-600">
                          {campaign.created_date
                            ? format(new Date(campaign.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "-"}
                        </TableCell>

                        <TableCell className="text-sm text-slate-600">
                          {completionOrScheduledDate}
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDetalhamento(campaign)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Detalhamento
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicar(campaign)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePausar(campaign)}>
                                <PauseCircle className="w-4 h-4 mr-2" />
                                Pausar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleExcluir(campaign)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}