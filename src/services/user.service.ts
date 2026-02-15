import apiClient from '@/api/client';
import { userApi } from '@/api/endpoints/users';
import { ManagedUser } from '@/data';
import { Roles } from '@/types/auth';

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  filter?: string; // This seems to be used for role or email filter based on user request {{local}}/users/all-user?page=1&limit=200&filter=emaiil
  search?: string;
}

export interface PaginationData {
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAllUsersResult {
  users: ManagedUser[];
  pagination: PaginationData;
}

export interface GetAllUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: Array<{
      _id: string;
      userId: string;
      name: string;
      email: string;
      roles: Roles[];
      isActive: boolean;
      createdAt: string;
    }>;
    pagination: PaginationData;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  roles: Roles[];
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    email: string;
    userId: string;
    roles: Roles[];
    isActive: boolean;
  };
}

export interface UpdateUserPayload {
  userId: string;
  name: string;
  roles: Roles[];
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    roles: Roles[];
  };
}

export const userService = {
  getAllUsers: async (params: GetAllUsersParams = {}): Promise<GetAllUsersResult> => {
    // Only include parameters that have values
    const queryParams: Record<string, any> = {};
    queryParams.page = params.page || 1;
    queryParams.limit = params.limit || 200;
    if (params.filter && params.filter !== 'all') queryParams.filter = params.filter;
    if (params.search && params.search.trim() !== '') queryParams.search = params.search;

    const response = await apiClient.get<GetAllUsersResponse>(userApi.allUsers, {
      params: queryParams,
    });

    console.group('User API Debug');
    console.log('Endpoint:', userApi.allUsers, 'Params:', queryParams);
    console.log('Response status:', response.status, 'Response data:', response.data);

    const users = (response.data?.data?.users || []).map((user) => ({
      userId: user?.userId || user?._id || String(Math.random()),
      name: user?.name || 'Unknown User',
      email: user?.email || 'No Email',
      roles: Array.isArray(user?.roles) ? user.roles : [],
      createdAt: user?.createdAt ? new Date(user.createdAt) : new Date(),
      status: user?.isActive ? ('active' as const) : ('inactive' as const),
    }));

    const pagination = response.data?.data?.pagination || {
      totalRecords: users.length,
      page: 1,
      limit: 200,
      totalPages: 1,
    };

    console.log('Extracted user count:', users.length);
    console.groupEnd();

    if (users.length === 0 && response.data?.success === false) {
      throw new Error(response.data.message || 'API reported failure');
    }

    return { users, pagination };
  },

  createUser: async (payload: CreateUserPayload): Promise<ManagedUser> => {
    const response = await apiClient.post<CreateUserResponse>(userApi.createUser, payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create user');
    }

    const userData = response.data.data;
    return {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
      createdAt: new Date(), // API doesn't return createdAt, so we use current time
      status: userData.isActive ? 'active' : 'inactive',
    };
  },

  updateUser: async (payload: UpdateUserPayload): Promise<ManagedUser> => {
    const response = await apiClient.put<UpdateUserResponse>(userApi.updateUser, payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user');
    }

    const userData = response.data.data;
    // The update API returns a slightly different structure (no userId, no isActive)
    // We need to map it back to ManagedUser, potentially reusing existing data if missing from response
    return {
      userId: userData._id, // API returns _id for update
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
      createdAt: new Date(), // Persist existing or use current
      status: 'active', // Default or need to fetch? API doesn't return isActive on update
    };
  },
};
