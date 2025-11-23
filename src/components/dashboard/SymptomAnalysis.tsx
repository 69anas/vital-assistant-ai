import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
}

interface SymptomAnalysisProps {
  userId: string;
}

export const SymptomAnalysis = ({ userId }: SymptomAnalysisProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe" | "critical">("moderate");
  const [duration, setDuration] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [treatment, setTreatment] = useState<any>(null);

  useEffect(() => {
    fetchPatients();
  }, [userId]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, medical_history, allergies, current_medications")
        .eq("doctor_id", userId);

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error("Failed to load patients");
      console.error(error);
    }
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case "very_high": return "bg-accent text-accent-foreground";
      case "high": return "bg-primary text-primary-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "emergency": return "bg-destructive text-destructive-foreground";
      case "urgent": return "bg-warning text-warning-foreground";
      case "routine": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatient || !symptoms) {
      toast.error("Please select a patient and enter symptoms");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setTreatment(null);

    try {
      const patient = patients.find((p) => p.id === selectedPatient);
      
      // Create symptom record
      const { data: symptomRecord, error: symptomError } = await supabase
        .from("symptom_records")
        .insert([
          {
            patient_id: selectedPatient,
            doctor_id: userId,
            symptoms,
            severity,
            duration,
          },
        ])
        .select()
        .single();

      if (symptomError) throw symptomError;

      // Call AI analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-symptoms",
        {
          body: {
            symptoms,
            severity,
            duration,
            patientHistory: patient?.medical_history,
          },
        }
      );

      if (analysisError) throw analysisError;
      setAnalysis(analysisData);

      // Save diagnosis
      const { data: diagnosisData, error: diagnosisError } = await supabase
        .from("diagnoses")
        .insert([
          {
            symptom_record_id: symptomRecord.id,
            doctor_id: userId,
            diagnosis: analysisData.primary_diagnosis,
            confidence: analysisData.confidence,
            reasoning: analysisData.reasoning,
            differential_diagnoses: analysisData.differential_diagnoses,
          },
        ])
        .select()
        .single();

      if (diagnosisError) throw diagnosisError;

      // Get treatment suggestions
      const { data: treatmentData, error: treatmentError } = await supabase.functions.invoke(
        "suggest-treatment",
        {
          body: {
            diagnosis: analysisData.primary_diagnosis,
            patientInfo: `Gender: ${patient?.full_name || "Unknown"}`,
            allergies: patient?.allergies,
            currentMedications: patient?.current_medications,
          },
        }
      );

      if (treatmentError) throw treatmentError;
      setTreatment(treatmentData);

      // Save treatment
      await supabase.from("treatments").insert([
        {
          diagnosis_id: diagnosisData.id,
          doctor_id: userId,
          treatment_plan: treatmentData.treatment_plan,
          medications: treatmentData.medications,
          priority: treatmentData.priority,
          precautions: treatmentData.precautions,
          follow_up_instructions: treatmentData.follow_up,
        },
      ]);

      toast.success("Analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Analysis failed");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Symptom Analysis</CardTitle>
          <CardDescription>
            Enter patient symptoms for AI-assisted diagnosis and treatment suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Symptoms</Label>
            <Textarea
              placeholder="Describe the patient's symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                placeholder="e.g., 3 days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
            <Brain className="h-4 w-4 mr-2" />
            {analyzing ? "Analyzing..." : "Analyze Symptoms"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  AI Diagnosis
                </CardTitle>
                <Badge className={getConfidenceBadgeColor(analysis.confidence)}>
                  {analysis.confidence.replace("_", " ")} confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Primary Diagnosis</h3>
                <p className="text-foreground">{analysis.primary_diagnosis}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Clinical Reasoning</h3>
                <p className="text-muted-foreground">{analysis.reasoning}</p>
              </div>

              {analysis.differential_diagnoses && analysis.differential_diagnoses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Differential Diagnoses</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {analysis.differential_diagnoses.map((dx: string, idx: number) => (
                      <li key={idx}>{dx}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.red_flags && analysis.red_flags.length > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Red Flags
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {analysis.red_flags.map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommended_tests && analysis.recommended_tests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommended Tests</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {analysis.recommended_tests.map((test: string, idx: number) => (
                      <li key={idx}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {treatment && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Treatment Plan
                  </CardTitle>
                  <Badge className={getPriorityBadgeColor(treatment.priority)}>
                    {treatment.priority} priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Treatment Overview</h3>
                  <p className="text-muted-foreground">{treatment.treatment_plan}</p>
                </div>

                {treatment.medications && treatment.medications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Medications</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {treatment.medications.map((med: string, idx: number) => (
                        <li key={idx}>{med}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {treatment.precautions && (
                  <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                    <h3 className="font-semibold mb-2 text-warning">Precautions</h3>
                    <p className="text-sm">{treatment.precautions}</p>
                  </div>
                )}

                {treatment.follow_up && (
                  <div>
                    <h3 className="font-semibold mb-2">Follow-up Instructions</h3>
                    <p className="text-muted-foreground">{treatment.follow_up}</p>
                  </div>
                )}

                {treatment.lifestyle_recommendations && treatment.lifestyle_recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Lifestyle Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {treatment.lifestyle_recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};