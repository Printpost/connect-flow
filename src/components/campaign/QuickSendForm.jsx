import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Plus, X, User, Mail, Phone, MapPin, Copy } from "lucide-react";

export default function QuickSendForm({ campaignData, onRecipientChange }) {
  const [recipients, setRecipients] = useState(campaignData.manual_recipients || []);
  const [currentRecipient, setCurrentRecipient] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [bulkText, setBulkText] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  const addRecipient = () => {
    if (!currentRecipient.name && !currentRecipient.email && !currentRecipient.phone && !currentRecipient.address) {
      return;
    }

    const newRecipients = [...recipients, { ...currentRecipient, id: Date.now() }];
    setRecipients(newRecipients);
    onRecipientChange({
      manual_recipients: newRecipients,
      recipient_source: "manual",
      total_recipients: newRecipients.length
    });
    setCurrentRecipient({ name: "", email: "", phone: "", address: "" });
  };

  const removeRecipient = (index) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(newRecipients);
    onRecipientChange({
      manual_recipients: newRecipients,
      recipient_source: "manual",
      total_recipients: newRecipients.length
    });
  };

  const processBulkText = () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    const newRecipients = lines.map((line, index) => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      return {
        id: Date.now() + index,
        name: parts[0] || "",
        email: parts[1] || "",
        phone: parts[2] || "",
        address: parts[3] || ""
      };
    });

    const allRecipients = [...recipients, ...newRecipients];
    setRecipients(allRecipients);
    onRecipientChange({
      manual_recipients: allRecipients,
      recipient_source: "manual",
      total_recipients: allRecipients.length
    });
    setBulkText("");
    setShowBulkInput(false);
  };

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">Destinatários do Envio Rápido</CardTitle>
        <p className="text-slate-600 mt-2">Digite ou cole os dados dos destinatários</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Adicionar destinatário individual */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
          <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-600" />
            Adicionar Destinatário
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="recipient-name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Nome
              </Label>
              <Input
                id="recipient-name"
                placeholder="Ex: João Silva"
                value={currentRecipient.name}
                onChange={(e) => setCurrentRecipient({...currentRecipient, name: e.target.value})}
                className="mt-2 border-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="recipient-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Email
              </Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="Ex: joao@email.com"
                value={currentRecipient.email}
                onChange={(e) => setCurrentRecipient({...currentRecipient, email: e.target.value})}
                className="mt-2 border-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="recipient-phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                Telefone
              </Label>
              <Input
                id="recipient-phone"
                placeholder="Ex: (11) 98888-7777"
                value={currentRecipient.phone}
                onChange={(e) => setCurrentRecipient({...currentRecipient, phone: e.target.value})}
                className="mt-2 border-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="recipient-address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                Endereço
              </Label>
              <Input
                id="recipient-address"
                placeholder="Ex: Rua X, 123"
                value={currentRecipient.address}
                onChange={(e) => setCurrentRecipient({...currentRecipient, address: e.target.value})}
                className="mt-2 border-slate-200"
              />
            </div>
          </div>

          <Button 
            onClick={addRecipient}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Destinatário
          </Button>
        </div>

        {/* Adicionar múltiplos em lote */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
              <Copy className="w-5 h-5 text-purple-600" />
              Adicionar Múltiplos (Colar)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkInput(!showBulkInput)}
            >
              {showBulkInput ? "Fechar" : "Abrir"}
            </Button>
          </div>

          {showBulkInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-sm text-slate-600 mb-3">
                Cole os dados separados por vírgula, ponto e vírgula ou tabulação. Uma linha por destinatário.
                <br />
                <span className="font-semibold">Formato: Nome, Email, Telefone, Endereço</span>
              </p>
              <Textarea
                placeholder="João Silva, joao@email.com, (11) 98888-7777, Rua X 123&#10;Maria Santos, maria@email.com, (11) 97777-6666, Rua Y 456"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="min-h-[120px] border-purple-200 mb-3"
              />
              <Button 
                onClick={processBulkText}
                disabled={!bulkText.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Processar e Adicionar
              </Button>
            </motion.div>
          )}
        </div>

        {/* Lista de destinatários */}
        {recipients.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-4">
              Destinatários Adicionados ({recipients.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recipients.map((recipient, index) => (
                <motion.div
                  key={recipient.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-cyan-300 transition-colors flex items-start justify-between group"
                >
                  <div className="flex-1 grid md:grid-cols-2 gap-2">
                    {recipient.name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{recipient.name}</span>
                      </div>
                    )}
                    {recipient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{recipient.email}</span>
                      </div>
                    )}
                    {recipient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{recipient.phone}</span>
                      </div>
                    )}
                    {recipient.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{recipient.address}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRecipient(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {recipients.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhum destinatário adicionado ainda</p>
            <p className="text-sm">Adicione destinatários usando os campos acima</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}