import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Smartphone, Radio, FileText, Check } from "lucide-react";

const channels = [
  { 
    id: "email", 
    name: "Email", 
    icon: Mail, 
    color: "from-blue-500 to-blue-600",
    description: "Envie emails personalizados com rich content"
  },
  { 
    id: "sms", 
    name: "SMS", 
    icon: MessageSquare, 
    color: "from-green-500 to-green-600",
    description: "Mensagens de texto curtas e diretas"
  },
  { 
    id: "whatsapp", 
    name: "WhatsApp", 
    icon: Smartphone, 
    color: "from-emerald-500 to-emerald-600",
    description: "Comunicação via WhatsApp Business"
  },
  { 
    id: "rcs", 
    name: "RCS", 
    icon: Radio, 
    color: "from-purple-500 to-purple-600",
    description: "Rich Communication Services com mídia"
  },
  { 
    id: "carta", 
    name: "Carta", 
    icon: FileText, 
    color: "from-amber-500 to-amber-600",
    description: "Correspondência física impressa"
  }
];

export default function ChannelSelector({ selectedChannels, onChannelsChange }) {
  const toggleChannel = (channelId) => {
    if (selectedChannels.includes(channelId)) {
      onChannelsChange(selectedChannels.filter(id => id !== channelId));
    } else {
      onChannelsChange([...selectedChannels, channelId]);
    }
  };

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">Selecionar Canais de Comunicação</CardTitle>
        <p className="text-slate-600 mt-2">Escolha um ou mais canais para sua campanha</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            const isSelected = selectedChannels.includes(channel.id);
            
            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => toggleChannel(channel.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                    isSelected 
                      ? "border-transparent bg-gradient-to-br from-cyan-50 to-purple-50 shadow-lg" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${channel.color} shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{channel.name}</h3>
                  <p className="text-sm text-slate-600">{channel.description}</p>
                </button>
              </motion.div>
            );
          })}
        </div>

        {selectedChannels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-xl"
          >
            <p className="text-sm font-semibold text-slate-900">
              {selectedChannels.length} {selectedChannels.length === 1 ? 'canal selecionado' : 'canais selecionados'}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}