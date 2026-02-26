import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { HomePage } from "./components/HomePage";
import { CattleList } from "./components/CattleList";
import { CattleDetail } from "./components/CattleDetail";
import { AddCattle } from "./components/AddCattle";
import { BreedsPage } from "./components/BreedsPage";
import { MilkProduction } from "./components/MilkProduction";
import { MilkList } from "./components/MilkList";
import { DataPage } from "./components/DataPage";
import { ActivityLog } from "./components/ActivityLog";
import { Login } from "./components/Login";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        Component: ProtectedRoute,
        children: [
          { index: true, Component: HomePage },
          { path: "cattle", Component: CattleList },
          { path: "cattle/add", Component: AddCattle },
          { path: "cattle/:id", Component: CattleDetail },
          { path: "breeds", Component: BreedsPage },
          { path: "milk", Component: MilkList },
          { path: "milk/add", Component: MilkProduction },
          { path: "data", Component: DataPage },
          { path: "activity", Component: ActivityLog },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login", Component: Login },
    ],
  },
]);
