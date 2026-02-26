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
          <Baby className="h-5 w-5 text-pink-600" />
          Pregnancy & Birth History - {cattleName}
        </CardTitle>
        <Button type="button" onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? 'Cancel' : 'Add Record'}
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-pink-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="servedBreed">Type of Breed (Served By)</Label>
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
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
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
          <Table>
            <TableHeader>
              <TableRow className="bg-pink-100">
                <TableHead className="text-pink-800"><Calendar className="h-4 w-4 inline mr-1" />Served Date</TableHead>
                <TableHead className="text-pink-800">Breed (Served By)</TableHead>
                <TableHead className="text-pink-800">Expected Birth</TableHead>
                <TableHead className="text-pink-800">Date Dried</TableHead>
                <TableHead className="text-pink-800">Actual Birth</TableHead>
                <TableHead className="text-pink-800">Calf Gender</TableHead>
                <TableHead className="text-pink-800">Calf Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.servedDate || "-"}</TableCell>
                  <TableCell>{record.servedBreed || "-"}</TableCell>
                  <TableCell>{record.expectedBirthDate || "-"}</TableCell>
                  <TableCell>{record.driedDate || "-"}</TableCell>
                  <TableCell>{record.actualBirthDate || "-"}</TableCell>
                  <TableCell className="capitalize">{record.calfGender || "-"}</TableCell>
                  <TableCell>{record.calfName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
