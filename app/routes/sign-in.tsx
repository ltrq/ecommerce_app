import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router';
import { auth } from '../utils/firebase';
import { Link } from 'react-router';
import { authSchema, type AuthForm } from '../utils/zodValidation';

export default function SignIn() {
  const [formData, setFormData] = useState<AuthForm>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AuthForm>>({});
  const navigate = useNavigate();

  const validateFormInputs = () => {
    const result = authSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return false;
    }
    return true;
  };

  const attemptSignIn = async () => {
    setLoading(true);
    setErrors({});
    const userCredential = await signInWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    console.log('User Signed In:', userCredential.user);
    navigate('/', { replace: true });
  };

  const handleSignInErrors = (error: unknown) => {
    console.error('Sign-in error:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    setErrors({
      password: message.includes('wrong-password')
        ? 'Incorrect password'
        : message.includes('user-not-found')
        ? 'No user found with this email'
        : 'Sign-in failed—please try again',
    });
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateFormInputs()) return;

    try {
      await attemptSignIn();
    } catch (error) {
      handleSignInErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof AuthForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value.trim() }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSignIn();
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
      <form onSubmit={handleSignIn} className="flex flex-col gap-4 w-80">
        <h2 className="text-3xl font-bold">Sign In</h2>
        <div className="flex flex-col gap-1">
          <input
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Email"
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="p-2 border rounded disabled:opacity-50"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Password"
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="p-2 border rounded disabled:opacity-50"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/sign-up" className="text-blue-500 hover:underline">
            Don’t have an account? Sign Up
          </Link>
          <Link to="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}
