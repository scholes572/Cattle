import { Link } from "react-router";
import { BookOpen, TrendingUp, Users, Heart, Beef } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function HomePage() {
  const features = [
    {
      icon: <Beef className="h-8 w-8 text-green-600" />,
      title: "Cattle Management",
      description: "Track and manage your entire herd with detailed records for each animal",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Health Monitoring",
      description: "Keep track of vaccinations, treatments, and health status",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Growth Tracking",
      description: "Monitor weight gain, feeding schedules, and performance metrics",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      title: "Breed Information",
      description: "Access comprehensive information about different cattle breeds",
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Breeding Records",
      description: "Maintain detailed breeding history and lineage information",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to CattleInfo
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-50">
            Your Complete Cattle Management Solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cattle">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                <Beef className="mr-2 h-5 w-5" />
                View My Herd
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Everything You Need to Manage Your Cattle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-green-100">Cattle Breeds</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">Access to Your Data</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-green-100">Records Storage</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start managing your cattle more efficiently today with CattleInfo
        </p>
        <Link to="/cattle">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <Beef className="mr-2 h-5 w-5" />
            View My Herd
          </Button>
        </Link>
      </div>
    </div>
  );
}
