// @ts-nocheck
import React, { useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { fetchAccountProfile, fetchCostCenters, fetchRequestTags, fetchRequestDatasetsDashboard, fetchRequestsDashboard } from "@/api/printpostClient";
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Radio,
  FileText,
  Plus,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  rcs: Radio,
  carta: FileText
};

const channelColors = {
  email: "from-blue-500 to-blue-600",
  sms: "from-green-500 to-green-600",
  whatsapp: "from-emerald-500 to-emerald-600",
  rcs: "from-purple-500 to-purple-600",
  carta: "from-amber-500 to-amber-600"
};

const STATUS_COLORS = ['#0EA5E9', '#F97316', '#10B981', '#4C1D95'];

const formatTotal = (value) => {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString('pt-BR');
};

export default function Dashboard() {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    campanha: "todas",
    centroDeCusto: "todos"
  });
  const [selectedPrintpostCostCenter, setSelectedPrintpostCostCenter] = useState("");
  const [selectedPrintpostTag, setSelectedPrintpostTag] = useState("");
  const NONE_VALUE = "__none__";

  const { user: authUser, token: authToken, isAuthenticated } = useAuth();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
    initialData: [],
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: () => base44.entities.CentroDeCusto.list(),
    initialData: [],
  });

  const { data: accountProfile = authUser, isLoading: isLoadingAccountProfile } = useQuery({
    queryKey: ['printpost-account', authToken, authUser?.id || authUser?._id],
    queryFn: () => fetchAccountProfile({ token: authToken, userId: authUser?.id || authUser?._id }),
    enabled: Boolean(authToken && (authUser?.id || authUser?._id)),
    initialData: authUser || undefined,
    staleTime: 5 * 60_000,
  });

  const { data: printpostCostCenters = [], isLoading: isLoadingPrintpostCostCenters } = useQuery({
    queryKey: ['printpost-cost-centers', authToken],
    queryFn: () => fetchCostCenters({ token: authToken }),
    enabled: Boolean(authToken),
    staleTime: 2 * 60_000,
  });

  const { data: printpostRequestTags = [], isLoading: isLoadingPrintpostTags } = useQuery({
    queryKey: ['printpost-request-tags', authToken],
    queryFn: () => fetchRequestTags({ token: authToken, active: true, limit: 100 }),
    enabled: Boolean(authToken),
    staleTime: 2 * 60_000,
  });

  const todayIsoDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const activeStartDate = filtros.dataInicio || filtros.dataFim || todayIsoDate;
  const activeEndDate = filtros.dataFim || filtros.dataInicio || todayIsoDate;
  const fromIso = `${activeStartDate}T00:00:00-03:00`;
  const toIso = `${activeEndDate}T23:59:59-03:00`;

  const { data: requestsDashboardSummary = null, isLoading: isLoadingRequestsSummary } = useQuery({
    queryKey: ['printpost-requests-dashboard', authToken, fromIso, toIso, selectedPrintpostCostCenter || null, filtros.campanha],
    queryFn: ({ signal }) => fetchRequestsDashboard({
      token: authToken,
      from: fromIso,
      to: toIso,
      costCenterId: selectedPrintpostCostCenter || undefined,
      campaignId: filtros.campanha && filtros.campanha !== 'todas' ? filtros.campanha : undefined,
      signal,
    }),
    enabled: Boolean(authToken && fromIso && toIso),
    staleTime: 60_000,
  });

  const { data: requestDataset = [], isLoading: isLoadingRequestDataset } = useQuery({
    queryKey: ['printpost-request-datasets', authToken, fromIso, toIso, selectedPrintpostCostCenter || null, filtros.campanha],
    queryFn: ({ signal }) => fetchRequestDatasetsDashboard({
      token: authToken,
      from: fromIso,
      to: toIso,
      costCenterId: selectedPrintpostCostCenter || undefined,
      campaignId: filtros.campanha && filtros.campanha !== 'todas' ? filtros.campanha : undefined,
      signal,
    }),
    enabled: Boolean(authToken && fromIso && toIso),
    staleTime: 60_000,
  });

  const selectedCostCenter = useMemo(() => (
    printpostCostCenters.find((item) => item.id === selectedPrintpostCostCenter) || null
  ), [printpostCostCenters, selectedPrintpostCostCenter]);

  const selectedTag = useMemo(() => (
    printpostRequestTags.find((item) => item.id === selectedPrintpostTag) || null
  ), [printpostRequestTags, selectedPrintpostTag]);

  const handleCostCenterChange = useCallback((value) => {
    if (value === NONE_VALUE) {
      setSelectedPrintpostCostCenter("");
      return;
    }
    setSelectedPrintpostCostCenter(value);
  }, []);

  const handleTagChange = useCallback((value) => {
    if (value === NONE_VALUE) {
      setSelectedPrintpostTag("");
      return;
    }
    setSelectedPrintpostTag(value);
  }, []);

  const desempenhoPorProduto = useMemo(() => {
    if (!Array.isArray(requestDataset) || requestDataset.length === 0) {
      return [];
    }

    const channelKeys = ['carta', 'email', 'sms', 'whatsapp', 'rcs'];

    return requestDataset.reduce((accumulator, entry) => {
      channelKeys.forEach((channel) => {
        const totalKey = `${channel}All`;
        if (entry[totalKey] === undefined) {
          return;
        }

        const totalSent = Number(entry[totalKey] ?? 0);
        const totalDelivered = Number(entry[`${channel}Receive`] ?? entry[`${channel}Received`] ?? 0);
        const totalNotDelivered = Number(entry[`${channel}NotReceive`] ?? 0);
        const breakdownSource = Array.isArray(entry[channel]) ? entry[channel] : [];
        const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

        accumulator.push({
          id: channel,
          channel,
          totalSent,
          totalDelivered,
          totalNotDelivered,
          deliveryRate,
          statusBreakdown: breakdownSource.map((statusItem, statusIndex) => ({
            name: statusItem.description || statusItem.label || `Status ${statusIndex + 1}`,
            value: Number(statusItem.quantity ?? statusItem.value ?? 0),
            color: STATUS_COLORS[statusIndex % STATUS_COLORS.length],
          })),
        });
      });

      return accumulator;
    }, []);
  }, [requestDataset]);

  const stats = useMemo(() => {
    const analise = Number(requestsDashboardSummary?.analise?.total ?? 0);
    const execucao = Number(requestsDashboardSummary?.execucao?.total ?? 0);
    const finalizados = Number(requestsDashboardSummary?.finalizados?.total ?? 0);
    const cancelados = Number(requestsDashboardSummary?.cancelados?.total ?? 0);

    return {
      total: analise + execucao + finalizados + cancelados,
      analise,
      execucao,
      finalizados,
      cancelados,
    };
  }, [requestsDashboardSummary]);

  const totalDelivered = useMemo(() => desempenhoPorProduto.reduce((sum, item) => sum + item.totalDelivered, 0), [desempenhoPorProduto]);
  const totalSent = useMemo(() => desempenhoPorProduto.reduce((sum, item) => sum + item.totalSent, 0), [desempenhoPorProduto]);
  const totalNotDelivered = useMemo(() => desempenhoPorProduto.reduce((sum, item) => sum + item.totalNotDelivered, 0), [desempenhoPorProduto]);
  const recentCampaigns = useMemo(() => campaigns.slice(0, 5), [campaigns]);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Dashboard</h1>
            <p className="text-slate-600 text-lg">Visão geral das suas campanhas multicanal</p>
          </div>
          <Link to={createPageUrl("NovaCampanha")}>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 px-6 py-6 text-base group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nova Campanha
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Campanha</Label>
                <Select value={filtros.campanha} onValueChange={(value) => setFiltros({...filtros, campanha: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Campanhas</SelectItem>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Centro de Custo</Label>
                <Select value={filtros.centroDeCusto} onValueChange={(value) => setFiltros({...filtros, centroDeCusto: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Centros</SelectItem>
                    {centrosCusto.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>{cc.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5" />
                    Integração Printpost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide mb-2">Usuário conectado</p>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Nome</span>
                          <span className="font-medium text-slate-900">
                            {isLoadingAccountProfile ? 'Carregando...' : accountProfile?.name || accountProfile?.username || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Email</span>
                          <span className="font-medium text-slate-900">
                            {isLoadingAccountProfile ? 'Carregando...' : accountProfile?.email || accountProfile?.emailMask || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Org.</span>
                          <span className="font-medium text-slate-900">
                            {accountProfile?.organizationId || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                          <span>Centros ativos</span>
                          <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                            {isLoadingPrintpostCostCenters ? '...' : printpostCostCenters.length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Centro de Custo (Printpost)</Label>
                      <Select
                        value={selectedPrintpostCostCenter || NONE_VALUE}
                        onValueChange={handleCostCenterChange}
                        disabled={isLoadingPrintpostCostCenters}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={isLoadingPrintpostCostCenters ? 'Carregando...' : 'Selecione um centro'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Nenhum</SelectItem>
                          {printpostCostCenters.length === 0 ? (
                            <SelectItem value="__no-centers" disabled>
                              Nenhum centro disponível
                            </SelectItem>
                          ) : (
                            printpostCostCenters.map((center) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.description || center.username || 'Sem descrição'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedCostCenter && (
                        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                          <p className="font-medium">Centro selecionado</p>
                          <p>{selectedCostCenter.razaoSocial || selectedCostCenter.description || '—'}</p>
                          <p className="text-xs text-emerald-600 mt-1">CNPJ: {selectedCostCenter.cnpj || '—'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Tag de Solicitação</Label>
                      <Select
                        value={selectedPrintpostTag || NONE_VALUE}
                        onValueChange={handleTagChange}
                        disabled={isLoadingPrintpostTags}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={isLoadingPrintpostTags ? 'Carregando...' : 'Selecione uma tag'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Nenhuma</SelectItem>
                          {printpostRequestTags.length === 0 ? (
                            <SelectItem value="__no-tags" disabled>
                              Nenhuma tag encontrada
                            </SelectItem>
                          ) : (
                            printpostRequestTags.map((tag) => (
                              <SelectItem key={tag.id} value={tag.id}>
                                {tag.description || tag.name || 'Sem descrição'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedTag && (
                        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
                          <p className="font-medium">Tag selecionada</p>
                          <p>{selectedTag.key ? `${selectedTag.key} · ` : ''}{selectedTag.description || selectedTag.name}</p>
                          <p className="text-xs text-indigo-600 mt-1">Ativa: {selectedTag.active ? 'Sim' : 'Não'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* TOTAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">TOTAL DE ENVIOS</p>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {isLoadingRequestDataset ? '...' : formatTotal(totalSent)}
                  </div>
                  <p className="text-sm text-slate-500">mensagens enviadas no período</p>
                  {!isLoadingRequestDataset && (
                    <p className="text-xs text-slate-400 mt-2">
                      Entregues: {formatTotal(totalDelivered)} • Não entregues: {formatTotal(totalNotDelivered)}
                    </p>
                  )}
                  {!isLoadingRequestsSummary && (
                    <p className="text-xs text-slate-400 mt-1">
                      Análise: {formatTotal(stats.analise)} • Execução: {formatTotal(stats.execucao)} • Finalizados: {formatTotal(stats.finalizados)}
                    </p>
                  )}
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Send className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AGENDADAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">EM ANÁLISE</p>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {isLoadingRequestsSummary ? '...' : formatTotal(stats.analise)}
                  </div>
                  <p className="text-sm text-slate-500">pedidos aguardando processamento</p>
                </div>
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ENVIANDO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">EM EXECUÇÃO</p>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {isLoadingRequestsSummary ? '...' : formatTotal(stats.execucao)}
                  </div>
                  <p className="text-sm text-slate-500">pedidos em andamento</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CONCLUÍDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">FINALIZADOS</p>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {isLoadingRequestsSummary ? '...' : formatTotal(stats.finalizados)}
                  </div>
                  <p className="text-sm text-slate-500">encerrados com sucesso</p>
                  {!isLoadingRequestsSummary && (
                    <p className="text-xs text-slate-400 mt-2">Cancelados: {formatTotal(stats.cancelados)}</p>
                  )}
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Totais por Produto/Canal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Desempenho por Produto</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingRequestDataset ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full"
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80">
                <CardContent className="p-10 text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Carregando métricas</h3>
                  <p className="text-slate-500 max-w-lg mx-auto">
                    Buscando dados de desempenho diretamente da Printpost.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : desempenhoPorProduto.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full"
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80">
                <CardContent className="p-10 text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Sem dados disponíveis</h3>
                  <p className="text-slate-500 max-w-lg mx-auto">
                    Não recebemos métricas da Printpost para o período selecionado.
                    Ajuste os filtros ou verifique o endpoint `RequestDatasets/dashboard` para popular esta visão.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            desempenhoPorProduto.map((item, index) => {
              const canalKey = item.channel || `canal-${index}`;
              const Icon = channelIcons[canalKey] || FileText;
              const gradiente = channelColors[canalKey] || "from-slate-400 to-slate-500";
              const breakdown = Array.isArray(item.statusBreakdown)
                ? item.statusBreakdown.map((status, statusIndex) => ({
                    name: status.name ?? status.label ?? `Status ${statusIndex + 1}`,
                    value: Number(status.value ?? status.quantidade ?? 0),
                    color: status.color ?? STATUS_COLORS[statusIndex % STATUS_COLORS.length],
                  }))
                : [];
              const totalEnviados = Number(item.totalSent ?? 0);
              const totalEntregues = Number(item.totalDelivered ?? 0);
              const deliveryRateDisplay = Number.isFinite(item.deliveryRate)
                ? `${item.deliveryRate.toFixed(1)}%`
                : '--';

              return (
                <motion.div
                  key={item.id ?? canalKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${gradiente}`} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradiente} shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 capitalize">
                              {canalKey}
                            </h3>
                            <Badge className="mt-1 bg-slate-100 text-slate-700">
                              Taxa: {deliveryRateDisplay}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Enviados</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatTotal(totalEnviados)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-700 mb-1">Entregues</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatTotal(totalEntregues)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <ResponsiveContainer width={80} height={80}>
                            <PieChart>
                              <Pie
                                data={breakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={35}
                                dataKey="value"
                              >
                                {breakdown.map((entry, sliceIndex) => (
                                  <Cell key={`cell-${sliceIndex}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex-1 space-y-1">
                          {breakdown.slice(0, 3).map((itemStatus, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: itemStatus.color }}
                                />
                                <span className="text-slate-600">{itemStatus.name}</span>
                              </div>
                              <span className="font-semibold text-slate-900">
                                {totalEnviados > 0
                                  ? `${((itemStatus.value / totalEnviados) * 100).toFixed(0)}%`
                                  : '--'}
                              </span>
                            </div>
                          ))}
                          {breakdown.length > 3 && (
                            <p className="text-xs text-slate-500 text-right">
                              +{breakdown.length - 3} mais
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Campanhas Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Campanhas Recentes</CardTitle>
                <p className="text-slate-500 mt-1">Últimas campanhas criadas</p>
              </div>
              <Link to={createPageUrl("Campanhas")}>
                <Button variant="outline" className="group border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300">
                  Ver todas
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Carregando...</div>
            ) : recentCampaigns.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma campanha ainda</h3>
                <p className="text-slate-500 mb-6">Comece criando sua primeira campanha multicanal</p>
                <Link to={createPageUrl("NovaCampanha")}>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Campanha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCampaigns.map((campaign, index) => {
                  const Icon = channelIcons[campaign.channels?.[0]] || Send;
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${channelColors[campaign.channels?.[0]] || 'from-slate-400 to-slate-500'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-lg mb-1 group-hover:text-cyan-600 transition-colors">{campaign.name}</h4>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                campaign.status === 'concluida' ? 'bg-green-100 text-green-700' :
                                campaign.status === 'enviando' ? 'bg-blue-100 text-blue-700' :
                                campaign.status === 'agendada' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {campaign.status}
                              </span>
                              <span className="text-sm text-slate-500">{campaign.total_recipients || 0} destinatários</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {campaign.channels?.map((channel) => {
                            const ChannelIcon = channelIcons[channel];
                            return (
                              <div key={channel} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <ChannelIcon className="w-4 h-4 text-slate-600" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}