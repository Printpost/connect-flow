// @ts-nocheck
import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RefreshCw, QrCode, UploadCloud } from "lucide-react";

const RETURN_REASONS = [
  "Positivo",
  "Mudou-se",
  "Endereço insuficiente",
  "Não existe o número indicado",
  "Ausente",
  "Desconhecido",
  "Recusado",
  "Falecido",
  "Outros"
];

const COMPANY_OPTIONS = [
  "Neoenergia",
  "Correios",
  "Empresa Exemplo"
];

const ORDER_OPTIONS = [
  "Pedido 0001",
  "Pedido 0002",
  "Pedido 0003"
];

const tabs = [
  {
    id: "simple",
    label: "Retorno - Carta simples",
    description: "Importe arquivos de retorno padrão",
    icon: QrCode
  },
  {
    id: "with-image",
    label: "Retorno - Com imagem do AR",
    description: "Faça upload com comprovante de AR",
    icon: RefreshCw
  },
  {
    id: "link-order",
    label: "Vincular pedido com planilha AR",
    description: "Associe pedidos a um arquivo AR",
    icon: UploadCloud
  }
];

const initialSimpleState = {
  target: "neoenergia",
  reason: "",
  files: []
};

const initialWithImageState = {
  reason: "",
  files: []
};

const initialLinkState = {
  company: "",
  order: "",
  files: []
};

export default function CentralRetorno() {
  const [activeTab, setActiveTab] = useState("simple");
  const [simpleForm, setSimpleForm] = useState(initialSimpleState);
  const [withImageForm, setWithImageForm] = useState(initialWithImageState);
  const [linkForm, setLinkForm] = useState(initialLinkState);

  const simpleFileInput = useRef(null);
  const withImageFileInput = useRef(null);
  const linkFileInput = useRef(null);

  const reasonItems = useMemo(
    () => RETURN_REASONS.map((reason) => ({ value: reason.toLowerCase(), label: reason })),
    []
  );

  const handleSimpleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSimpleForm((prev) => ({ ...prev, files }));
  };

  const handleWithImageFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setWithImageForm((prev) => ({ ...prev, files }));
  };

  const handleLinkFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setLinkForm((prev) => ({ ...prev, files }));
  };

  const handleSimpleSubmit = (event) => {
    event.preventDefault();
    // Integração com backend a ser adicionada posteriormente
  };

  const handleWithImageSubmit = (event) => {
    event.preventDefault();
  };

  const handleLinkSubmit = (event) => {
    event.preventDefault();
  };

  const renderSimpleForm = () => (
    <form onSubmit={handleSimpleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <Label className="text-slate-700 font-semibold">Tipo de processamento</Label>
        <RadioGroup
          value={simpleForm.target}
          onValueChange={(value) => setSimpleForm((prev) => ({ ...prev, target: value }))}
          className="grid gap-3 md:grid-cols-2"
        >
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow group cursor-pointer">
            <RadioGroupItem value="neoenergia" className="mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Retorno para o cliente Neoenergia</p>
              <p className="text-sm text-slate-500">Identificador por ID</p>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow group cursor-pointer">
            <RadioGroupItem value="carta-simples" className="mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Retorno para carta simples</p>
              <p className="text-sm text-slate-500">Identificador interno</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="simple-reason" className="text-slate-700 font-semibold">
          Motivo do retorno
        </Label>
        <Select
          value={simpleForm.reason}
          onValueChange={(value) => setSimpleForm((prev) => ({ ...prev, reason: value }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecione o motivo de retorno" />
          </SelectTrigger>
          <SelectContent>
            {reasonItems.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label className="text-slate-700 font-semibold">Arquivo de retorno</Label>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">
            ( {simpleForm.files.length} ) arquivo(s) selecionados
          </p>
          <div>
            <Button type="button" onClick={() => simpleFileInput.current?.click()}>
              Selecionar arquivo
            </Button>
            <input
              ref={simpleFileInput}
              type="file"
              multiple
              className="hidden"
              onChange={handleSimpleFileChange}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!simpleForm.reason || simpleForm.files.length === 0}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold disabled:opacity-60"
      >
        Enviar
      </Button>
    </form>
  );

  const renderWithImageForm = () => (
    <form onSubmit={handleWithImageSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="with-image-reason" className="text-slate-700 font-semibold">
          Motivo do retorno
        </Label>
        <Select
          value={withImageForm.reason}
          onValueChange={(value) => setWithImageForm((prev) => ({ ...prev, reason: value }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecione o motivo de retorno" />
          </SelectTrigger>
          <SelectContent>
            {reasonItems.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label className="text-slate-700 font-semibold">Arquivos AR com imagem</Label>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">
            ( {withImageForm.files.length} ) arquivo(s) selecionados
          </p>
          <div>
            <Button type="button" onClick={() => withImageFileInput.current?.click()}>
              Selecionar arquivo
            </Button>
            <input
              ref={withImageFileInput}
              type="file"
              multiple
              className="hidden"
              onChange={handleWithImageFileChange}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!withImageForm.reason || withImageForm.files.length === 0}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold disabled:opacity-60"
      >
        Enviar
      </Button>
    </form>
  );

  const renderLinkForm = () => (
    <form onSubmit={handleLinkSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-slate-700 font-semibold">Selecione a empresa</Label>
          <Select
            value={linkForm.company}
            onValueChange={(value) => setLinkForm((prev) => ({ ...prev, company: value }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Escolha a empresa" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_OPTIONS.map((company) => (
                <SelectItem key={company} value={company.toLowerCase()}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-slate-700 font-semibold">Selecione o pedido</Label>
          <Select
            value={linkForm.order}
            onValueChange={(value) => setLinkForm((prev) => ({ ...prev, order: value }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Escolha o pedido" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_OPTIONS.map((order) => (
                <SelectItem key={order} value={order.toLowerCase()}>
                  {order}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-slate-700 font-semibold">Planilha AR</Label>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">
            ( {linkForm.files.length} ) arquivo(s) selecionados
          </p>
          <div>
            <Button type="button" onClick={() => linkFileInput.current?.click()}>
              Selecionar arquivo
            </Button>
            <input
              ref={linkFileInput}
              type="file"
              multiple
              className="hidden"
              onChange={handleLinkFileChange}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!linkForm.company || !linkForm.order || linkForm.files.length === 0}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold disabled:opacity-60"
      >
        Enviar
      </Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Central de Retorno</h1>
        <p className="text-slate-600 text-lg">Gerencie uploads e integrações de arquivos de retorno</p>
      </motion.div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${
                  isActive
                    ? "border-transparent bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xl"
                    : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white ${
                    isActive ? "" : "bg-cyan-50 text-cyan-600"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <p className={`text-base font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>
                    {tab.label}
                  </p>
                  <p className={`text-sm ${isActive ? "text-white/80" : "text-slate-500"}`}>
                    {tab.description}
                  </p>
                </span>
              </button>
            );
          })}
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/60">
          <CardContent className="p-8">
            {activeTab === "simple" && renderSimpleForm()}
            {activeTab === "with-image" && renderWithImageForm()}
            {activeTab === "link-order" && renderLinkForm()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
