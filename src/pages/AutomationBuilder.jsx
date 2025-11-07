
import React, { useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Zap,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  FileText,
  Clock,
  GitBranch,
  Filter,
  Database,
  Webhook,
  Calendar,
  Gift,
  ShoppingCart,
  Tag,
  MousePointer,
  Trash2,
  Settings,
  Copy,
  Users, // New import
  Sparkles, // New import
  BarChart3, // New import
  Workflow, // New import
  Library, // New import
  Check // New import
} from "lucide-react";
import { Switch } from "@/components/ui/switch"; // New import

// Tipos de nodes disponíveis
const nodeTypes = [
  {
    category: "Gatilhos",
    items: [
      { id: "webhook", label: "Webhook", icon: Webhook, color: "from-purple-500 to-purple-600", description: "Acionar por requisição HTTP" },
      { id: "novo_contato", label: "Novo Contato", icon: Database, color: "from-blue-500 to-blue-600", description: "Quando um novo contato é adicionado" },
      { id: "tag_adicionada", label: "Tag Adicionada", icon: Tag, color: "from-green-500 to-green-600", description: "Quando uma tag é adicionada" },
      { id: "email_aberto", label: "Email Aberto", icon: Mail, color: "from-cyan-500 to-cyan-600", description: "Quando um email é aberto" },
      { id: "link_clicado", label: "Link Clicado", icon: MousePointer, color: "from-orange-500 to-orange-600", description: "Quando um link é clicado" },
      { id: "data_especifica", label: "Data Específica", icon: Calendar, color: "from-pink-500 to-pink-600", description: "Em uma data e hora específica" },
      { id: "aniversario", label: "Aniversário", icon: Gift, color: "from-yellow-500 to-yellow-600", description: "No aniversário do contato" },
      { id: "carrinho_abandonado", label: "Carrinho Abandonado", icon: ShoppingCart, color: "from-red-500 to-red-600", description: "Quando carrinho é abandonado" }
    ]
  },
  {
    category: "Ações",
    items: [
      { id: "enviar_email", label: "Enviar Email", icon: Mail, color: "from-blue-500 to-blue-600", description: "Enviar email para contato" },
      { id: "enviar_sms", label: "Enviar SMS", icon: MessageSquare, color: "from-green-500 to-green-600", description: "Enviar SMS para contato" },
      { id: "enviar_whatsapp", label: "Enviar WhatsApp", icon: Smartphone, color: "from-emerald-500 to-emerald-600", description: "Enviar mensagem WhatsApp" },
      { id: "enviar_rcs", label: "Enviar RCS", icon: Radio, color: "from-purple-500 to-purple-600", description: "Enviar mensagem RCS" },
      { id: "enviar_carta", label: "Enviar Carta", icon: FileText, color: "from-amber-500 to-amber-600", description: "Enviar carta física" },
      { id: "adicionar_tag", label: "Adicionar Tag", icon: Tag, color: "from-pink-500 to-pink-600", description: "Adicionar tag ao contato" },
      { id: "atualizar_contato", label: "Atualizar Contato", icon: Database, color: "from-cyan-500 to-cyan-600", description: "Atualizar dados do contato" }
    ]
  },
  {
    category: "Lógica",
    items: [
      { id: "aguardar", label: "Aguardar", icon: Clock, color: "from-slate-500 to-slate-600", description: "Aguardar tempo específico" },
      { id: "condicao", label: "Condição", icon: GitBranch, color: "from-violet-500 to-violet-600", description: "Dividir fluxo por condição" },
      { id: "filtro", label: "Filtro", icon: Filter, color: "from-indigo-500 to-indigo-600", description: "Filtrar contatos" }
    ]
  }
];

// Condições específicas por canal
const condicoesPorCanal = {
  email: [
    { value: "entregue", label: "Entregue" },
    { value: "bloqueado_blacklist", label: "Bloqueado na black list" },
    { value: "hard_bounce", label: "Hard Bounce" },
    { value: "aberto", label: "Aberto" },
    { value: "clicado", label: "Clicado" },
    { value: "caixa_cheia", label: "Caixa cheia" },
    { value: "soft_bounce", label: "Soft bounce" }
  ],
  sms: [
    { value: "entregue_operadora", label: "Entregue na operadora" },
    { value: "entregue_celular", label: "Entregue no celular" },
    { value: "nao_recebido", label: "Não recebido" },
    { value: "bloqueado_higienizacao", label: "Bloqueado na higienização" },
    { value: "telefone_invalido", label: "Telefone inválido" }
  ],
  whatsapp: [
    { value: "entregue", label: "Entregue" },
    { value: "nao_entregue", label: "Não entregue" },
    { value: "lido", label: "Lido" },
    { value: "nao_lido", label: "Não lido" },
    { value: "bloqueado_higienizacao", label: "Bloqueado na higienização" },
    { value: "telefone_invalido", label: "Telefone inválido" }
  ],
  rcs: [
    { value: "entregue_operadora", label: "Entregue na operadora" },
    { value: "fallback", label: "Fallback" },
    { value: "bloqueado_higienizacao", label: "Bloqueado na higienização" },
    { value: "telefone_invalido", label: "Telefone inválido" }
  ],
  carta: [
    { value: "positivo", label: "Positivo" },
    { value: "aguardando", label: "Aguardando" },
    { value: "negativo_mudou", label: "Negativo – Mudou-se" },
    { value: "negativo_endereco_insuficiente", label: "Negativo – Endereço insuficiente" },
    { value: "negativo_nao_procurado", label: "Negativo – Não procurado" },
    { value: "negativo_nao_existe_numero", label: "Negativo – Não existe o número indicado" },
    { value: "negativo_ausente", label: "Negativo - Ausente" },
    { value: "negativo_desconhecido", label: "Negativo - Desconhecido" },
    { value: "negativo_outros", label: "Negativo - Outros" },
    { value: "negativo_recusado", label: "Negativo - Recusado" },
    { value: "negativo_falecido", label: "Negativo - Falecido" }
  ]
};

export default function AutomationBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);

  const [automationName, setAutomationName] = useState("");
  const [automationDescription, setAutomationDescription] = useState("");
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [draggingNode, setDraggingNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);

  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { data: automacoes = [] } = useQuery({
    queryKey: ['automacoes-fluxo'],
    queryFn: () => base44.entities.AutomacaoFluxo.list('-created_date'),
    initialData: [],
  });

  const saveAutomationMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomacaoFluxo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes-fluxo'] });
      navigate(createPageUrl("Campanhas"));
    },
  });

  const handleMouseMove = (e) => {
    if (isDraggingConnection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleStartConnectionDrag = (e, nodeId, handleType) => {
    e.stopPropagation();
    setIsDraggingConnection(true);
    
    const node = nodes.find(n => n.id === nodeId);
    // Assuming card width is 256 (w-64) + padding, and handle is at right edge, its x + node width
    // Node card width is 256px. CardContent padding is p-4, total 256px.
    // Handle is visually translated right by 1/2 of its width. So, it should be at node.position.x + 256
    const startX = handleType === 'source' ? node.position.x + 256 : node.position.x;
    const startY = node.position.y + 50; // Center of the node vertically
    
    setConnectionStart({
      nodeId,
      handleType,
      x: startX,
      y: startY
    });
  };

  const handleEndConnectionDrag = (e, targetNodeId) => {
    e.stopPropagation();
    
    if (isDraggingConnection && connectionStart && connectionStart.nodeId !== targetNodeId) {
      const newConnection = {
        id: `conn-${Date.now()}`,
        source: connectionStart.nodeId,
        target: targetNodeId
      };
      
      // Verificar se a conexão já existe para evitar duplicatas
      const connectionExists = connections.some(
        c => c.source === newConnection.source && c.target === newConnection.target
      );
      
      if (!connectionExists) {
        setConnections([...connections, newConnection]);
      }
    }
    
    setIsDraggingConnection(false);
    setConnectionStart(null);
  };

  const handleCancelConnection = () => {
    setIsDraggingConnection(false);
    setConnectionStart(null);
  };

  const handleDeleteConnection = (connectionId) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const handleDragStart = (e, nodeType) => {
    setDraggingNode(nodeType);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggingNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode = {
      id: `node-${Date.now()}`,
      type: draggingNode.id,
      label: draggingNode.label,
      icon: draggingNode.icon,
      color: draggingNode.color,
      position: { x, y },
      data: {}
    };

    setNodes([...nodes, newNode]);
    setDraggingNode(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setConfigDialogOpen(true);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.source !== nodeId && c.target !== nodeId));
  };

  const handleSaveAutomation = async () => {
    if (!automationName.trim()) {
      alert("Digite um nome para a automação");
      return;
    }

    const triggerNode = nodes.find(n =>
      nodeTypes[0].items.some(item => item.id === n.type)
    );

    await saveAutomationMutation.mutateAsync({
      nome: automationName,
      descricao: automationDescription,
      status: "rascunho",
      trigger_type: triggerNode?.type || "webhook",
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data
      })),
      connections: connections
    });
  };

  const handleUpdateNodeData = (data) => {
    setSelectedNode(prev => ({
      ...prev,
      data: { ...prev.data, ...data }
    }));
    setNodes(nodes.map(n =>
      n.id === selectedNode.id
        ? { ...n, data: { ...n.data, ...data } }
        : n
    ));
  };

  const handleSaveAndCloseConfig = () => {
    if (selectedNode) {
      handleUpdateNodeData(selectedNode.data);
    }
    setConfigDialogOpen(false);
    setSelectedNode(null);
  };

  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    const isEmailNode = selectedNode.type === "enviar_email";
    const isSmsNode = selectedNode.type === "enviar_sms";
    const isWhatsappNode = selectedNode.type === "enviar_whatsapp";
    const isRcsNode = selectedNode.type === "enviar_rcs";
    const isCartaNode = selectedNode.type === "enviar_carta";
    const isMessagingNode = isEmailNode || isSmsNode || isWhatsappNode || isRcsNode || isCartaNode;

    if (isMessagingNode) {
      return (
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Criar Conteúdo</h2>
            <p className="text-slate-600">Configure o conteúdo e cronograma para cada canal</p>
          </div>

          {/* Email Info */}
          {isEmailNode && (
            <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Informações do Email
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email Remetente *</Label>
                  <Input
                    placeholder="noreply@empresa.com"
                    defaultValue={selectedNode.data.sender_email || ""}
                    onChange={(e) => selectedNode.data.sender_email = e.target.value}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Email de Resposta</Label>
                  <Input
                    placeholder="contato@empresa.com"
                    defaultValue={selectedNode.data.reply_email || ""}
                    onChange={(e) => selectedNode.data.reply_email = e.target.value}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Assunto *</Label>
                <Input
                  placeholder="Ex: Nova oferta especial para você!"
                  defaultValue={selectedNode.data.subject || ""}
                  onChange={(e) => selectedNode.data.subject = e.target.value}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Cronograma de Envio */}
          <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
            <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Cronograma de Envio
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, schedule_type: "imediato" })}
                className={`flex items-start gap-3 border-2 rounded-lg p-4 transition-colors text-left ${
                  selectedNode.data.schedule_type === "imediato"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <Zap className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Envio Imediato</p>
                  <p className="text-xs text-slate-500 mt-1">Enviar assim que aprovado</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, schedule_type: "agendado" })}
                className={`flex items-start gap-3 border-2 rounded-lg p-4 transition-colors text-left ${
                  selectedNode.data.schedule_type === "agendado"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <Calendar className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Agendar Envio</p>
                  <p className="text-xs text-slate-500 mt-1">Escolha data e hora específicas</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, schedule_type: "personalizado" })}
                className={`flex items-start gap-3 border-2 rounded-lg p-4 transition-colors text-left ${
                  selectedNode.data.schedule_type === "personalizado"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <Users className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Personalizar Envio</p>
                  <p className="text-xs text-slate-500 mt-1">Personalize por segmento</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, schedule_type: "preditivo" })}
                className={`flex items-start gap-3 border-2 rounded-lg p-4 transition-colors text-left ${
                  selectedNode.data.schedule_type === "preditivo"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Envio Preditivo</p>
                  <p className="text-xs text-slate-500 mt-1">IA entrega no melhor momento (até 24h)</p>
                </div>
              </button>
            </div>

            {selectedNode.data.schedule_type === "agendado" && (
              <div className="mt-4">
                <Label>Data e Hora do Envio</Label>
                <Input
                  type="datetime-local"
                  defaultValue={selectedNode.data.scheduled_datetime || ""}
                  onChange={(e) => handleUpdateNodeData({ ...selectedNode.data, scheduled_datetime: e.target.value })}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Monitoramento e Automações */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Monitoramento
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">Ativar rastreamento avançado</p>
                </div>
                <Switch
                  checked={selectedNode.data.monitoring_enabled || false}
                  onCheckedChange={(checked) => handleUpdateNodeData({ ...selectedNode.data, monitoring_enabled: checked })}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-purple-600" />
                    Automações
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">Fluxos por status de entrega</p>
                </div>
                <Switch
                  checked={selectedNode.data.automation_enabled || false}
                  onCheckedChange={(checked) => handleUpdateNodeData({ ...selectedNode.data, automation_enabled: checked })}
                />
              </div>
            </div>
          </div>

          {/* Criar Mensagem */}
          <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
            <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Criar Mensagem
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                type="button"
                variant={selectedNode.data.template_source === "do_zero" ? "default" : "outline"}
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, template_source: "do_zero" })}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedNode.data.template_source === "do_zero" ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : ""
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs text-center">Criar do Zero</span>
              </Button>

              <Button
                type="button"
                variant={selectedNode.data.template_source === "biblioteca" ? "default" : "outline"}
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, template_source: "biblioteca" })}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedNode.data.template_source === "biblioteca" ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : ""
                }`}
              >
                <Library className="w-5 h-5" />
                <span className="text-xs text-center">Biblioteca de Modelos</span>
              </Button>

              <Button
                type="button"
                variant={selectedNode.data.template_source === "ia" ? "default" : "outline"}
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, template_source: "ia" })}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedNode.data.template_source === "ia" ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : ""
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs text-center">Criar com IA</span>
              </Button>

              <Button
                type="button"
                variant={selectedNode.data.template_source === "salvos" ? "default" : "outline"}
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, template_source: "salvos" })}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedNode.data.template_source === "salvos" ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : ""
                }`}
              >
                <Save className="w-5 h-5" />
                <span className="text-xs text-center">Modelos Salvos</span>
              </Button>

              <Button
                type="button"
                variant={selectedNode.data.template_source === "duplicar" ? "default" : "outline"}
                onClick={() => handleUpdateNodeData({ ...selectedNode.data, template_source: "duplicar" })}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedNode.data.template_source === "duplicar" ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : ""
                }`}
              >
                <Copy className="w-5 h-5" />
                <span className="text-xs text-center">Duplicar Campanha</span>
              </Button>
            </div>

            <div className="mt-4">
              <Label>{isEmailNode ? "Corpo do Email" : "Mensagem"}</Label>
              <Textarea
                placeholder={isEmailNode ? "Digite o conteúdo do email..." : "Digite a mensagem..."}
                defaultValue={selectedNode.data.message || ""}
                onChange={(e) => handleUpdateNodeData({ ...selectedNode.data, message: e.target.value })}
                className="mt-2 min-h-[200px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAndCloseConfig}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      );
    }

    // Configurações para node de condição
    if (selectedNode.type === "condicao") {
      // Encontrar todos os nodes de envio que já existem no fluxo
      const sendingNodes = nodes.filter(n => 
        ['enviar_email', 'enviar_sms', 'enviar_whatsapp', 'enviar_rcs', 'enviar_carta'].includes(n.type)
      );

      return (
        <div className="space-y-6 py-4">
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-xl border-2 border-cyan-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Como funciona?</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Esta condição verifica o resultado de um envio anterior e cria um novo disparo baseado na resposta. 
                  <br/><strong>Exemplo:</strong> Se email teve "Hard Bounce" → Enviar SMS apenas para quem teve Hard Bounce
                </p>
              </div>
            </div>
          </div>

          {sendingNodes.length === 0 ? (
            <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-200 text-center">
              <Mail className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h4 className="font-semibold text-amber-900 mb-2">Adicione um envio primeiro!</h4>
              <p className="text-sm text-amber-700">
                Você precisa criar um bloco de envio (Email, SMS, WhatsApp, etc.) antes de adicionar uma condição.
              </p>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-cyan-600" />
                  1. Qual envio você quer verificar?
                </Label>
                <Select
                  value={selectedNode.data.source_node_id || ""}
                  onValueChange={(value) => {
                    const sourceNode = nodes.find(n => n.id === value);
                    handleUpdateNodeData({ 
                      ...selectedNode.data, 
                      source_node_id: value,
                      source_node_label: sourceNode?.label,
                      source_node_type: sourceNode?.type,
                      channel: sourceNode?.type === 'enviar_email' ? 'email' :
                              sourceNode?.type === 'enviar_sms' ? 'sms' :
                              sourceNode?.type === 'enviar_whatsapp' ? 'whatsapp' :
                              sourceNode?.type === 'enviar_rcs' ? 'rcs' :
                              sourceNode?.type === 'enviar_carta' ? 'carta' : undefined,
                      status: undefined // Reset status when source node changes
                    });
                  }}
                >
                  <SelectTrigger className="mt-2 h-14 text-base">
                    <SelectValue placeholder="Selecione o envio anterior" />
                  </SelectTrigger>
                  <SelectContent>
                    {sendingNodes.map((node) => {
                      const NodeIcon = node.icon;
                      const channelName = 
                        node.type === 'enviar_email' ? 'Email' :
                        node.type === 'enviar_sms' ? 'SMS' :
                        node.type === 'enviar_whatsapp' ? 'WhatsApp' :
                        node.type === 'enviar_rcs' ? 'RCS' :
                        node.type === 'enviar_carta' ? 'Carta' : node.label;
                      
                      return (
                        <SelectItem key={node.id} value={node.id}>
                          <div className="flex items-center gap-3 py-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${node.color}`}>
                              <NodeIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">{node.label}</p>
                              <p className="text-xs text-slate-500">{channelName}</p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-2">
                  Selecione qual envio anterior você quer verificar o resultado
                </p>
              </div>

              {selectedNode.data.source_node_id && (
                <>
                  <div>
                    <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                      <Filter className="w-5 h-5 text-purple-600" />
                      2. Qual resultado você quer verificar?
                    </Label>
                    <Select
                      value={selectedNode.data.status || ""}
                      onValueChange={(value) => handleUpdateNodeData({ ...selectedNode.data, status: value })}
                    >
                      <SelectTrigger className="mt-2 h-14 text-base">
                        <SelectValue placeholder="Selecione o status/resultado" />
                      </SelectTrigger>
                      <SelectContent>
                        {condicoesPorCanal[selectedNode.data.channel]?.map((condicao) => (
                          <SelectItem key={condicao.value} value={condicao.value}>
                            <div className="py-1">
                              <p className="font-semibold">{condicao.label}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-2">
                      Exemplo: "Hard Bounce", "Entregue", "Não lido", etc.
                    </p>
                  </div>

                  {selectedNode.data.status && (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900 mb-2">Condição Configurada!</h4>
                          <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${nodes.find(n => n.id === selectedNode.data.source_node_id)?.color}`}>
                                {React.createElement(nodes.find(n => n.id === selectedNode.data.source_node_id)?.icon, { className: "w-4 h-4 text-white" })}
                              </div>
                              <p className="text-sm font-semibold text-slate-900">
                                {selectedNode.data.source_node_label}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <span>Se o resultado for:</span>
                              <Badge className="bg-green-600 text-white font-semibold">
                                {condicoesPorCanal[selectedNode.data.channel]?.find(c => c.value === selectedNode.data.status)?.label}
                              </Badge>
                            </div>
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs text-slate-600 font-medium">
                                ⬇️ Próximo passo: Conecte esta condição a um novo envio (SMS, WhatsApp, etc.)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Exemplo de uso:
                    </h5>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>1. Enviar Email para todos</span>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <GitBranch className="w-4 h-4 text-purple-500" />
                        <span>2. Se Email teve "Hard Bounce"</span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">3. Enviar SMS apenas para quem teve Hard Bounce</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAndCloseConfig}
              disabled={!selectedNode.data.source_node_id || !selectedNode.data.status}
            >
              Salvar Condição
            </Button>
          </div>
        </div>
      );
    }


    // Configurações simples para outros nodes
    return (
      <div className="space-y-4 py-4">
        {selectedNode.type === "aguardar" && (
          <div>
            <Label>Tempo de Espera</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Input
                type="number"
                placeholder="Quantidade"
                defaultValue={selectedNode.data.wait_amount || ""}
                onChange={(e) => handleUpdateNodeData({ ...selectedNode.data, wait_amount: e.target.value })}
              />
              <Select
                defaultValue={selectedNode.data.wait_unit || "minutos"}
                onValueChange={(value) => handleUpdateNodeData({ ...selectedNode.data, wait_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutos">Minutos</SelectItem>
                  <SelectItem value="horas">Horas</SelectItem>
                  <SelectItem value="dias">Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedNode.type === "adicionar_tag" && (
          <div>
            <Label>Tag</Label>
            <Input
              placeholder="Nome da tag"
              defaultValue={selectedNode.data.tag || ""}
              onChange={(e) => handleUpdateNodeData({ ...selectedNode.data, tag: e.target.value })}
              className="mt-2"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAndCloseConfig}>
            Salvar Configurações
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Campanhas"))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <Input
              placeholder="Nome da Automação"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              className="font-semibold text-lg border-0 focus-visible:ring-0 px-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveAutomation}
            disabled={saveAutomationMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveAutomationMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Play className="w-4 h-4 mr-2" />
            Ativar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Blocos */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Blocos Disponíveis
            </h3>

            {nodeTypes.map((category, idx) => (
              <div key={idx} className="mb-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-move"
                      >
                        <Card className="border-2 border-slate-200 hover:border-cyan-400 transition-all">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-900">{item.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative bg-slate-50 overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleCancelConnection} // Cancel dragging if mouse released on canvas background
          style={{
            backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        >
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Comece Criando um Fluxo Multicanal
                </h3>
                <p className="text-slate-500 mb-4">
                  Arraste blocos da barra lateral para criar automações baseadas em resultados de envios
                </p>
                <div className="bg-white p-4 rounded-lg shadow-md text-left text-sm text-slate-700">
                  <p className="font-semibold mb-2">💡 Exemplo:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Arraste "Enviar Email"</li>
                    <li>Arraste "Condição" e configure "Se Hard Bounce"</li>
                    <li>Arraste "Enviar SMS" e conecte à condição</li>
                    <li>SMS só será enviado para Hard Bounces!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Renderizar conexões */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {/* Conexões existentes */}
            {connections.map((conn) => {
              const sourceNode = nodes.find(n => n.id === conn.source);
              const targetNode = nodes.find(n => n.id === conn.target);
              
              if (!sourceNode || !targetNode) return null;

              // Node card width is 256px.
              // Source handle at node.position.x + 256, target handle at node.position.x
              const x1 = sourceNode.position.x + 256; 
              const y1 = sourceNode.position.y + 50; // Center of the node vertically
              const x2 = targetNode.position.x;
              const y2 = targetNode.position.y + 50; // Center of the node vertically

              const dx = x2 - x1;
              const controlPointOffset = Math.max(50, Math.abs(dx) / 2); // Ensure some curvature

              return (
                <g key={conn.id}>
                  <defs>
                    <marker
                      id={`arrowhead-${conn.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="#06B6D4" />
                    </marker>
                  </defs>
                  
                  {/* Path invisível mais largo para facilitar hover/click */}
                  <path
                    d={`M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`}
                    stroke="transparent"
                    strokeWidth="20"
                    fill="none"
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => handleDeleteConnection(conn.id)}
                  />
                  
                  {/* Path visível */}
                  <path
                    d={`M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`}
                    stroke="#06B6D4"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    markerEnd={`url(#arrowhead-${conn.id})`}
                    className="pointer-events-none"
                  />
                  
                  {/* Botão de deletar no meio da conexão */}
                  <g 
                    transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => handleDeleteConnection(conn.id)}
                  >
                    <circle
                      r="12"
                      fill="white"
                      stroke="#EF4444"
                      strokeWidth="2"
                      className="hover:fill-red-50 transition-colors"
                    />
                    <line
                      x1="-5"
                      y1="-5"
                      x2="5"
                      y2="5"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="5"
                      y1="-5"
                      x2="-5"
                      y2="5"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              );
            })}

            {/* Conexão sendo arrastada */}
            {isDraggingConnection && connectionStart && (
              <g>
                <defs>
                  <marker
                    id="arrowhead-temp"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L9,3 z" fill="#94A3B8" />
                  </marker>
                </defs>
                <path
                  d={`M ${connectionStart.x} ${connectionStart.y} C ${connectionStart.x + 100} ${connectionStart.y}, ${mousePosition.x - 100} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`}
                  stroke="#94A3B8"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead-temp)"
                />
              </g>
            )}
          </svg>

          {/* Renderizar nodes */}
          <AnimatePresence>
            {nodes.map((node) => {
              const Icon = node.icon;
              const isConditionNode = node.type === "condicao";
              const sourceNodeLabel = isConditionNode && node.data.source_node_label 
                ? node.data.source_node_label 
                : null;
              const statusLabel = isConditionNode && node.data.channel && node.data.status 
                ? condicoesPorCanal[node.data.channel]?.find(c => c.value === node.data.status)?.label 
                : null;
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  drag
                  dragMomentum={false}
                  onDragEnd={(e, info) => {
                    const updatedNodes = nodes.map(n =>
                      n.id === node.id
                        ? { ...n, position: { x: n.position.x + info.offset.x, y: n.position.y + info.offset.y } }
                        : n
                    );
                    setNodes(updatedNodes);
                  }}
                  style={{
                    position: 'absolute',
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: 2
                  }}
                  className="cursor-move"
                >
                  <Card className={`w-64 border-2 transition-all ${
                    isConditionNode && sourceNodeLabel && statusLabel
                      ? 'border-green-400 shadow-xl shadow-green-500/20'
                      : 'border-slate-200 hover:border-cyan-400 shadow-lg'
                  }`}>
                    {/* Handle de entrada (esquerda) */}
                    <div
                      className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-400 rounded-full cursor-crosshair hover:border-cyan-500 hover:scale-125 transition-all z-10"
                      onMouseUp={(e) => handleEndConnectionDrag(e, node.id)}
                      title="Conectar aqui"
                    >
                      <div className="absolute inset-0.5 bg-slate-200 rounded-full group-hover:bg-cyan-200 transition-colors" />
                    </div>

                    {/* Handle de saída (direita) */}
                    <div
                      className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-400 rounded-full cursor-crosshair hover:border-cyan-500 hover:scale-125 transition-all z-10"
                      onMouseDown={(e) => handleStartConnectionDrag(e, node.id, 'source')}
                      title="Arrastar para conectar"
                    >
                      <div className="absolute inset-0.5 bg-slate-200 rounded-full group-hover:bg-cyan-200 transition-colors" />
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${node.color} shadow-lg flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900">{node.label}</h4>
                          {isConditionNode && sourceNodeLabel && statusLabel ? (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-slate-600">
                                Verificando: <span className="font-semibold">{sourceNodeLabel}</span>
                              </p>
                              <Badge className="bg-green-600 text-white text-xs">
                                {statusLabel}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {node.data.subject || node.data.message || node.data.status || "Configure este bloco"}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNodeClick(node)}
                          className="flex-1"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Config
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNode(node.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Dialog de Configuração */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNode && <selectedNode.icon className="w-5 h-5" />}
              Configurar: {selectedNode?.label}
            </DialogTitle>
          </DialogHeader>

          {renderNodeConfig()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
