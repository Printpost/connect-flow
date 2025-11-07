// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Library,
  Building2,
  Users,
  ShieldBan,
  UserCheck,
  ArrowRight,
  RefreshCw
} from "lucide-react";

const tools = [
  {
    id: "biblioteca",
    name: "Biblioteca de Modelos",
    description: "Gerencie templates e modelos de mensagens",
    icon: Library,
    color: "from-blue-500 to-blue-600",
    url: createPageUrl("BibliotecaModelos")
  },
  {
    id: "centro-custo",
    name: "Centro de Custo",
    description: "Cadastre e gerencie centros de custo (PF e PJ)",
    icon: Building2,
    color: "from-purple-500 to-purple-600",
    url: createPageUrl("CentroDeCusto")
  },
  {
    id: "listas-contatos",
    name: "Listas de Contatos",
    description: "Crie e gerencie suas listas de contatos",
    icon: Users,
    color: "from-green-500 to-green-600",
    url: createPageUrl("ListasContatos")
  },
  {
    id: "blacklist",
    name: "Cadastro de Blacklist",
    description: "Gerencie bloqueios de email, telefone e endereço",
    icon: ShieldBan,
    color: "from-red-500 to-red-600",
    url: createPageUrl("Blacklist")
  },
  {
    id: "ratinho",
    name: "Cadastrar Ratinho",
    description: "Configure aprovadores de ações da plataforma",
    icon: UserCheck,
    color: "from-amber-500 to-amber-600",
    url: createPageUrl("Ratinho")
  },
  {
    id: "central-retorno",
    name: "Central de Retorno",
    description: "Envie arquivos de retorno e vincule pedidos",
    icon: RefreshCw,
    color: "from-cyan-500 to-purple-600",
    url: createPageUrl("CentralRetorno")
  }
];

export default function Ferramentas() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Ferramentas</h1>
        <p className="text-slate-600 text-lg">Gerencie recursos e configurações da plataforma</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={tool.url}>
                <Card className="border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 bg-white overflow-hidden group cursor-pointer h-full">
                  <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${tool.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-cyan-600 transition-colors">
                      {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{tool.description}</p>
                    <div className="flex items-center text-cyan-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                      <span>Acessar</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
