
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Radio,
  FileText,
  Sparkles,
  Zap,
  History,
  DollarSign,
  Users
} from "lucide-react";

import CampaignTypeSelector from "../components/campaign/CampaignTypeSelector";
import ChannelSelector from "../components/campaign/ChannelSelector";
import RecipientSelector from "../components/campaign/RecipientSelector";
import ContentEditor from "../components/campaign/ContentEditor";
import CampaignPreview from "../components/campaign/CampaignPreview";
import QuickSendForm from "../components/campaign/QuickSendForm";

const steps = [
  { id: 0, name: "Tipo de Envio", icon: Zap },
  { id: 1, name: "Informações Básicas", icon: Sparkles },
  { id: 2, name: "Selecionar Canais", icon: Radio },
  { id: 3, name: "Destinatários", icon: Users },
  { id: 4, name: "Criar Conteúdo", icon: FileText },
  { id: 5, name: "Revisar e Agendar", icon: Check }
];

export default function NovaCampanha() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: "",
    centro_de_custo: "",
    type: "",
    channels: [],
    recipient_source: "",
    recipient_file_url: "",
    recipient_list_name: "",
    manual_recipients: [], // Added for QuickSendForm
    total_recipients: 0,
    scheduled_date: "",
    trigger_event: "",
    email_content: { subject: "", body: "" },
    sms_content: { message: "" },
    whatsapp_content: { message: "", media_url: "" },
    rcs_content: { title: "", message: "", media_url: "" },
    carta_content: { header: "", body: "" }
  });

  const { data: previousCampaigns = [] } = useQuery({
    queryKey: ['previous-campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date', 50),
    initialData: [],
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate(createPageUrl("Campanhas"));
    },
  });

  const handleNext = () => {
    // Se selecionou automação, redireciona para o builder visual
    if (currentStep === 0 && campaignData.type === "automacao") {
      navigate(createPageUrl("AutomationBuilder"));
      return;
    }
    
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    const status = campaignData.scheduled_date ? 'agendada' : 'rascunho';
    await createCampaignMutation.mutateAsync({
      ...campaignData,
      status
    });
  };

  const canProceed = () => {
    if (currentStep === 0) return campaignData.type !== "";
    if (currentStep === 1) {
      if (campaignData.type === "envio_rapido") {
        return campaignData.name.trim() !== "";
      }
      return campaignData.name.trim() !== "" && campaignData.centro_de_custo.trim() !== "";
    }
    if (currentStep === 2) return campaignData.channels.length > 0;
    if (currentStep === 3) {
      if (campaignData.type === "envio_rapido") {
        return campaignData.manual_recipients && campaignData.manual_recipients.length > 0;
      }
      return campaignData.recipient_source !== "" && campaignData.total_recipients > 0;
    }
    if (currentStep === 4) return true;
    return true;
  };

  const filteredSuggestions = previousCampaigns
    .filter(campaign => 
      campaign.name?.toLowerCase().includes(campaignData.name.toLowerCase()) &&
      campaign.name !== campaignData.name
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Nova Campanha</h1>
          <p className="text-slate-600 text-lg">Crie sua campanha multicanal em poucos passos</p>
        </motion.div>

        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 -z-10">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {steps.slice(1).map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30 scale-110" 
                          : isCompleted 
                          ? "bg-green-500 text-white" 
                          : "bg-white border-2 border-slate-200 text-slate-400"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </motion.div>
                    <span className={`mt-2 text-sm font-medium hidden lg:block ${
                      isActive ? "text-slate-900" : "text-slate-500"
                    }`}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <CampaignTypeSelector
                selectedType={campaignData.type}
                onTypeChange={(type) => setCampaignData({...campaignData, type})}
              />
            )}

            {currentStep === 1 && campaignData.type === "envio_rapido" && (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      Nome do Envio Rápido *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Envio Individual Cliente VIP"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                      className="mt-2 h-12 text-base border-slate-200 focus:border-cyan-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && campaignData.type === "campanha" && (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      Nome da Campanha *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Lançamento Produto X"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="mt-2 h-12 text-base border-slate-200 focus:border-cyan-500"
                    />
                    
                    <AnimatePresence>
                      {showSuggestions && campaignData.name && filteredSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="p-2 bg-slate-50 border-b border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2">
                              Campanhas Anteriores
                            </p>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredSuggestions.map((campaign) => (
                              <button
                                key={campaign.id}
                                onClick={() => {
                                  setCampaignData({
                                    ...campaignData, 
                                    name: campaign.name,
                                    centro_de_custo: campaign.centro_de_custo || ""
                                  });
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors duration-200 flex items-center gap-3 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <History className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{campaign.name}</p>
                                  {campaign.centro_de_custo && (
                                    <p className="text-xs text-slate-500">Centro: {campaign.centro_de_custo}</p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <p className="text-sm text-slate-500 mt-2">
                      Digite para ver campanhas anteriores relacionadas
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="centro-custo" className="text-base font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      Centro de Custo *
                    </Label>
                    <Input
                      id="centro-custo"
                      placeholder="Ex: Marketing, Vendas, TI"
                      value={campaignData.centro_de_custo}
                      onChange={(e) => setCampaignData({...campaignData, centro_de_custo: e.target.value})}
                      className="mt-2 h-12 text-base border-slate-200 focus:border-cyan-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && campaignData.type === "automacao" && (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      Nome da Automação *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Boas-vindas Novos Clientes"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="mt-2 h-12 text-base border-slate-200 focus:border-cyan-500"
                    />
                    
                    <AnimatePresence>
                      {showSuggestions && campaignData.name && filteredSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="p-2 bg-slate-50 border-b border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2">
                              Automações Anteriores
                            </p>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredSuggestions.map((campaign) => (
                              <button
                                key={campaign.id}
                                onClick={() => {
                                  setCampaignData({
                                    ...campaignData, 
                                    name: campaign.name,
                                    centro_de_custo: campaign.centro_de_custo || "",
                                    trigger_event: campaign.trigger_event || ""
                                  });
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors duration-200 flex items-center gap-3 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <History className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{campaign.name}</p>
                                  {campaign.centro_de_custo && (
                                    <p className="text-xs text-slate-500">Centro: {campaign.centro_de_custo}</p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <p className="text-sm text-slate-500 mt-2">
                      Digite para ver automações anteriores relacionadas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="centro-custo" className="text-base font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      Centro de Custo *
                    </Label>
                    <Input
                      id="centro-custo"
                      placeholder="Ex: Marketing, Vendas, TI"
                      value={campaignData.centro_de_custo}
                      onChange={(e) => setCampaignData({...campaignData, centro_de_custo: e.target.value})}
                      className="mt-2 h-12 text-base border-slate-200 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trigger" className="text-base font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-500" />
                      Evento de Acionamento
                    </Label>
                    <Input
                      id="trigger"
                      placeholder="Ex: Novo cadastro, Carrinho abandonado, Aniversário"
                      value={campaignData.trigger_event || ""}
                      onChange={(e) => setCampaignData({...campaignData, trigger_event: e.target.value})}
                      className="mt-2 h-12 text-base border-slate-200 focus:border-cyan-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Defina qual evento irá acionar automaticamente esta comunicação
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <ChannelSelector
                selectedChannels={campaignData.channels}
                onChannelsChange={(channels) => setCampaignData({...campaignData, channels})}
              />
            )}

            {currentStep === 3 && campaignData.type === "envio_rapido" && (
              <QuickSendForm
                campaignData={campaignData}
                onRecipientChange={(data) => setCampaignData({...campaignData, ...data})}
              />
            )}

            {currentStep === 3 && campaignData.type !== "envio_rapido" && (
              <RecipientSelector
                recipientData={campaignData}
                onRecipientChange={(data) => setCampaignData({...campaignData, ...data})}
              />
            )}

            {currentStep === 4 && (
              <ContentEditor
                campaignData={campaignData}
                onContentChange={(content) => setCampaignData({...campaignData, ...content})}
              />
            )}

            {currentStep === 5 && (
              <CampaignPreview
                campaignData={campaignData}
                onScheduleDateChange={(date) => setCampaignData({...campaignData, scheduled_date: date})}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-6 border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          {currentStep < 5 || (currentStep === 0 && campaignData.type === "automacao") ? ( // Modified condition for 'Próximo' button
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createCampaignMutation.isPending}
              className="px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
            >
              {createCampaignMutation.isPending ? "Salvando..." : `Criar ${
                campaignData.type === "envio_rapido" ? "Envio Rápido" :
                campaignData.type === "campanha" ? "Campanha" : "Automação"
              }`}
              <Check className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
