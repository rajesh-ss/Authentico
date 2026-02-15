import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginParams } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

export const useLoginMutation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: LoginParams) => authService.login(params),
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: error.message || 'Failed to login',
      });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
};
