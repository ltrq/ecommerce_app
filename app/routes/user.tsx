// routes/user.tsx
import { useUser } from '../context/userContext';
import Logout from './log-out';

export default function UserPage() {
  const { user, loading, email } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log('UserPage - User:', user);
  console.log('UserPage - Email:', email);

  return (
    <>
      <h1>User Page</h1>
      <p>Email: {email || 'Not available'}</p>
      <Logout />
    </>
  );
}
