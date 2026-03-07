import { useState, useEffect } from "react";
import { pregnancyApi } from "../supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Trash2, Calendar, Baby, Edit } from "lucide-react";
import { toast } from "sonner";

interface PregnancyRecord {
  id: string;
  cattleId: string;
  servedDate?: string;
  servedBreed?: string;
  expectedBirthDate?: string;
  driedDate?: string;
  actualBirthDate?: string;
  calfGender?: string;
  calfName?: string;
  createdAt?: string;
}

interface PregnancyTrackerProps {
  cattleId: string;
  cattleName: string;
}

export function PregnancyTracker({ cattleId, cattleName }: PregnancyTrackerProps) {
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    servedDate: "",
    servedBreed: "",
    expectedBirthDate: "",
    driedDate: "",
    actualBirthDate: "",
    calfGender: "",
    calfName: ""
  });

  useEffect(() => {
    fetchRecords();
  }, [cattleId]);

  const fetchRecords = async () => {
    setLoading(true);
    const { success, records: data, error } = await pregnancyApi.getAll(cattleId);
    if (success && data) {
      setRecords(data as PregnancyRecord[]);
    } else if (error) {
      console.error("Failed to fetch pregnancy records:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pregnancyData = {
      cattleId,
      servedDate: formData.servedDate || null,
      servedBreed: formData.servedBreed || null,
      expectedBirthDate: formData.expectedBirthDate || null,
      driedDate: formData.driedDate || null,
      actualBirthDate: formData.actualBirthDate || null,
      calfGender: formData.calfGender || null,
      calfName: formData.calfName || null
    };

    let result;
    if (editingId) {
      result = await pregnancyApi.update(editingId, pregnancyData);
    } else {
      result = await pregnancyApi.create(pregnancyData);
    }

    if (result.success) {
      toast.success(editingId ? "Pregnancy record updated!" : "Pregnancy record added!");
      resetForm();
      fetchRecords();
    } else {
      toast.error(result.error || "Failed to save pregnancy record");
    }
  };

  const handleEdit = (record: PregnancyRecord) => {
    setFormData({
      servedDate: record.servedDate || "",
      servedBreed: record.servedBreed || "",
      expectedBirthDate: record.expectedBirthDate || "",
      driedDate: record.driedDate || "",
      actualBirthDate: record.actualBirthDate || "",
      calfGender: record.calfGender || "",
      calfName: record.calfName || ""
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pregnancy record?")) return;
    
    const result = await pregnancyApi.delete(id);
    if (result.success) {
      toast.success("Pregnancy record deleted!");
      fetchRecords();
    } else {
      toast.error(result.error || "Failed to delete record");
    }
  };

  const resetForm = () => {
    setFormData({
      servedDate: "",
      servedBreed: "",
      expectedBirthDate: "",
      driedDate: "",
      actualBirthDate: "",
      calfGender: "",
      calfName: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Calculate expected birth date (283 days from served date)
  const calculateExpectedDate = (servedDate: string) => {
    if (!servedDate) return "";
    const date = new Date(servedDate);
    date.setDate(date.getDate() + 283); // 283 days gestation
    return date.toISOString().split("T")[0];
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Baby className="h-5 w-5 text-black" />
          Pregnancy & Birth History - {cattleName}
        </CardTitle>
        <Button type="button" onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? 'Cancel' : 'Add Record'}
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="servedDate">Served Date</Label>
                <Input
                  id="servedDate"
                  type="date"
                  value={formData.servedDate}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      servedDate: e.target.value,
                      expectedBirthDate: calculateExpectedDate(e.target.value)
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="servedBreed">Breed Served By</Label>
                <Input
                  id="servedBreed"
                  type="text"
                  placeholder="e.g., Holstein, Angus, Jersey"
                  value={formData.servedBreed}
                  onChange={(e) => setFormData({ ...formData, servedBreed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expectedBirthDate">Expected Birth Date</Label>
                <Input
                  id="expectedBirthDate"
                  type="date"
                  value={formData.expectedBirthDate}
                  onChange={(e) => setFormData({ ...formData, expectedBirthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="driedDate">Date Dried</Label>
                <Input
                  id="driedDate"
                  type="date"
                  value={formData.driedDate}
                  onChange={(e) => setFormData({ ...formData, driedDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="actualBirthDate">Exact Date of Birth</Label>
                <Input
                  id="actualBirthDate"
                  type="date"
                  value={formData.actualBirthDate}
                  onChange={(e) => setFormData({ ...formData, actualBirthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="calfGender">Calf Gender</Label>
                <Select
                  value={formData.calfGender}
                  onValueChange={(value) => setFormData({ ...formData, calfGender: value })}
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
              <div>
                <Label htmlFor="calfName">Calf Name</Label>
                <Input
                  id="calfName"
                  type="text"
                  placeholder="Name of the calf"
                  value={formData.calfName}
                  onChange={(e) => setFormData({ ...formData, calfName: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-black hover:bg-gray-800">
                {editingId ? "Update Record" : "Save Record"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pregnancy records yet. Click "Add Record" to start tracking.</p>
        ) : (
          <>
            {/* Vertical Card view */}
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-black">1. Served Date:</span>
                        <p>{record.servedDate || "-"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-black">2. Breed Served By:</span>
                        <p>{record.servedBreed || "-"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-black">3. Expected Birth Date:</span>
                        <p>{record.expectedBirthDate || "-"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-black">4. Date Dried:</span>
                        <p>{record.driedDate || "-"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-black">5. Exact Date of Birth:</span>
                        <p>{record.actualBirthDate || "-"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-black">6. Calf Gender:</span>
                        <p className="capitalize">{record.calfGender || "-"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-black">7. Calf Name:</span>
                        <p>{record.calfName || "-"}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4 text-red-500 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
