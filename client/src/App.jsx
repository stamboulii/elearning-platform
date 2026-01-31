// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import Dashboard from './pages/Dashboard';

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           {/* Protected Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Redirect root to dashboard */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />

//           {/* 404 */}
//           <Route
//             path="*"
//             element={
//               <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                   <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
//                   <p className="text-xl text-gray-600 mb-8">Page not found</p>
//                   <a
//                     href="/dashboard"
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
//                   >
//                     Go to Dashboard
//                   </a>
//                 </div>
//               </div>
//             }
//           />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import InstructorDashboard from './pages/instructor/Dashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetail from './pages/student/CourseDetail';
import CoursePlayer from './pages/student/CoursePlayer';
import StudentMyCourses from './pages/student/MyCourses';
import Profile from './pages/Profile';
import MyCourses from './pages/instructor/MyCourses';
import CourseBuilder from './pages/instructor/CourseBuilder';
import CreateCourse from './pages/instructor/CreateCourse';
import Checkout from './pages/student/Checkout';
import CertificateView from './pages/student/CertificateView';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminCategories from './pages/admin/Categories';
function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetail />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />


            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentMyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/learn"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CoursePlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificates/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CertificateView />
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/create"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <CreateCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:courseId/builder"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <CourseBuilder />
                </ProtectedRoute>
              }
            />

            {/* Common Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;