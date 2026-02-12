import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";

interface Breed {
  name: string;
  purpose: string;
  origin: string;
  characteristics: string;
  weight: string;
  temperament: string;
}

export function BreedsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const breeds: Breed[] = [
    {
      name: "Angus",
      purpose: "Beef",
      origin: "Scotland",
      characteristics: "Black, naturally polled (hornless), excellent meat quality",
      weight: "500-900 kg",
      temperament: "Docile, maternal",
    },
    {
      name: "Hereford",
      purpose: "Beef",
      origin: "England",
      characteristics: "Red body with white face, horned or polled varieties",
      weight: "600-1000 kg",
      temperament: "Calm, hardy",
    },
    {
      name: "Holstein",
      purpose: "Dairy",
      origin: "Netherlands",
      characteristics: "Black and white spotted, highest milk production",
      weight: "600-700 kg",
      temperament: "Gentle, high energy",
    },
    {
      name: "Jersey",
      purpose: "Dairy",
      origin: "Jersey Island, UK",
      characteristics: "Small, light brown, high butterfat milk content",
      weight: "350-450 kg",
      temperament: "Friendly, intelligent",
    },
    {
      name: "Simmental",
      purpose: "Dual (Beef & Dairy)",
      origin: "Switzerland",
      characteristics: "Gold and white coloring, large frame, versatile",
      weight: "700-1200 kg",
      temperament: "Docile, adaptable",
    },
    {
      name: "Charolais",
      purpose: "Beef",
      origin: "France",
      characteristics: "Cream/white color, heavily muscled, fast growth",
      weight: "700-1100 kg",
      temperament: "Calm but can be protective",
    },
    {
      name: "Brahman",
      purpose: "Beef",
      origin: "India/United States",
      characteristics: "Large hump, drooping ears, heat and parasite resistant",
      weight: "600-900 kg",
      temperament: "Intelligent, can be nervous",
    },
    {
      name: "Limousin",
      purpose: "Beef",
      origin: "France",
      characteristics: "Golden-red color, lean meat, good feed efficiency",
      weight: "650-1100 kg",
      temperament: "Docile, easy calving",
    },
    {
      name: "Gelbvieh",
      purpose: "Dual (Beef & Dairy)",
      origin: "Germany",
      characteristics: "Golden to reddish color, good maternal traits",
      weight: "600-1000 kg",
      temperament: "Calm, good mothers",
    },
    {
      name: "Red Angus",
      purpose: "Beef",
      origin: "Scotland",
      characteristics: "Red color, naturally polled, good marbling",
      weight: "500-900 kg",
      temperament: "Docile, maternal",
    },
    {
      name: "Shorthorn",
      purpose: "Dual (Beef & Dairy)",
      origin: "England",
      characteristics: "Red, white, or roan, versatile, hardy",
      weight: "600-900 kg",
      temperament: "Gentle, easy to handle",
    },
    {
      name: "Texas Longhorn",
      purpose: "Beef",
      origin: "United States",
      characteristics: "Distinctive long horns, lean meat, various colors",
      weight: "400-700 kg",
      temperament: "Independent, hardy",
    },
    {
      name: "Highland",
      purpose: "Beef",
      origin: "Scotland",
      characteristics: "Long shaggy coat, long horns, cold-hardy",
      weight: "400-650 kg",
      temperament: "Docile, good mothers",
    },
    {
      name: "Belted Galloway",
      purpose: "Beef",
      origin: "Scotland",
      characteristics: "Black with white belt, double coat, cold-hardy",
      weight: "450-750 kg",
      temperament: "Calm, easy to manage",
    },
  ];

  const filteredBreeds = breeds.filter(
    (breed) =>
      breed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breed.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breed.origin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPurposeColor = (purpose: string) => {
    if (purpose.includes("Beef")) return "bg-red-100 text-red-800";
    if (purpose.includes("Dairy")) return "bg-blue-100 text-blue-800";
    return "bg-purple-100 text-purple-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cattle Breeds</h1>
        <p className="text-gray-600">
          Explore different cattle breeds and their characteristics
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search breeds by name, purpose, or origin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBreeds.map((breed) => (
          <Card key={breed.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl">{breed.name}</CardTitle>
                <Badge className={getPurposeColor(breed.purpose)}>
                  {breed.purpose}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <span className="text-sm">📍 {breed.origin}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Characteristics:
                </p>
                <p className="text-sm text-gray-600">{breed.characteristics}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Weight Range:</p>
                  <p className="text-sm text-gray-600">{breed.weight}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Temperament:</p>
                  <p className="text-sm text-gray-600">{breed.temperament}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBreeds.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No breeds found matching your search.</p>
        </div>
      )}
    </div>
  );
}
