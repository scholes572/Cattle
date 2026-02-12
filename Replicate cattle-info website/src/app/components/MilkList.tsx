import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  Droplets,
  Calendar,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { API_URL } from "../api";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

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

interface DailyTotal {
  date: string;
  totalLiters: number;
  recordCount: number;
}

export function MilkList() {
  const { token } = useAuth();
  const [milkRecords, setMilkRecords] = useState<MilkProduction[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterCattle, setFilterCattle] = useState("");
  const [totalProduction, setTotalProduction] = useState(0);

  useEffect(() => {
    fetchMilkRecords();
  }, []);

  const fetchMilkRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/milk`);
      const data = await response.json();
      if (data.success) {
        const records = data.records || [];
        setMilkRecords(records);
        calculateDailyTotals(records);
        calculateTotalProduction(records);
      }
    } catch (error) {
      console.error("Error fetching milk records:", error);
      toast.error("Failed to load milk records");
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyTotals = (records: MilkProduction[]) => {
    const totals: Record<string, { total: number; count: number }> = {};
    records.forEach((record) => {
      if (!totals[record.date]) {
        totals[record.date] = { total: 0, count: 0 };
      }
      totals[record.date].total += record.totalLiters;
      totals[record.date].count += 1;
    });

    const dailyData: DailyTotal[] = Object.entries(totals)
      .map(([date, data]) => ({
        date,
        totalLiters: data.total,
        recordCount: data.count,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    setDailyTotals(dailyData);
  };

  const calculateTotalProduction = (records: MilkProduction[]) => {
    const total = records.reduce((sum, record) => sum + record.totalLiters, 0);
    setTotalProduction(total);
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`${API_URL}/milk/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Record deleted successfully");
        fetchMilkRecords();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const filteredRecords = milkRecords.filter((record) => {
    const dateMatch = !filterDate || record.date === filterDate;
    const cattleMatch =
      !filterCattle ||
      record.cattleId === filterCattle ||
      record.cattleTagNumber.toLowerCase().includes(filterCattle.toLowerCase()) ||
      record.cattleName.toLowerCase().includes(filterCattle.toLowerCase());
    return dateMatch && cattleMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center space-x-2 text-green-600">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Link to="/milk/add">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Record Milk</span>
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Droplets className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Total Production
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {totalProduction.toFixed(1)} L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Daily Average
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {dailyTotals.length > 0
                    ? (totalProduction / dailyTotals.length).toFixed(1)
                    : "0.0"}{" "}
                  L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Recording Days
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {dailyTotals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span>Filter Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="All dates"
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Cow</Label>
              <Input
                placeholder="Search by tag number or name"
                value={filterCattle}
                onChange={(e) => setFilterCattle(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Totals */}
      {dailyTotals.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Daily Production Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {dailyTotals.map((day) => (
                <div
                  key={day.date}
                  className="bg-green-50 p-3 rounded-lg text-center"
                >
                  <p className="text-sm text-green-600 font-medium">
                    {new Date(day.date).toLocaleDateString()}
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {day.totalLiters.toFixed(1)} L
                  </p>
                  <p className="text-xs text-green-500">
                    {day.recordCount} {day.recordCount === 1 ? "cow" : "cows"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Records */}
      <Card>
        <CardHeader>
          <CardTitle>Milk Production Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No milk records found</p>
              <Link to="/milk/add">
                <Button className="mt-4">Record First Milk Production</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Cow
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Morning
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Evening
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Notes
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((record) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/cattle/${record.cattleId}`}
                            className="text-green-600 hover:underline"
                          >
                            {record.cattleTagNumber} - {record.cattleName}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {record.morningLiters.toFixed(1)} L
                        </td>
                        <td className="py-3 px-4 text-right">
                          {record.eveningLiters.toFixed(1)} L
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {record.totalLiters.toFixed(1)} L
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {record.notes || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
