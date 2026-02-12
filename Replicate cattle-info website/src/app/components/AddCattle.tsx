import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { API_URL } from "../api";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

const commonBreeds = [
  "Holstein",
  "Jersey",
  "Angus",
  "Hereford",
  "Charolais",
  "Limousin",
  "Simmental",
  "Brahman",
  "Guernsey",
  "Brown Swiss",
  "Milking Shorthorn",
  "Other",
];

export function AddCattle() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tagNumber: "",
    name: "",
    breed: "",
    gender: "",
    dateOfBirth: "",
    weight: "",
    color: "",
    status: "active",
    sire: "",
    dam: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cattle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...formData,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Cattle added successfully!");
        navigate("/cattle");
      } else {
        toast.error("Failed to add cattle: " + data.error);
      }
    } catch (error) {
      toast.error("Failed to add cattle");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/cattle")}
        className="flex items-center space-x-2 text-green-600 mb-6 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Cattle List</span>
      </button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Cattle</CardTitle>
          <CardDescription>
            Enter the details for the new cattle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tagNumber">Tag Number *</Label>
                <Input
                  id="tagNumber"
                  required
                  value={formData.tagNumber}
                  onChange={(e) => handleChange("tagNumber", e.target.value)}
                  placeholder="e.g., A001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Bessie"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Select
                  value={formData.breed}
                  onValueChange={(value) => handleChange("breed", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonBreeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color/Markings</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="e.g., Black and White"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sire">Sire (Father)</Label>
                <Input
                  id="sire"
                  value={formData.sire}
                  onChange={(e) => handleChange("sire", e.target.value)}
                  placeholder="Tag number or name of sire"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dam">Dam (Mother)</Label>
                <Input
                  id="dam"
                  value={formData.dam}
                  onChange={(e) => handleChange("dam", e.target.value)}
                  placeholder="Tag number or name of dam"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional information..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Cattle"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cattle")}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
