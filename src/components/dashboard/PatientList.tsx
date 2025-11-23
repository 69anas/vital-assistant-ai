import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, User } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
}

interface PatientListProps {
  userId: string;
}

export const PatientList = ({ userId }: PatientListProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    medical_history: "",
    allergies: "",
    current_medications: "",
  });

  useEffect(() => {
    fetchPatients();
  }, [userId]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error("Failed to load patients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("patients").insert([
        {
          ...newPatient,
          doctor_id: userId,
          date_of_birth: newPatient.date_of_birth || null,
        },
      ]);

      if (error) throw error;
      
      toast.success("Patient added successfully");
      setDialogOpen(false);
      setNewPatient({
        full_name: "",
        date_of_birth: "",
        gender: "",
        medical_history: "",
        allergies: "",
        current_medications: "",
      });
      fetchPatients();
    } catch (error: any) {
      toast.error("Failed to add patient");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading patients...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-muted-foreground">View and manage your patients</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Enter patient information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPatient}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={newPatient.full_name}
                      onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical_history">Medical History</Label>
                  <Input
                    id="medical_history"
                    value={newPatient.medical_history}
                    onChange={(e) => setNewPatient({ ...newPatient, medical_history: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_medications">Current Medications</Label>
                  <Input
                    id="current_medications"
                    value={newPatient.current_medications}
                    onChange={(e) => setNewPatient({ ...newPatient, current_medications: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Patient</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No patients yet. Add your first patient to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle>{patient.full_name}</CardTitle>
                <CardDescription>
                  {patient.gender && `${patient.gender} • `}
                  {patient.date_of_birth && `DOB: ${new Date(patient.date_of_birth).toLocaleDateString()}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.allergies && (
                  <div>
                    <span className="text-sm font-medium">Allergies: </span>
                    <span className="text-sm text-muted-foreground">{patient.allergies}</span>
                  </div>
                )}
                {patient.current_medications && (
                  <div>
                    <span className="text-sm font-medium">Medications: </span>
                    <span className="text-sm text-muted-foreground">{patient.current_medications}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};