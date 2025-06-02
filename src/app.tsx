import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Main } from "./pages/main";
import { News } from "./pages/news";
import { Feedback } from "./pages/feedback";
import { FeedbackDetails } from "./pages/feedback-details";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/news",
    element: <News />,
  },
  {
    path: "/feedback",
    element: <Feedback />,
  },
  {
    path: "/feedback/:feedbackId",
    element: <FeedbackDetails />,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
