import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Main } from "./pages/main";
import { News } from "./pages/news";
import { Feedback } from "./pages/feedback";
import { FeedbackDetails } from "./pages/feedback-details";
import { Layout } from "./components/layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Main /></Layout>,
  },
  {
    path: "/news",
    element: <Layout><News /></Layout>,
  },
  {
    path: "/feedback",
    element: <Layout><Feedback /></Layout>,
  },
  {
    path: "/feedback/:feedbackId",
    element: <Layout><FeedbackDetails /></Layout>,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
