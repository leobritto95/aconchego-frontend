import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Main } from "./pages/main";
import { News } from "./pages/news";
import { Feedback } from "./pages/feedback";
import { FeedbackDetails } from "./pages/feedback-details";
import { ClassFeedbacks } from "./pages/class-feedbacks";
import { StudentClassFeedbacksPage } from "./pages/student-class-feedbacks";
import { Users } from "./pages/users";
import { Layout } from "./components/layout";
import { Login } from "./pages/Login";
import { ToastContainer } from "./components/toast";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
  },
  {
    path: "/news",
    element: (
      <ProtectedRoute>
        <News />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback",
    element: (
      <ProtectedRoute>
        <Feedback />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback/:feedbackId",
    element: (
      <ProtectedRoute>
        <FeedbackDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback/class/:classId",
    element: (
      <ProtectedRoute>
        <ClassFeedbacks />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student-class-feedbacks/:classId",
    element: (
      <ProtectedRoute>
        <StudentClassFeedbacksPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
]);

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
