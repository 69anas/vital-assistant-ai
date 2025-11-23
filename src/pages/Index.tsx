import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Shield, Wifi, FileText, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Activity className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              AI-Powered Medical Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering healthcare professionals with intelligent symptom analysis, treatment suggestions, 
              and medical record summarization. Designed for both advanced hospitals and resource-limited clinics.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Medical AI Capabilities</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built to support medical decision-making with explainable AI, secure data handling, and offline functionality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Symptom Analysis</CardTitle>
              <CardDescription>
                AI-powered analysis of patient symptoms with differential diagnoses and confidence scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Evidence-based diagnosis suggestions</li>
                <li>• Confidence level indicators</li>
                <li>• Red flag identification</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Stethoscope className="h-10 w-10 text-accent mb-4" />
              <CardTitle>Treatment Planning</CardTitle>
              <CardDescription>
                Get AI-assisted treatment recommendations based on diagnosis and patient history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Medication suggestions with dosages</li>
                <li>• Priority-based treatment plans</li>
                <li>• Drug interaction warnings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Record Summarization</CardTitle>
              <CardDescription>
                Automatically extract key findings from lengthy medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Rapid record review</li>
                <li>• Key finding extraction</li>
                <li>• Timeline reconstruction</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-accent mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Patient data encrypted and protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• End-to-end encryption</li>
                <li>• HIPAA-compliant storage</li>
                <li>• Access control policies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Wifi className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Offline Capable</CardTitle>
              <CardDescription>
                Core functionality available even with limited connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Local data caching</li>
                <li>• Sync when online</li>
                <li>• Rural clinic support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-10 w-10 text-accent mb-4" />
              <CardTitle>Explainable AI</CardTitle>
              <CardDescription>
                Clear reasoning behind every AI recommendation for clinical confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Clinical reasoning provided</li>
                <li>• Evidence references</li>
                <li>• Confidence indicators</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Medical Practice?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join healthcare professionals using AI to make faster, more informed decisions.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
