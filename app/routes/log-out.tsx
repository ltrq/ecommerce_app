import { logout } from '../services/auth';
import { useNavigate } from 'react-router';
import { UserRound } from 'lucide-react';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      alert('Logged out successfully!');
      navigate('/sign-in');
    } catch (error: unknown) {
      console.error(
        'Logout failed:',
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  return (
    <button onClick={handleLogout}>
      {/* <UserRound color="black" /> */}
      Log Me Out
    </button>
  );
}
