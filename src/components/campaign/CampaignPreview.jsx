
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Radio, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Circle,
  Eye,
  Send,
  Clock,
  Zap,
  Sparkles,
  Workflow,
  Printer,
  FileCheck,
  Database,
  Download,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  Table
} from "lucide-react";

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  rcs: Radio,
  carta: FileText
};

const channelNames = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  rcs: "RCS",
  carta: "Carta"
};

const scheduleTypeLabels = {
  imediato: { label: "Envio Imediato", icon: Zap },
  agendado: { label: "Envio Agendado", icon: Clock },
  personalizado: { label: "Envio Personalizado", icon: Workflow },
  preditivo: { label: "Envio Preditivo", icon: Sparkles }
};

export default function CampaignPreview({ campaignData }) {
  const [activeTab, setActiveTab] = useState(campaignData.channels[0] || "email");
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  
  // Mock validation data - seria calculado pelo backend
  const mockValidation = {
    email: {
      total: campaignData.total_recipients,
      invalidos: Math.floor(campaignData.total_recipients * 0.05),
      blacklist: Math.floor(campaignData.total_recipients * 0.02),
      repetidos: Math.floor(campaignData.total_recipients * 0.03),
      verde: Math.floor(campaignData.total_recipients * 0.85),
      amarelo: Math.floor(campaignData.total_recipients * 0.05)
    },
    sms: {
      total: campaignData.total_recipients,
      invalidos: Math.floor(campaignData.total_recipients * 0.04),
      blacklist: Math.floor(campaignData.total_recipients * 0.01),
      repetidos: Math.floor(campaignData.total_recipients * 0.02),
      comWhatsapp: Math.floor(campaignData.total_recipients * 0.70),
      semWhatsapp: Math.floor(campaignData.total_recipients * 0.21),
      naoPerturbe: Math.floor(campaignData.total_recipients * 0.03),
      acima160: (campaignData.sms_content?.message || "").length > 160 ? 1 : 0,
      verde: Math.floor(campaignData.total_recipients * 0.88),
      amarelo: Math.floor(campaignData.total_recipients * 0.05)
    },
    whatsapp: {
      total: campaignData.total_recipients,
      invalidos: Math.floor(campaignData.total_recipients * 0.03),
      blacklist: Math.floor(campaignData.total_recipients * 0.01),
      repetidos: Math.floor(campaignData.total_recipients * 0.02),
      comWhatsapp: Math.floor(campaignData.total_recipients * 0.85),
      semWhatsapp: Math.floor(campaignData.total_recipients * 0.09),
      naoPerturbe: Math.floor(campaignData.total_recipients * 0.02),
      verde: Math.floor(campaignData.total_recipients * 0.89),
      amarelo: Math.floor(campaignData.total_recipients * 0.04)
    },
    rcs: {
      total: campaignData.total_recipients,
      invalidos: Math.floor(campaignData.total_recipients * 0.03),
      blacklist: Math.floor(campaignData.total_recipients * 0.01),
      repetidos: Math.floor(campaignData.total_recipients * 0.02),
      comWhatsapp: Math.floor(campaignData.total_recipients * 0.85),
      semWhatsapp: Math.floor(campaignData.total_recipients * 0.09),
      naoPerturbe: Math.floor(campaignData.total_recipients * 0.02),
      verde: Math.floor(campaignData.total_recipients * 0.89),
      amarelo: Math.floor(campaignData.total_recipients * 0.04)
    },
    carta: {
      total: campaignData.total_recipients,
      inconsistentes: Math.floor(campaignData.total_recipients * 0.08),
      cepIncompativel: Math.floor(campaignData.total_recipients * 0.05),
      semNumero: Math.floor(campaignData.total_recipients * 0.03),
      verde: Math.floor(campaignData.total_recipients * 0.80),
      amarelo: Math.floor(campaignData.total_recipients * 0.04)
    }
  };

  const [validationToggles, setValidationToggles] = useState({
    email: { blacklist: true, repetidos: true },
    sms: { blacklist: true, repetidos: true, comWhatsapp: false, semWhatsapp: false, naoPerturbe: true, acima160: true },
    whatsapp: { blacklist: true, repetidos: true, comWhatsapp: true, semWhatsapp: false, naoPerturbe: true },
    rcs: { blacklist: true, repetidos: true, comWhatsapp: true, semWhatsapp: false, naoPerturbe: true },
    carta: { inconsistentes: false, cepIncompativel: false, semNumero: false }
  });

  const calculateApproved = (channel) => {
    const validation = mockValidation[channel];
    let approved = validation.total - validation.invalidos;
    
    if (channel === 'email') {
      if (validationToggles.email.blacklist) approved -= validation.blacklist;
      if (validationToggles.email.repetidos) approved -= validation.repetidos;
    } else if (channel === 'sms' || channel === 'whatsapp' || channel === 'rcs') {
      if (validationToggles[channel].blacklist) approved -= validation.blacklist;
      if (validationToggles[channel].repetidos) approved -= validation.repetidos;
      if (validationToggles[channel].naoPerturbe) approved -= validation.naoPerturbe;
      if (channel === 'sms' && validationToggles.sms.acima160) approved -= validation.acima160;
      // The logic for comWhatsapp and semWhatsapp might be inverted based on the toggle.
      // If comWhatsapp is toggled OFF, it means we remove those with WhatsApp from approved.
      // If semWhatsapp is toggled OFF, it means we remove those without WhatsApp from approved.
      // This might need clarification on expected behavior. For now, assuming if toggle is OFF, they are filtered out.
      if (!validationToggles[channel].comWhatsapp) approved -= validation.comWhatsapp;
      if (!validationToggles[channel].semWhatsapp) approved -= validation.semWhatsapp;
    } else if (channel === 'carta') {
      if (!validationToggles.carta.inconsistentes) approved -= validation.inconsistentes;
      if (!validationToggles.carta.cepIncompativel) approved -= validation.cepIncompativel;
      if (!validationToggles.carta.semNumero) approved -= validation.semNumero;
    }
    
    return Math.max(0, approved);
  };

  const toggleValidation = (channel, field) => {
    setValidationToggles(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: !prev[channel][field]
      }
    }));
  };

  const ValidationRow = ({ label, value, toggleable, toggleValue, onToggle, highlight }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-900">{value}</span>
        {toggleable && (
          <Switch
            checked={toggleValue}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-green-500"
          />
        )}
      </div>
    </div>
  );

  // Mock de destinatários para preview de cartas
  const mockDestinatarios = [
    {
      nome: "João Silva",
      endereco: "Rua das Flores, 123",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
      cpf: "123.456.789-00",
      numero_contrato: "CTR-2024-001",
      valor: "R$ 1.500,00",
      vencimento: "15/01/2025",
      id_cliente: "CLI-001"
    },
    {
      nome: "Maria Santos",
      endereco: "Av. Paulista, 456",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
      cpf: "987.654.321-00",
      numero_contrato: "CTR-2024-002",
      valor: "R$ 2.300,00",
      vencimento: "20/01/2025",
      id_cliente: "CLI-002"
    },
    {
      nome: "ABC Comércio LTDA",
      endereco: "Rua do Comércio, 789",
      bairro: "Vila Mariana",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04101-200",
      cnpj: "12.345.678/0001-90",
      numero_contrato: "CTR-2024-003",
      valor: "R$ 5.000,00",
      vencimento: "10/01/2025",
      id_cliente: "CLI-003"
    }
  ];

  const preencherCampos = (texto, destinatario) => {
    if (!texto) return "";
    let resultado = texto;
    Object.entries(destinatario).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      resultado = resultado.replace(regex, value || '');
    });
    // Adicionar data atual
    resultado = resultado.replace(/\{\{data_atual\}\}/g, new Date().toLocaleDateString('pt-BR'));
    resultado = resultado.replace(/\{\{mes_referencia\}\}/g, new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
    return resultado;
  };

  const handleGerarPDFs = async () => {
    setGeneratingPDFs(true);
    // Simular geração de PDFs
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratingPDFs(false);
    alert(`${calculateApproved('carta')} PDFs gerados com sucesso!`);
  };

  const handleDownloadZip = () => {
    alert("Iniciando download do arquivo .zip com todos os PDFs...");
  };

  const handleExportarPlanilha = () => {
    alert("Exportando planilha de controle...");
  };

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">Revisar e Validar Campanha</CardTitle>
        <p className="text-slate-600 mt-2">Verifique as validações e informações antes de enviar</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full gap-2 bg-slate-100 p-2 rounded-xl mb-6" style={{ gridTemplateColumns: `repeat(${campaignData.channels.length}, 1fr)` }}>
            {campaignData.channels.map((channel) => {
              const Icon = channelIcons[channel];
              return (
                <TabsTrigger 
                  key={channel} 
                  value={channel}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {channelNames[channel]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* EMAIL */}
          {campaignData.channels.includes("email") && (
            <TabsContent value="email" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Validação da Base */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    VALIDAÇÃO DA BASE
                  </h3>
                  
                  <div className="space-y-2">
                    <ValidationRow label="Quantidade total" value={mockValidation.email.total} />
                    <ValidationRow label="E-mails inválidos" value={mockValidation.email.invalidos} highlight />
                    <ValidationRow 
                      label="Bloquear e-mail da black list" 
                      value={mockValidation.email.blacklist}
                      toggleable
                      toggleValue={validationToggles.email.blacklist}
                      onToggle={() => toggleValidation('email', 'blacklist')}
                    />
                    <ValidationRow 
                      label="Bloquear e-mail repetidos" 
                      value={mockValidation.email.repetidos}
                      toggleable
                      toggleValue={validationToggles.email.repetidos}
                      onToggle={() => toggleValidation('email', 'repetidos')}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-green-600">{calculateApproved('email')}</span>
                    </div>
                  </div>
                </div>

                {/* Classificação da Base */}
                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">CLASSIFICAÇÃO DA BASE</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                        <span className="text-sm text-slate-700">Sinal verde (Pronto para entrega)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.email.verde}</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-slate-700">Sinal Amarelo (Problemas anteriores)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.email.amarelo}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-blue-600">{mockValidation.email.verde + mockValidation.email.amarelo}</span>
                    </div>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">INFORMAÇÕES</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Assunto:</span>
                      <p className="text-slate-900 mt-1">{campaignData.email_content?.subject || "-"}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Email remetente:</span>
                      <p className="text-slate-900 mt-1">{campaignData.email_content?.sender_email || "-"}</p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-slate-600">Tipo de envio:</span>
                      <Badge className="ml-2 bg-gradient-to-r from-cyan-500 to-purple-600">
                        {scheduleTypeLabels[campaignData.email_content?.schedule_type]?.label || "Envio Imediato"}
                      </Badge>
                      {campaignData.email_content?.schedule_type === "agendado" && campaignData.email_content?.scheduled_datetime && (
                        <p className="text-sm text-slate-600 mt-1">
                          Data: {new Date(campaignData.email_content.scheduled_datetime).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar modelo
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar um teste
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* SMS */}
          {campaignData.channels.includes("sms") && (
            <TabsContent value="sms" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    VALIDAÇÃO DA BASE
                  </h3>
                  
                  <div className="space-y-2">
                    <ValidationRow label="Quantidade total" value={mockValidation.sms.total} />
                    <ValidationRow label="Telefones inválidos" value={mockValidation.sms.invalidos} highlight />
                    <ValidationRow 
                      label="Bloquear números da black list" 
                      value={mockValidation.sms.blacklist}
                      toggleable
                      toggleValue={validationToggles.sms.blacklist}
                      onToggle={() => toggleValidation('sms', 'blacklist')}
                    />
                    <ValidationRow 
                      label="Bloquear números repetidos" 
                      value={mockValidation.sms.repetidos}
                      toggleable
                      toggleValue={validationToggles.sms.repetidos}
                      onToggle={() => toggleValidation('sms', 'repetidos')}
                    />
                    <ValidationRow 
                      label="Números com WhatsApp" 
                      value={mockValidation.sms.comWhatsapp}
                      toggleable
                      toggleValue={validationToggles.sms.comWhatsapp}
                      onToggle={() => toggleValidation('sms', 'comWhatsapp')}
                    />
                    <ValidationRow 
                      label="Números sem WhatsApp" 
                      value={mockValidation.sms.semWhatsapp}
                      toggleable
                      toggleValue={validationToggles.sms.semWhatsapp}
                      onToggle={() => toggleValidation('sms', 'semWhatsapp')}
                    />
                    <ValidationRow 
                      label="Telefones cadastrados não perturbe" 
                      value={mockValidation.sms.naoPerturbe}
                      toggleable
                      toggleValue={validationToggles.sms.naoPerturbe}
                      onToggle={() => toggleValidation('sms', 'naoPerturbe')}
                    />
                    <ValidationRow 
                      label="Mensagens acima de 160 caracteres" 
                      value={mockValidation.sms.acima160}
                      toggleable
                      toggleValue={validationToggles.sms.acima160}
                      onToggle={() => toggleValidation('sms', 'acima160')}
                      highlight={mockValidation.sms.acima160 > 0}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-green-600">{calculateApproved('sms')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">CLASSIFICAÇÃO DA BASE</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                        <span className="text-sm text-slate-700">Sinal verde (Pronto para entrega)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.sms.verde}</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-slate-700">Sinal Amarelo (Fora de área)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.sms.amarelo}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-blue-600">{mockValidation.sms.verde + mockValidation.sms.amarelo}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">INFORMAÇÕES</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Tipo de envio:</span>
                      <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-600">
                        {scheduleTypeLabels[campaignData.sms_content?.schedule_type]?.label || "Envio Imediato"}
                      </Badge>
                      {campaignData.sms_content?.schedule_type === "agendado" && campaignData.sms_content?.scheduled_datetime && (
                        <p className="text-sm text-slate-600 mt-1">
                          Data: {new Date(campaignData.sms_content.scheduled_datetime).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar modelo
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar um teste
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* WHATSAPP */}
          {campaignData.channels.includes("whatsapp") && (
            <TabsContent value="whatsapp" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    VALIDAÇÃO DA BASE
                  </h3>
                  
                  <div className="space-y-2">
                    <ValidationRow label="Quantidade total" value={mockValidation.whatsapp.total} />
                    <ValidationRow label="Telefones inválidos" value={mockValidation.whatsapp.invalidos} highlight />
                    <ValidationRow 
                      label="Bloquear números da black list" 
                      value={mockValidation.whatsapp.blacklist}
                      toggleable
                      toggleValue={validationToggles.whatsapp.blacklist}
                      onToggle={() => toggleValidation('whatsapp', 'blacklist')}
                    />
                    <ValidationRow 
                      label="Bloquear números repetidos" 
                      value={mockValidation.whatsapp.repetidos}
                      toggleable
                      toggleValue={validationToggles.whatsapp.repetidos}
                      onToggle={() => toggleValidation('whatsapp', 'repetidos')}
                    />
                    <ValidationRow 
                      label="Números com WhatsApp" 
                      value={mockValidation.whatsapp.comWhatsapp}
                      toggleable
                      toggleValue={validationToggles.whatsapp.comWhatsapp}
                      onToggle={() => toggleValidation('whatsapp', 'comWhatsapp')}
                    />
                    <ValidationRow 
                      label="Números sem WhatsApp" 
                      value={mockValidation.whatsapp.semWhatsapp}
                      toggleable
                      toggleValue={validationToggles.whatsapp.semWhatsapp}
                      onToggle={() => toggleValidation('whatsapp', 'semWhatsapp')}
                    />
                    <ValidationRow 
                      label="Telefones cadastrados não perturbe" 
                      value={mockValidation.whatsapp.naoPerturbe}
                      toggleable
                      toggleValue={validationToggles.whatsapp.naoPerturbe}
                      onToggle={() => toggleValidation('whatsapp', 'naoPerturbe')}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-green-600">{calculateApproved('whatsapp')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">CLASSIFICAÇÃO DA BASE</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                        <span className="text-sm text-slate-700">Sinal verde (Pronto para entrega)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.whatsapp.verde}</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-slate-700">Sinal Amarelo (Fora de área)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.whatsapp.amarelo}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-blue-600">{mockValidation.whatsapp.verde + mockValidation.whatsapp.amarelo}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">INFORMAÇÕES</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Tipo de envio:</span>
                      <Badge className="ml-2 bg-gradient-to-r from-emerald-500 to-emerald-600">
                        {scheduleTypeLabels[campaignData.whatsapp_content?.schedule_type]?.label || "Envio Imediato"}
                      </Badge>
                      {campaignData.whatsapp_content?.schedule_type === "agendado" && campaignData.whatsapp_content?.scheduled_datetime && (
                        <p className="text-sm text-slate-600 mt-1">
                          Data: {new Date(campaignData.whatsapp_content.scheduled_datetime).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar modelo
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar um teste
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* RCS */}
          {campaignData.channels.includes("rcs") && (
            <TabsContent value="rcs" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    VALIDAÇÃO DA BASE
                  </h3>
                  
                  <div className="space-y-2">
                    <ValidationRow label="Quantidade total" value={mockValidation.rcs.total} />
                    <ValidationRow label="Telefones inválidos" value={mockValidation.rcs.invalidos} highlight />
                    <ValidationRow 
                      label="Bloquear números da black list" 
                      value={mockValidation.rcs.blacklist}
                      toggleable
                      toggleValue={validationToggles.rcs.blacklist}
                      onToggle={() => toggleValidation('rcs', 'blacklist')}
                    />
                    <ValidationRow 
                      label="Bloquear números repetidos" 
                      value={mockValidation.rcs.repetidos}
                      toggleable
                      toggleValue={validationToggles.rcs.repetidos}
                      onToggle={() => toggleValidation('rcs', 'repetidos')}
                    />
                    <ValidationRow 
                      label="Números com WhatsApp" 
                      value={mockValidation.rcs.comWhatsapp}
                      toggleable
                      toggleValue={validationToggles.rcs.comWhatsapp}
                      onToggle={() => toggleValidation('rcs', 'comWhatsapp')}
                    />
                    <ValidationRow 
                      label="Números sem WhatsApp" 
                      value={mockValidation.rcs.semWhatsapp}
                      toggleable
                      toggleValue={validationToggles.rcs.semWhatsapp}
                      onToggle={() => toggleValidation('rcs', 'semWhatsapp')}
                    />
                    <ValidationRow 
                      label="Telefones cadastrados não perturbe" 
                      value={mockValidation.rcs.naoPerturbe}
                      toggleable
                      toggleValue={validationToggles.rcs.naoPerturbe}
                      onToggle={() => toggleValidation('rcs', 'naoPerturbe')}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-green-600">{calculateApproved('rcs')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">CLASSIFICAÇÃO DA BASE</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                        <span className="text-sm text-slate-700">Sinal verde (Pronto para entrega)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.rcs.verde}</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-slate-700">Sinal Amarelo (Fora de área)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.rcs.amarelo}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-blue-600">{mockValidation.rcs.verde + mockValidation.rcs.amarelo}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">INFORMAÇÕES</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Tipo de envio:</span>
                      <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-purple-600">
                        {scheduleTypeLabels[campaignData.rcs_content?.schedule_type]?.label || "Envio Imediato"}
                      </Badge>
                      {campaignData.rcs_content?.schedule_type === "agendado" && campaignData.rcs_content?.scheduled_datetime && (
                        <p className="text-sm text-slate-600 mt-1">
                          Data: {new Date(campaignData.rcs_content.scheduled_datetime).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar modelo
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar um teste
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* CARTA */}
          {campaignData.channels.includes("carta") && (
            <TabsContent value="carta" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-600" />
                    VALIDAÇÃO DA BASE
                  </h3>
                  
                  <div className="space-y-2">
                    <ValidationRow label="Quantidade total" value={mockValidation.carta.total} />
                    <ValidationRow 
                      label="Endereços inconsistentes" 
                      value={mockValidation.carta.inconsistentes}
                      toggleable
                      toggleValue={validationToggles.carta.inconsistentes}
                      onToggle={() => toggleValidation('carta', 'inconsistentes')}
                      highlight
                    />
                    <ValidationRow 
                      label="CEP não corresponde com UF" 
                      value={mockValidation.carta.cepIncompativel}
                      toggleable
                      toggleValue={validationToggles.carta.cepIncompativel}
                      onToggle={() => toggleValidation('carta', 'cepIncompativel')}
                      highlight
                    />
                    <ValidationRow 
                      label="Endereços sem número" 
                      value={mockValidation.carta.semNumero}
                      toggleable
                      toggleValue={validationToggles.carta.semNumero}
                      onToggle={() => toggleValidation('carta', 'semNumero')}
                      highlight
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-green-600">{calculateApproved('carta')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">CLASSIFICAÇÃO DA BASE</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                        <span className="text-sm text-slate-700">Sinal verde (Pronto para entrega)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.carta.verde}</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-slate-700">Sinal Amarelo (Retorno negativo)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{mockValidation.carta.amarelo}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QUANTIDADE TOTAL APROVADA</span>
                      <span className="text-2xl font-bold text-blue-600">{mockValidation.carta.verde + mockValidation.carta.amarelo}</span>
                    </div>
                  </div>
                </div>

                {/* Preview das Cartas Personalizadas */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      PREVIEW DAS CARTAS PERSONALIZADAS
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        Destinatário {currentPreviewIndex + 1} de {mockDestinatarios.length}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
                          disabled={currentPreviewIndex === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPreviewIndex(Math.min(mockDestinatarios.length - 1, currentPreviewIndex + 1))}
                          disabled={currentPreviewIndex === mockDestinatarios.length - 1}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Carta Preview */}
                  <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-slate-300 max-h-[600px] overflow-y-auto">
                    {/* Logo */}
                    {campaignData.carta_content?.logo_url && (
                      <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                          <p className="text-xs text-blue-700 mt-2">Logo da Empresa</p>
                        </div>
                      </div>
                    )}

                    {/* Cabeçalho */}
                    {campaignData.carta_content?.cabecalho_url && (
                      <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                        <p className="text-sm text-purple-700">Imagem de Cabeçalho</p>
                      </div>
                    )}

                    {/* Título */}
                    {campaignData.carta_content?.titulo && (
                      <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">
                        {preencherCampos(campaignData.carta_content.titulo, mockDestinatarios[currentPreviewIndex])}
                      </h2>
                    )}

                    {/* Corpo */}
                    <div 
                      className="whitespace-pre-wrap mb-6 font-serif text-slate-800"
                      style={{ 
                        fontSize: `${campaignData.carta_content?.fonte_tamanho || 12}pt`,
                        textAlign: campaignData.carta_content?.alinhamento || 'left',
                        lineHeight: campaignData.carta_content?.espacamento || '1.5'
                      }}
                    >
                      {preencherCampos(
                        campaignData.carta_content?.corpo || "", 
                        mockDestinatarios[currentPreviewIndex]
                      )}
                    </div>

                    {/* Assinatura */}
                    {campaignData.carta_content?.assinatura && (
                      <div className="mt-8 whitespace-pre-wrap text-sm text-slate-700 border-t pt-4">
                        {preencherCampos(campaignData.carta_content.assinatura, mockDestinatarios[currentPreviewIndex])}
                      </div>
                    )}

                    {/* Rodapé */}
                    {campaignData.carta_content?.rodape_url && (
                      <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                        <p className="text-sm text-purple-700">Imagem de Rodapé</p>
                      </div>
                    )}
                  </div>

                  {/* Informações do destinatário atual */}
                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">Dados do Destinatário:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(mockDestinatarios[currentPreviewIndex]).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-slate-600">{key}:</span>
                          <span className="font-semibold text-slate-900">{String(value)}</span> {/* Ensure value is a string */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ações de Geração */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-green-600" />
                    GERAR PDFs E RELATÓRIOS
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-sm text-slate-900 mb-2">PDFs Individuais</h4>
                      <p className="text-xs text-slate-600 mb-3">
                        Será gerado 1 PDF para cada destinatário aprovado com dados personalizados
                      </p>
                      <Button
                        onClick={handleGerarPDFs}
                        disabled={generatingPDFs}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        {generatingPDFs ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Gerando PDFs...
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-4 h-4 mr-2" />
                            Gerar {calculateApproved('carta')} PDFs
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-sm text-slate-900 mb-2">Arquivo Compactado</h4>
                      <p className="text-xs text-slate-600 mb-3">
                        Download de todos os PDFs em um único arquivo .zip
                      </p>
                      <Button
                        onClick={handleDownloadZip}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download .ZIP
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Planilha de Controle</h4>
                        <p className="text-xs text-slate-600">
                          Exportar relatório com status de cada destinatário (gerado/erro)
                        </p>
                      </div>
                      <Button
                        onClick={handleExportarPlanilha}
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Table className="w-4 h-4 mr-2" />
                        Exportar Excel
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">INFORMAÇÕES</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Nome do arquivo:</span>
                      <p className="text-slate-900 mt-1 font-mono text-sm">
                        {campaignData.carta_content?.nome_arquivo || "carta-{{id_cliente}}"}.pdf
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-slate-600">Formato:</span>
                      <p className="text-slate-900 mt-1">PDF A4 (210x297mm)</p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-slate-600">Margem:</span>
                      <p className="text-slate-900 mt-1">{campaignData.carta_content?.margem || "20"}mm</p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-slate-600">Tipo de envio:</span>
                      <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-amber-600">
                        {scheduleTypeLabels[campaignData.carta_content?.schedule_type]?.label || "Envio Imediato"}
                      </Badge>
                      {campaignData.carta_content?.schedule_type === "agendado" && campaignData.carta_content?.scheduled_datetime && (
                        <p className="text-sm text-slate-600 mt-1">
                          Data: {new Date(campaignData.carta_content.scheduled_datetime).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                      <Button variant="outline" className="flex-1">
                        <FileCheck className="w-4 h-4 mr-2" />
                        Visualizar PDF Completo
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir Teste
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
