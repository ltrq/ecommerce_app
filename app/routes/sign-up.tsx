import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router';
import { auth } from '../utils/firebase';
import { Link } from 'react-router';
import { signUpSchema, type SignUpForm } from '../utils/zodValidation';

export default function SignUp() {
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SignUpForm>>({});
  const navigate = useNavigate();

  const validateFormInputs = () => {
    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return false;
    }
    return true;
  };

  const attemptSignUp = async () => {
    setLoading(true);
    setErrors({});
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    console.log('User Signed Up:', userCredential.user);
    navigate('/', { replace: true });
  };

  const handleSignUpErrors = (error: unknown) => {
    console.error('Sign-up error:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    setErrors({
      email: message.includes('email-already-in-use')
        ? 'Email already in use'
        : 'Sign-up failed—please try again',
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormInputs()) return;

    try {
      await attemptSignUp();
    } catch (error) {
      handleSignUpErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof SignUpForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value.trim() }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSignUp(event);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
      <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-80">
        <h2 className="text-3xl font-bold">Sign Up</h2>
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
        <div className="flex flex-col gap-1">
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirm Password"
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="p-2 border rounded disabled:opacity-50"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <div className="text-sm">
          <Link to="/sign-in" className="text-blue-500 hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
