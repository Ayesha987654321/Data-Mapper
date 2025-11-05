import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '../schemas/registerSchema';
import { createUser as createUserApi, login as loginApi } from '../services/requests';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from '../components/Button';
import { REGISTER_INPUT_FIELDS } from '../utils/constants';
type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        roleId: 1
      };
      await createUserApi(payload);
      toast.success('Registration successful!');
      // Auto-login after successful registration
      try {
        const loginPayload = {
          email: data.email,
          password: data.password
        };
        const loginResponse = await loginApi(loginPayload);
        toast.success('Registration and login successful!');
        loginStore(loginResponse.data.data.token);
        navigate('/home');
      } catch (loginError: any) {
        toast.warning('Registration successful! Please login manually.');
        navigate('/login');
      }
      reset();
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed';
      toast.error('Registration failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient" style={{background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)'}}>
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{maxWidth: 480, width: '100%'}}>
        <div className="text-center mb-4">
          <div className="mb-2">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3B82F6" fillOpacity="0.1"/><path d="M24 14a6 6 0 0 1 6 6v2h-2v-2a4 4 0 0 0-8 0v2h-2v-2a6 6 0 0 1 6-6Zm-7 8a1 1 0 0 1 1 1v7a6 6 0 0 0 12 0v-7a1 1 0 1 1 2 0v7a8 8 0 0 1-16 0v-7a1 1 0 0 1 1-1Z" fill="#2563EB"/></svg>
          </div>
          <h2 className="fw-bold mb-1 text-primary">Register</h2>
          <div className="text-muted mb-2">Create your account to get started.</div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="row g-3 mb-2">
            {REGISTER_INPUT_FIELDS.slice(0, 2).map((field) => (
              <div key={field.name} className={field.colClass}>
                <input
                  type={field.type}
                  {...register(field.name as keyof RegisterFormData)}
                  className={`form-control form-control-lg rounded-3${errors[field.name as keyof RegisterFormData] ? ' is-invalid' : ''}`}
                  placeholder={field.placeholder}
                  autoFocus={field.autoFocus}
                />
                {errors[field.name as keyof RegisterFormData] && (
                  <div className="invalid-feedback d-block">{errors[field.name as keyof RegisterFormData]?.message}</div>
                )}
              </div>
            ))}
          </div>
          {REGISTER_INPUT_FIELDS.slice(2).map((field) => (
            <div key={field.name} className="mb-3">
              <input
                type={field.type}
                {...register(field.name as keyof RegisterFormData)}
                className={`form-control form-control-lg rounded-3${errors[field.name as keyof RegisterFormData] ? ' is-invalid' : ''}`}
                placeholder={field.placeholder}
              />
              {errors[field.name as keyof RegisterFormData] && (
                <div className="invalid-feedback d-block">{errors[field.name as keyof RegisterFormData]?.message}</div>
              )}
            </div>
          ))}
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            className="mb-3"
            type="submit"
            loading={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <div className="text-center mt-2">
          <span className="text-muted">Already have an account? </span>
          <Button
            variant="link"
            onClick={() => navigate('/login')}
            className="p-0 text-primary text-decoration-none fw-semibold"
            style={{fontSize: '1rem'}}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register; 