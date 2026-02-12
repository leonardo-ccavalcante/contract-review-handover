import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function UploadTranscription() {
  const [, setLocation] = useLocation();
  const [transcriptionText, setTranscriptionText] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [salesManagerId, setSalesManagerId] = useState("");
  const [callDate, setCallDate] = useState("");
  const [callDuration, setCallDuration] = useState("");

  const uploadMutation = trpc.transcriptions.uploadText.useMutation({
    onSuccess: (data) => {
      toast.success("Transcripción cargada exitosamente", {
        description: `Call ID: ${data?.callId}`,
      });
      setTranscriptionText("");
      setMerchantName("");
      setSalesManagerId("");
      setCallDate("");
      setCallDuration("");
      setTimeout(() => setLocation("/transcriptions"), 1500);
    },
    onError: (error) => {
      toast.error("Error al cargar transcripción", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transcriptionText.trim()) {
      toast.error("Por favor ingresa el texto de la transcripción");
      return;
    }

    uploadMutation.mutate({
      transcriptionText: transcriptionText.trim(),
      merchantName: merchantName.trim() || undefined,
      salesManagerId: salesManagerId.trim() || undefined,
      callDate: callDate || undefined,
      callDurationMinutes: callDuration ? parseInt(callDuration) : undefined,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cargar Transcripción de Llamada</h1>
        <p className="text-muted-foreground">
          Sube el texto de la transcripción de una llamada de ventas para procesamiento con IA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Formulario de Carga
          </CardTitle>
          <CardDescription>
            Completa los campos con la información de la llamada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="transcription">Texto de Transcripción *</Label>
              <Textarea
                id="transcription"
                placeholder="Pega aquí el texto completo de la transcripción de la llamada..."
                value={transcriptionText}
                onChange={(e) => setTranscriptionText(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                {transcriptionText.length} caracteres
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchantName">Nombre del Comerciante</Label>
                <Input
                  id="merchantName"
                  placeholder="Ej: Pizzaria do Bairro"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesManagerId">ID del Sales Manager</Label>
                <Input
                  id="salesManagerId"
                  placeholder="Ej: SM-12345"
                  value={salesManagerId}
                  onChange={(e) => setSalesManagerId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callDate">Fecha de la Llamada</Label>
                <Input
                  id="callDate"
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callDuration">Duración (minutos)</Label>
                <Input
                  id="callDuration"
                  type="number"
                  placeholder="Ej: 45"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Cargar Transcripción
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setLocation("/transcriptions")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
