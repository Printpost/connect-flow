
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Radio, 
  FileText, 
  Clock,
  Zap,
  BarChart3,
  Workflow,
  Sparkles,
  Library,
  Copy,
  Save
} from "lucide-react";
import CartaEditor from "./CartaEditor"; // Added import

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

const scheduleOptions = [
  { value: "imediato", label: "Envio Imediato", icon: Zap, description: "Enviar assim que aprovado" },
  { value: "agendado", label: "Agendar Envio", icon: Clock, description: "Escolha data e hora específicas" },
  { value: "personalizado", label: "Personalizar Envio", icon: Workflow, description: "Personalize por segmento" },
  { value: "preditivo", label: "Envio Preditivo", icon: Sparkles, description: "IA entrega no melhor momento (até 24h)" }
];

const templateOptions = [
  { value: "do_zero", label: "Criar do Zero", icon: FileText },
  { value: "biblioteca", label: "Biblioteca de Modelos", icon: Library },
  { value: "ia", label: "Criar com IA", icon: Sparkles },
  { value: "salvos", label: "Modelos Salvos", icon: Save },
  { value: "duplicar", label: "Duplicar Campanha", icon: Copy }
];

export default function ContentEditor({ campaignData, onContentChange }) {
  const [activeTab, setActiveTab] = useState(campaignData.channels[0] || "email");

  const handleEmailChange = (field, value) => {
    onContentChange({
      email_content: { ...campaignData.email_content, [field]: value }
    });
  };

  const handleSmsChange = (field, value) => {
    onContentChange({
      sms_content: { ...campaignData.sms_content, [field]: value }
    });
  };

  const handleWhatsappChange = (field, value) => {
    onContentChange({
      whatsapp_content: { ...campaignData.whatsapp_content, [field]: value }
    });
  };

  const handleRcsChange = (field, value) => {
    onContentChange({
      rcs_content: { ...campaignData.rcs_content, [field]: value }
    });
  };

  // Retained original handleCartaChange, assuming CartaEditor will call it with (field, value)
  const handleCartaChange = (field, value) => {
    onContentChange({
      carta_content: { ...campaignData.carta_content, [field]: value }
    });
  };

  if (campaignData.channels.length === 0) {
    return (
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum canal selecionado</h3>
          <p className="text-slate-500">Volte e selecione pelo menos um canal para criar o conteúdo</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">Criar Conteúdo</CardTitle>
        <p className="text-slate-600 mt-2">Configure o conteúdo e cronograma para cada canal</p>
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
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 transition-all duration-200"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {channelNames[channel]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* EMAIL CONTENT */}
          {campaignData.channels.includes("email") && (
            <TabsContent value="email" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Informações Básicas */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Informações do Email
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email-sender">Email Remetente *</Label>
                      <Input
                        id="email-sender"
                        type="email"
                        placeholder="noreply@empresa.com"
                        value={campaignData.email_content?.sender_email || ""}
                        onChange={(e) => handleEmailChange("sender_email", e.target.value)}
                        className="mt-2 border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-reply">Email de Resposta</Label>
                      <Input
                        id="email-reply"
                        type="email"
                        placeholder="contato@empresa.com"
                        value={campaignData.email_content?.reply_to_email || ""}
                        onChange={(e) => handleEmailChange("reply_to_email", e.target.value)}
                        className="mt-2 border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email-subject">Assunto *</Label>
                    <Input
                      id="email-subject"
                      placeholder="Ex: Nova oferta especial para você!"
                      value={campaignData.email_content?.subject || ""}
                      onChange={(e) => handleEmailChange("subject", e.target.value)}
                      className="mt-2 border-slate-200"
                    />
                  </div>
                </div>

                {/* Cronograma de Envio */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Cronograma de Envio
                  </h3>
                  
                  <RadioGroup 
                    value={campaignData.email_content?.schedule_type || "imediato"}
                    onValueChange={(value) => handleEmailChange("schedule_type", value)}
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      {scheduleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value} className="flex items-start space-x-3 border-2 border-slate-200 rounded-lg p-4 hover:border-cyan-300 transition-colors cursor-pointer">
                            <RadioGroupItem value={option.value} id={`email-${option.value}`} />
                            <div className="flex-1">
                              <Label htmlFor={`email-${option.value}`} className="cursor-pointer flex items-center gap-2 font-semibold">
                                <Icon className="w-4 h-4" />
                                {option.label}
                              </Label>
                              <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>

                  {campaignData.email_content?.schedule_type === "agendado" && (
                    <div className="mt-4">
                      <Label>Data e Hora do Envio</Label>
                      <Input
                        type="datetime-local"
                        value={campaignData.email_content?.scheduled_datetime || ""}
                        onChange={(e) => handleEmailChange("scheduled_datetime", e.target.value)}
                        className="mt-2 border-slate-200"
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
                        checked={campaignData.email_content?.monitoring_enabled || false}
                        onCheckedChange={(checked) => handleEmailChange("monitoring_enabled", checked)}
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
                        checked={campaignData.email_content?.automation_enabled || false}
                        onCheckedChange={(checked) => handleEmailChange("automation_enabled", checked)}
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
                    {templateOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = campaignData.email_content?.template_source === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleEmailChange("template_source", option.value)}
                          className={`h-auto py-4 flex flex-col items-center gap-2 ${
                            isSelected ? "bg-gradient-to-r from-cyan-500 to-purple-600" : ""
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs text-center">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="email-body">Corpo do Email</Label>
                    <Textarea
                      id="email-body"
                      placeholder="Digite o conteúdo do email..."
                      value={campaignData.email_content?.body || ""}
                      onChange={(e) => handleEmailChange("body", e.target.value)}
                      className="mt-2 min-h-[200px] border-slate-200"
                    />
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* SMS CONTENT */}
          {campaignData.channels.includes("sms") && (
            <TabsContent value="sms" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Cronograma de Envio */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Cronograma de Envio
                  </h3>
                  
                  <RadioGroup 
                    value={campaignData.sms_content?.schedule_type || "imediato"}
                    onValueChange={(value) => handleSmsChange("schedule_type", value)}
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      {scheduleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value} className="flex items-start space-x-3 border-2 border-slate-200 rounded-lg p-4 hover:border-cyan-300 transition-colors cursor-pointer">
                            <RadioGroupItem value={option.value} id={`sms-${option.value}`} />
                            <div className="flex-1">
                              <Label htmlFor={`sms-${option.value}`} className="cursor-pointer flex items-center gap-2 font-semibold">
                                <Icon className="w-4 h-4" />
                                {option.label}
                              </Label>
                              <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>

                  {campaignData.sms_content?.schedule_type === "agendado" && (
                    <div className="mt-4">
                      <Label>Data e Hora do Envio</Label>
                      <Input
                        type="datetime-local"
                        value={campaignData.sms_content?.scheduled_datetime || ""}
                        onChange={(e) => handleSmsChange("scheduled_datetime", e.target.value)}
                        className="mt-2 border-slate-200"
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
                        checked={campaignData.sms_content?.monitoring_enabled || false}
                        onCheckedChange={(checked) => handleSmsChange("monitoring_enabled", checked)}
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
                        checked={campaignData.sms_content?.automation_enabled || false}
                        onCheckedChange={(checked) => handleSmsChange("automation_enabled", checked)}
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
                    {templateOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = campaignData.sms_content?.template_source === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleSmsChange("template_source", option.value)}
                          className={`h-auto py-4 flex flex-col items-center gap-2 ${
                            isSelected ? "bg-gradient-to-r from-cyan-500 to-purple-600" : ""
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs text-center">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="sms-message">Mensagem SMS</Label>
                    <Textarea
                      id="sms-message"
                      placeholder="Digite a mensagem (máx 160 caracteres)..."
                      value={campaignData.sms_content?.message || ""}
                      onChange={(e) => handleSmsChange("message", e.target.value)}
                      maxLength={160}
                      className="mt-2 min-h-[120px] border-slate-200"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      {(campaignData.sms_content?.message || "").length}/160 caracteres
                    </p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* WHATSAPP CONTENT */}
          {campaignData.channels.includes("whatsapp") && (
            <TabsContent value="whatsapp" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Cronograma de Envio */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Cronograma de Envio
                  </h3>
                  
                  <RadioGroup 
                    value={campaignData.whatsapp_content?.schedule_type || "imediato"}
                    onValueChange={(value) => handleWhatsappChange("schedule_type", value)}
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      {scheduleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value} className="flex items-start space-x-3 border-2 border-slate-200 rounded-lg p-4 hover:border-cyan-300 transition-colors cursor-pointer">
                            <RadioGroupItem value={option.value} id={`whatsapp-${option.value}`} />
                            <div className="flex-1">
                              <Label htmlFor={`whatsapp-${option.value}`} className="cursor-pointer flex items-center gap-2 font-semibold">
                                <Icon className="w-4 h-4" />
                                {option.label}
                              </Label>
                              <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>

                  {campaignData.whatsapp_content?.schedule_type === "agendado" && (
                    <div className="mt-4">
                      <Label>Data e Hora do Envio</Label>
                      <Input
                        type="datetime-local"
                        value={campaignData.whatsapp_content?.scheduled_datetime || ""}
                        onChange={(e) => handleWhatsappChange("scheduled_datetime", e.target.value)}
                        className="mt-2 border-slate-200"
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
                        checked={campaignData.whatsapp_content?.monitoring_enabled || false}
                        onCheckedChange={(checked) => handleWhatsappChange("monitoring_enabled", checked)}
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
                        checked={campaignData.whatsapp_content?.automation_enabled || false}
                        onCheckedChange={(checked) => handleWhatsappChange("automation_enabled", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Canal Conectado */}
                <div className="p-6 bg-slate-50 rounded-xl">
                  <Label>Selecionar Canal Conectado</Label>
                  <Select
                    value={campaignData.whatsapp_content?.connected_channel || ""}
                    onValueChange={(value) => handleWhatsappChange("connected_channel", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Escolha um canal conectado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="channel1">WhatsApp Business 1</SelectItem>
                      <SelectItem value="channel2">WhatsApp Business 2</SelectItem>
                      <SelectItem value="channel3">WhatsApp Business 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Criar Mensagem */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Criar Mensagem
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[...templateOptions, { value: "meta_templates", label: "Templates META", icon: Smartphone }].map((option) => {
                      const Icon = option.icon;
                      const isSelected = campaignData.whatsapp_content?.template_source === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleWhatsappChange("template_source", option.value)}
                          className={`h-auto py-4 flex flex-col items-center gap-2 ${
                            isSelected ? "bg-gradient-to-r from-cyan-500 to-purple-600" : ""
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs text-center">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="whatsapp-message">Mensagem WhatsApp</Label>
                      <Textarea
                        id="whatsapp-message"
                        placeholder="Digite a mensagem..."
                        value={campaignData.whatsapp_content?.message || ""}
                        onChange={(e) => handleWhatsappChange("message", e.target.value)}
                        className="mt-2 min-h-[150px] border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp-media">URL da Mídia (opcional)</Label>
                      <Input
                        id="whatsapp-media"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={campaignData.whatsapp_content?.media_url || ""}
                        onChange={(e) => handleWhatsappChange("media_url", e.target.value)}
                        className="mt-2 border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* RCS CONTENT */}
          {campaignData.channels.includes("rcs") && (
            <TabsContent value="rcs" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Cronograma de Envio */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Cronograma de Envio
                  </h3>
                  
                  <RadioGroup 
                    value={campaignData.rcs_content?.schedule_type || "imediato"}
                    onValueChange={(value) => handleRcsChange("schedule_type", value)}
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      {scheduleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value} className="flex items-start space-x-3 border-2 border-slate-200 rounded-lg p-4 hover:border-cyan-300 transition-colors cursor-pointer">
                            <RadioGroupItem value={option.value} id={`rcs-${option.value}`} />
                            <div className="flex-1">
                              <Label htmlFor={`rcs-${option.value}`} className="cursor-pointer flex items-center gap-2 font-semibold">
                                <Icon className="w-4 h-4" />
                                {option.label}
                              </Label>
                              <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>

                  {campaignData.rcs_content?.schedule_type === "agendado" && (
                    <div className="mt-4">
                      <Label>Data e Hora do Envio</Label>
                      <Input
                        type="datetime-local"
                        value={campaignData.rcs_content?.scheduled_datetime || ""}
                        onChange={(e) => handleRcsChange("scheduled_datetime", e.target.value)}
                        className="mt-2 border-slate-200"
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
                        checked={campaignData.rcs_content?.monitoring_enabled || false}
                        onCheckedChange={(checked) => handleRcsChange("monitoring_enabled", checked)}
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
                        checked={campaignData.rcs_content?.automation_enabled || false}
                        onCheckedChange={(checked) => handleRcsChange("automation_enabled", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Canal Conectado */}
                <div className="p-6 bg-slate-50 rounded-xl">
                  <Label>Selecionar Canal Conectado</Label>
                  <Select
                    value={campaignData.rcs_content?.connected_channel || ""}
                    onValueChange={(value) => handleRcsChange("connected_channel", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Escolha um canal RCS conectado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rcs1">RCS Channel 1</SelectItem>
                      <SelectItem value="rcs2">RCS Channel 2</SelectItem>
                      <SelectItem value="rcs3">RCS Channel 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Criar Mensagem */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Criar Mensagem
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[...templateOptions, { value: "google_templates", label: "Templates Google", icon: Radio }].map((option) => {
                      const Icon = option.icon;
                      const isSelected = campaignData.rcs_content?.template_source === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleRcsChange("template_source", option.value)}
                          className={`h-auto py-4 flex flex-col items-center gap-2 ${
                            isSelected ? "bg-gradient-to-r from-cyan-500 to-purple-600" : ""
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs text-center">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="rcs-title">Título RCS</Label>
                      <Input
                        id="rcs-title"
                        placeholder="Título da mensagem"
                        value={campaignData.rcs_content?.title || ""}
                        onChange={(e) => handleRcsChange("title", e.target.value)}
                        className="mt-2 border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rcs-message">Mensagem RCS</Label>
                      <Textarea
                        id="rcs-message"
                        placeholder="Digite a mensagem..."
                        value={campaignData.rcs_content?.message || ""}
                        onChange={(e) => handleRcsChange("message", e.target.value)}
                        className="mt-2 min-h-[150px] border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rcs-media">URL da Mídia (opcional)</Label>
                      <Input
                        id="rcs-media"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={campaignData.rcs_content?.media_url || ""}
                        onChange={(e) => handleRcsChange("media_url", e.target.value)}
                        className="mt-2 border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* CARTA CONTENT - Refactored to CartaEditor component */}
          {campaignData.channels.includes("carta") && (
            <TabsContent value="carta" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* CartaEditor will take cartaData and emit changes via onCartaChange(field, value) */}
                <CartaEditor
                  cartaData={campaignData.carta_content || {}}
                  onCartaChange={handleCartaChange} // Pass the handler directly for (field, value) updates
                />
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
