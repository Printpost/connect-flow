import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, FileText, Users, Upload, Check, Loader2, List } from "lucide-react";

const recipientSources = [
  {
    id: "excel",
    name: "Enviar por Excel",
    icon: FileSpreadsheet,
    color: "from-green-500 to-green-600",
    description: "Faça upload de uma planilha Excel (.xlsx) com seus contatos",
    accept: ".xlsx,.xls"
  },
  {
    id: "csv",
    name: "Enviar por CSV",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    description: "Faça upload de um arquivo CSV com seus contatos",
    accept: ".csv"
  },
  {
    id: "lista_contatos",
    name: "Lista de Contatos",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    description: "Selecione uma lista de contatos já existente",
    accept: null
  }
];

export default function RecipientSelector({ recipientData, onRecipientChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [listName, setListName] = useState(recipientData.recipient_list_name || "");

  const handleFileUpload = async (e, sourceType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Aqui você pode processar o arquivo para contar os destinatários
      const mockRecipientCount = Math.floor(Math.random() * 500) + 100;

      onRecipientChange({
        recipient_source: sourceType,
        recipient_file_url: file_url,
        total_recipients: mockRecipientCount
      });

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleListSelection = () => {
    if (!listName.trim()) return;

    const mockRecipientCount = Math.floor(Math.random() * 300) + 50;

    onRecipientChange({
      recipient_source: "lista_contatos",
      recipient_list_name: listName,
      total_recipients: mockRecipientCount
    });
  };

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">Seleção de Destinatários</CardTitle>
        <p className="text-slate-600 mt-2">Escolha como você deseja adicionar os destinatários da campanha</p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {recipientSources.map((source, index) => {
            const Icon = source.icon;
            const isSelected = recipientData.recipient_source === source.id;

            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer border-2 transition-all duration-300 overflow-hidden group hover:shadow-lg ${
                    isSelected
                      ? "border-transparent shadow-xl ring-2 ring-offset-2 ring-cyan-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`h-2 bg-gradient-to-r ${source.color}`} />
                  <CardContent className="p-6 relative">
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${source.color} shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{source.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{source.description}</p>

                    {source.accept ? (
                      <div>
                        <input
                          type="file"
                          accept={source.accept}
                          onChange={(e) => handleFileUpload(e, source.id)}
                          id={`file-${source.id}`}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label htmlFor={`file-${source.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-slate-300 hover:bg-slate-50"
                            disabled={uploading}
                            onClick={() => document.getElementById(`file-${source.id}`).click()}
                          >
                            {uploading && recipientData.recipient_source === source.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : isSelected ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Arquivo Enviado
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Fazer Upload
                              </>
                            )}
                          </Button>
                        </label>

                        {uploading && recipientData.recipient_source === source.id && (
                          <div className="mt-3">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1 text-center">{uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          placeholder="Nome da lista"
                          value={listName}
                          onChange={(e) => setListName(e.target.value)}
                          className="border-slate-300"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-slate-300 hover:bg-slate-50"
                          onClick={handleListSelection}
                          disabled={!listName.trim()}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Lista Selecionada
                            </>
                          ) : (
                            <>
                              <List className="w-4 h-4 mr-2" />
                              Selecionar Lista
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {recipientData.recipient_source && recipientData.total_recipients > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Destinatários Carregados</h4>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {recipientData.total_recipients} contatos prontos para receber a campanha
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {recipientData.total_recipients}
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">contatos</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}