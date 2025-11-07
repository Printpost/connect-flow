
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  TrendingUp,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  FileText,
  ArrowLeft,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MapPin,
  MoreVertical,
  AlertCircle, // New import
  Target,      // New import
  CheckCircle, // New import
  Award        // New import
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  rcs: Radio,
  carta: FileText
};

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

export default function Relatorios() {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    campanha: "todas",
    centroDeCusto: "todos",
    statusKanban: "todos",
    responsavel: "todos"
  });

  const [viewMode, setViewMode] = useState("meses");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas'],
    queryFn: () => base44.entities.Campaign.list(),
    initialData: [],
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: () => base44.entities.CentroDeCusto.list(),
    initialData: [],
  });

  // Dados Kanban simulados
  const dadosKanban = useMemo(() => {
    const nomes = ['Fernando Silva', 'Ramon Lisboa', 'Carlos Oliveira', 'Dr. Paulo Santos', 'Luma Comercial', 'Diego Costa', 'Cristofer Almeida', 'Kleven Soares', 'Geysa Santos', 'O. Luiz Peralta'];
    const cidades = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba'];
    const leads = ['Lead: Fernando', 'Lead: Ramon Lisboa', 'Lead: Carlos - Gr7', 'Lead: Luma Santos', 'Lead: Diego', 'Lead: Cristofer', 'Lead: Geysa'];

    const gerarCards = (quantidade, status) => {
      const cards = [];
      for (let i = 0; i < quantidade; i++) {
        const nome = nomes[Math.floor(Math.random() * nomes.length)];
        const valor = (Math.random() * 1000 + 100).toFixed(2);
        cards.push({
          id: `${status}-${i}`,
          numero: Math.floor(Math.random() * 30) + 1,
          nome,
          lead: leads[Math.floor(Math.random() * leads.length)],
          valor: `R$ ${valor}`,
          avatar: null, // You can add avatar URLs if needed
          cidade: cidades[Math.floor(Math.random() * cidades.length)],
          abertos: Math.floor(Math.random() * 200), // Placeholder for 'Abertos'
          naEspera: Math.floor(Math.random() * 100), // Placeholder for 'Na Espera'
          previstos: Math.floor(Math.random() * 50), // Placeholder for 'Previstos'
          data: format(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), "dd/MM/yyyy")
        });
      }
      return cards;
    };

    return {
      entregue: {
        titulo: 'ENTREGUE',
        cor: 'from-green-400 to-green-500',
        total: 45,
        valorTotal: 'R$ 125.458,00',
        cards: gerarCards(6, 'entregue')
      },
      emProcessamento: {
        titulo: 'EM PROCESSAMENTO',
        cor: 'from-cyan-400 to-cyan-500',
        total: 23,
        valorTotal: 'R$ 56.737,00',
        cards: gerarCards(4, 'processamento')
      },
      aguardando: {
        titulo: 'AGUARDANDO',
        cor: 'from-yellow-400 to-yellow-500',
        total: 18,
        valorTotal: 'R$ 32.107,00',
        cards: gerarCards(5, 'aguardando')
      },
      falhou: {
        titulo: 'NÃO ENTREGUE',
        cor: 'from-red-400 to-red-500',
        total: 12,
        valorTotal: 'R$ 15.990,00',
        cards: gerarCards(3, 'falhou')
      }
    };
  }, []);

  // Dados analíticos detalhados por canal
  const dadosAnaliticos = useMemo(() => {
    return {
      email: {
        totalEnviados: 45000,
        totalEntregues: 41400,
        totalNaoEntregues: 3600,
        taxaSucesso: 92.0,
        statusDetalhado: [
          { name: 'Entregue', value: 35000, color: '#10B981' },
          { name: 'Aberto', value: 15750, color: '#3B82F6' },
          { name: 'Clicado', value: 4500, color: '#8B5CF6' },
          { name: 'Bloqueado na blacklist', value: 900, color: '#EF4444' },
          { name: 'Hard Bounce', value: 1350, color: '#DC2626' },
          { name: 'Caixa cheia', value: 450, color: '#F59E0B' },
          { name: 'Soft Bounce', value: 675, color: '#FB923C' },
          { name: 'Assinatura cancelada', value: 225, color: '#EC4899' },
          { name: 'Marcado como spam', value: 450, color: '#BE123C' }
        ]
      },
      sms: {
        totalEnviados: 28000,
        totalEntregues: 25760,
        totalNaoEntregues: 2240,
        taxaSucesso: 92.0,
        statusDetalhado: [
          { name: 'Entregue no celular', value: 23520, color: '#10B981' },
          { name: 'Entregue na operadora', value: 2240, color: '#3B82F6' },
          { name: 'Não recebido', value: 1400, color: '#EF4444' },
          { name: 'Telefone inválido', value: 840, color: '#F59E0B' }
        ]
      },
      rcs: {
        totalEnviados: 15000,
        totalEntregues: 13500,
        totalNaoEntregues: 1500,
        taxaSucesso: 90.0,
        statusDetalhado: [
          { name: 'Entregue no celular', value: 12000, color: '#10B981' },
          { name: 'Entregue na operadora', value: 1500, color: '#3B82F6' },
          { name: 'Não recebido', value: 750, color: '#EF4444' },
          { name: 'Telefone inválido', value: 450, color: '#F59E0B' },
          { name: 'Não possui Android', value: 300, color: '#8B5CF6' }
        ]
      },
      whatsapp: {
        totalEnviados: 32000,
        totalEntregues: 29440,
        totalNaoEntregues: 2560,
        taxaSucesso: 92.0,
        statusDetalhado: [
          { name: 'Entregue', value: 29440, color: '#10B981' },
          { name: 'Lido', value: 20608, color: '#3B82F6' },
          { name: 'Não lido', value: 8832, color: '#F59E0B' },
          { name: 'Não entregue', value: 2560, color: '#EF4444' }
        ]
      },
      carta: {
        totalEnviados: 5000,
        totalEntregues: 4000,
        totalNaoEntregues: 1000,
        taxaSucesso: 80.0,
        statusDetalhado: [
          { name: 'Positivo', value: 4000, color: '#10B981' },
          { name: 'Aguardando', value: 250, color: '#3B82F6' },
          { name: 'Não existe o nº indicado', value: 200, color: '#EF4444' },
          { name: 'Endereço insuficiente', value: 150, color: '#F59E0B' },
          { name: 'Não procurado', value: 100, color: '#FB923C' },
          { name: 'Desconhecido', value: 100, color: '#F472B6' },
          { name: 'Ausente', value: 75, color: '#A78BFA' },
          { name: 'Mudou-se', value: 75, color: '#60A5FA' },
          { name: 'Falecido', value: 25, color: '#DC2626' },
          { name: 'Outros', value: 25, color: '#9CA3AF' }
        ]
      }
    };
  }, []);

  // Dados sintéticos
  const dadosSimulados = useMemo(() => {
    const meses = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const totalEnvios = Math.floor(Math.random() * 50000) + 10000;
      const entregues = Math.floor(totalEnvios * 0.92);
      const abertos = Math.floor(entregues * 0.45);
      const cliques = Math.floor(abertos * 0.15);

      meses.push({
        mes: format(mes, "MMM/yy", { locale: ptBR }),
        mesCompleto: format(mes, "MMMM 'de' yyyy", { locale: ptBR }),
        data: mes,
        totalEnvios,
        entregues,
        abertos,
        cliques,
        falhas: totalEnvios - entregues,
        taxaEntrega: ((entregues / totalEnvios) * 100).toFixed(1),
        taxaAbertura: ((abertos / entregues) * 100).toFixed(1),
        taxaClique: ((cliques / abertos) * 100).toFixed(1)
      });
    }

    return meses;
  }, []);

  const gerarDadosDias = (mes) => {
    if (!mes) return [];

    const inicio = startOfMonth(mes.data);
    const fim = endOfMonth(mes.data);
    const dias = eachDayOfInterval({ start: inicio, end: fim });

    return dias.map(dia => {
      const totalEnvios = Math.floor(Math.random() * 3000) + 500;
      const entregues = Math.floor(totalEnvios * 0.92);
      const abertos = Math.floor(entregues * 0.45);

      return {
        dia: format(dia, "dd/MM", { locale: ptBR }),
        diaCompleto: format(dia, "dd 'de' MMMM", { locale: ptBR }),
        data: dia,
        totalEnvios,
        entregues,
        abertos,
        falhas: totalEnvios - entregues
      };
    });
  };

  const gerarMensagensDetalhadas = (dia) => {
    if (!dia) return [];

    const mensagens = [];
    const canais = ['email', 'sms', 'whatsapp', 'rcs'];
    const status = ['entregue', 'aberto', 'clicado', 'falhou'];

    for (let i = 0; i < 50; i++) {
      const canal = canais[Math.floor(Math.random() * canais.length)];
      const statusMsg = status[Math.floor(Math.random() * status.length)];

      mensagens.push({
        id: `msg-${i}`,
        campanha: `Campanha ${Math.floor(Math.random() * 10) + 1}`,
        destinatario: `cliente${i}@email.com`,
        canal,
        status: statusMsg,
        horario: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        assunto: `Assunto da mensagem ${i + 1}`
      });
    }

    return mensagens;
  };

  const handleVoltar = () => {
    if (viewMode === "mensagens") {
      setViewMode("dias");
      setSelectedDay(null);
    } else if (viewMode === "dias") {
      setViewMode("meses");
      setSelectedMonth(null);
    }
  };

  const handleExportarPDF = () => {
    alert("Exportação de PDF será implementada em breve");
  };

  const dadosDias = selectedMonth ? gerarDadosDias(selectedMonth) : [];
  const mensagensDetalhadas = selectedDay ? gerarMensagensDetalhadas(selectedDay) : [];

  const CanalCard = ({ titulo, icone: Icon, dados, corGradiente }) => (
    <Card className={`border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br ${corGradiente} overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {titulo}
          </CardTitle>
          <Badge className="bg-white/20 text-white border-0">
            Taxa: {dados.taxaSucesso}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xs text-white/80 mb-1">Total Enviados</p>
            <p className="text-xl font-bold text-white">{dados.totalEnviados.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xs text-white/80 mb-1">Entregues</p>
            <p className="text-xl font-bold text-white">{dados.totalEntregues.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xs text-white/80 mb-1">Não Entregues</p>
            <p className="text-xl font-bold text-white">{dados.totalNaoEntregues.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-white rounded-xl p-4">
          <h4 className="font-semibold text-slate-900 mb-3 text-sm">Distribuição de Status</h4>
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
                formatter={(value) => value.toLocaleString('pt-BR')}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda Detalhada */}
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {dados.statusDetalhado.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1800px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Relatórios</h1>
            <p className="text-slate-600 text-lg">Análises sintéticas, analíticas e kanban de campanhas</p>
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

        {/* Filtros */}
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
                    {campanhas.map((c) => (
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

        {/* Abas Sintético / Analítico / Kanban */}
        <Tabs defaultValue="ranking" className="space-y-6">
          <TabsList className="bg-slate-100 p-2 rounded-xl">
            <TabsTrigger value="ranking" className="px-6">Ranking de Canais</TabsTrigger>
            <TabsTrigger value="multicanais" className="px-6">Ações Multicanais</TabsTrigger>
            <TabsTrigger value="analitico" className="px-6">Relatório Analítico</TabsTrigger>
            <TabsTrigger value="engajamento" className="px-6">Engajamento</TabsTrigger>
            <TabsTrigger value="contatos" className="px-6">Visão 360º</TabsTrigger>
          </TabsList>

          {/* RANKING DE CANAIS */}
          <TabsContent value="ranking" className="space-y-6">
            {(viewMode === "dias" || viewMode === "mensagens") && (
              <Button
                variant="outline"
                onClick={handleVoltar}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}

            {viewMode === "meses" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Envios por Mês</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dadosSimulados.map((mes, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-2xl transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedMonth(mes);
                          setViewMode("dias");
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-cyan-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg capitalize">{mes.mesCompleto}</CardTitle>
                                <Badge className="mt-1 bg-cyan-600">{mes.totalEnvios.toLocaleString('pt-BR')} envios</Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Taxa de Entrega:</span>
                            <span className="font-semibold text-green-600">{mes.taxaEntrega}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Taxa de Abertura:</span>
                            <span className="font-semibold text-blue-600">{mes.taxaAbertura}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Taxa de Clique:</span>
                            <span className="font-semibold text-purple-600">{mes.taxaClique}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "dias" && selectedMonth && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 capitalize">
                    Envios por Dia - {selectedMonth.mesCompleto}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Total do mês: {selectedMonth.totalEnvios.toLocaleString('pt-BR')} envios
                  </p>
                </div>

                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardHeader>
                    <CardTitle>Evolução Diária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dadosDias}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalEnvios" stroke="#06B6D4" strokeWidth={2} name="Envios" />
                        <Line type="monotone" dataKey="entregues" stroke="#10B981" strokeWidth={2} name="Entregues" />
                        <Line type="monotone" dataKey="abertos" stroke="#8B5CF6" strokeWidth={2} name="Abertos" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {dadosDias.map((dia, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card
                        className="border-0 shadow-lg shadow-slate-200/50 bg-white hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedDay(dia);
                          setViewMode("mensagens");
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-slate-900 mb-1">{dia.dia}</div>
                          <div className="text-xs text-slate-600 mb-2">{dia.diaCompleto}</div>
                          <Badge className="bg-cyan-600 w-full">{dia.totalEnvios.toLocaleString('pt-BR')}</Badge>
                          <ChevronRight className="w-4 h-4 mx-auto mt-2 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "mensagens" && selectedDay && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Mensagens Detalhadas - {selectedDay.diaCompleto}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Total: {selectedDay.totalEnvios.toLocaleString('pt-BR')} mensagens
                  </p>
                </div>

                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Horário</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Campanha</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Destinatário</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Canal</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Assunto</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mensagensDetalhadas.map((msg) => {
                            const Icon = channelIcons[msg.canal];
                            return (
                              <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-900">{msg.horario}</td>
                                <td className="px-6 py-4 text-sm text-slate-900">{msg.campanha}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{msg.destinatario}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-slate-600" />
                                    <span className="text-sm capitalize">{msg.canal}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{msg.assunto}</td>
                                <td className="px-6 py-4">
                                  <Badge className={
                                    msg.status === 'entregue' ? 'bg-green-100 text-green-700' :
                                    msg.status === 'aberto' ? 'bg-blue-100 text-blue-700' :
                                    msg.status === 'clicado' ? 'bg-purple-100 text-purple-700' :
                                    'bg-red-100 text-red-700'
                                  }>
                                    {msg.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* AÇÕES MULTICANAIS */}
          <TabsContent value="multicanais" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Relatório de Ações Multicanais</h2>
            <p className="text-slate-600 mb-6">Fluxo de campanhas através de múltiplos canais baseado em condições de resposta</p>

            {/* Fluxo Visual de Multicanais */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-x-auto">
              <CardContent className="p-8">
                <div className="flex items-center gap-6 min-w-max">
                  {/* 1. Canal Inicial - Email */}
                  <div className="flex flex-col items-center">
                    <div className="w-72 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-900">1º Canal</h3>
                            <p className="text-sm text-blue-700">E-mail</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white">Inicial</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Total Enviados</p>
                          <p className="text-2xl font-bold text-slate-900">45.000</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 mb-1">Total Entregues</p>
                          <p className="text-2xl font-bold text-green-900">41.400</p>
                          <p className="text-xs text-green-700 mt-1">92% taxa de entrega</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs text-red-700 mb-1">Total Não Entregues</p>
                          <p className="text-2xl font-bold text-red-900">3.600</p>
                          <p className="text-xs text-red-700 mt-1">8% falhas</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">Hard Bounce: 1.350</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seta de conexão */}
                  <div className="flex flex-col items-center">
                    <div className="text-center mb-2">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                        Hard Bounce
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-green-400"></div>
                      <ChevronRight className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  {/* 2. Segundo Canal - SMS */}
                  <div className="flex flex-col items-center">
                    <div className="w-72 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-green-900">2º Canal</h3>
                            <p className="text-sm text-green-700">SMS</p>
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white">Recuperação</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Total Enviados</p>
                          <p className="text-2xl font-bold text-slate-900">1.350</p>
                          <p className="text-xs text-slate-600 mt-1">Hard Bounces do email</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 mb-1">Total Entregues</p>
                          <p className="text-2xl font-bold text-green-900">1.242</p>
                          <p className="text-xs text-green-700 mt-1">92% recuperados</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs text-red-700 mb-1">Total Não Entregues</p>
                          <p className="text-2xl font-bold text-red-900">108</p>
                          <p className="text-xs text-red-700 mt-1">8% falhas</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-green-800">
                            <span>Entregue na operadora:</span>
                            <span className="font-semibold">200</span>
                          </div>
                          <div className="flex items-center justify-between text-green-800">
                            <span>Entregue no celular:</span>
                            <span className="font-semibold">1.042</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seta de conexão */}
                  <div className="flex flex-col items-center">
                    <div className="text-center mb-2">
                      <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">
                        Entregue Operadora/Celular
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                      <ChevronRight className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>

                  {/* 3. Terceiro Canal - WhatsApp */}
                  <div className="flex flex-col items-center">
                    <div className="w-72 p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Smartphone className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-emerald-900">3º Canal</h3>
                            <p className="text-sm text-emerald-700">WhatsApp</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white">Confirmação</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Total Enviados</p>
                          <p className="text-2xl font-bold text-slate-900">1.242</p>
                          <p className="text-xs text-slate-600 mt-1">Entregues do SMS</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 mb-1">Total Entregues</p>
                          <p className="text-2xl font-bold text-green-900">1.143</p>
                          <p className="text-xs text-green-700 mt-1">92% confirmados</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs text-red-700 mb-1">Total Não Entregues</p>
                          <p className="text-2xl font-bold text-red-900">99</p>
                          <p className="text-xs text-red-700 mt-1">8% falhas</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-emerald-200">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-emerald-800">
                            <span>Lidos:</span>
                            <span className="font-semibold">800</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-800">
                            <span>Não lidos:</span>
                            <span className="font-semibold">343</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resultado Final */}
                  <div className="flex flex-col items-center ml-6">
                    <div className="w-64 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-purple-900">Resultado Final</h3>
                          <p className="text-sm text-purple-700">Multicanal</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                          <p className="text-xs text-slate-600 mb-1">Taxa de Alcance Total</p>
                          <p className="text-3xl font-bold text-purple-900">94.8%</p>
                          <p className="text-xs text-slate-600 mt-2">42.785 de 45.000</p>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-700 mb-1">Recuperados via SMS</p>
                          <p className="text-xl font-bold text-green-900">1.242</p>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-lg">
                          <p className="text-xs text-emerald-700 mb-1">Confirmados via WhatsApp</p>
                          <p className="text-xl font-bold text-emerald-900">1.143</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela Detalhada de Fluxo */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Análise Detalhada do Fluxo Multicanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Etapa</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Canal</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Condição</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Enviados</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Entregues</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Não Entregues</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Taxa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <Badge className="bg-blue-600 text-white">1ª Etapa</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-slate-900">E-mail</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">Envio inicial</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">45.000</td>
                        <td className="px-6 py-4 text-right font-bold text-green-900">41.400</td>
                        <td className="px-6 py-4 text-right font-bold text-red-900">3.600</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-green-100 text-green-800">92%</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4">
                          <Badge className="bg-green-600 text-white">2ª Etapa</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-slate-900">SMS</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                            Hard Bounce
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">1.350</td>
                        <td className="px-6 py-4 text-right font-bold text-green-900">1.242</td>
                        <td className="px-6 py-4 text-right font-bold text-red-900">108</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-green-100 text-green-800">92%</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-emerald-50 transition-colors">
                        <td className="px-6 py-4">
                          <Badge className="bg-emerald-600 text-white">3ª Etapa</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-900">WhatsApp</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-300">
                            Entregue Operadora/Celular
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">1.242</td>
                        <td className="px-6 py-4 text-right font-bold text-green-900">1.143</td>
                        <td className="px-6 py-4 text-right font-bold text-red-900">99</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-green-100 text-green-800">92%</Badge>
                        </td>
                      </tr>
                      <tr className="bg-purple-50 font-bold border-t-2 border-purple-200">
                        <td className="px-6 py-4" colSpan="3">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            <span className="text-lg text-purple-900">TOTAL GERAL</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-lg text-slate-900">45.000</td>
                        <td className="px-6 py-4 text-right text-lg text-green-900">42.785</td>
                        <td className="px-6 py-4 text-right text-lg text-red-900">2.215</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-purple-600 text-white text-base">94.8%</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Insights */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Recuperação via SMS</p>
                      <p className="text-xs text-green-700">Hard Bounces recuperados</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-900 mb-2">1.242</p>
                  <p className="text-sm text-green-700">92% dos Hard Bounces alcançados via SMS</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Confirmação via WhatsApp</p>
                      <p className="text-xs text-emerald-700">SMS entregues confirmados</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900 mb-2">1.143</p>
                  <p className="text-sm text-emerald-700">92% confirmados via WhatsApp</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Efetividade Total</p>
                      <p className="text-xs text-purple-700">Com estratégia multicanal</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 mb-2">94.8%</p>
                  <p className="text-sm text-purple-700">+2.8% comparado ao email apenas</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RELATÓRIO ANALÍTICO */}
          <TabsContent value="analitico" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Análise Detalhada por Canal</h2>

            <CanalCard
              titulo="E-mail"
              icone={Mail}
              dados={dadosAnaliticos.email}
              corGradiente="from-blue-500 to-blue-600"
            />

            <CanalCard
              titulo="SMS"
              icone={MessageSquare}
              dados={dadosAnaliticos.sms}
              corGradiente="from-green-500 to-green-600"
            />

            <CanalCard
              titulo="RCS"
              icone={Radio}
              dados={dadosAnaliticos.rcs}
              corGradiente="from-purple-500 to-purple-600"
            />

            <CanalCard
              titulo="WhatsApp"
              icone={Smartphone}
              dados={dadosAnaliticos.whatsapp}
              corGradiente="from-emerald-500 to-emerald-600"
            />

            <CanalCard
              titulo="Carta"
              icone={FileText}
              dados={dadosAnaliticos.carta}
              corGradiente="from-amber-500 to-amber-600"
            />
          </TabsContent>

          {/* ENGAGEMENT */}
          <TabsContent value="engajamento" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Engajamento</h2>
            <p className="text-slate-600">Conteúdo do relatório de engajamento aqui.</p>
          </TabsContent>

          {/* VISÃO 360º */}
          <TabsContent value="contatos" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Visão 360º</h2>
            <p className="text-slate-600">Conteúdo do relatório de visão 360º de contatos aqui.</p>
          </TabsContent>

          {/* VISÃO KANBAN */}
          <TabsContent value="kanban" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Visão Kanban - Status de Entrega</h2>

            <div className="grid lg:grid-cols-4 gap-6">
              {Object.entries(dadosKanban).map(([key, coluna]) => (
                <div key={key} className="flex flex-col">
                  {/* Header da coluna */}
                  <div className={`bg-gradient-to-r ${coluna.cor} text-white rounded-t-xl p-4 shadow-lg`}>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-2">{coluna.titulo}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-semibold">{coluna.total}</span>
                      </div>
                      <span className="text-sm font-semibold">{coluna.valorTotal}</span>
                    </div>
                  </div>

                  {/* Cards da coluna */}
                  <div className="bg-slate-50 rounded-b-xl p-3 space-y-3 min-h-[600px] max-h-[800px] overflow-y-auto">
                    {coluna.cards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-white">
                          <CardContent className="p-4">
                            {/* Header do card */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300">
                                  {card.avatar ? (
                                    <AvatarImage src={card.avatar} alt={card.nome} />
                                  ) : (
                                    <AvatarFallback className="text-slate-700 font-bold">
                                      {card.nome.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-sm">
                                      {card.numero}
                                    </div>
                                    <span className="text-xs text-green-500">●</span> {/* Placeholder for status dot */}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </div>

                            {/* Nome e Lead */}
                            <div className="mb-3">
                              <h4 className="font-semibold text-slate-900 text-sm mb-1">{card.nome}</h4>
                              <p className="text-xs text-slate-600">{card.lead}</p>
                              <p className="text-lg font-bold text-slate-900 mt-2">{card.valor}</p>
                            </div>

                            {/* Badges de status */}
                            <div className="flex gap-2 mb-3">
                              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                <span className="text-xs">≤</span> {card.abertos}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                <span className="text-xs">□</span> {card.naEspera}
                              </Badge>
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                <span className="text-xs">○</span> {card.previstos}
                              </Badge>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{card.cidade}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>Aberto: {card.abertos}</span>
                                <span>Na Espera: {card.naEspera}</span>
                                <span>Prev: {card.previstos}</span>
                              </div>
                            </div>

                            {/* Data */}
                            <div className="mt-2 text-xs text-slate-500">{card.data}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
