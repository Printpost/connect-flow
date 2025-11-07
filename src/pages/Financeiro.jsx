
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  AlertCircle,
  Settings,
  FileText,
  Wallet,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Award,
  Truck, // Added new import
  UserPlus, // Added new import
  Package // Added new import
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function Financeiro() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("mes_atual");

  // Queries
  const { data: contratos = [] } = useQuery({
    queryKey: ['contratos-saas'],
    queryFn: () => base44.entities.ContratoSaaS.list(),
    initialData: [],
  });

  const { data: faturas = [] } = useQuery({
    queryKey: ['faturas-recorrentes'],
    queryFn: () => base44.entities.FaturaRecorrente.list('-data_vencimento'),
    initialData: [],
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento'),
    initialData: [],
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-caixa'],
    queryFn: () => base44.entities.MovimentacaoCaixa.list('-data'),
    initialData: [],
  });

  // Cálculos de KPIs
  const kpis = useMemo(() => {
    const contratosAtivos = contratos.filter(c => c.status === 'ativo');
    
    const mrr = contratosAtivos.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const arr = mrr * 12;
    const ticketMedio = contratosAtivos.length > 0 ? mrr / contratosAtivos.length : 0;

    const faturasVencidas = faturas.filter(f => f.status === 'atrasado').length;
    const taxaInadimplencia = faturas.length > 0 ? (faturasVencidas / faturas.length) * 100 : 0;

    const receitaMes = faturas
      .filter(f => f.status === 'pago')
      .reduce((sum, f) => sum + (f.valor_total || 0), 0);

    const despesasMes = contasPagar
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + (c.valor || 0), 0);

    const margemBruta = receitaMes > 0 ? ((receitaMes - despesasMes) / receitaMes) * 100 : 0;

    // MRR Movement
    const mesAtual = new Date().getMonth();
    const contratosNovos = contratos.filter(c => {
      const dataInicio = new Date(c.data_inicio);
      return dataInicio.getMonth() === mesAtual && c.status === 'ativo';
    });
    const novoMRR = contratosNovos.reduce((sum, c) => sum + (c.mrr || 0), 0);

    const contratosCancelados = contratos.filter(c => {
      if (!c.data_cancelamento) return false;
      const dataCancelamento = new Date(c.data_cancelamento);
      return dataCancelamento.getMonth() === mesAtual;
    });
    const churnMRR = contratosCancelados.reduce((sum, c) => sum + (c.mrr || 0), 0);

    const taxaChurn = mrr > 0 ? (churnMRR / (mrr + churnMRR)) * 100 : 0;

    // CAC e LTV simplificados
    const despesasMarketing = contasPagar
      .filter(c => c.categoria === 'marketing')
      .reduce((sum, c) => sum + (c.valor || 0), 0);
    
    const cac = contratosNovos.length > 0 ? despesasMarketing / contratosNovos.length : 0;
    const ltv = ticketMedio * 24; // Assumindo 24 meses de lifetime
    const payback = cac > 0 && ticketMedio > 0 ? cac / ticketMedio : 0;

    return {
      mrr,
      arr,
      ticketMedio,
      totalClientes: contratosAtivos.length,
      novoMRR,
      churnMRR,
      taxaChurn,
      receitaMes,
      despesasMes,
      margemBruta,
      taxaInadimplencia,
      cac,
      ltv,
      payback,
      ratioLTVCAC: cac > 0 ? ltv / cac : 0
    };
  }, [contratos, faturas, contasPagar]);

  // Dados para gráficos
  const mrrEvolution = useMemo(() => {
    const ultimosMeses = [];
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(new Date(), i);
      const mesAno = format(data, 'MM/yyyy');
      
      const contratosMes = contratos.filter(c => {
        const inicio = new Date(c.data_inicio);
        return inicio <= data && (!c.data_cancelamento || new Date(c.data_cancelamento) > data);
      });
      
      const mrrMes = contratosMes.reduce((sum, c) => sum + (c.mrr || 0), 0);
      
      ultimosMeses.push({
        mes: format(data, 'MMM/yy', { locale: ptBR }),
        mrr: mrrMes,
        clientes: contratosMes.length
      });
    }
    return ultimosMeses;
  }, [contratos]);

  const receitaDespesa = useMemo(() => {
    const ultimosMeses = [];
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(new Date(), i);
      const mesAno = format(data, 'MM/yyyy');
      
      const receitaMes = faturas
        .filter(f => f.competencia === mesAno && f.status === 'pago')
        .reduce((sum, f) => sum + (f.valor_total || 0), 0);
      
      const despesaMes = contasPagar
        .filter(c => {
          const venc = new Date(c.data_vencimento);
          return venc.getMonth() === data.getMonth() && venc.getFullYear() === data.getFullYear() && c.status === 'pago';
        })
        .reduce((sum, c) => sum + (c.valor || 0), 0);
      
      ultimosMeses.push({
        mes: format(data, 'MMM/yy', { locale: ptBR }),
        receita: receitaMes,
        despesa: despesaMes,
        lucro: receitaMes - despesaMes
      });
    }
    return ultimosMeses;
  }, [faturas, contasPagar]);

  const despesasPorCategoria = useMemo(() => {
    const categorias = {};
    contasPagar
      .filter(c => c.status === 'pago')
      .forEach(conta => {
        const cat = conta.categoria || 'outro';
        categorias[cat] = (categorias[cat] || 0) + (conta.valor || 0);
      });
    
    return Object.entries(categorias).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toUpperCase(),
      value
    }));
  }, [contasPagar]);

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

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Financeiro</h1>
            <p className="text-slate-600 text-lg">Gestão financeira, fornecedores, comissionados e produtos</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("ConfiguracoesFinanceiras"))}
            variant="outline"
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
        </div>
      </motion.div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-cyan-900 uppercase tracking-wider">MRR</span>
                <TrendingUp className="w-4 h-4 text-cyan-600" />
              </div>
              <p className="text-3xl font-bold text-cyan-900">
                R$ {(kpis.mrr / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-cyan-700 mt-1">
                +{kpis.novoMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} novo
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-900 uppercase tracking-wider">ARR</span>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                R$ {(kpis.arr / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Receita anual projetada
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-900 uppercase tracking-wider">Clientes</span>
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">
                {kpis.totalClientes}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Ticket: {kpis.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-amber-900 uppercase tracking-wider">Churn</span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-900">
                {kpis.taxaChurn.toFixed(1)}%
              </p>
              <p className="text-xs text-amber-700 mt-1">
                -{kpis.churnMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} MRR
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900 uppercase tracking-wider">LTV/CAC</span>
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {kpis.ratioLTVCAC.toFixed(1)}x
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Payback: {kpis.payback.toFixed(1)} meses
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={`border-0 shadow-lg ${kpis.taxaInadimplencia > 5 ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${kpis.taxaInadimplencia > 5 ? 'text-red-900' : 'text-slate-900'} uppercase tracking-wider`}>Inadimpl.</span>
                <AlertCircle className={`w-4 h-4 ${kpis.taxaInadimplencia > 5 ? 'text-red-600' : 'text-slate-600'}`} />
              </div>
              <p className={`text-3xl font-bold ${kpis.taxaInadimplencia > 5 ? 'text-red-900' : 'text-slate-900'}`}>
                {kpis.taxaInadimplencia.toFixed(1)}%
              </p>
              <p className={`text-xs ${kpis.taxaInadimplencia > 5 ? 'text-red-700' : 'text-slate-700'} mt-1`}>
                {faturas.filter(f => f.status === 'atrasado').length} faturas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-slate-100 p-2 rounded-xl">
          <TabsTrigger value="dashboard" className="px-6">Dashboard</TabsTrigger>
          <TabsTrigger value="receitas" className="px-6">Receitas</TabsTrigger>
          <TabsTrigger value="fornecedores" className="px-6">Fornecedores</TabsTrigger> {/* Added */}
          <TabsTrigger value="comissionados" className="px-6">Comissionados</TabsTrigger> {/* Added */}
          <TabsTrigger value="produtos" className="px-6">Produtos</TabsTrigger> {/* Added */}
          <TabsTrigger value="custos" className="px-6">Custos</TabsTrigger>
          <TabsTrigger value="tesouraria" className="px-6">Tesouraria</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Evolução MRR */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  Evolução do MRR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mrrEvolution}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Area type="monotone" dataKey="mrr" stroke="#06B6D4" fillOpacity={1} fill="url(#colorMrr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Receita vs Despesa */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Receita vs Despesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={receitaDespesa}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="receita" fill="#10B981" name="Receita" />
                    <Bar dataKey="despesa" fill="#EF4444" name="Despesa" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Despesas por Categoria */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={despesasPorCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {despesasPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {despesasPorCategoria.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        <span className="text-lg font-bold text-slate-900">
                          {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(item.value / despesasPorCategoria.reduce((sum, d) => sum + d.value, 0)) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Economics */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4">CAC (Customer Acquisition Cost)</h3>
                <p className="text-4xl font-bold text-blue-900 mb-2">
                  {kpis.cac.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-sm text-blue-700">
                  Custo para adquirir 1 cliente
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wider mb-4">LTV (Lifetime Value)</h3>
                <p className="text-4xl font-bold text-green-900 mb-2">
                  {kpis.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-sm text-green-700">
                  Valor médio do cliente
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wider mb-4">Margem Bruta</h3>
                <p className="text-4xl font-bold text-purple-900 mb-2">
                  {kpis.margemBruta.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-700">
                  (Receita - Custos) / Receita
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RECEITAS */}
        <TabsContent value="receitas">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Gestão de Receitas</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(createPageUrl("GerenciarProdutosSaaS"))}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Produtos
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("GerenciarPlanos"))}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Planos
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("GerenciarContratos"))}
                  className="bg-gradient-to-r from-green-500 to-green-600 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Contrato
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle>Contratos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contratos.filter(c => c.status === 'ativo').slice(0, 10).map((contrato) => (
                    <div key={contrato.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{contrato.cliente_nome}</h4>
                        <p className="text-sm text-slate-600">{contrato.plano_nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-900">
                          {contrato.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                        </p>
                        <p className="text-xs text-slate-600">
                          Renovação: {format(new Date(contrato.data_renovacao), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}

                  {contratos.filter(c => c.status === 'ativo').length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Nenhum contrato ativo</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FORNECEDORES */}
        <TabsContent value="fornecedores">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Gerenciar Fornecedores</h2>
            <Button
              onClick={() => navigate(createPageUrl("GerenciarFornecedores"))}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Acessar Gestão de Fornecedores
            </Button>
          </div>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestão de Fornecedores</h3>
              <p className="text-slate-600 mb-4">
                Cadastre e gerencie fornecedores com controle de preços, volumetria e contatos
              </p>
              <Button
                onClick={() => navigate(createPageUrl("GerenciarFornecedores"))}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600"
              >
                Ir para Fornecedores
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMISSIONADOS */}
        <TabsContent value="comissionados">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Gerenciar Comissionados</h2>
            <Button
              onClick={() => navigate(createPageUrl("GerenciarVendedores"))}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Acessar Gestão de Comissionados
            </Button>
          </div>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestão de Comissionados</h3>
              <p className="text-slate-600 mb-4">
                Gerencie vendedores e toda equipe comissionada com estrutura de percentuais
              </p>
              <Button
                onClick={() => navigate(createPageUrl("GerenciarVendedores"))}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                Ir para Comissionados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUTOS */}
        <TabsContent value="produtos">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Gerenciar Produtos</h2>
            <Button
              onClick={() => navigate(createPageUrl("GerenciarProdutos"))}
              className="bg-gradient-to-r from-purple-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Acessar Gestão de Produtos
            </Button>
          </div>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestão de Produtos</h3>
              <p className="text-slate-600 mb-4">
                Cadastre e gerencie produtos, serviços e margem de negociação
              </p>
              <Button
                onClick={() => navigate(createPageUrl("GerenciarProdutos"))}
                className="bg-gradient-to-r from-purple-500 to-purple-600"
              >
                Ir para Produtos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOS */}
        <TabsContent value="custos">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Custos e Despesas</h2>
              <Button
                onClick={() => navigate(createPageUrl("GerenciarContasPagar"))}
                className="bg-gradient-to-r from-red-500 to-red-600 gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Despesa
              </Button>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle>Contas a Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contasPagar.slice(0, 10).map((conta) => {
                    const vencida = new Date(conta.data_vencimento) < new Date() && conta.status !== 'pago';
                    return (
                      <div key={conta.id} className={`p-4 rounded-lg flex items-center justify-between ${
                        vencida ? 'bg-red-50 border-2 border-red-200' : 'bg-slate-50'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{conta.fornecedor_nome}</h4>
                            <Badge variant="outline" className={
                              conta.status === 'pago' ? 'bg-green-100 text-green-800 border-green-300' :
                              vencida ? 'bg-red-100 text-red-800 border-red-300' :
                              'bg-amber-100 text-amber-800 border-amber-300'
                            }>
                              {conta.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{conta.descricao}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {conta.categoria?.replace(/_/g, ' ')} • Venc: {format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${vencida ? 'text-red-900' : 'text-slate-900'}`}>
                            {conta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {contasPagar.length === 0 && (
                    <div className="text-center py-12">
                      <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Nenhuma conta a pagar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TESOURARIA */}
        <TabsContent value="tesouraria">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Tesouraria</h2>
              <Button
                onClick={() => navigate(createPageUrl("FluxoCaixa"))}
                variant="outline"
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Ver Fluxo de Caixa
              </Button>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle>Movimentações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {movimentacoes.slice(0, 15).map((mov) => (
                    <div key={mov.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          mov.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {mov.tipo === 'entrada' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{mov.descricao}</h4>
                          <p className="text-sm text-slate-600">
                            {mov.categoria?.replace(/_/g, ' ')} • {format(new Date(mov.data), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${mov.tipo === 'entrada' ? 'text-green-900' : 'text-red-900'}`}>
                        {mov.tipo === 'entrada' ? '+' : '-'} {mov.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  ))}

                  {movimentacoes.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Nenhuma movimentação registrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
