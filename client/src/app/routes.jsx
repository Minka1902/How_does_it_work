import { Home } from "../pages/Home";
import { Lesson } from "../pages/Lesson";
import { NotFound } from "../pages/NotFound";
import { Preferences } from "../pages/Preferences";
import { Layout } from "./Layout";

export const ROUTES = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "lesson/:slug", element: <Lesson /> },
      { path: "preferences", element: <Preferences /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
