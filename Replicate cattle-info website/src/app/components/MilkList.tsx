import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  Droplets,
  Calendar,
  TrendingUp,
  Filter,
  Trash2,
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
import { milkApi, getAuthToken } from "../api";
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
      const response = await milkApi.getAll();
      if (response.success) {
        const records = (response.records || []) as MilkProduction[];
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
      const response = await milkApi.delete(id);
      if (response.success) {
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
      (record.cattleTagNumber?.toLowerCase() || "").includes(filterCattle.toLowerCase()) ||
      (record.cattleName?.toLowerCase() || "").includes(filterCattle.toLowerCase());
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
            <div className="space-y-4">
              {filteredRecords
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col space-y-3">
                      {/* Date and Cow Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        <Link
                          to={`/cattle/${record.cattleId}`}
                          className="text-green-600 hover:underline text-sm font-medium"
                        >
                          {record.cattleTagNumber} - {record.cattleName}
                        </Link>
                      </div>

                      {/* Production Details */}
                      <div className="grid grid-cols-3 gap-4 bg-green-50 rounded-lg p-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Morning</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {record.morningLiters.toFixed(1)} L
                          </p>
                        </div>
                        <div className="text-center border-l border-r border-green-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Evening</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {record.eveningLiters.toFixed(1)} L
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Total</p>
                          <p className="text-xl font-bold text-green-600">
                            {record.totalLiters.toFixed(1)} L
                          </p>
                        </div>
                      </div>

                      {/* Notes and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-500 flex-1 pr-4">
                          {record.notes ? (
                            <span className="italic bg-yellow-50 px-2 py-1 rounded">
                              "{record.notes}"
                            </span>
                          ) : (
                            <span className="text-gray-400">No notes</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
