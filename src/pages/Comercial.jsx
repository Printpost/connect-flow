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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Edit,
  Trash2,
  BarChart3,
  Users,
  Phone,
  CheckCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tiposCanal = [
  { value: "email_marketing", label: "E-mail Marketing" },
  { value: "sms", label: "SMS" },
  { value: "seo", label: "SEO" },
  { value: "google_ads", label: "Google Ads" },
  { value: "facebook_ads", label: "Facebook Ads" },
  { value: "linkedin_ads", label: "LinkedIn Ads" },
  { value: "ligacoes", label: "Ligações" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "evento", label: "Evento" },
  { value: "parceria", label: "Parceria" },
  { value: "indicacao", label: "Indicação" },
  { value: "outro", label: "Outro" }
];

export default function Comercial() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados para Canais de Aquisição
  const [showCanalDialog, setShowCanalDialog] = useState(false);
  const [canalForm, setCanalForm] = useState({ nome: "", tipo: "", descricao: "" });

  // Estados para Orçamento
  const [showOrcamentoDialog, setShowOrcamentoDialog] = useState(false);
  const [orcamentoForm, setOrcamentoForm] = useState({
    canal_id: "",
    valor_gasto: "",
    data_inicio: "",
    data_fim: "",
    detalhamento: ""
  });

  // Estados para Métricas
  const [showMetricaDialog, setShowMetricaDialog] = useState(false);
  const [tipoFunil, setTipoFunil] = useState("padrao");
  const [metricaForm, setMetricaForm] = useState({
    vendedor_nome: "",
    canal_id: "",
    data_registro: new Date().toISOString().split('T')[0],
    tipo_funil: "padrao",
    funil_padrao: {
      leads: 0,
      conexoes: 0,
      reunioes_agendadas: 0,
      reunioes_realizadas: 0,
      vendas: 0,
      indicacoes: 0
    },
    funil_ligacoes: {
      leads: 0,
      ligacoes_feitas: 0,
      faladas: 0,
      conexoes: 0,
      fechamentos: 0,
      vendas: 0,
      indicacoes: 0
    },
    observacoes: ""
  });

  // Queries
  const { data: canais = [] } = useQuery({
    queryKey: ['canais-aquisicao'],
    queryFn: () => base44.entities.CanalAquisicao.list(),
    initialData: [],
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos-marketing'],
    queryFn: () => base44.entities.OrcamentoMarketing.list('-data_inicio'),
    initialData: [],
  });

  const { data: metricas = [] } = useQuery({
    queryKey: ['metricas-vendas'],
    queryFn: () => base44.entities.MetricaVendas.list('-data_registro'),
    initialData: [],
  });

  // Mutations
  const createCanalMutation = useMutation({
    mutationFn: (data) => base44.entities.CanalAquisicao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canais-aquisicao'] });
      setShowCanalDialog(false);
      setCanalForm({ nome: "", tipo: "", descricao: "" });
    },
  });

  const createOrcamentoMutation = useMutation({
    mutationFn: (data) => {
      const canal = canais.find(c => c.id === data.canal_id);
      return base44.entities.OrcamentoMarketing.create({
        ...data,
        canal_nome: canal?.nome || "",
        valor_gasto: parseFloat(data.valor_gasto)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos-marketing'] });
      setShowOrcamentoDialog(false);
      setOrcamentoForm({
        canal_id: "",
        valor_gasto: "",
        data_inicio: "",
        data_fim: "",
        detalhamento: ""
      });
    },
  });

  const createMetricaMutation = useMutation({
    mutationFn: (data) => {
      const canal = canais.find(c => c.id === data.canal_id);
      return base44.entities.MetricaVendas.create({
        ...data,
        canal_nome: canal?.nome || ""
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metricas-vendas'] });
      setShowMetricaDialog(false);
      resetMetricaForm();
    },
  });

  const resetMetricaForm = () => {
    setMetricaForm({
      vendedor_nome: "",
      canal_id: "",
      data_registro: new Date().toISOString().split('T')[0],
      tipo_funil: "padrao",
      funil_padrao: {
        leads: 0,
        conexoes: 0,
        reunioes_agendadas: 0,
        reunioes_realizadas: 0,
        vendas: 0,
        indicacoes: 0
      },
      funil_ligacoes: {
        leads: 0,
        ligacoes_feitas: 0,
        faladas: 0,
        conexoes: 0,
        fechamentos: 0,
        vendas: 0,
        indicacoes: 0
      },
      observacoes: ""
    });
    setTipoFunil("padrao");
  };

  // Calcular estatísticas
  const totalGasto = orcamentos.reduce((sum, o) => sum + (o.valor_gasto || 0), 0);
  const totalLeadsGerados = metricas.reduce((sum, m) => {
    if (m.tipo_funil === 'padrao') {
      return sum + (m.funil_padrao?.leads || 0);
    }
    return sum + (m.funil_ligacoes?.leads || 0);
  }, 0);
  const totalVendas = metricas.reduce((sum, m) => {
    if (m.tipo_funil === 'padrao') {
      return sum + (m.funil_padrao?.vendas || 0);
    }
    return sum + (m.funil_ligacoes?.vendas || 0);
  }, 0);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1800px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Admin"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Comercial</h1>
            <p className="text-slate-600 text-lg">Planejamento, orçamento e métricas de vendas</p>
          </div>
        </div>
      </motion.div>

      {/* Cards de Resumo */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-600 text-white">Orçamento</Badge>
            </div>
            <p className="text-sm text-green-700 mb-1">Total Investido</p>
            <p className="text-3xl font-bold text-green-900">
              R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-600 text-white">Leads</Badge>
            </div>
            <p className="text-sm text-blue-700 mb-1">Total Gerados</p>
            <p className="text-3xl font-bold text-blue-900">{totalLeadsGerados}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-600 text-white">Vendas</Badge>
            </div>
            <p className="text-sm text-purple-700 mb-1">Total Realizadas</p>
            <p className="text-3xl font-bold text-purple-900">{totalVendas}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="canais" className="space-y-6">
        <TabsList className="bg-slate-100 p-2 rounded-xl">
          <TabsTrigger value="canais" className="px-6">Canais de Aquisição</TabsTrigger>
          <TabsTrigger value="orcamento" className="px-6">Orçamento</TabsTrigger>
          <TabsTrigger value="metricas" className="px-6">Adicionar Métricas</TabsTrigger>
          <TabsTrigger value="analises" className="px-6">Análises</TabsTrigger>
        </TabsList>

        {/* ABA: CANAIS DE AQUISIÇÃO */}
        <TabsContent value="canais">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Canais de Aquisição</CardTitle>
                  <p className="text-slate-600 mt-2">Cadastre os canais que serão usados para captar clientes</p>
                </div>
                <Dialog open={showCanalDialog} onOpenChange={setShowCanalDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Canal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Canal de Aquisição</DialogTitle>
                      <DialogDescription>
                        Adicione um novo canal para rastreamento de orçamento e métricas
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Nome do Canal *</Label>
                        <Input
                          placeholder="Ex: Campanha Google Ads Q1"
                          value={canalForm.nome}
                          onChange={(e) => setCanalForm({...canalForm, nome: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Tipo *</Label>
                        <Select value={canalForm.tipo} onValueChange={(value) => setCanalForm({...canalForm, tipo: value})}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposCanal.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          placeholder="Descrição do canal..."
                          value={canalForm.descricao}
                          onChange={(e) => setCanalForm({...canalForm, descricao: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCanalDialog(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => createCanalMutation.mutate(canalForm)}
                        disabled={!canalForm.nome || !canalForm.tipo || createCanalMutation.isPending}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600"
                      >
                        {createCanalMutation.isPending ? "Salvando..." : "Salvar Canal"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {canais.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Nenhum canal cadastrado</p>
                  <Button
                    onClick={() => setShowCanalDialog(true)}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Canal
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {canais.map((canal) => (
                    <Card key={canal.id} className="border-2 border-slate-200 hover:border-cyan-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-slate-900">{canal.nome}</h3>
                          <Badge variant="outline">
                            {tiposCanal.find(t => t.value === canal.tipo)?.label}
                          </Badge>
                        </div>
                        {canal.descricao && (
                          <p className="text-sm text-slate-600 mt-2">{canal.descricao}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: ORÇAMENTO */}
        <TabsContent value="orcamento">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Orçamento de Marketing</CardTitle>
                  <p className="text-slate-600 mt-2">Cadastre os investimentos em estratégias de marketing</p>
                </div>
                <Dialog open={showOrcamentoDialog} onOpenChange={setShowOrcamentoDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-green-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Orçamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Orçamento</DialogTitle>
                      <DialogDescription>
                        Registre o investimento em um canal de aquisição
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Canal de Aquisição *</Label>
                        <Select value={orcamentoForm.canal_id} onValueChange={(value) => setOrcamentoForm({...orcamentoForm, canal_id: value})}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecione o canal" />
                          </SelectTrigger>
                          <SelectContent>
                            {canais.map((canal) => (
                              <SelectItem key={canal.id} value={canal.id}>{canal.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Valor Gasto (R$) *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          value={orcamentoForm.valor_gasto}
                          onChange={(e) => setOrcamentoForm({...orcamentoForm, valor_gasto: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data Início *</Label>
                          <Input
                            type="date"
                            value={orcamentoForm.data_inicio}
                            onChange={(e) => setOrcamentoForm({...orcamentoForm, data_inicio: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Data Fim *</Label>
                          <Input
                            type="date"
                            value={orcamentoForm.data_fim}
                            onChange={(e) => setOrcamentoForm({...orcamentoForm, data_fim: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Detalhamento / Descrição</Label>
                        <Textarea
                          placeholder="Descreva a estratégia e objetivos..."
                          value={orcamentoForm.detalhamento}
                          onChange={(e) => setOrcamentoForm({...orcamentoForm, detalhamento: e.target.value})}
                          className="mt-2 min-h-[100px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowOrcamentoDialog(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => createOrcamentoMutation.mutate(orcamentoForm)}
                        disabled={!orcamentoForm.canal_id || !orcamentoForm.valor_gasto || !orcamentoForm.data_inicio || !orcamentoForm.data_fim || createOrcamentoMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-green-600"
                      >
                        {createOrcamentoMutation.isPending ? "Salvando..." : "Salvar Orçamento"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {orcamentos.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Nenhum orçamento cadastrado</p>
                  <Button
                    onClick={() => setShowOrcamentoDialog(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Orçamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orcamentos.map((orc) => (
                    <Card key={orc.id} className="border-2 border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900">{orc.canal_nome}</h3>
                              <Badge className="bg-green-600 text-white">
                                R$ {orc.valor_gasto?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(new Date(orc.data_inicio), "dd/MM/yyyy", { locale: ptBR })} até {format(new Date(orc.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                            {orc.detalhamento && (
                              <p className="text-sm text-slate-600 mt-3 p-3 bg-slate-50 rounded-lg">
                                {orc.detalhamento}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: ADICIONAR MÉTRICAS */}
        <TabsContent value="metricas">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Adicionar Métricas Diárias</CardTitle>
                  <p className="text-slate-600 mt-2">Registre as métricas de vendas por canal</p>
                </div>
                <Dialog open={showMetricaDialog} onOpenChange={setShowMetricaDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Métrica
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Métricas do Dia</DialogTitle>
                      <DialogDescription>
                        Registre as métricas de vendas do dia por canal
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vendedor *</Label>
                          <Input
                            placeholder="Nome do vendedor"
                            value={metricaForm.vendedor_nome}
                            onChange={(e) => setMetricaForm({...metricaForm, vendedor_nome: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Data *</Label>
                          <Input
                            type="date"
                            value={metricaForm.data_registro}
                            onChange={(e) => setMetricaForm({...metricaForm, data_registro: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Canal de Origem do Lead *</Label>
                        <Select value={metricaForm.canal_id} onValueChange={(value) => setMetricaForm({...metricaForm, canal_id: value})}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecione o canal" />
                          </SelectTrigger>
                          <SelectContent>
                            {canais.map((canal) => (
                              <SelectItem key={canal.id} value={canal.id}>{canal.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Tipo de Funil *</Label>
                        <Select
                          value={tipoFunil}
                          onValueChange={(value) => {
                            setTipoFunil(value);
                            setMetricaForm({...metricaForm, tipo_funil: value});
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="padrao">Funil Padrão</SelectItem>
                            <SelectItem value="ligacoes">Funil de Ligações</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {tipoFunil === "padrao" ? (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-3">Funil Padrão</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Leads</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_padrao.leads}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_padrao: {...metricaForm.funil_padrao, leads: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Conexões</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_padrao.conexoes}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_padrao: {...metricaForm.funil_padrao, conexoes: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reuniões Agendadas</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_padrao.reunioes_agendadas}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_padrao: {...metricaForm.funil_padrao, reunioes_agendadas: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reuniões Realizadas</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_padrao.reunioes_realizadas}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_padrao: {...metricaForm.funil_padrao, reunioes_realizadas: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Vendas</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_padrao.vendas}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_padrao: {...metricaForm.funil_padrao, vendas: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Indicações</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_padrao.indicacoes}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_padrao: {...metricaForm.funil_padrao, indicacoes: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Funil de Ligações
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Leads</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.leads}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, leads: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Ligações Feitas</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.ligacoes_feitas}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, ligacoes_feitas: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Faladas</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.faladas}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, faladas: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Conexões</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.conexoes}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, conexoes: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Fechamentos</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.fechamentos}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, fechamentos: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Vendas</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.vendas}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, vendas: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Indicações</Label>
                              <Input
                                type="number"
                                value={metricaForm.funil_ligacoes.indicacoes}
                                onChange={(e) => setMetricaForm({
                                  ...metricaForm,
                                  funil_ligacoes: {...metricaForm.funil_ligacoes, indicacoes: parseInt(e.target.value) || 0}
                                })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Observações</Label>
                        <Textarea
                          placeholder="Observações sobre o dia..."
                          value={metricaForm.observacoes}
                          onChange={(e) => setMetricaForm({...metricaForm, observacoes: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowMetricaDialog(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => createMetricaMutation.mutate(metricaForm)}
                        disabled={!metricaForm.vendedor_nome || !metricaForm.canal_id || createMetricaMutation.isPending}
                        className="bg-gradient-to-r from-purple-500 to-purple-600"
                      >
                        {createMetricaMutation.isPending ? "Salvando..." : "Salvar Métrica"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {metricas.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Nenhuma métrica registrada</p>
                  <Button
                    onClick={() => setShowMetricaDialog(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeira Métrica
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {metricas.map((metrica) => (
                    <Card key={metrica.id} className="border-2 border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900">{metrica.vendedor_nome}</h3>
                              <Badge>{metrica.canal_nome}</Badge>
                              <Badge variant="outline">
                                {metrica.tipo_funil === 'padrao' ? 'Funil Padrão' : 'Funil de Ligações'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(metrica.data_registro), "dd/MM/yyyy", { locale: ptBR })}
                            </div>

                            {metrica.tipo_funil === 'padrao' ? (
                              <div className="grid grid-cols-6 gap-3">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-700 mb-1">Leads</p>
                                  <p className="text-xl font-bold text-blue-900">{metrica.funil_padrao?.leads || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                                  <p className="text-xs text-cyan-700 mb-1">Conexões</p>
                                  <p className="text-xl font-bold text-cyan-900">{metrica.funil_padrao?.conexoes || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                  <p className="text-xs text-purple-700 mb-1">Reun. Agend.</p>
                                  <p className="text-xl font-bold text-purple-900">{metrica.funil_padrao?.reunioes_agendadas || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                  <p className="text-xs text-indigo-700 mb-1">Reun. Real.</p>
                                  <p className="text-xl font-bold text-indigo-900">{metrica.funil_padrao?.reunioes_realizadas || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-xs text-green-700 mb-1">Vendas</p>
                                  <p className="text-xl font-bold text-green-900">{metrica.funil_padrao?.vendas || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-amber-50 rounded-lg">
                                  <p className="text-xs text-amber-700 mb-1">Indicações</p>
                                  <p className="text-xl font-bold text-amber-900">{metrica.funil_padrao?.indicacoes || 0}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-7 gap-3">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-700 mb-1">Leads</p>
                                  <p className="text-xl font-bold text-blue-900">{metrica.funil_ligacoes?.leads || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                                  <p className="text-xs text-cyan-700 mb-1">Ligações</p>
                                  <p className="text-xl font-bold text-cyan-900">{metrica.funil_ligacoes?.ligacoes_feitas || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                  <p className="text-xs text-purple-700 mb-1">Faladas</p>
                                  <p className="text-xl font-bold text-purple-900">{metrica.funil_ligacoes?.faladas || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                  <p className="text-xs text-indigo-700 mb-1">Conexões</p>
                                  <p className="text-xl font-bold text-indigo-900">{metrica.funil_ligacoes?.conexoes || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-pink-50 rounded-lg">
                                  <p className="text-xs text-pink-700 mb-1">Fecham.</p>
                                  <p className="text-xl font-bold text-pink-900">{metrica.funil_ligacoes?.fechamentos || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-xs text-green-700 mb-1">Vendas</p>
                                  <p className="text-xl font-bold text-green-900">{metrica.funil_ligacoes?.vendas || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-amber-50 rounded-lg">
                                  <p className="text-xs text-amber-700 mb-1">Indic.</p>
                                  <p className="text-xl font-bold text-amber-900">{metrica.funil_ligacoes?.indicacoes || 0}</p>
                                </div>
                              </div>
                            )}

                            {metrica.observacoes && (
                              <p className="text-sm text-slate-600 mt-3 p-3 bg-slate-50 rounded-lg">
                                {metrica.observacoes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: ANÁLISES */}
        <TabsContent value="analises">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Dashboard de Análises
              </CardTitle>
              <p className="text-slate-600 mt-2">Análises avançadas e insights</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <BarChart3 className="w-24 h-24 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Dashboard em Desenvolvimento</h3>
                <p className="text-slate-600 mb-4">
                  Aqui você terá acesso a gráficos e análises avançadas sobre:<br/>
                  • ROI por canal<br/>
                  • Conversão por etapa do funil<br/>
                  • Performance por vendedor<br/>
                  • Análise de tendências<br/>
                  • Comparativo entre períodos
                </p>
                <Badge className="bg-purple-600 text-white text-base px-4 py-2">
                  Em breve
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}