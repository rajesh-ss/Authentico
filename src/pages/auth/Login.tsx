import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getRoleDefaultRoute } from '@/lib/roleRoutes';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

import { useLoginMutation } from '@/hooks/api/useAuthApi';
import { LoginParams } from '@/services/auth.service';

export default function Login() {
  const { setCredentials, user } = useAuth(); // Use only setCredentials from AuthContext
  const { mutateAsync: login, isPending: isLoading } = useLoginMutation(); // useLoginMutation for API call
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login(data as LoginParams); // data has email and password

      // Let's assume service login returns { user, token }
      setCredentials(response.user, response.token);

      toast({
        title: 'Login Successful',
        description: 'Welcome to Authentico Academic Verification System',
      });
      console.log(`Here is the response ${JSON.stringify(response)}`);
      const defaultRoute = getRoleDefaultRoute(response.user?.roles || []);
      navigate(defaultRoute);
    } catch (error: any) {
      // Toast handled by mutation hook onError?
      // If I use mutateAsync, I catch the error here.
      // The hook onError also fires. Dual toasts?
      // I'll rely on the hook's onError or handle it here.
      // The hook has onError toast. So I might not need catch block toast if I let it bubble up, OR I should remove toast from hook.
      // Current hook has toast.
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Login Form */}
      <div className="flex w-full flex-col p-8 lg:w-[45%] lg:p-12 xl:p-24 bg-white">
        <div className="flex items-center gap-2 mb-12 lg:mb-20">
          <span className="text-2xl font-bold text-[#2563EB]">Authentico</span>
        </div>

        <div className="mx-auto w-full max-w-sm flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Log in</h1>
            <p className="text-gray-500">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                title="Password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-[#2563EB] hover:text-blue-700"
              >
                Forgot password
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel - Banner Image */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#F8FAFC] p-12 items-center justify-center">
        <div className="relative w-full max-w-2xl">
          <img
            src="/login-banner.png"
            alt="Blockchain Verified Education Credentials Banner"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
