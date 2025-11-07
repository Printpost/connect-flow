import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Send, Zap, Rocket, Clock, Users, Workflow, Target } from "lucide-react";

const campaignTypes = [
  {
    id: "envio_rapido",
    name: "Envio Rápido",
    icon: Rocket,
    color: "from-orange-500 to-red-600",
    description: "Disparo individual rápido sem importar arquivos de dados",
    features: [
      "Envio imediato",
      "Digite ou cole os dados",
      "Sem necessidade de importação"
    ]
  },
  {
    id: "campanha",
    name: "Campanha",
    icon: Send,
    color: "from-cyan-500 to-blue-600",
    description: "Envie mensagens únicas para um grupo de destinatários",
    features: [
      "Envio único ou agendado",
      "Segmentação de público",
      "Múltiplos canais simultâneos"
    ]
  },
  {
    id: "automacao",
    name: "Automação",
    icon: Zap,
    color: "from-purple-500 to-pink-600",
    description: "Configure fluxos automáticos que são acionados por eventos específicos",
    features: [
      "Acionamento por eventos",
      "Fluxos personalizados",
      "Respostas automáticas"
    ]
  }
];

export default function CampaignTypeSelector({ selectedType, onTypeChange }) {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Escolha o Tipo de Envio</h2>
        <p className="text-lg text-slate-600">Selecione como deseja configurar suas comunicações</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {campaignTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => onTypeChange(type.id)}
                className={`cursor-pointer border-2 transition-all duration-300 overflow-hidden group hover:shadow-2xl ${
                  isSelected
                    ? "border-transparent shadow-2xl scale-105"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${type.color}`} />
                <CardContent className="p-8 relative">
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-6 right-6 w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${type.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{type.name}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{type.description}</p>

                  <div className="space-y-3">
                    {type.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + idx * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.color}`} />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`mt-6 pt-6 border-t border-slate-100`}
                    >
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                        <Target className="w-4 h-4" />
                        <span>Selecionado</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 rounded-2xl border border-slate-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Workflow className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                {selectedType === "envio_rapido" ? "Modo Envio Rápido Selecionado" : 
                 selectedType === "campanha" ? "Modo Campanha Selecionado" : 
                 "Modo Automação Selecionado"}
              </h4>
              <p className="text-sm text-slate-600">
                {selectedType === "envio_rapido" 
                  ? "Você poderá fazer disparos individuais digitando ou colando os dados dos destinatários diretamente."
                  : selectedType === "campanha" 
                  ? "Você poderá configurar um envio único ou agendado para seus destinatários."
                  : "Você poderá criar fluxos automáticos que serão acionados por eventos específicos."
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}