import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { FileText, Upload, Shield, BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bolt Food Sales Handover Automation
              </h1>
              <p className="text-xl text-gray-600">
                Sistema de auditoría y validación de contratos con IA
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Upload className="w-10 h-10 text-blue-600 mb-2" />
                  <CardTitle>Cargar Transcripción</CardTitle>
                  <CardDescription>
                    Sube transcripciones de llamadas de ventas para procesamiento con IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/upload/transcription">
                    <Button className="w-full">Subir Transcripción</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="w-10 h-10 text-green-600 mb-2" />
                  <CardTitle>Cargar Audio</CardTitle>
                  <CardDescription>
                    Convierte automáticamente audio de llamadas a texto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/upload/audio">
                    <Button className="w-full" variant="outline">Subir Audio</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="w-10 h-10 text-purple-600 mb-2" />
                  <CardTitle>Cargar Contrato</CardTitle>
                  <CardDescription>
                    Sube contratos PDF firmados para auditoría automática
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/upload/contract">
                    <Button className="w-full" variant="outline">Subir Contrato</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <BarChart3 className="w-10 h-10 text-orange-600 mb-2" />
                  <CardTitle>Ver Dashboard</CardTitle>
                  <CardDescription>
                    Accede al panel de control completo del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard">
                    <Button className="w-full" variant="outline">Ir al Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/transcriptions">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Transcripciones
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/merchants">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Comerciantes
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/audits">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Auditorías
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bolt Food Sales Handover</CardTitle>
          <CardDescription>
            Inicia sesión para acceder al sistema de automatización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
