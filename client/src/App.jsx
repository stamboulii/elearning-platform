import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import CustomToaster from './components/common/Toaster';

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
import StudentEnrollments from './pages/student/StudentEnrollments';
import Profile from './pages/Profile';
import MyCourses from './pages/instructor/MyCourses';
import CourseBuilder from './pages/instructor/CourseBuilder';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import Checkout from './pages/student/Checkout';
import CertificateView from './pages/student/CertificateView';
import MyCertificates from './pages/student/MyCertificates';
import NotificationsPage from './pages/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminCategories from './pages/admin/Categories';
import AdminSkills from './pages/admin/Skills';
import AdminCareerPaths from './pages/admin/CareerPaths';
import AdminSettings from './pages/admin/Settings';
import UserSettings from './pages/admin/Settings';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CouponManager from './pages/admin/CouponManager';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import TransactionManager from './pages/admin/TransactionManager';
import CareerPaths from './pages/student/CareerPaths';
import AdminReviews from './pages/admin/AdminReviews';
import Reviews from './pages/student/Reviews';
import AdminEnrollments from './pages/admin/Enrollments';
import InstructorCourseDetail from './pages/instructor/CourseDetail';
import InstructorCourseStats from './pages/instructor/InstructorCourseStats';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
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

              <Route
                path="/admin/skills"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminSkills />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/career-paths"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCareerPaths />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/enrollments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminEnrollments />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT', 'INSTRUCTOR']}>
                    <UserSettings />
                  </ProtectedRoute>
                }
              />

              <Route path="/admin/reviews" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReviews />
                </ProtectedRoute>
              } />

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
                path="/student/enrollments"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentEnrollments />
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
              {/* <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Checkout />
                </ProtectedRoute>
              }
            /> */}
              <Route
                path="/student/certificates"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <MyCertificates />
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
              <Route
                path="/student/career-paths"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <CareerPaths />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/reviews"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Reviews />
                  </ProtectedRoute>
                }
              />

              {/* Notifications Route */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
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
              <Route
                path="/instructor/courses/:courseId/edit"
                element={
                  <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                    <EditCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/courses/:courseId"
                element={
                  <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                    <InstructorCourseDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/instructor/courses/:courseId/stats"
                element={
                  <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                    <InstructorCourseStats />
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

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <WishlistPage />
                  </ProtectedRoute>}
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <CartPage />
                  </ProtectedRoute>}
              />

              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CouponManager />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/transactions"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <TransactionManager />
                  </ProtectedRoute>
                }
              />
              <Route path="/checkout" element={<ProtectedRoute allowedRoles={['STUDENT']}> <CheckoutPage /> </ProtectedRoute>} />
              <Route path="/payment/success" element={<ProtectedRoute allowedRoles={['STUDENT']}> <PaymentSuccessPage /> </ProtectedRoute>} />
              <Route path="/payment/cancel" element={<ProtectedRoute allowedRoles={['STUDENT']}> <PaymentCancelPage /> </ProtectedRoute>} />


              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;