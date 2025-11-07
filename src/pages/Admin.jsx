
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Package,
  Truck,
  DollarSign,
  FileText,
  ArrowRight,
  Shield,
  TrendingUp // Added TrendingUp icon
} from "lucide-react";

const adminTools = [
  {
    id: "clientes",
    name: "Gerenciar Clientes",
    description: "Cadastre e gerencie clientes (PJ e PF)",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    url: createPageUrl("GerenciarClientes")
  },
  {
    id: "comercial",
    name: "Comercial",
    description: "Orçamento, métricas e análises de vendas",
    icon: TrendingUp,
    color: "from-cyan-500 to-cyan-600",
    url: createPageUrl("Comercial")
  },
  {
    id: "financeiro",
    name: "Financeiro",
    description: "ERP Financeiro + Fornecedores + Comissionados + Produtos",
    icon: DollarSign,
    color: "from-amber-500 to-amber-600",
    url: createPageUrl("Financeiro")
  },
  {
    id: "contratos",
    name: "Modelos de Contratos",
    description: "Gerencie templates de contratos",
    icon: FileText,
    color: "from-rose-500 to-rose-600",
    url: createPageUrl("GerenciarContratos")
  }
];

export default function Admin() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Área Administrativa</h1>
            <p className="text-slate-600 text-lg">Gerencie clientes, comissionados e configurações</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool, index) => {
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
