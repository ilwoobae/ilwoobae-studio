import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminGate from "./components/AdminGate";
import Home from "./pages/Home";
import About from "./pages/About";
import BlogIndex from "./pages/BlogIndex";
import BlogGroup from "./pages/BlogGroup";
import BlogCategory from "./pages/BlogCategory";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGroupForm from "./pages/AdminGroupForm";
import AdminCategoryForm from "./pages/AdminCategoryForm";
import AdminPostForm from "./pages/AdminPostForm";
import TypePage from "./pages/TypePage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<BlogIndex />} />
          <Route path="blog/group/:groupId" element={<BlogGroup />} />
          <Route path="blog/category/:categoryId" element={<BlogCategory />} />
          <Route path="blog/post/:postId" element={<BlogPost />} />
          <Route path="type/:typeId" element={<TypePage />} />
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
