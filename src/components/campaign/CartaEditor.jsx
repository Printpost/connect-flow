import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { 
  Upload, 
  Image, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  FileText,
  Sparkles,
  X,
  Plus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const camposVariaveis = [
  { value: "{{nome}}", label: "Nome" },
  { value: "{{endereco}}", label: "Endereço" },
  { value: "{{bairro}}", label: "Bairro" },
  { value: "{{cidade}}", label: "Cidade" },
  { value: "{{estado}}", label: "Estado" },
  { value: "{{cep}}", label: "CEP" },
  { value: "{{cpf}}", label: "CPF" },
  { value: "{{cnpj}}", label: "CNPJ" },
  { value: "{{numero_contrato}}", label: "Nº Contrato" },
  { value: "{{valor}}", label: "Valor" },
  { value: "{{vencimento}}", label: "Vencimento" },
  { value: "{{id_cliente}}", label: "ID Cliente" },
  { value: "{{codigo_barras}}", label: "Código de Barras" },
  { value: "{{data_atual}}", label: "Data Atual" },
  { value: "{{mes_referencia}}", label: "Mês Referência" }
];

export default function CartaEditor({ cartaData, onCartaChange }) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCabecalho, setUploadingCabecalho] = useState(false);
  const [uploadingRodape, setUploadingRodape] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onCartaChange({ logo_url: file_url });
    } catch (error) {
      alert("Erro ao fazer upload do logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCabecalhoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCabecalho(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onCartaChange({ cabecalho_url: file_url });
    } catch (error) {
      alert("Erro ao fazer upload do cabeçalho");
    } finally {
      setUploadingCabecalho(false);
    }
  };

  const handleRodapeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingRodape(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onCartaChange({ rodape_url: file_url });
    } catch (error) {
      alert("Erro ao fazer upload do rodapé");
    } finally {
      setUploadingRodape(false);
    }
  };

  const inserirCampo = (campo) => {
    const textarea = document.getElementById('carta-corpo');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = cartaData.corpo || "";
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newText = before + campo + after;
    onCartaChange({ corpo: newText });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + campo.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Layout */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="w-5 h-5 text-purple-600" />
            Elementos Visuais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div>
            <Label>Logo da Empresa</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                id="logo-upload"
                className="hidden"
                disabled={uploadingLogo}
              />
              <label htmlFor="logo-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingLogo}
                  onClick={() => document.getElementById('logo-upload').click()}
                  className="cursor-pointer"
                >
                  {uploadingLogo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
              </label>
              {cartaData.logo_url && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Image className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Logo carregado</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onCartaChange({ logo_url: "" })}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Recomendado: PNG com fundo transparente, max 500x200px</p>
          </div>

          {/* Cabeçalho */}
          <div>
            <Label>Imagem de Cabeçalho (Opcional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleCabecalhoUpload}
                id="cabecalho-upload"
                className="hidden"
                disabled={uploadingCabecalho}
              />
              <label htmlFor="cabecalho-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingCabecalho}
                  onClick={() => document.getElementById('cabecalho-upload').click()}
                  className="cursor-pointer"
                >
                  {uploadingCabecalho ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Cabeçalho
                    </>
                  )}
                </Button>
              </label>
              {cartaData.cabecalho_url && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Image className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Cabeçalho carregado</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onCartaChange({ cabecalho_url: "" })}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Rodapé */}
          <div>
            <Label>Imagem de Rodapé (Opcional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleRodapeUpload}
                id="rodape-upload"
                className="hidden"
                disabled={uploadingRodape}
              />
              <label htmlFor="rodape-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingRodape}
                  onClick={() => document.getElementById('rodape-upload').click()}
                  className="cursor-pointer"
                >
                  {uploadingRodape ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Rodapé
                    </>
                  )}
                </Button>
              </label>
              {cartaData.rodape_url && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Image className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Rodapé carregado</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onCartaChange({ rodape_url: "" })}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos Variáveis */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Campos Variáveis Disponíveis
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Clique em um campo para inseri-lo no texto da carta. Os dados serão preenchidos automaticamente para cada destinatário.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {camposVariaveis.map((campo) => (
              <Button
                key={campo.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inserirCampo(campo.value)}
                className="border-blue-300 hover:bg-blue-100 text-blue-900 font-mono text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {campo.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor de Conteúdo */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-amber-600" />
            Conteúdo da Carta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de Formatação */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Label className="text-sm font-semibold mr-2">Formatação:</Label>
            
            <Select 
              value={cartaData.fonte_tamanho || "12"} 
              onValueChange={(value) => onCartaChange({ fonte_tamanho: value })}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10pt</SelectItem>
                <SelectItem value="11">11pt</SelectItem>
                <SelectItem value="12">12pt</SelectItem>
                <SelectItem value="14">14pt</SelectItem>
                <SelectItem value="16">16pt</SelectItem>
                <SelectItem value="18">18pt</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-slate-300 mx-2" />

            <Select 
              value={cartaData.alinhamento || "left"} 
              onValueChange={(value) => onCartaChange({ alinhamento: value })}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" />
                    Esquerda
                  </div>
                </SelectItem>
                <SelectItem value="center">
                  <div className="flex items-center gap-2">
                    <AlignCenter className="w-4 h-4" />
                    Centro
                  </div>
                </SelectItem>
                <SelectItem value="right">
                  <div className="flex items-center gap-2">
                    <AlignRight className="w-4 h-4" />
                    Direita
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="carta-titulo">Título da Carta</Label>
            <Input
              id="carta-titulo"
              placeholder="Ex: COMUNICADO IMPORTANTE"
              value={cartaData.titulo || ""}
              onChange={(e) => onCartaChange({ titulo: e.target.value })}
              className="mt-2 font-semibold"
            />
          </div>

          {/* Corpo */}
          <div>
            <Label htmlFor="carta-corpo">Corpo da Carta *</Label>
            <Textarea
              id="carta-corpo"
              placeholder="Digite o conteúdo da carta aqui. Use os botões acima para inserir campos variáveis.&#10;&#10;Exemplo:&#10;Prezado(a) {{nome}},&#10;&#10;Gostaríamos de informar sobre o contrato {{numero_contrato}} com vencimento em {{vencimento}}.&#10;&#10;Endereço: {{endereco}}, {{bairro}}, {{cidade}}-{{estado}}, CEP: {{cep}}"
              value={cartaData.corpo || ""}
              onChange={(e) => onCartaChange({ corpo: e.target.value })}
              className="mt-2 min-h-[400px] font-serif text-base"
              style={{ 
                fontSize: `${cartaData.fonte_tamanho || 12}pt`,
                textAlign: cartaData.alinhamento || 'left'
              }}
            />
            <p className="text-xs text-slate-500 mt-2">
              Campos em amarelo serão substituídos pelos dados reais de cada destinatário
            </p>
          </div>

          {/* Assinatura */}
          <div>
            <Label htmlFor="carta-assinatura">Assinatura / Fechamento</Label>
            <Textarea
              id="carta-assinatura"
              placeholder="Atenciosamente,&#10;&#10;Nome da Empresa&#10;CNPJ: 00.000.000/0000-00"
              value={cartaData.assinatura || ""}
              onChange={(e) => onCartaChange({ assinatura: e.target.value })}
              className="mt-2 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Adicionais */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="w-5 h-5 text-slate-600" />
            Configurações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Margem (mm)</Label>
              <Input
                type="number"
                placeholder="20"
                value={cartaData.margem || "20"}
                onChange={(e) => onCartaChange({ margem: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Espaçamento entre linhas</Label>
              <Select 
                value={cartaData.espacamento || "1.5"} 
                onValueChange={(value) => onCartaChange({ espacamento: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Simples (1.0)</SelectItem>
                  <SelectItem value="1.5">1.5 linhas</SelectItem>
                  <SelectItem value="2">Duplo (2.0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Nome do Arquivo (sem extensão)</Label>
            <Input
              placeholder="carta-{{nome}}-{{id_cliente}}"
              value={cartaData.nome_arquivo || "carta-{{id_cliente}}"}
              onChange={(e) => onCartaChange({ nome_arquivo: e.target.value })}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">
              Use campos variáveis para personalizar o nome dos PDFs gerados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Rápido */}
      {cartaData.corpo && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-900">
              <FileText className="w-5 h-5" />
              Preview da Estrutura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-8 rounded-lg shadow-inner border border-green-200 max-h-[400px] overflow-y-auto">
              {cartaData.logo_url && (
                <div className="mb-4 text-center">
                  <Badge className="bg-blue-100 text-blue-800">
                    [LOGO AQUI]
                  </Badge>
                </div>
              )}
              {cartaData.cabecalho_url && (
                <div className="mb-4 text-center">
                  <Badge className="bg-purple-100 text-purple-800">
                    [CABEÇALHO AQUI]
                  </Badge>
                </div>
              )}
              {cartaData.titulo && (
                <h2 className="text-xl font-bold text-center mb-6">{cartaData.titulo}</h2>
              )}
              <div 
                className="whitespace-pre-wrap mb-6 font-serif"
                style={{ 
                  fontSize: `${cartaData.fonte_tamanho || 12}pt`,
                  textAlign: cartaData.alinhamento || 'left',
                  lineHeight: cartaData.espacamento || '1.5'
                }}
              >
                {cartaData.corpo.split(/(\{\{[^}]+\}\})/g).map((part, index) => {
                  if (part.match(/\{\{[^}]+\}\}/)) {
                    return (
                      <span key={index} className="bg-yellow-200 px-1 rounded font-semibold">
                        {part}
                      </span>
                    );
                  }
                  return <span key={index}>{part}</span>;
                })}
              </div>
              {cartaData.assinatura && (
                <div className="mt-8 whitespace-pre-wrap text-sm">
                  {cartaData.assinatura}
                </div>
              )}
              {cartaData.rodape_url && (
                <div className="mt-4 text-center border-t pt-4">
                  <Badge className="bg-purple-100 text-purple-800">
                    [RODAPÉ AQUI]
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}