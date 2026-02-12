import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { useEffect } from "react";
import { checkAndSeedData } from "./utils/seedData";

export default function App() {
  useEffect(() => {
    // Seed sample data on first load
    checkAndSeedData();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}