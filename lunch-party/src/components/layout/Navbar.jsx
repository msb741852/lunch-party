import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../../firebase";
import { useAuthStore } from "../../store/useAuthStore";
import Avatar from "../common/Avatar";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("로그아웃 되었어요");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("로그아웃에 실패했어요");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="text-xl">🍱</span>
          <span>점심파티</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar name={user.displayName} src={user.photoURL} size="sm" />
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user.displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
