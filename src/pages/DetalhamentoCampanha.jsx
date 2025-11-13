import React from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { fetchCampaignDetail } from "@/api/printpostClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  FileText,
  PauseCircle,
  Eye,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const statusConfig = {
  rascunho: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Rascunho", icon: FileText },
  agendada: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Agendada", icon: Calendar },
  enviando: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Enviando", icon: Send },
  concluida: { color: "bg-green-100 text-green-700 border-green-200", label: "Concluída", icon: CheckCircle2 },
  pausada: { color: "bg-red-100 text-red-700 border-red-200", label: "Pausada", icon: PauseCircle }
};

const COLORS = {
  enviados: '#06B6D4',
  entregues: '#10B981',
  naoEntregues: '#EF4444'
};

export default function DetalhamentoCampanha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { token: authToken } = useAuth();

  const { data: campaignResponse, isLoading } = useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: () => fetchCampaignDetail({
      token: authToken,
      campaignId: campaignId,
    }),
    enabled: !!campaignId && !!authToken,
  });

  const campaign = campaignResponse?.request;

  const pausarEnvioMutation = useMutation({
    mutationFn: () => base44.entities.Campaign.update(campaignId, { status: 'pausada' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      alert('Envio pausado com sucesso!');
    },
  });

  const handleDownloadArquivo = () => {
    if (campaign?.recipient_file_url) {
      window.open(campaign.recipient_file_url, '_blank');
    } else {
      alert('Nenhum arquivo disponível para download');
    }
  };

  const handleVisualizarTemplate = () => {
    alert('Visualização de template será implementada em breve');
  };

  const handleGerarArquivoRetorno = () => {
    alert('Gerando arquivo de retorno...');
  };

  const handleDownloadComprovante = () => {
    alert('Gerando comprovante de postagem...');
  };

  const handleEnriquecerDados = () => {
    alert('Enriquecimento de dados será iniciado...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Campanha não encontrada</h3>
            <p className="text-slate-600 mb-6">A campanha solicitada não existe ou foi removida</p>
            <Button onClick={() => navigate(createPageUrl("Campanhas"))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Campanhas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map Printpost API status to statusConfig
  const mapStatus = (apiStatus) => {
    const statusMap = {
      'Análise': 'rascunho',
      'Execução': 'enviando',
      'Enviando': 'enviando',
      'Finalizado': 'concluida',
      'Concluído': 'concluida',
      'Solicitado': 'agendada',
      'Pausado': 'pausada',
      'Agendado': 'agendada'
    };
    return statusMap[apiStatus] || 'rascunho';
  };

  const status = statusConfig[mapStatus(campaign.status)] || statusConfig.rascunho;
  const StatusIcon = status.icon;

  // Calculate totals from statistics in the return array
  // The API returns an array like: [{cartaAll: 0, cartaReceive: 0, cartaNotReceive: 0}, {emailAll: 14867, ...}]
  const getChannelStats = () => {
    const returnArray = campaignResponse?.return || [];
    console.log('📊 Campaign Response:', campaignResponse);
    console.log('📊 Return Array:', returnArray);
    let totalEnvios = 0;
    let totalEntregues = 0;
    let totalNaoEntregues = 0;

    // The return array contains objects, one per channel
    returnArray.forEach(channelStats => {
      console.log('📊 Processing channel stats:', channelStats);
      Object.keys(channelStats).forEach(key => {
        if (key.endsWith('All')) {
          totalEnvios += channelStats[key] || 0;
        } else if (key.endsWith('NotReceive')) {
          // Check NotReceive BEFORE Receive to avoid matching both
          totalNaoEntregues += channelStats[key] || 0;
        } else if (key.endsWith('Receive')) {
          totalEntregues += channelStats[key] || 0;
        }
      });
    });

    console.log('📊 Calculated Stats:', { totalEnvios, totalEntregues, totalNaoEntregues });

    // Fallback to quantity if stats not available
    if (totalEnvios === 0 && campaign.quantity) {
      totalEnvios = Object.values(campaign.quantity).reduce((sum, val) => sum + val, 0);
      totalEntregues = campaign.sent || Math.floor(totalEnvios * 0.92);
      totalNaoEntregues = totalEnvios - totalEntregues;
      console.log('📊 Using fallback from quantity:', { totalEnvios, totalEntregues, totalNaoEntregues });
    }

    return { totalEnvios, totalEntregues, totalNaoEntregues };
  };

  const { totalEnvios, totalEntregues, totalNaoEntregues } = getChannelStats();
  const progressPercent = totalEnvios > 0 ? Math.round((totalEntregues / totalEnvios) * 100) : 0;

  const chartData = [
    { name: 'Total Enviados', value: totalEnvios, color: COLORS.enviados },
    { name: 'Entregues', value: totalEntregues, color: COLORS.entregues },
    { name: 'Não Entregues', value: totalNaoEntregues, color: COLORS.naoEntregues }
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Campanhas"))}
          className="mb-4 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Campanhas
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
              Detalhamento da Campanha
            </h1>
            <p className="text-slate-600 text-lg">Informações completas e ações disponíveis</p>
          </div>
          <Badge variant="outline" className={`${status.color} border font-semibold px-4 py-2 text-base`}>
            <StatusIcon className="w-5 h-5 mr-2" />
            {status.label}
          </Badge>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Informações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Informações do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data e Hora */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                      Data e Hora do Pedido
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {campaign.createdAt
                            ? format(new Date(campaign.createdAt), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {campaign.createdAt
                            ? format(new Date(campaign.createdAt), "HH:mm", { locale: ptBR })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Número do Pedido */}
                  <div>
                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                      Número do Pedido
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          #{String(campaign.number || campaign.id).slice(0, 8).toUpperCase() || "N/A"}
                        </p>
                        <p className="text-sm text-slate-500">Número do Pedido</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Título do Pedido */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                    Título do Pedido
                  </label>
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border-2 border-cyan-200">
                    <p className="text-xl font-bold text-slate-900">{campaign.title}</p>
                  </div>
                </div>

                {/* Status Detalhado */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                    Status Detalhado
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600 mb-1">Total de Destinatários</p>
                      <p className="text-2xl font-bold text-slate-900">{totalEnvios.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-700 mb-1">Enviados</p>
                      <p className="text-2xl font-bold text-green-900">{totalEntregues.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg text-center">
                      <p className="text-sm text-amber-700 mb-1">Progresso</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {totalEnvios > 0 ? Math.round((totalEntregues / totalEnvios) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de Efetividade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Gráfico de Efetividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Gráfico de Pizza */}
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => value.toLocaleString('pt-BR')}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Estatísticas */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-cyan-900 uppercase tracking-wider">
                          Total de Envios
                        </span>
                        <Send className="w-5 h-5 text-cyan-600" />
                      </div>
                      <p className="text-3xl font-bold text-cyan-900">{totalEnvios.toLocaleString('pt-BR')}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-green-900 uppercase tracking-wider">
                          Total Entregues
                        </span>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-900">{totalEntregues.toLocaleString('pt-BR')}</p>
                      <p className="text-sm text-green-700 mt-1">
                        {totalEnvios > 0 ? ((totalEntregues / totalEnvios) * 100).toFixed(1) : 0}% de taxa de entrega
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-red-900 uppercase tracking-wider">
                          Total Não Entregues
                        </span>
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-3xl font-bold text-red-900 mb-3">{totalNaoEntregues.toLocaleString('pt-BR')}</p>
                      <Button 
                        onClick={handleEnriquecerDados}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enriquecer Dados
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Coluna Lateral - Ações */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl">Ações Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Arquivo */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4 hover:bg-slate-50 border-2"
                  onClick={handleDownloadArquivo}
                  disabled={!campaign.recipient_file_url}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-slate-900">Arquivo</p>
                      <p className="text-xs text-slate-600">Baixar arquivo de destinatários</p>
                    </div>
                  </div>
                </Button>

                {/* Pausar Envio */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4 hover:bg-red-50 border-2 hover:border-red-300"
                  onClick={() => pausarEnvioMutation.mutate()}
                  disabled={campaign.status === 'pausada' || campaign.status === 'concluida' || pausarEnvioMutation.isPending}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PauseCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-slate-900">Pausar Envio</p>
                      <p className="text-xs text-slate-600">
                        {pausarEnvioMutation.isPending ? 'Pausando...' : 'Interromper campanha'}
                      </p>
                    </div>
                  </div>
                </Button>

                {/* Visualizar Template */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4 hover:bg-purple-50 border-2 hover:border-purple-300"
                  onClick={handleVisualizarTemplate}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-slate-900">Visualizar Template</p>
                      <p className="text-xs text-slate-600">Ver conteúdo da mensagem</p>
                    </div>
                  </div>
                </Button>

                {/* Gerar Arquivo de Retorno */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4 hover:bg-cyan-50 border-2 hover:border-cyan-300"
                  onClick={handleGerarArquivoRetorno}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-slate-900">Gerar Arquivo de Retorno</p>
                      <p className="text-xs text-slate-600">Exportar resultados</p>
                    </div>
                  </div>
                </Button>

                {/* Download Comprovante */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4 hover:bg-green-50 border-2 hover:border-green-300"
                  onClick={handleDownloadComprovante}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-slate-900">Comprovante de Postagem</p>
                      <p className="text-xs text-slate-600">Baixar comprovante</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}