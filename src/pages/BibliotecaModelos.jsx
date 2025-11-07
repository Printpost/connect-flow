import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Library, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BibliotecaModelos() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Ferramentas"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Biblioteca de Modelos</h1>
        <p className="text-slate-600 text-lg mb-8">Gerencie seus templates e modelos de mensagens</p>
      </motion.div>

      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
        <CardContent className="p-12 text-center">
          <Library className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Em breve</h3>
          <p className="text-slate-600">Funcionalidade em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}