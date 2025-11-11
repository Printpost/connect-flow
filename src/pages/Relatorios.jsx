// @ts-nocheck
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { fetchCostCenters, fetchRequestDatasetsDashboard } from "@/api/printpostClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar,
  ChevronRight,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  FileText,
  Download,
  Filter,
  AlertCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, parseISO, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHANNEL_CONFIG = {
  email: {
    label: "E-mail",
    icon: Mail,
    gradient: "from-blue-500 to-blue-600",
  },
  sms: {
    label: "SMS",
    icon: MessageSquare,
    gradient: "from-green-500 to-green-600",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: Smartphone,
    gradient: "from-emerald-500 to-emerald-600",
  },
  rcs: {
    label: "RCS",
    icon: Radio,
    gradient: "from-purple-500 to-purple-600",
  },
  carta: {
    label: "Carta",
    icon: FileText,
    gradient: "from-amber-500 to-amber-600",
  },
  generic: {
    label: "Canal",
    icon: Mail,
    gradient: "from-slate-500 to-slate-600",
  },
};

const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#06B6D4", "#EC4899", "#6366F1", "#14B8A6", "#F97316"];
const PRINTPOST_TZ_OFFSET = "-03:00";

const formatToPrintpostDateTime = (date, endOfDay = false) => {
  return `${format(date, "yyyy-MM-dd")}T${endOfDay ? "23:59:59" : "00:00:00"}${PRINTPOST_TZ_OFFSET}`;
};

export default function Relatorios() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    campanha: "todas",
    centroDeCusto: "todos",
  });

  const { token: authToken, isAuthenticated } = useAuth();

  const { data: campanhas = [] } = useQuery({
    queryKey: ["campanhas"],
    queryFn: () => base44.entities.Campaign.list(),
    enabled: Boolean(base44?.isConfigured),
    initialData: [],
  });

  const {
    data: printpostCostCenters = [],
    isLoading: isLoadingCostCenters,
  } = useQuery({
    queryKey: ["relatorios-printpost-cost-centers", authToken],
    queryFn: () => fetchCostCenters({ token: authToken }),
    enabled: Boolean(authToken),
    staleTime: 120000,
  });

  const monthsToFetch = useMemo(() => {
    const parseDate = (value) => {
      if (!value) return null;
      const parsed = parseISO(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const today = new Date();
    const startInput = parseDate(filtros.dataInicio);
    const endInput = parseDate(filtros.dataFim);

    const startBoundary = startOfMonth(startInput || subMonths(today, 5));
    const endBoundary = endOfMonth(endInput || today);

    const result = [];
    let cursor = startBoundary;
    let guard = 0;

    while (cursor <= endBoundary && guard < 24) {
      const monthStart = startOfMonth(cursor);
      const monthEnd = endOfMonth(cursor);

      result.push({
        key: format(monthStart, "yyyy-MM"),
        label: format(monthStart, "MMMM 'de' yyyy", { locale: ptBR }),
        shortLabel: format(monthStart, "MMM/yy", { locale: ptBR }),
        start: monthStart,
        end: monthEnd,
      });

      cursor = addMonths(cursor, 1);
      guard += 1;
    }

    return result.slice(-6);
  }, [filtros.dataInicio, filtros.dataFim]);

  const { data: monthlyDatasets = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: [
      "relatorios-printpost-monthly",
      authToken,
      monthsToFetch.map((month) => month.key),
      filtros.campanha,
      filtros.centroDeCusto,
    ],
    queryFn: async ({ signal }) => {
      if (!authToken || monthsToFetch.length === 0) {
        return [];
      }

      const campaignId = filtros.campanha !== "todas" ? filtros.campanha : undefined;
      const costCenterId = filtros.centroDeCusto !== "todos" ? filtros.centroDeCusto : undefined;

      const results = [];

      for (const month of monthsToFetch) {
        const dataset = await fetchRequestDatasetsDashboard({
          token: authToken,
          from: formatToPrintpostDateTime(month.start, false),
          to: formatToPrintpostDateTime(month.end, true),
          campaignId,
          costCenterId,
          signal,
        });

        results.push({
          ...month,
          dataset,
        });
      }

      return results;
    },
    enabled: Boolean(authToken && isAuthenticated && monthsToFetch.length > 0),
    staleTime: 60000,
  });

  const monthlyMetrics = useMemo(() => {
    if (!Array.isArray(monthlyDatasets) || monthlyDatasets.length === 0) {
      return [];
    }

    const channelKeys = ["carta", "email", "sms", "whatsapp", "rcs"];

    return monthlyDatasets
      .map((month) => {
        const dataset = Array.isArray(month.dataset) ? month.dataset : [];

        let totalEnvios = 0;
        let totalEntregues = 0;
        let totalNaoEntregues = 0;

        dataset.forEach((entry) => {
          channelKeys.forEach((channel) => {
            totalEnvios += Number(entry?.[`${channel}All`] ?? 0);
            totalEntregues += Number(entry?.[`${channel}Receive`] ?? entry?.[`${channel}Received`] ?? 0);
            totalNaoEntregues += Number(entry?.[`${channel}NotReceive`] ?? 0);
          });
        });

        if (totalEnvios === 0) {
          return null;
        }

        const taxaEntrega = totalEnvios > 0 ? (totalEntregues / totalEnvios) * 100 : 0;

        return {
          key: month.key,
          mesCompleto: month.label,
          mes: month.shortLabel,
          totalEnvios,
          entregues: totalEntregues,
          falhas: totalNaoEntregues,
          taxaEntrega: taxaEntrega.toFixed(1),
        };
      })
      .filter(Boolean);
  }, [monthlyDatasets]);

  const channelAggregates = useMemo(() => {
    const channelKeys = ["email", "sms", "whatsapp", "rcs", "carta"];
    const base = {};

    channelKeys.forEach((channel) => {
      base[channel] = {
        totalEnviados: 0,
        totalEntregues: 0,
        totalNaoEntregues: 0,
        statusMap: new Map(),
      };
    });

    monthlyDatasets.forEach((month) => {
      const dataset = Array.isArray(month.dataset) ? month.dataset : [];

      dataset.forEach((entry) => {
        channelKeys.forEach((channel) => {
          const stats = base[channel];
          const totalSent = Number(entry?.[`${channel}All`] ?? 0);
          const totalDelivered = Number(entry?.[`${channel}Receive`] ?? entry?.[`${channel}Received`] ?? 0);
          const totalFailed = Number(entry?.[`${channel}NotReceive`] ?? 0);
          const statusBreakdown = Array.isArray(entry?.[channel]) ? entry[channel] : [];

          stats.totalEnviados += totalSent;
          stats.totalEntregues += totalDelivered;
          stats.totalNaoEntregues += totalFailed;

          statusBreakdown.forEach((statusItem) => {
            const name = statusItem?.description || statusItem?.label || "Outros";
            const value = Number(statusItem?.quantity ?? statusItem?.value ?? 0);
            stats.statusMap.set(name, (stats.statusMap.get(name) ?? 0) + value);
          });
        });
      });
    });

    const result = {};
    channelKeys.forEach((channel) => {
      const stats = base[channel];
      const statusDetalhado = Array.from(stats.statusMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }));

      result[channel] = {
        totalEnviados: stats.totalEnviados,
        totalEntregues: stats.totalEntregues,
        totalNaoEntregues: stats.totalNaoEntregues,
        taxaSucesso:
          stats.totalEnviados > 0 ? Number(((stats.totalEntregues / stats.totalEnviados) * 100).toFixed(1)) : 0,
        statusDetalhado,
      };
    });

    return result;
  }, [monthlyDatasets]);

  const channelCards = useMemo(
    () => Object.entries(channelAggregates).filter(([, dados]) => dados.totalEnviados > 0),
    [channelAggregates]
  );

  const monthlyCards = monthlyMetrics;
  const hasAuthenticatedAccess = Boolean(authToken && isAuthenticated);

  const handleExportarPDF = () => {
    alert("Exportação de PDF será implementada em breve");
  };

  const CanalCard = ({ titulo, icone: Icon, dados, corGradiente }) => {
    const hasStatus = Array.isArray(dados.statusDetalhado) && dados.statusDetalhado.length > 0;

    return (
      <Card className={`border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br ${corGradiente} overflow-hidden`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {titulo}
            </CardTitle>
            <Badge className="bg-white/20 text-white border-0">
              Taxa: {dados.taxaSucesso.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-white/80 mb-1">Total Enviados</p>
              <p className="text-xl font-bold text-white">{dados.totalEnviados.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-white/80 mb-1">Entregues</p>
              <p className="text-xl font-bold text-white">{dados.totalEntregues.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-white/80 mb-1">Não Entregues</p>
              <p className="text-xl font-bold text-white">{dados.totalNaoEntregues.toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Distribuição de Status</h4>
            {hasStatus ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dados.statusDetalhado}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dados.statusDetalhado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        Number.isFinite(value) ? Number(value).toLocaleString("pt-BR") : value
                      }
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {dados.statusDetalhado.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{item.value.toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Ainda não há distribuição detalhada para este canal no período selecionado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Relatórios</h1>
            <p className="text-slate-600 text-lg">
              Acompanhe indicadores reais de campanhas com dados da PrintPost.
            </p>
          </div>
          <Button
            onClick={handleExportarPDF}
            variant="outline"
            className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Card de Acesso Rápido - Cartas Digitalizadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card 
            className="border-0 shadow-xl shadow-purple-200/50 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-2xl hover:shadow-purple-200/60 transition-all cursor-pointer group overflow-hidden"
            onClick={() => navigate(createPageUrl("ConsultaCartas"))}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
                      Consulta de Cartas Digitalizadas
                    </h3>
                    <p className="text-white/90 text-sm">
                      Visualize imagens, status de entrega e análise de SLA de cartas físicas
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white mb-6">
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
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Campanha</Label>
                <Select value={filtros.campanha} onValueChange={(value) => setFiltros({ ...filtros, campanha: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Todas as Campanhas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Campanhas</SelectItem>
                    {campanhas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Centro de Custo</Label>
                <Select
                  value={filtros.centroDeCusto}
                  onValueChange={(value) => {
                    if (value === "__loading") return;
                    setFiltros({ ...filtros, centroDeCusto: value });
                  }}
                  disabled={isLoadingCostCenters && printpostCostCenters.length === 0}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Todos os Centros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Centros</SelectItem>
                    {isLoadingCostCenters && printpostCostCenters.length === 0 ? (
                      <SelectItem value="__loading" disabled>
                        Carregando centros...
                      </SelectItem>
                    ) : (
                      printpostCostCenters.map((cc) => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.description || cc.razaoSocial || cc.username || "Sem descrição"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ranking" className="space-y-6">
          <TabsList className="bg-slate-100 p-2 rounded-xl">
            <TabsTrigger value="ranking" className="px-6">
              Ranking de Canais
            </TabsTrigger>
            <TabsTrigger value="analitico" className="px-6">
              Relatório Analítico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Envios por Mês</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingMonthly && hasAuthenticatedAccess && monthlyCards.length === 0 ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={`skeleton-${index}`}
                    className="border-0 shadow-xl shadow-slate-200/50 bg-white p-6 animate-pulse min-h-[180px]"
                  />
                ))
              ) : monthlyCards.length === 0 ? (
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white col-span-full">
                  <CardContent className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {hasAuthenticatedAccess ? "Nenhum dado encontrado" : "Autenticação necessária"}
                    </h3>
                    <p className="text-slate-500 mt-2">
                      {hasAuthenticatedAccess
                        ? "Ajuste os filtros ou tente outro intervalo de datas para visualizar envios."
                        : "Conecte-se com suas credenciais da PrintPost para carregar os relatórios."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                monthlyCards.map((mes, index) => {
                  const deliveryRateLabel =
                    mes.taxaEntrega !== null && mes.taxaEntrega !== undefined ? `${mes.taxaEntrega}%` : "--";

                  return (
                    <motion.div
                      key={mes.key || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-cyan-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg capitalize">{mes.mesCompleto}</CardTitle>
                                <Badge className="mt-1 bg-cyan-600">
                                  {mes.totalEnvios.toLocaleString("pt-BR")} envios
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Taxa de Entrega:</span>
                            <span className="font-semibold text-green-600">{deliveryRateLabel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Entregues:</span>
                            <span className="font-semibold text-slate-900">
                              {mes.entregues.toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Falhas:</span>
                            <span className="font-semibold text-slate-900">
                              {mes.falhas.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="analitico" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Análise Detalhada por Canal</h2>
            {channelCards.length > 0 ? (
              <div className="space-y-6">
                {channelCards.map(([channel, dados]) => {
                  const channelConfig = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.generic;
                  return (
                    <CanalCard
                      key={channel}
                      titulo={channelConfig.label}
                      icone={channelConfig.icon}
                      dados={dados}
                      corGradiente={channelConfig.gradient}
                    />
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardContent className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Sem dados analíticos no período
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Assim que os envios ocorrerem, apresentaremos os detalhamentos por canal.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

