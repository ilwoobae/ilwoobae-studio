import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminGate from "./components/AdminGate";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGroupForm from "./pages/AdminGroupForm";
import AdminCategoryForm from "./pages/AdminCategoryForm";
import AdminPostForm from "./pages/AdminPostForm";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="type/:typeId" element={<Home />} />
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin"
          element={
            <AdminGate>
              <AdminDashboard />
            </AdminGate>
          }
        />
        <Route
          path="admin/groups/:id"
          element={
            <AdminGate>
              <AdminGroupForm />
            </AdminGate>
          }
        />
        <Route
          path="admin/categories/:id"
          element={
            <AdminGate>
              <AdminCategoryForm />
            </AdminGate>
          }
        />
        <Route
          path="admin/posts/:id"
          element={
            <AdminGate>
              <AdminPostForm />
            </AdminGate>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
