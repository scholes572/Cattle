import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Droplets, Calendar, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { API_URL } from "../api";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

interface Cattle {
  id: string;
  tagNumber: string;
  name: string;
  breed: string;
  gender: string;
  dateOfBirth: string;
  weight: number;
  color: string;
  status: string;
  sire: string;
  dam: string;
  notes: string;
  imageUrl: string;
  imagePath: string;
  createdAt: string;
}

interface MilkProduction {
  id: string;
  cattleId: string;
  cattleName: string;
  cattleTagNumber: string;
  date: string;
  morningLiters: number;
  eveningLiters: number;
  totalLiters: number;
  notes: string;
  createdAt: string;
}

export function MilkProduction() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [formData, setFormData] = useState({
    cattleId: "",
    date: new Date().toISOString().split("T")[0],
    morningLiters: "",
    eveningLiters: "",
    notes: "",
  });

  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      const response = await fetch(`${API_URL}/cattle`);
      const data = await response.json();
      if (data.success) {
        // Filter only female cattle (cows)
        const femaleCattle = (data.cattle || []).filter((c: Cattle) => c.gender === "female");
        setCattle(femaleCattle);
      }
    } catch (error) {
      console.error("Error fetching cattle:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedCattle = cattle.find((c) => c.id === formData.cattleId);
    if (!selectedCattle) {
      toast.error("Please select a cow");
      setLoading(false);
      return;
    }

    const morning = parseFloat(formData.morningLiters) || 0;
    const evening = parseFloat(formData.eveningLiters) || 0;
    const totalLiters = morning + evening;

    try {
      const response = await fetch(`${API_URL}/milk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          cattleId: formData.cattleId,
          cattleName: selectedCattle.name,
          cattleTagNumber: selectedCattle.tagNumber,
          date: formData.date,
          morningLiters: morning,
          eveningLiters: evening,
          totalLiters,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Milk production recorded successfully!");
        setFormData({
          cattleId: "",
          date: new Date().toISOString().split("T")[0],
          morningLiters: "",
          eveningLiters: "",
          notes: "",
        });
      } else {
        toast.error("Failed to record milk production: " + data.error);
      }
    } catch (error) {
      toast.error("Failed to record milk production");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/milk" className="flex items-center space-x-2 text-green-600 mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Milk Records</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-6 w-6 text-green-600" />
            <span>Record Milk Production</span>
          </CardTitle>
          <CardDescription>
            Record daily milk production for your cows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cattleId">Select Cow *</Label>
                <Select
                  value={formData.cattleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cattleId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cow" />
                  </SelectTrigger>
                  <SelectContent>
                    {cattle.map((cow) => (
                      <SelectItem key={cow.id} value={cow.id}>
                        {cow.tagNumber} - {cow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="morningLiters">Morning Milk (liters)</Label>
                <Input
                  id="morningLiters"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.morningLiters}
                  onChange={(e) =>
                    setFormData({ ...formData, morningLiters: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eveningLiters">Evening Milk (liters)</Label>
                <Input
                  id="eveningLiters"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.eveningLiters}
                  onChange={(e) =>
                    setFormData({ ...formData, eveningLiters: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">
                  Total for this recording:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {(
                    (parseFloat(formData.morningLiters) || 0) +
                    (parseFloat(formData.eveningLiters) || 0)
                  ).toFixed(1)}{" "}
                  liters
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this milking session..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Record Milk Production"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
