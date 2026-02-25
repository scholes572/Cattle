import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, Save, Trash2, Calendar, Weight, User, Upload, X, Droplets } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { cattleApi, milkApi, storageApi } from "../api";
import { PregnancyTracker } from "./PregnancyTracker";
import { toast } from "sonner";

interface Cattle {
  id: string;
  tagNumber: string;
  name: string;
  breed: string;
  gender: string;
  dateOfBirth: string;
  weight?: number;
  color?: string;
  status: string;
  sire?: string;
  dam?: string;
  notes?: string;
  imageUrl?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
}

export function CattleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Cattle>>({});
  const [milkRecords, setMilkRecords] = useState<any[]>([]);
  const [showMilkForm, setShowMilkForm] = useState(false);
  const [milkFormData, setMilkFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    morningLiters: "",
    eveningLiters: "",
    notes: "",
  });

  useEffect(() => {
    const fetchCattle = async () => {
      try {
        const response = await cattleApi.getById(id || '');
        if (response.success && response.cattle) {
          setCattle(response.cattle as Cattle);
          setFormData(response.cattle);
        } else {
          toast.error("Cattle not found");
          navigate("/cattle");
        }
      } catch (error) {
        console.error("Failed to fetch cattle:", error);
        toast.error("Failed to load cattle details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCattle();
      fetchMilkRecords();
    }
  }, [id, navigate]);

  const fetchMilkRecords = async () => {
    try {
      const response = await milkApi.getByCattleId(id || '');
      if (response.success) {
        setMilkRecords(response.records || []);
      }
    } catch (error) {
      console.error("Failed to fetch milk records:", error);
    }
  };

  const saveMilkRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const morning = parseFloat(milkFormData.morningLiters) || 0;
    const evening = parseFloat(milkFormData.eveningLiters) || 0;
    const totalLiters = morning + evening;

    try {
      const response = await milkApi.create({
        cattleId: id,
        cattleName: cattle?.name,
        cattleTagNumber: cattle?.tagNumber,
        date: milkFormData.date,
        morningLiters: morning,
        eveningLiters: evening,
        totalLiters,
        notes: milkFormData.notes,
      });

      if (response.success) {
        toast.success("Milk production recorded!");
        setShowMilkForm(false);
        setMilkFormData({
          date: new Date().toISOString().split("T")[0],
          morningLiters: "",
          eveningLiters: "",
          notes: "",
        });
        fetchMilkRecords();
      } else {
        toast.error("Failed to record milk: " + response.error);
      }
    } catch (error) {
      toast.error("Failed to record milk production");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await cattleApi.update(id || '', {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight.toString()) : undefined,
      });

      if (response.success) {
        setCattle(response.cattle as Cattle);
        setFormData(response.cattle);
        toast.success("Cattle updated successfully!");
      } else {
        toast.error("Failed to update cattle: " + response.error);
      }
    } catch (error) {
      console.error("Failed to update cattle:", error);
      toast.error("Failed to update cattle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await cattleApi.delete(id || '');

      if (response.success) {
        toast.success("Cattle deleted successfully!");
        navigate("/cattle");
      } else {
        toast.error("Failed to delete cattle: " + response.error);
      }
    } catch (error) {
      console.error("Failed to delete cattle:", error);
      toast.error("Failed to delete cattle");
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      // Get the cattle ID (use existing id or generate a temp one for new cattle)
      const cattleId = id || `new-${Date.now()}`;
      
      // Upload to Supabase Storage
      const result = await storageApi.uploadImage(file, cattleId);
      
      if (result.success && result.url) {
        const newFormData = {
          ...formData,
          imageUrl: result.url,
          imagePath: "",
        };
        setFormData(newFormData);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image: " + (result.error || "Unknown error"));
        // Fall back to local preview if upload fails
        const newFormData = {
          ...formData,
          imageUrl: URL.createObjectURL(file),
          imagePath: "",
        };
        setFormData(newFormData);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      // Fall back to local preview
      const newFormData = {
        ...formData,
        imageUrl: URL.createObjectURL(file),
        imagePath: "",
      };
      setFormData(newFormData);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url, imagePath: "" });
    setImagePreview(url);
  };

  const removeImage = async () => {
    const newFormData = { ...formData, imageUrl: "", imagePath: "" };
    setFormData(newFormData);
    setImagePreview(null);
    
    // Update cattle record
    await cattleApi.update(id || '', newFormData);
    
    toast.success("Image removed");
    if (cattle) {
      setCattle({ ...cattle, imageUrl: undefined, imagePath: undefined });
    }
  };

  const getAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) {
      return `${months} months`;
    } else if (months < 0) {
      return `${years - 1} years, ${12 + months} months`;
    }
    return `${years} years, ${months} months`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Loading cattle details...</p>
      </div>
    );
  }

  if (!cattle) {
    return null;
  }

  const commonBreeds = [
    "Angus",
    "Hereford",
    "Holstein",
    "Fresian",
    "Jersey",
    "Simmental",
    "Charolais",
    "Brahman",
    "Limousin",
    "Gelbvieh",
    "Red Angus",
    "Shorthorn",
    "Texas Longhorn",
    "Highland",
    "Belted Galloway",
    "Other",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="ghost" onClick={() => navigate("/cattle")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cattle List
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{cattle.name || "Unnamed"}</CardTitle>
                  <CardDescription>Tag: {cattle.tagNumber}</CardDescription>
                </div>
                <Badge className={
                  cattle.status === "active"
                    ? "bg-green-100 text-green-800"
                    : cattle.status === "sold"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }>
                  {cattle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Section */}
              <div className="space-y-2">
                <Label>Animal Photo</Label>
                {!imagePreview && !cattle.imageUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload-detail"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="image-upload-detail" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">
                        Click to upload
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview || cattle.imageUrl}
                      alt={cattle.name || cattle.tagNumber}
                      className="w-full h-auto max-h-[500px] object-contain rounded-lg cursor-pointer"
                      onClick={() => window.open(imagePreview || cattle.imageUrl, '_blank')}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                      disabled={uploadingImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <p className="text-white text-sm">Uploading...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-semibold w-24">Breed:</span>
                  <span className="text-gray-700">{cattle.breed}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-semibold w-24">Gender:</span>
                  <span className="text-gray-700 capitalize">{cattle.gender}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-semibold w-24">Age:</span>
                  <span className="text-gray-700">{getAge(cattle.dateOfBirth)}</span>
                </div>
                {cattle.weight && (
                  <div className="flex items-center text-sm">
                    <Weight className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-semibold w-24">Weight:</span>
                    <span className="text-gray-700">{cattle.weight} kg</span>
                  </div>
                )}
                {cattle.color && (
                  <div className="flex items-center text-sm">
                    <span className="font-semibold w-24 ml-6">Color:</span>
                    <span className="text-gray-700">{cattle.color}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Added: {new Date(cattle.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  Updated: {new Date(cattle.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Cattle
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Details</CardTitle>
              <CardDescription>Update cattle information</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="lineage">Lineage & Notes</TabsTrigger>
                  <TabsTrigger value="milk" disabled={cattle?.gender !== "female"}>
                    <Droplets className="h-4 w-4 mr-1" />
                    Milk
                  </TabsTrigger>
                  <TabsTrigger value="pregnancy" disabled={cattle?.gender !== "female"}>
                    <Droplets className="h-4 w-4 mr-1" />
                    Pregnancy
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleUpdate}>
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="breed">Breed</Label>
                        <Select
                          value={formData.breed || ""}
                          onValueChange={(value) => handleChange("breed", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) => handleChange("gender", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          required
                          value={formData.dateOfBirth || ""}
                          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={formData.color || ""}
                          onChange={(e) => handleChange("color", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status || ""}
                          onValueChange={(value) => handleChange("status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="deceased">Deceased</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="lineage" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sire">Sire (Father)</Label>
                        <Input
                          id="sire"
                          value={formData.sire || ""}
                          onChange={(e) => handleChange("sire", e.target.value)}
                          placeholder="Tag number or name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dam">Dam (Mother)</Label>
                        <Input
                          id="dam"
                          value={formData.dam || ""}
                          onChange={(e) => handleChange("dam", e.target.value)}
                          placeholder="Tag number or name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="Additional information..."
                        rows={6}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Milk Production Tab */}
                  <TabsContent value="milk" className="space-y-6">
                    {cattle?.gender !== "female" ? (
                      <div className="text-center py-8 text-gray-500">
                        Only female cattle (cows) can have milk production records.
                      </div>
                    ) : (
                      <>
                        {/* Add Milk Form */}
                        {!showMilkForm ? (
                          <div className="flex justify-end mb-4">
                            <Button onClick={() => setShowMilkForm(true)} className="bg-green-600 hover:bg-green-700">
                              <Droplets className="h-4 w-4 mr-2" />
                              Record Milk Production
                            </Button>
                          </div>
                        ) : (
                          <Card>
                            <CardHeader>
                              <CardTitle>Record Milk Production</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <form onSubmit={saveMilkRecord} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="milkDate">Date</Label>
                                    <Input
                                      id="milkDate"
                                      type="date"
                                      value={milkFormData.date}
                                      onChange={(e) => setMilkFormData({ ...milkFormData, date: e.target.value })}
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
                                      value={milkFormData.morningLiters}
                                      onChange={(e) => setMilkFormData({ ...milkFormData, morningLiters: e.target.value })}
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
                                      value={milkFormData.eveningLiters}
                                      onChange={(e) => setMilkFormData({ ...milkFormData, eveningLiters: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <span className="text-green-800 font-medium">
                                    Total: {((parseFloat(milkFormData.morningLiters) || 0) + (parseFloat(milkFormData.eveningLiters) || 0)).toFixed(1)} liters
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="milkNotes">Notes</Label>
                                  <Textarea
                                    id="milkNotes"
                                    value={milkFormData.notes}
                                    onChange={(e) => setMilkFormData({ ...milkFormData, notes: e.target.value })}
                                    placeholder="Any notes about this milking session..."
                                  />
                                </div>
                                <div className="flex gap-4">
                                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Record
                                  </Button>
                                  <Button type="button" variant="outline" onClick={() => setShowMilkForm(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </CardContent>
                          </Card>
                        )}

                        {/* Milk Records List */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Milk Production History</CardTitle>
                            <CardDescription>
                              {milkRecords.length} record(s) - Total:{" "}
                              {milkRecords.reduce((sum: number, r: any) => sum + r.totalLiters, 0).toFixed(1)} liters
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {milkRecords.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p>No milk production records yet.</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {milkRecords
                                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .slice(0, 10)
                                  .map((record: any) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                      <div>
                                        <p className="font-medium">
                                          {new Date(record.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Morning: {record.morningLiters}L | Evening: {record.eveningLiters}L
                                        </p>
                                        {record.notes && (
                                          <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xl font-bold text-green-600">
                                          {record.totalLiters.toFixed(1)} L
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                {milkRecords.length > 10 && (
                                  <Link to="/milk">
                                    <Button variant="outline" className="w-full mt-4">
                                      View All Records
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>

                  {/* Pregnancy Tab */}
                  <TabsContent value="pregnancy" className="space-y-6">
                    {cattle?.gender !== "female" ? (
                      <p className="text-gray-500">Pregnancy tracking is only available for female cattle.</p>
                    ) : (
                      <PregnancyTracker cattleId={cattle.id} cattleName={cattle.name} />
                    )}
                  </TabsContent>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cattle
              record for {cattle.name || cattle.tagNumber} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}