import { useUser } from '../context/userContext';
import Logout from './log-out';

export default function UserPage() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>User Page</h1>
      <p>Email: {user?.email}</p>
      <Logout />
    </>
  );
}
