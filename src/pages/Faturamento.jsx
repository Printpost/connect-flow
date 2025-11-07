import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Calendar,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  faturamento_aberto: { 
    color: "bg-amber-100 text-amber-700 border-amber-200", 
    label: "Faturamento em Aberto",
    icon: Clock
  },
  faturamento_validado: { 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    label: "Faturamento Validado",
    icon: CheckCircle2
  },
  em_aberto: { 
    color: "bg-orange-100 text-orange-700 border-orange-200", 
    label: "Em Aberto",
    icon: AlertCircle
  },
  pago: { 
    color: "bg-green-100 text-green-700 border-green-200", 
    label: "Pago",
    icon: CheckCircle2
  }
};

export default function Faturamento() {
  const queryClient = useQueryClient();
  const [selectedFatura, setSelectedFatura] = useState(null);
  const [detalhamentoOpen, setDetalhamentoOpen] = useState(false);
  const [aprovarItemId, setAprovarItemId] = useState(null);
  const [reprovarItemId, setReprovarItemId] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [tipoExtrato, setTipoExtrato] = useState("mensal");

  const { data: faturas = [] } = useQuery({
    queryKey: ['faturas'],
    queryFn: () => base44.entities.Fatura.list('-created_date'),
    initialData: [],
  });

  const { data: itensFatura = [] } = useQuery({
    queryKey: ['itens-fatura', selectedFatura?.id],
    queryFn: () => base44.entities.ItemFatura.filter({ fatura_id: selectedFatura?.id }),
    enabled: !!selectedFatura,
    initialData: [],
  });

  const aprovarItemMutation = useMutation({
    mutationFn: ({ id, observacao }) => base44.entities.ItemFatura.update(id, { 
      aprovado: true, 
      observacao_aprovacao: observacao 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-fatura'] });
      setAprovarItemId(null);
      setObservacao("");
    },
  });

  const reprovarItemMutation = useMutation({
    mutationFn: ({ id, observacao }) => base44.entities.ItemFatura.update(id, { 
      aprovado: false, 
      observacao_aprovacao: observacao 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-fatura'] });
      setReprovarItemId(null);
      setObservacao("");
    },
  });

  const handleDetalhamento = (fatura) => {
    setSelectedFatura(fatura);
    setDetalhamentoOpen(true);
  };

  const calcularTotais = () => {
    const totalGeral = faturas.reduce((acc, f) => acc + (f.valor_total || 0), 0);
    const totalPago = faturas.filter(f => f.status === "pago").reduce((acc, f) => acc + (f.valor_total || 0), 0);
    const totalAberto = faturas.filter(f => f.status === "em_aberto").reduce((acc, f) => acc + (f.valor_total || 0), 0);
    
    return { totalGeral, totalPago, totalAberto };
  };

  const totais = calcularTotais();

  // Dados em tempo real (simulados - você pode adaptar para dados reais)
  const dadosTempoReal = [
    { id: 1, campanha: "Black Friday 2024", data: new Date(), produto: "Email Marketing", quantidade: 15000, valor: 450.00, status: "processando" },
    { id: 2, campanha: "Lançamento Produto X", data: new Date(), produto: "WhatsApp", quantidade: 8000, valor: 320.00, status: "processando" },
    { id: 3, campanha: "Newsletter Semanal", data: new Date(), produto: "SMS", quantidade: 5000, valor: 150.00, status: "processando" }
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1800px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Faturamento</h1>
          <p className="text-slate-600 text-lg">Gerencie suas faturas e extrato de consumo</p>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">Total Faturado</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">
                R$ {totais.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-blue-700 mt-1">Todos os períodos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-900">Total Pago</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">
                R$ {totais.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-700 mt-1">Faturas quitadas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-orange-900">Total em Aberto</span>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-900">
                R$ {totais.totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-orange-700 mt-1">Aguardando pagamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Abas */}
        <Tabs defaultValue="mensal" className="space-y-6">
          <TabsList className="bg-slate-100 p-2 rounded-xl">
            <TabsTrigger value="mensal" className="px-6">Extrato Mensal</TabsTrigger>
            <TabsTrigger value="tempo-real" className="px-6">Consumo em Tempo Real</TabsTrigger>
          </TabsList>

          {/* EXTRATO MENSAL */}
          <TabsContent value="mensal" className="space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle>Faturas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Campanha</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Data Cadastro</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Nº Fatura</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Valor Total</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Nota Fiscal</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Boleto</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {faturas.map((fatura) => {
                        const status = statusConfig[fatura.status] || statusConfig.faturamento_aberto;
                        const StatusIcon = status.icon;
                        
                        return (
                          <tr key={fatura.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{fatura.campanha_nome}</div>
                              {fatura.mes_referencia && (
                                <div className="text-xs text-slate-500">Ref: {fatura.mes_referencia}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {fatura.data_cadastro ? format(new Date(fatura.data_cadastro), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`${status.color} border font-semibold flex items-center gap-1 w-fit`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-900">{fatura.numero_fatura}</td>
                            <td className="px-6 py-4">
                              <div className="text-lg font-bold text-slate-900">
                                R$ {fatura.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {fatura.nota_fiscal_url ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(fatura.nota_fiscal_url, '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  NF
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {fatura.boleto_url ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(fatura.boleto_url, '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Boleto
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDetalhamento(fatura)}
                                className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                              >
                                <Eye className="w-4 h-4" />
                                Detalhes
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {faturas.length === 0 && (
                    <div className="text-center py-12">
                      <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Nenhuma fatura encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONSUMO EM TEMPO REAL */}
          <TabsContent value="tempo-real" className="space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  Consumo em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Campanha</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Data/Hora</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Produto</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Quantidade</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Valor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dadosTempoReal.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{item.campanha}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {format(item.data, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">{item.produto}</td>
                          <td className="px-6 py-4 text-sm text-slate-900">{item.quantidade.toLocaleString('pt-BR')}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">
                              R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 w-fit">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              Processando
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog - Detalhamento */}
        <Dialog open={detalhamentoOpen} onOpenChange={setDetalhamentoOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                Detalhamento da Fatura {selectedFatura?.numero_fatura}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações da Fatura */}
              <Card className="border-2 border-slate-200">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500 uppercase">Campanha</Label>
                      <p className="font-semibold text-slate-900 mt-1">{selectedFatura?.campanha_nome}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 uppercase">Data Cadastro</Label>
                      <p className="font-semibold text-slate-900 mt-1">
                        {selectedFatura?.data_cadastro ? format(new Date(selectedFatura.data_cadastro), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 uppercase">Valor Total</Label>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        R$ {selectedFatura?.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Itens da Fatura */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Itens da Fatura</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Status
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data Campanha</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID Campanha</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Campanha</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Produto</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Quantidade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Valor Unit.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Valor Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {itensFatura.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            {item.aprovado === null ? (
                              <Badge className="bg-amber-100 text-amber-700">Pendente</Badge>
                            ) : item.aprovado ? (
                              <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                Aprovado
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" />
                                Reprovado
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.data_campanha ? format(new Date(item.data_campanha), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-slate-900">{item.campanha_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{item.campanha_nome}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{item.produto}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{item.quantidade.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            R$ {item.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">
                              R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.aprovado === null && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setAprovarItemId(item.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setReprovarItemId(item.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {item.aprovado !== null && item.observacao_aprovacao && (
                              <p className="text-xs text-slate-500 italic">{item.observacao_aprovacao}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {itensFatura.length === 0 && (
                    <div className="text-center py-8 bg-white border border-slate-200 rounded-b-lg">
                      <p className="text-slate-500">Nenhum item encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog - Aprovar Item */}
        <Dialog open={!!aprovarItemId} onOpenChange={() => setAprovarItemId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                Aprovar Item
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Observação (opcional)</Label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Adicione uma observação..."
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setAprovarItemId(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => aprovarItemMutation.mutate({ id: aprovarItemId, observacao })}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={aprovarItemMutation.isPending}
                >
                  {aprovarItemMutation.isPending ? "Aprovando..." : "Confirmar Aprovação"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog - Reprovar Item */}
        <Dialog open={!!reprovarItemId} onOpenChange={() => setReprovarItemId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Reprovar Item
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Motivo da Reprovação *</Label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Descreva o motivo da reprovação..."
                  className="mt-2"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setReprovarItemId(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => reprovarItemMutation.mutate({ id: reprovarItemId, observacao })}
                  variant="destructive"
                  disabled={reprovarItemMutation.isPending || !observacao.trim()}
                >
                  {reprovarItemMutation.isPending ? "Reprovando..." : "Confirmar Reprovação"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}