import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';
import { login as loginApi } from '../services/requests';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../components/Button';
import { useFileStore } from '../stores/fileStore';
import { LOGIN_INPUT_FIELDS } from '../utils/constants';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const { fetchAllPatterns } = useFileStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const loginPayload = {
        email: data.email,
        password: data.password
      };
      const response = await loginApi(loginPayload);
      toast.success('Login successful!');
      const token = response.data.data.token;
      loginStore(token);
      await fetchAllPatterns(); // Fetch patterns after login
      navigate('/uploadFiles');
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed';
      toast.error('Login failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient" style={{background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)'}}>
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{maxWidth: 400, width: '100%'}}>
        <div className="text-center mb-4">
          <div className="mb-2">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3B82F6" fillOpacity="0.1"/><path d="M24 14a6 6 0 0 1 6 6v2h-2v-2a4 4 0 0 0-8 0v2h-2v-2a6 6 0 0 1 6-6Zm-7 8a1 1 0 0 1 1 1v7a6 6 0 0 0 12 0v-7a1 1 0 1 1 2 0v7a8 8 0 0 1-16 0v-7a1 1 0 0 1 1-1Z" fill="#2563EB"/></svg>
          </div>
          <h2 className="fw-bold mb-1 text-primary">Sign In</h2>
          <div className="text-muted mb-2">Welcome back! Please login to your account.</div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {LOGIN_INPUT_FIELDS.map((field) => (
            <div key={field.name} className="mb-3">
              <input
                type={field.type}
                {...register(field.name as keyof LoginFormData)}
                placeholder={field.placeholder}
                className={`form-control form-control-lg rounded-3${errors[field.name as keyof LoginFormData] ? ' is-invalid' : ''}`}
                autoFocus={field.autoFocus}
              />
              {errors[field.name as keyof LoginFormData] && (
                <div className="invalid-feedback d-block">
                  {errors[field.name as keyof LoginFormData]?.message}
                </div>
              )}
            </div>
          ))}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            className="mb-3"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        {/* <div className="text-center mt-2">
          <span className="text-muted">Don't have an account? </span>
          <Button
            variant="link"
            onClick={() => navigate('/register')}
            className="p-0 text-primary text-decoration-none fw-semibold"
            style={{fontSize: '1rem'}}
          >
            Register
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;