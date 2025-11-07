import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  DollarSign,
  TrendingUp,
  ChevronDown,
  BookOpen,
  Search,
  ExternalLink
} from "lucide-react";

const departments = [
  {
    id: "suporte",
    name: "Suporte Técnico",
    icon: Headphones,
    color: "from-blue-500 to-blue-600",
    avatar: "S",
    status: "online"
  },
  {
    id: "financeiro",
    name: "Financeiro",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
    avatar: "F",
    status: "online"
  },
  {
    id: "vendas",
    name: "Vendas",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600",
    avatar: "V",
    status: "online"
  },
  {
    id: "tutoriais",
    name: "Tutoriais",
    icon: BookOpen,
    color: "from-orange-500 to-orange-600",
    avatar: "T",
    status: "online"
  }
];

// Base de conhecimento de tutoriais
const tutoriais = [
  {
    id: 1,
    titulo: "Como criar uma campanha?",
    descricao: "Aprenda a criar sua primeira campanha multicanal passo a passo",
    palavrasChave: ["criar", "campanha", "nova", "enviar", "mensagem"],
    conteudo: "Para criar uma campanha:\n1. Clique em 'Nova Campanha' no menu\n2. Escolha o tipo de envio (Campanha, Automação ou Envio Rápido)\n3. Preencha as informações básicas\n4. Selecione os canais desejados (Email, SMS, WhatsApp, etc.)\n5. Adicione os destinatários\n6. Crie o conteúdo\n7. Revise e agende ou envie imediatamente"
  },
  {
    id: 2,
    titulo: "Como adicionar destinatários?",
    descricao: "Saiba como importar ou adicionar contatos às suas campanhas",
    palavrasChave: ["destinatários", "contatos", "importar", "excel", "csv", "lista"],
    conteudo: "Você pode adicionar destinatários de várias formas:\n1. Upload de Excel/CSV - Faça upload de um arquivo com os contatos\n2. Lista de Contatos - Use uma lista pré-cadastrada\n3. Manual - Digite os dados diretamente\n\nDica: Certifique-se de que os campos estão formatados corretamente!"
  },
  {
    id: 3,
    titulo: "Como criar um centro de custo?",
    descricao: "Configure centros de custo para organizar suas campanhas",
    palavrasChave: ["centro", "custo", "pj", "pf", "cadastrar"],
    conteudo: "Para criar um centro de custo:\n1. Vá em Ferramentas > Centro de Custo\n2. Clique em 'Novo Centro de Custo'\n3. Escolha o tipo (Pessoa Jurídica ou Pessoa Física)\n4. Preencha os dados solicitados\n5. Salve as informações\n\nOs centros de custo ajudam a organizar e rastrear suas campanhas!"
  },
  {
    id: 4,
    titulo: "Como agendar uma campanha?",
    descricao: "Agende suas campanhas para envio futuro",
    palavrasChave: ["agendar", "agendamento", "programar", "data", "hora"],
    conteudo: "Para agendar uma campanha:\n1. Ao criar a campanha, chegue até a etapa final 'Revisar e Agendar'\n2. Defina a data e hora desejadas\n3. Revise todas as configurações\n4. Clique em 'Criar Campanha'\n\nA campanha será enviada automaticamente na data agendada!"
  },
  {
    id: 5,
    titulo: "Como usar o Inbox?",
    descricao: "Gerencie conversas com clientes em tempo real",
    palavrasChave: ["inbox", "conversa", "mensagem", "responder", "atendimento"],
    conteudo: "No Inbox você pode:\n1. Ver todas as conversas em um só lugar\n2. Filtrar por canal (WhatsApp, Email, SMS, etc.)\n3. Responder mensagens diretamente\n4. Organizar por status (Em andamento, Aberta, Resolvida)\n\nDica: Use os filtros para encontrar conversas rapidamente!"
  },
  {
    id: 6,
    titulo: "Como criar uma blacklist?",
    descricao: "Bloqueie contatos que não devem receber mensagens",
    palavrasChave: ["blacklist", "bloquear", "bloqueio", "spam", "descadastro"],
    conteudo: "Para adicionar à blacklist:\n1. Vá em Ferramentas > Cadastro de Blacklist\n2. Clique em 'Novo Bloqueio'\n3. Escolha o tipo (Email, Telefone ou Endereço)\n4. Insira o valor a ser bloqueado\n5. Adicione o motivo\n6. Salve\n\nContatos na blacklist não receberão suas campanhas!"
  },
  {
    id: 7,
    titulo: "Como visualizar relatórios?",
    descricao: "Acompanhe métricas e resultados das suas campanhas",
    palavrasChave: ["relatórios", "métricas", "estatísticas", "resultados", "análise"],
    conteudo: "Para visualizar relatórios:\n1. Acesse o menu 'Relatórios'\n2. Use os filtros para selecionar período e campanhas\n3. Veja métricas como taxa de abertura, cliques e conversões\n4. Exporte os dados se necessário\n\nDica: Use os relatórios para otimizar suas campanhas!"
  },
  {
    id: 8,
    titulo: "Como configurar automações?",
    descricao: "Crie fluxos automáticos baseados em eventos",
    palavrasChave: ["automação", "automatizar", "trigger", "evento", "fluxo"],
    conteudo: "Para criar uma automação:\n1. Clique em 'Nova Campanha'\n2. Escolha 'Automação'\n3. Defina o evento de acionamento (ex: novo cadastro, aniversário)\n4. Configure os canais e conteúdo\n5. Ative a automação\n\nAs mensagens serão enviadas automaticamente quando o evento ocorrer!"
  }
];

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [tutorialSearch, setTutorialSearch] = useState("");
  const [tutoriaisFiltrados, setTutoriaisFiltrados] = useState(tutoriais);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedDepartment) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    
    // Se for tutoriais, buscar por tutoriais relacionados
    if (selectedDepartment.id === "tutoriais") {
      const busca = inputMessage.toLowerCase();
      const tutoriaisEncontrados = tutoriais.filter(t => 
        t.palavrasChave.some(palavra => busca.includes(palavra)) ||
        t.titulo.toLowerCase().includes(busca) ||
        t.descricao.toLowerCase().includes(busca)
      );

      setTimeout(() => {
        if (tutoriaisEncontrados.length > 0) {
          const responseMessage = {
            id: Date.now() + 1,
            text: `Encontrei ${tutoriaisEncontrados.length} tutorial(is) que pode(m) ajudar:`,
            sender: "agent",
            timestamp: new Date(),
            tutoriais: tutoriaisEncontrados
          };
          setMessages(prev => [...prev, responseMessage]);
        } else {
          const responseMessage = {
            id: Date.now() + 1,
            text: "Não encontrei tutoriais específicos para sua busca. Tente outras palavras-chave ou navegue pelos tutoriais disponíveis abaixo!",
            sender: "agent",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, responseMessage]);
        }
      }, 800);
    } else {
      // Resposta automática para outros departamentos
      setTimeout(() => {
        const autoResponse = {
          id: Date.now() + 1,
          text: `Obrigado por entrar em contato com ${selectedDepartment.name}! Em breve um de nossos atendentes irá responder.`,
          sender: "agent",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, autoResponse]);
      }, 1500);
    }

    setInputMessage("");
  };

  const handleSelectDepartment = (dept) => {
    setSelectedDepartment(dept);
    
    if (dept.id === "tutoriais") {
      setMessages([
        {
          id: 1,
          text: `Olá! Bem-vindo aos Tutoriais! 📚\n\nDigite sua dúvida ou busque por palavras-chave como:\n• "Como criar uma campanha?"\n• "Adicionar destinatários"\n• "Agendar envio"\n\nOu navegue pelos tutoriais abaixo!`,
          sender: "agent",
          timestamp: new Date()
        }
      ]);
    } else {
      setMessages([
        {
          id: 1,
          text: `Olá! Você está conversando com ${dept.name}. Como podemos ajudar?`,
          sender: "agent",
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleBack = () => {
    setSelectedDepartment(null);
    setMessages([]);
    setTutorialSearch("");
    setTutoriaisFiltrados(tutoriais);
  };

  const handleTutorialClick = (tutorial) => {
    const tutorialMessage = {
      id: Date.now(),
      text: tutorial.titulo,
      sender: "user",
      timestamp: new Date()
    };

    const responseMessage = {
      id: Date.now() + 1,
      text: tutorial.conteudo,
      sender: "agent",
      timestamp: new Date(),
      isTutorial: true
    };

    setMessages([...messages, tutorialMessage, responseMessage]);
  };

  const filtrarTutoriais = (busca) => {
    setTutorialSearch(busca);
    if (!busca.trim()) {
      setTutoriaisFiltrados(tutoriais);
      return;
    }

    const buscaLower = busca.toLowerCase();
    const filtrados = tutoriais.filter(t => 
      t.palavrasChave.some(palavra => palavra.includes(buscaLower)) ||
      t.titulo.toLowerCase().includes(buscaLower) ||
      t.descricao.toLowerCase().includes(buscaLower)
    );
    setTutoriaisFiltrados(filtrados);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 group"
            >
              <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            </Button>
            {/* Badge de notificação (opcional) */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Janela de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="border-0 shadow-2xl shadow-slate-900/20 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedDepartment && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <ChevronDown className="w-5 h-5 rotate-90" />
                      </Button>
                    )}
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {selectedDepartment ? selectedDepartment.name : "Como podemos ajudar?"}
                      </CardTitle>
                      {selectedDepartment && (
                        <p className="text-xs text-white/80 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Online
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Seleção de Departamento */}
                {!selectedDepartment ? (
                  <div className="p-4 space-y-3 bg-slate-50 min-h-[400px]">
                    <p className="text-sm text-slate-600 font-medium mb-4">
                      Escolha um departamento para iniciar o atendimento:
                    </p>
                    {departments.map((dept, index) => {
                      const Icon = dept.icon;
                      return (
                        <motion.div
                          key={dept.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            onClick={() => handleSelectDepartment(dept)}
                            className="w-full justify-start h-auto p-4 bg-white border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
                          >
                            <div className="flex items-center gap-4 w-full">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${dept.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-slate-900">{dept.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span className="text-xs text-slate-500">Disponível</span>
                                </div>
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Área de Mensagens */}
                    <div className="h-96 overflow-y-auto p-4 bg-slate-50 space-y-4">
                      <AnimatePresence>
                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`flex gap-2 max-w-[90%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                              {message.sender === "agent" && (
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarFallback className={`bg-gradient-to-br ${selectedDepartment.color} text-white text-xs font-bold`}>
                                    {selectedDepartment.avatar}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div className={`rounded-2xl p-3 ${
                                  message.sender === "user"
                                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-br-none"
                                    : "bg-white text-slate-900 shadow-sm rounded-bl-none"
                                }`}>
                                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                                </div>

                                {/* Renderizar tutoriais encontrados */}
                                {message.tutoriais && message.tutoriais.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {message.tutoriais.map((tutorial) => (
                                      <button
                                        key={tutorial.id}
                                        onClick={() => handleTutorialClick(tutorial)}
                                        className="w-full text-left p-3 bg-white rounded-lg border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                                      >
                                        <div className="flex items-start gap-2">
                                          <BookOpen className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="font-semibold text-slate-900 text-sm">{tutorial.titulo}</p>
                                            <p className="text-xs text-slate-600 mt-1">{tutorial.descricao}</p>
                                          </div>
                                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-600 flex-shrink-0" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Lista de tutoriais disponíveis (somente no canal de tutoriais) */}
                      {selectedDepartment.id === "tutoriais" && messages.length <= 1 && (
                        <div className="space-y-2 mt-4">
                          <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              placeholder="Buscar tutorial..."
                              value={tutorialSearch}
                              onChange={(e) => filtrarTutoriais(e.target.value)}
                              className="pl-10 bg-white border-slate-200"
                            />
                          </div>

                          {tutoriaisFiltrados.map((tutorial) => (
                            <button
                              key={tutorial.id}
                              onClick={() => handleTutorialClick(tutorial)}
                              className="w-full text-left p-3 bg-white rounded-lg border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                            >
                              <div className="flex items-start gap-2">
                                <BookOpen className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 text-sm">{tutorial.titulo}</p>
                                  <p className="text-xs text-slate-600 mt-1">{tutorial.descricao}</p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-600 flex-shrink-0" />
                              </div>
                            </button>
                          ))}

                          {tutoriaisFiltrados.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-4">
                              Nenhum tutorial encontrado
                            </p>
                          )}
                        </div>
                      )}

                      {messages.length === 0 && selectedDepartment.id !== "tutoriais" && (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <p className="text-sm">Inicie a conversa...</p>
                        </div>
                      )}
                    </div>

                    {/* Input de Mensagem */}
                    <div className="p-4 bg-white border-t border-slate-200">
                      <div className="flex gap-2">
                        <Input
                          placeholder={selectedDepartment.id === "tutoriais" ? "Digite sua dúvida..." : "Digite sua mensagem..."}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 border-slate-200 focus:border-cyan-500"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {selectedDepartment.id === "tutoriais" 
                          ? "Digite palavras-chave para buscar tutoriais"
                          : "Pressione Enter para enviar"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}