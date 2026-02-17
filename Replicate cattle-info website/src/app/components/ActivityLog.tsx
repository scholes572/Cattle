import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trash2, User, Calendar, Activity } from "lucide-react";
import { toast } from "sonner";
import { activityApi } from "../api";

interface ActivityLogEntry {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export function ActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activityApi.getAll();
      if (response.success) {
        setActivities((response.activities || []) as ActivityLogEntry[]);
      } else {
        toast.error(response.error || "Failed to load activity log");
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error("Failed to load activity log");
    }
    setLoading(false);
  };

  const clearActivities = async () => {
    if (!confirm("Are you sure you want to clear all activity logs?")) return;

    try {
      const response = await activityApi.clear();
      if (response.success) {
        setActivities([]);
        toast.success("Activity log cleared");
      } else {
        toast.error("Failed to clear activity log");
      }
    } catch (error) {
      toast.error("Failed to clear activity log");
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('ADD')) return 'text-green-600 bg-green-100';
    if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-100';
    if (action.includes('DELETE')) return 'text-red-600 bg-red-100';
    if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CATTLE')) return '🐄';
    if (action.includes('MILK')) return '🥛';
    if (action.includes('LOGIN')) return '🔐';
    return '📋';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-1">Track all actions performed on the system</p>
        </div>
        {activities.length > 0 && (
          <Button
            variant="outline"
            onClick={clearActivities}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Log
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activity recorded yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Showing {activities.length} {activities.length === 1 ? 'entry' : 'entries'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActionIcon(activity.action)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(activity.action)}`}>
                          {activity.action.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.details}</p>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{activity.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
