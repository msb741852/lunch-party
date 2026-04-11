import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";
import { auth } from "./firebase";
import { useAuthStore } from "./store/useAuthStore";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import PartyDetailPage from "./pages/PartyDetailPage";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        불러오는 중...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        clearUser();
      }
    });
    return () => unsubscribe();
  }, [setUser, clearUser]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/party/:id"
          element={
            <ProtectedRoute>
              <PartyDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
