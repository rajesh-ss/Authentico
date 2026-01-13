import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { demoAccounts } from '@/data';
import { getRoleDefaultRoute } from '@/lib/roleRoutes';

const Login = memo(function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(email, password);
      toast({ title: 'Login Successful', description: 'Welcome to Authentico Academic Verification System' });
      const defaultRoute = getRoleDefaultRoute(loggedInUser.role);
      navigate(defaultRoute);
    } catch (_err) {
      setError('Invalid email or password. Please try again.');
    }
  }, [email, password, login, toast, navigate]);

  const features = [
    'Tamper-proof digital marks cards',
    'Multi-signature verification workflow',
    'Real-time re-evaluation tracking',
    'Instant QR code verification',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">Authentico</h1>
              <p className="text-primary-foreground/70">Academic Verification System</p>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            Blockchain-Verified<br />Academic Records
          </h2>

          <p className="text-lg text-primary-foreground/80 max-w-md mb-8">
            Secure, immutable, and instantly verifiable academic credentials powered by blockchain technology.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-primary-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Authentico</h1>
              <p className="text-xs text-muted-foreground">Academic Verification</p>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Sign in to access your academic verification dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
                </Button>
              </form>

              {/* Demo Accounts - For Development Only */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    ⚠️ Demo Mode
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  <strong>For demonstration purposes only.</strong> These mock accounts should not be used in production. 
                  Implement real authentication before deployment.
                </p>
                <div className="space-y-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => { setEmail(account.email); setPassword('password'); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <span className="font-mono text-xs truncate">{account.email}</span>
                      <span className="text-muted-foreground text-xs">{account.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Secure Access</p>
              <p className="text-xs text-muted-foreground mt-1">All sessions are encrypted and blockchain transactions require wallet signature verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Login;
