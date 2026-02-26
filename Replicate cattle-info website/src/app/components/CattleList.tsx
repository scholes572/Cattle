import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit, Trash2, Calendar, Weight, Beef } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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
import { cattleApi } from "../api";

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
  imageUrl?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
}

export function CattleList() {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCattle = async () => {
    try {
      const data = await cattleApi.getAll();
      if (data.success) {
        setCattle((data.cattle as Cattle[]) || []);
      } else {
        console.error("Error fetching cattle:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch cattle:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCattle();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const data = await cattleApi.delete(id);
      if (data.success) {
        setCattle(cattle.filter((c) => c.id !== id));
      } else {
        console.error("Error deleting cattle:", data.error);
      }
    } catch (error) {
      console.error("Failed to delete cattle:", error);
    }
    setDeleteId(null);
  };

  const filteredCattle = cattle.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      case "deceased":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Loading cattle records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Cattle</h1>
            <p className="text-gray-600">
              Manage and track your entire herd ({filteredCattle.length} animals)
            </p>
          </div>
          <Link to="/cattle/add">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Cattle
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, tag number, or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCattle.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Beef className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No cattle found" : "No cattle yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by adding your first cattle to the system"}
            </p>
            {!searchTerm && (
              <Link to="/cattle/add">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Cattle
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCattle.map((animal) => (
            <Card key={animal.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {animal.imageUrl && (
                <div className="h-64 md:h-80 w-full overflow-hidden bg-gray-100">
                  <img
                    src={animal.imageUrl}
                    alt={animal.name || animal.tagNumber}
                    className="w-full h-full object-contain cursor-pointer"
                    loading="lazy"
                    onClick={() => window.open(animal.imageUrl, '_blank')}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Beef className="h-5 w-5 text-green-600" />
                      {animal.name || "Unnamed"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {animal.status === "active" ? "Active" : "Inactive"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(animal.status)}>
                    {animal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold w-20">Breed:</span>
                    <span>{animal.breed}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold w-20">Gender:</span>
                    <span className="capitalize">{animal.gender}</span>
                  </div>
                  {animal.weight && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Weight className="h-4 w-4 mr-2" />
                      <span>{animal.weight} kg</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Born: {new Date(animal.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/cattle/${animal.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(animal.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cattle
              record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
