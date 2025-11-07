import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Mail,
  Smartphone,
  Phone,
  MoreVertical,
  Circle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const channelIcons = {
  whatsapp: Smartphone,
  email: Mail,
  sms: MessageSquare,
  chat: MessageSquare,
  telefone: Phone
};

const statusConfig = {
  "em andamento": { color: "bg-blue-100 text-blue-700 border-blue-200", label: "em andamento" },
  "aberta": { color: "bg-amber-100 text-amber-700 border-amber-200", label: "aberta" },
  "resolvida": { color: "bg-green-100 text-green-700 border-green-200", label: "resolvida" },
  "fechada": { color: "bg-slate-100 text-slate-700 border-slate-200", label: "fechada" }
};

export default function Inbox() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [channelFilter, setChannelFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-last_message_date'),
    initialData: [],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation 
      ? base44.entities.Message.filter({ conversation_id: selectedConversation.id }, 'sent_date')
      : Promise.resolve([]),
    enabled: !!selectedConversation,
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.Message.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText("");
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    await sendMessageMutation.mutateAsync({
      conversation_id: selectedConversation.id,
      sender: "agente",
      content: messageText,
      sent_date: new Date().toISOString(),
      read: true
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === "todos" || conv.channel === channelFilter;
    const matchesStatus = statusFilter === "todos" || conv.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) return "hoje";
    if (diffInDays === 1) return "ontem";
    if (diffInDays < 7) return `há ${diffInDays} dias`;
    if (diffInDays < 30) return `há ${Math.floor(diffInDays / 7)} semanas`;
    return `há cerca de ${Math.floor(diffInDays / 30)} mês${Math.floor(diffInDays / 30) > 1 ? 'es' : ''}`;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Inbox</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex gap-2">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="flex-1 bg-slate-50">
                <SelectValue placeholder="Todos os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 bg-slate-50">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="em andamento">Em andamento</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="resolvida">Resolvida</SelectItem>
                <SelectItem value="fechada">Fechada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const Icon = channelIcons[conv.channel];
            const status = statusConfig[conv.status];
            const isSelected = selectedConversation?.id === conv.id;

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors relative ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                {conv.unread && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={conv.contact_avatar} />
                    <AvatarFallback className="bg-purple-500 text-white font-bold">
                      {conv.contact_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{conv.contact_name}</h3>
                      <Icon className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      {getRelativeTime(conv.last_message_date)}
                    </p>
                    <p className="text-sm text-slate-700 truncate mb-2">{conv.subject}</p>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${status.color} text-xs border`}>
                        {status.label}
                      </Badge>
                      <span className="text-xs text-slate-500">{conv.message_count} msgs</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Área Principal - Mensagens */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header da Conversa */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedConversation.contact_avatar} />
                    <AvatarFallback className="bg-purple-500 text-white font-bold">
                      {selectedConversation.contact_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                      {selectedConversation.contact_name}
                      {selectedConversation.channel === 'whatsapp' && (
                        <Smartphone className="w-4 h-4 text-green-500" />
                      )}
                    </h2>
                    <p className="text-sm text-slate-600 uppercase tracking-wide">
                      {selectedConversation.channel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${statusConfig[selectedConversation.status].color} border`}>
                    {statusConfig[selectedConversation.status].label}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    Criada há {getRelativeTime(selectedConversation.last_message_date)}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-slate-900">{selectedConversation.subject}</h3>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isAgent = message.sender === "agente";
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isAgent ? 'order-2' : 'order-1'}`}>
                            <div className={`p-4 rounded-2xl ${
                              isAgent 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-white text-slate-900 rounded-bl-none shadow-sm'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs text-slate-500 mt-1 ${isAgent ? 'text-right' : 'text-left'}`}>
                              {format(new Date(message.sent_date), "HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Input de Mensagem */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-3">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[60px]"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="w-4 h-4 text-slate-500" />
                      </Button>
                      <span className="text-xs text-slate-400 ml-auto">
                        Enter para enviar • Shift+Enter para nova linha
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600 h-auto py-4 px-6 rounded-xl"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Selecione uma conversa</h3>
              <p className="text-slate-500">Escolha uma conversa da lista para visualizar as mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}