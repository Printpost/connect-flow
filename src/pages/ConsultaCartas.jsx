import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Download,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const statusConfig = {
  positivo: {
    label: "Positivo",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    gradient: "from-green-400 to-green-500"
  },
  aguardando: {
    label: "Aguardando",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Clock,
    gradient: "from-blue-400 to-blue-500"
  },
  negativo_nao_existe_numero: {
    label: "Não existe o nº indicado",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_endereco_insuficiente: {
    label: "Endereço insuficiente",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_nao_procurado: {
    label: "Não procurado",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_desconhecido: {
    label: "Desconhecido",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_ausente: {
    label: "Ausente",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_mudou_se: {
    label: "Mudou-se",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_outros: {
    label: "Outros",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  },
  negativo_falecido: {
    label: "Falecido",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    gradient: "from-red-400 to-red-500"
  }
};

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];

export default function ConsultaCartas() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    campanha: "todas",
    status: "todos",
    busca: ""
  });

  const [selectedCarta, setSelectedCarta] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const { data: cartas = [], isLoading } = useQuery({
    queryKey: ['cartas-digitalizadas'],
    queryFn: () => base44.entities.CartaDigitalizada.list('-created_date'),
    initialData: [],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
    initialData: [],
  });

  // Estatísticas gerais
  const stats = useMemo(() => {
    const total = cartas.length;
    const positivo = cartas.filter(c => c.status === 'positivo').length;
    const aguardando = cartas.filter(c => c.status === 'aguardando').length;
    const negativo = cartas.filter(c => c.status.startsWith('negativo_')).length;
    const emPI = cartas.filter(c => c.em_pi).length;

    return { total, positivo, aguardando, negativo, emPI };
  }, [cartas]);

  // Filtrar cartas
  const filteredCartas = useMemo(() => {
    return cartas.filter(carta => {
      const matchesCampanha = filtros.campanha === "todas" || carta.campanha_id === filtros.campanha;
      const matchesStatus = filtros.status === "todos" || carta.status === filtros.status;
      const matchesBusca = !filtros.busca ||
        carta.nome_notificado?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        carta.codigo_ar?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        carta.campanha_nome?.toLowerCase().includes(filtros.busca.toLowerCase());
      
      const matchesDataInicio = !filtros.dataInicio ||
        (carta.data_envio && new Date(carta.data_envio) >= new Date(filtros.dataInicio));
      
      const matchesDataFim = !filtros.dataFim ||
        (carta.data_envio && new Date(carta.data_envio) <= new Date(filtros.dataFim + 'T23:59:59'));

      return matchesCampanha && matchesStatus && matchesBusca && matchesDataInicio && matchesDataFim;
    });
  }, [cartas, filtros]);

  // Dados para gráfico de pizza - Status
  const pieData = useMemo(() => {
    return [
      { name: 'Positivo', value: stats.positivo, color: '#10B981' },
      { name: 'Negativo', value: stats.negativo, color: '#EF4444' },
      { name: 'Aguardando', value: stats.aguardando, color: '#3B82F6' },
      { name: 'Em PI', value: stats.emPI, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Motivos de negativos
  const motivosNegativos = useMemo(() => {
    const motivos = cartas.filter(c => c.status.startsWith('negativo_'));
    const agrupado = {};
    
    motivos.forEach(carta => {
      const motivo = statusConfig[carta.status]?.label || carta.status;
      agrupado[motivo] = (agrupado[motivo] || 0) + 1;
    });

    return Object.entries(agrupado).map(([name, value]) => ({ name, value }));
  }, [cartas]);

  // SLA - Positivas
  const slaPositivas = useMemo(() => {
    const positivas = cartas.filter(c => c.status === 'positivo' && c.dias_uteis_entrega);
    return {
      total: positivas.length,
      ate5: positivas.filter(c => c.dias_uteis_entrega <= 5).length,
      de6a10: positivas.filter(c => c.dias_uteis_entrega >= 6 && c.dias_uteis_entrega <= 10).length,
      de11a15: positivas.filter(c => c.dias_uteis_entrega >= 11 && c.dias_uteis_entrega <= 15).length,
      acima15: positivas.filter(c => c.dias_uteis_entrega > 15).length
    };
  }, [cartas]);

  // SLA - Negativas
  const slaNegativas = useMemo(() => {
    const negativas = cartas.filter(c => c.status.startsWith('negativo_') && c.dias_uteis_entrega);
    return {
      total: negativas.length,
      ate5: negativas.filter(c => c.dias_uteis_entrega <= 5).length,
      de6a10: negativas.filter(c => c.dias_uteis_entrega >= 6 && c.dias_uteis_entrega <= 10).length,
      de11a15: negativas.filter(c => c.dias_uteis_entrega >= 11 && c.dias_uteis_entrega <= 15).length,
      acima15: negativas.filter(c => c.dias_uteis_entrega > 15).length
    };
  }, [cartas]);

  const handleViewImage = (carta) => {
    setSelectedCarta(carta);
    setImageDialogOpen(true);
  };

  const handleDownloadImage = (carta) => {
    if (carta.imagem_url) {
      window.open(carta.imagem_url, '_blank');
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Relatorios"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Relatórios
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Consulta de Cartas Digitalizadas</h1>
              <p className="text-slate-600 text-lg">Análise completa de envios físicos</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl">
            <TabsTrigger value="visao-geral" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
              <TrendingUp className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="busca" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Search className="w-4 h-4 mr-2" />
              Busca de Imagens
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* VISÃO GERAL */}
          <TabsContent value="visao-geral" className="space-y-6">
            {/* Filtros */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
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
                    <Label>Status</Label>
                    <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-5 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">TOTAL DE CARTAS</p>
                        <div className="text-5xl font-bold text-slate-900">{stats.total}</div>
                      </div>
                      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">POSITIVO</p>
                        <div className="text-5xl font-bold text-green-900">{stats.positivo}</div>
                      </div>
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">NEGATIVO</p>
                        <div className="text-5xl font-bold text-red-900">{stats.negativo}</div>
                      </div>
                      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                        <XCircle className="w-7 h-7 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">AGUARDANDO</p>
                        <div className="text-5xl font-bold text-blue-900">{stats.aguardando}</div>
                      </div>
                      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Clock className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">EM PI</p>
                        <div className="text-5xl font-bold text-amber-900">{stats.emPI}</div>
                      </div>
                      <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* BUSCA DE IMAGENS */}
          <TabsContent value="busca" className="space-y-6">
            {/* Filtros de Busca */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Label>Buscar</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Nome, Código AR ou Campanha..."
                        value={filtros.busca}
                        onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
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
                    <Label>Status</Label>
                    <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Resultados */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle>Resultados da Busca ({filteredCartas.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Carregando cartas...</p>
                  </div>
                ) : filteredCartas.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhuma carta encontrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-bold">ID</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="font-bold">Nome do Notificado</TableHead>
                          <TableHead className="font-bold">Código AR</TableHead>
                          <TableHead className="font-bold">Campanha</TableHead>
                          <TableHead className="font-bold">Data Envio</TableHead>
                          <TableHead className="font-bold text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCartas.map((carta) => {
                          const statusInfo = statusConfig[carta.status];
                          const StatusIcon = statusInfo?.icon || FileText;
                          
                          return (
                            <TableRow key={carta.id} className="hover:bg-slate-50">
                              <TableCell className="font-mono text-xs">{carta.id?.slice(0, 8)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${statusInfo?.color} border-2 font-semibold flex items-center gap-2 w-fit`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {statusInfo?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{carta.nome_notificado}</TableCell>
                              <TableCell className="font-mono text-sm">{carta.codigo_ar}</TableCell>
                              <TableCell>{carta.campanha_nome}</TableCell>
                              <TableCell>{carta.data_envio || "-"}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewImage(carta)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Visualizar Imagem
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadImage(carta)}>
                                      <Download className="w-4 h-4 mr-2" />
                                      Baixar Imagem
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RELATÓRIOS */}
          <TabsContent value="relatorios" className="space-y-6">
            {/* Filtros */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Relatório
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Gráficos Principais */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle>Distribuição de Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle>Insights de Motivos de Negativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={motivosNegativos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* SLA - Positivas */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Insights de SLA - Cartas Positivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700 font-semibold mb-2">Total Positivas</p>
                    <p className="text-3xl font-bold text-green-900">{slaPositivas.total}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 font-semibold mb-2">Até 5 dias úteis</p>
                    <p className="text-3xl font-bold text-slate-900">{slaPositivas.ate5}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slaPositivas.total > 0 ? `${((slaPositivas.ate5 / slaPositivas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 font-semibold mb-2">6 a 10 dias úteis</p>
                    <p className="text-3xl font-bold text-slate-900">{slaPositivas.de6a10}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slaPositivas.total > 0 ? `${((slaPositivas.de6a10 / slaPositivas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 font-semibold mb-2">11 a 15 dias úteis</p>
                    <p className="text-3xl font-bold text-slate-900">{slaPositivas.de11a15}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slaPositivas.total > 0 ? `${((slaPositivas.de11a15 / slaPositivas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700 font-semibold mb-2">Acima de 15 dias</p>
                    <p className="text-3xl font-bold text-red-900">{slaPositivas.acima15}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {slaPositivas.total > 0 ? `${((slaPositivas.acima15 / slaPositivas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA - Negativas */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Insights de SLA - Cartas Negativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700 font-semibold mb-2">Total Negativas</p>
                    <p className="text-3xl font-bold text-red-900">{slaNegativas.total}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 font-semibold mb-2">Até 5 dias úteis</p>
                    <p className="text-3xl font-bold text-slate-900">{slaNegativas.ate5}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slaNegativas.total > 0 ? `${((slaNegativas.ate5 / slaNegativas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 font-semibold mb-2">6 a 10 dias úteis</p>
                    <p className="text-3xl font-bold text-slate-900">{slaNegativas.de6a10}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slaNegativas.total > 0 ? `${((slaNegativas.de6a10 / slaNegativas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 font-semibold mb-2">11 a 15 dias úteis</p>
                    <p className="text-3xl font-bold text-slate-900">{slaNegativas.de11a15}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slaNegativas.total > 0 ? `${((slaNegativas.de11a15 / slaNegativas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700 font-semibold mb-2">Acima de 15 dias</p>
                    <p className="text-3xl font-bold text-red-900">{slaNegativas.acima15}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {slaNegativas.total > 0 ? `${((slaNegativas.acima15 / slaNegativas.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Aguardando */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Cartas Aguardando Retorno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-blue-50 rounded-xl">
                  <p className="text-5xl font-bold text-blue-900 mb-2">{stats.aguardando}</p>
                  <p className="text-slate-600">cartas aguardando confirmação de entrega</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialog para Visualizar Imagem */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Imagem Digitalizada da Carta</DialogTitle>
          </DialogHeader>
          {selectedCarta && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Nome do Notificado:</p>
                  <p className="font-semibold">{selectedCarta.nome_notificado}</p>
                </div>
                <div>
                  <p className="text-slate-600">Código AR:</p>
                  <p className="font-semibold font-mono">{selectedCarta.codigo_ar}</p>
                </div>
                <div>
                  <p className="text-slate-600">Campanha:</p>
                  <p className="font-semibold">{selectedCarta.campanha_nome}</p>
                </div>
                <div>
                  <p className="text-slate-600">Status:</p>
                  <Badge className={statusConfig[selectedCarta.status]?.color}>
                    {statusConfig[selectedCarta.status]?.label}
                  </Badge>
                </div>
              </div>
              
              {selectedCarta.imagem_url ? (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <img 
                    src={selectedCarta.imagem_url} 
                    alt="Carta Digitalizada" 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Imagem não disponível</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => handleDownloadImage(selectedCarta)} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Imagem
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
