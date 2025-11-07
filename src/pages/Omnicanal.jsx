
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Mail,
  MessageSquare,
  Smartphone,
  Phone,
  MessageCircle,
  Video,
  Radio,
  Calendar,
  Smile,
  Meh,
  Frown,
  Award,
  Target,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, FunnelChart, Funnel, LabelList } from "recharts";

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  rcs: Radio,
  telefone: Phone,
  chat: MessageCircle,
  video: Video
};

const channelColors = {
  email: "#3B82F6",
  sms: "#10B981",
  whatsapp: "#10B981",
  rcs: "#8B5CF6",
  telefone: "#06B6D4",
  chat: "#F59E0B",
  video: "#EF4444"
};

const sentimentIcons = {
  feliz: { icon: Smile, color: "bg-green-100 text-green-700" },
  calmo: { icon: Meh, color: "bg-blue-100 text-blue-700" },
  insatisfeito: { icon: Frown, color: "bg-red-100 text-red-700" },
  neutro: { icon: Meh, color: "bg-slate-100 text-slate-700" }
};

export default function Omnicanal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: [],
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions'],
    queryFn: () => base44.entities.Interaction.list('-interaction_date'),
    initialData: [],
  });

  // Calcular estatísticas por canal
  const channelStats = Object.keys(channelIcons).map(channel => {
    const channelInteractions = interactions.filter(i => i.channel === channel);
    const conversions = channelInteractions.filter(i => i.converted).length;
    const conversionRate = channelInteractions.length > 0
      ? (conversions / channelInteractions.length) * 100
      : 0;

    return {
      channel,
      total: channelInteractions.length,
      conversions,
      conversionRate: conversionRate.toFixed(1)
    };
  }).sort((a, b) => b.conversionRate - a.conversionRate);

  // Dados para o funil de conversão por canal
  const funnelDataCanais = channelStats.map((stat, index) => ({
    name: stat.channel.toUpperCase(),
    value: parseFloat(stat.conversionRate),
    fill: channelColors[stat.channel] || '#94A3B8'
  }));

  // Dados para o funil de clientes
  const totalClientes = contacts.length;
  const clientesReceberam = contacts.filter(c => c.total_interactions > 0).length;
  const clientesResponderam = contacts.filter(c => c.total_interactions > 2).length; // Considerando que 2+ interações = respondeu
  const nuncaReceberam = totalClientes - clientesReceberam;

  const funnelDataClientes = [
    { name: 'Total de Clientes', value: totalClientes, fill: '#06B6D4' },
    { name: 'Receberam Mensagens', value: clientesReceberam, fill: '#10B981' },
    { name: 'Responderam', value: clientesResponderam, fill: '#8B5CF6' },
    { name: 'Nunca Receberam', value: nuncaReceberam, fill: '#EF4444' }
  ];

  // Filtrar contatos por busca
  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar por nível de engajamento
  const highEngagement = filteredContacts.filter(c => c.engagement_level === "alto");
  const lowEngagement = filteredContacts.filter(c => c.engagement_level === "baixo");

  // Interações do contato selecionado
  const contactInteractions = selectedContact
    ? interactions.filter(i => i.contact_id === selectedContact.id)
    : [];

  // Dados para o gráfico de pizza do índice de sucesso
  const successData = selectedContact ? [
    { name: 'Sucesso', value: selectedContact.success_rate || 0 },
    { name: 'Restante', value: 100 - (selectedContact.success_rate || 0) }
  ] : [];

  const COLORS = ['#10B981', '#E5E7EB'];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1800px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Omnicanal</h1>
        <p className="text-slate-600 text-lg">Visão 360º de engajamento e conversão</p>
      </motion.div>

      <Tabs defaultValue="ranking" className="space-y-6">
        <TabsList className="bg-slate-100 p-2 rounded-xl">
          <TabsTrigger value="ranking" className="px-6">Ranking de Canais</TabsTrigger>
          <TabsTrigger value="engajamento" className="px-6">Engajamento</TabsTrigger>
          <TabsTrigger value="contatos" className="px-6">Visão 360º</TabsTrigger>
        </TabsList>

        {/* RANKING DE CANAIS */}
        <TabsContent value="ranking" className="space-y-6">
          {/* Funis lado a lado */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Funil de Conversão por Canal */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600" />
                  Funil de Conversão por Canal
                </CardTitle>
                <p className="text-slate-600 mt-2">Taxa de conversão por canal de comunicação</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Funnel
                      dataKey="value"
                      data={funnelDataCanais}
                      isAnimationActive
                    >
                      <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="value" formatter={(value) => `${value}%`} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>

                {/* Legenda detalhada */}
                <div className="mt-6 space-y-3">
                  {funnelDataCanais.map((item, index) => {
                    const Icon = channelIcons[item.name.toLowerCase()];
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.fill}20` }}>
                            {Icon && <Icon className="w-5 h-5" style={{ color: item.fill }} />}
                          </div>
                          <span className="font-semibold text-slate-900 capitalize">{item.name}</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">{item.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Funil de Status dos Clientes */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-600" />
                  Funil de Clientes
                </CardTitle>
                <p className="text-slate-600 mt-2">Status de recebimento e resposta dos clientes</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip
                      formatter={(value) => `${value} clientes`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Funnel
                      dataKey="value"
                      data={funnelDataClientes}
                      isAnimationActive
                    >
                      <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>

                {/* Estatísticas detalhadas */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-semibold text-cyan-900">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-900">{totalClientes}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Receberam</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{clientesReceberam}</p>
                    <p className="text-xs text-green-700 mt-1">
                      {totalClientes > 0 ? ((clientesReceberam / totalClientes) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Responderam</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{clientesResponderam}</p>
                    <p className="text-xs text-purple-700 mt-1">
                      {clientesReceberam > 0 ? ((clientesResponderam / clientesReceberam) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-900">Nunca Receberam</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{nuncaReceberam}</p>
                    <p className="text-xs text-red-700 mt-1">
                      {totalClientes > 0 ? ((nuncaReceberam / totalClientes) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking de Canais - Lista */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-600" />
                Ranking Detalhado de Conversão por Canal
              </CardTitle>
              <p className="text-slate-600 mt-2">Canais ordenados por índice de conversão</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelStats.map((stat, index) => {
                  const Icon = channelIcons[stat.channel];
                  return (
                    <motion.div
                      key={stat.channel}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-r from-slate-50 to-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${channelColors[stat.channel]}20` }}>
                            <Icon className="w-6 h-6" style={{ color: channelColors[stat.channel] }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 capitalize">{stat.channel}</h3>
                            <p className="text-sm text-slate-600">{stat.total} interações totais</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-slate-900">{stat.conversionRate}%</div>
                          <p className="text-sm text-slate-600">{stat.conversions} conversões</p>
                        </div>
                      </div>
                      <Progress value={parseFloat(stat.conversionRate)} className="h-3" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Gráfico de barras */}
              <div className="mt-8 p-6 bg-slate-50 rounded-xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Comparativo de Conversões</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelStats}>
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#94A3B8" name="Total Interações" />
                    <Bar dataKey="conversions" fill="#10B981" name="Conversões" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ENGAJAMENTO */}
        <TabsContent value="engajamento" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Alto Engajamento */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Alto Engajamento ({highEngagement.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {highEngagement.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.avatar_url} />
                        <AvatarFallback className="bg-green-200 text-green-700 font-bold">
                          {contact.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{contact.name}</h4>
                        <p className="text-sm text-slate-600">{contact.total_interactions} interações</p>
                      </div>
                      <Badge className="bg-green-600 text-white">{contact.success_rate}%</Badge>
                    </div>
                  </motion.div>
                ))}
                {highEngagement.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Nenhum contato com alto engajamento</p>
                )}
              </CardContent>
            </Card>

            {/* Baixo Engajamento */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Baixo Engajamento ({lowEngagement.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {lowEngagement.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-400 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.avatar_url} />
                        <AvatarFallback className="bg-red-200 text-red-700 font-bold">
                          {contact.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{contact.name}</h4>
                        <p className="text-sm text-slate-600">{contact.total_interactions} interações</p>
                      </div>
                      <Badge className="bg-red-600 text-white">{contact.success_rate}%</Badge>
                    </div>
                  </motion.div>
                ))}
                {lowEngagement.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Nenhum contato com baixo engajamento</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* VISÃO 360º */}
        <TabsContent value="contatos" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lista de Contatos */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">Buscar Contato</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Digite o nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[700px] overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedContact?.id === contact.id
                        ? 'bg-cyan-50 border-cyan-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar_url} />
                        <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">
                          {contact.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{contact.name}</h4>
                        <p className="text-xs text-slate-600">{contact.email || contact.phone}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Detalhes do Contato */}
            {selectedContact ? (
              <div className="lg:col-span-2 space-y-6">
                {/* Header com foto e stats */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <Avatar className="w-32 h-32 border-4 border-cyan-500">
                        <AvatarImage src={selectedContact.avatar_url} />
                        <AvatarFallback className="bg-cyan-200 text-cyan-700 text-4xl font-bold">
                          {selectedContact.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedContact.name}</h2>
                        <p className="text-slate-600">{selectedContact.email || selectedContact.phone}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                      {/* Total de Interações */}
                      <div className="p-6 bg-slate-50 rounded-xl text-center">
                        <p className="text-sm font-semibold text-slate-600 mb-2">Total de interações</p>
                        <p className="text-4xl font-bold text-slate-900">{selectedContact.total_interactions}</p>
                      </div>

                      {/* Melhor Canal */}
                      <div className="p-6 bg-slate-50 rounded-xl">
                        <p className="text-sm font-semibold text-slate-600 mb-3 text-center">Melhor canal</p>
                        <div className="space-y-2">
                          {Object.entries(selectedContact.channel_stats || {})
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([channel, count]) => {
                              const Icon = channelIcons[channel];
                              const percentage = (count / selectedContact.total_interactions) * 100;
                              return (
                                <div key={channel} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                      <Icon className="w-3 h-3" style={{ color: channelColors[channel] }} />
                                      <span className="capitalize">{channel}</span>
                                    </div>
                                    <span className="font-semibold">{count}</span>
                                  </div>
                                  <Progress value={percentage} className="h-1" />
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Índice de Sucesso */}
                      <div className="p-6 bg-slate-50 rounded-xl">
                        <p className="text-sm font-semibold text-slate-600 mb-2 text-center">Índice de sucesso</p>
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie
                              data={successData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={40}
                              dataKey="value"
                            >
                              {successData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <p className="text-center text-2xl font-bold text-slate-900 -mt-2">
                          {selectedContact.success_rate}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Jornada do Contato */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl">Jornada de {selectedContact.name?.split(' ')[0]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-6">
                      {/* Timeline */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

                      {contactInteractions.map((interaction, index) => {
                        const Icon = channelIcons[interaction.channel];
                        const SentimentIcon = sentimentIcons[interaction.sentiment]?.icon || Meh;
                        const sentimentColor = sentimentIcons[interaction.sentiment]?.color || "bg-slate-100 text-slate-700";

                        return (
                          <motion.div
                            key={interaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-20"
                          >
                            <div
                              className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                              style={{ backgroundColor: channelColors[interaction.channel] }}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900">{interaction.type}</p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(interaction.interaction_date).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                    {interaction.description && ` - ${interaction.description}`}
                                  </p>
                                </div>
                                <Badge className={sentimentColor}>
                                  <SentimentIcon className="w-3 h-3 mr-1" />
                                  {interaction.sentiment}
                                </Badge>
                              </div>

                              {interaction.tags && interaction.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {interaction.tags.map((tag, i) => (
                                    <Badge key={i} variant="outline" className="bg-slate-700 text-white border-slate-600">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                      {contactInteractions.length === 0 && (
                        <p className="text-center text-slate-500 py-8">Nenhuma interação registrada</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Selecione um Contato</h3>
                  <p className="text-slate-600">Escolha um contato para ver sua jornada completa</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
