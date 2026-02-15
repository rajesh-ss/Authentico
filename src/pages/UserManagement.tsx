import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  FilterBar,
  DataTable,
  ConfirmDialog,
  FormDialog,
  MobileCard,
  StatusBadge,
  type Column,
} from '@/components/shared';
import { availableRoles, type ManagedUser } from '@/data';
import { roleLabels, Roles } from '@/types/auth';
import { useDialog } from '@/hooks/useDialog';
import { useForm } from '@/hooks/useForm';
import { UserPlus, Pencil, Trash2, Mail, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { userService, type PaginationData } from '@/services/user.service';

type UserFormData = {
  name: string;
  email: string;
  roles: Roles[];
};

const initialFormValues: UserFormData = { name: '', email: '', roles: [] };

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    totalRecords: 0,
    page: 1,
    limit: 200,
    totalPages: 1,
  });

  const addDialog = useDialog();
  const editDialog = useDialog<ManagedUser>();
  const deleteDialog = useDialog<ManagedUser>();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(
        'Fetching users with search:',
        debouncedSearch,
        'filter:',
        filterValue,
        'page:',
        currentPage
      );
      const result = await userService.getAllUsers({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        filter: filterValue !== 'all' ? filterValue : undefined,
      });
      console.log('Received users result:', result);
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filterValue, currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterValue]);

  const form = useForm<UserFormData>({
    initialValues: initialFormValues,
    validate: (values) => {
      const errors: Partial<Record<keyof UserFormData, string>> = {};
      if (values.name === '') errors.name = 'Name is required';
      if (values.email === '') errors.email = 'Email is required';
      if (values.roles?.length === 0) errors.roles = 'Role is required';
      return errors;
    },
  });

  const handleAddUser = async () => {
    try {
      // Basic validation before API call
      const errors = form.validate(form.values);
      if (Object.keys(errors).length > 0) return;

      setIsLoading(true);
      const newUser = await userService.createUser({
        name: form.values.name,
        email: form.values.email,
        roles: form.values.roles,
      });

      // Optimistically add to list or re-fetch. Since we have pagination,
      // adding to top is good for UX even if next fetch organizes it differently.
      setUsers([newUser, ...users]);
      setPagination((prev) => ({ ...prev, totalRecords: prev.totalRecords + 1 }));

      addDialog.close();
      form.reset();
      toast.success(`User ${newUser.name} created successfully`);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!editDialog.data) return;

    try {
      // Basic validation before API call
      const errors = form.validate(form.values);
      if (Object.keys(errors).length > 0) return;

      setIsLoading(true);
      const updatedUser = await userService.updateUser({
        userId: editDialog.data.userId,
        name: form.values.name,
        roles: form.values.roles,
      });

      setUsers(
        users.map((u) =>
          u.userId === editDialog.data.userId
            ? { ...u, ...updatedUser, status: u.status } // Preserve existing status if API defaults it
            : u
        )
      );

      editDialog.close();
      form.reset();
      toast.success('User updated successfully');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = () => {
    if (!deleteDialog.data) return;
    setUsers(users.filter((u) => u.userId !== deleteDialog.data.userId));
    deleteDialog.close();
    toast.success(`User ${deleteDialog.data.name} deleted`);
  };

  const handleToggleStatus = (user: ManagedUser) => {
    setUsers(
      users.map((u) =>
        u.userId === user.userId
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      )
    );
    toast.success(`User ${user.name} is now ${user.status === 'active' ? 'inactive' : 'active'}`);
  };

  const openEditDialog = (user: ManagedUser) => {
    form.setValues({
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
    editDialog.open(user);
  };

  const columns: Column<ManagedUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <Badge key={role} variant="outline" className="font-normal">
              <Shield className="h-3 w-3 mr-1" />
              {roleLabels[role]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (user) => (
        <span className="text-muted-foreground">{user.createdAt.toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteDialog.open(user)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const UserFormFields = (
    <>
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          value={form.values.name}
          onChange={(e) => form.handleChange('name', e.target.value)}
          placeholder="Enter full name"
        />
      </div>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input
          type="email"
          value={form.values.email}
          onChange={(e) => form.handleChange('email', e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div className="space-y-2">
        <Label>Roles</Label>
        <Select
          value={form.values.roles[0]}
          onValueChange={(v) => form.handleChange('roles', [v as Roles])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabels[role as Roles]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <DashboardLayout title="User Management" subtitle="Manage system users and their roles">
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users..."
        filters={[
          {
            value: filterValue,
            onChange: setFilterValue,
            options: [
              { value: 'all', label: 'All Roles' },
              ...availableRoles.map((r) => ({ value: r, label: roleLabels[r] })),
            ],
            placeholder: 'Filter role',
          },
        ]}
        actions={
          <Button
            onClick={() => {
              form.reset();
              addDialog.open();
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      {/* Desktop Table */}
      <div className="hidden md:block space-y-4">
        <DataTable
          data={users}
          columns={columns}
          title="All Users"
          isLoading={isLoading}
          keyExtractor={(u) => u.userId}
          emptyMessage="No users found"
        />

        {/* Pagination */}
        {users.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100, 200].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground ml-2">
                ({pagination.totalRecords} total users)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1; // Simplified for now
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="text-muted-foreground italic">Loading users...</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {users.length} user{users.length === 1 ? '' : 's'}
            </p>
            {users.map((user) => (
              <MobileCard
                key={user.userId}
                header={
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                }
                badges={
                  <>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {roleLabels[r]}
                        </Badge>
                      ))}
                    </div>
                    <StatusBadge status={user.status} size="sm" />
                  </>
                }
                footer={
                  <p className="text-xs text-muted-foreground">
                    Added {user.createdAt.toLocaleDateString()}
                  </p>
                }
                actions={
                  <>
                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info(`Email sent to ${user.email}`)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteDialog.open(user)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                }
              />
            ))}
          </>
        )}
      </div>

      {/* Dialogs */}
      <FormDialog
        open={addDialog.isOpen}
        onOpenChange={(open) => !open && addDialog.close()}
        title="Add New User"
        description="Create a new user account"
        onSubmit={handleAddUser}
        submitLabel="Add User"
      >
        {UserFormFields}
      </FormDialog>
      <FormDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        title="Edit User"
        description="Update user information"
        onSubmit={handleEditUser}
        submitLabel="Save Changes"
      >
        {UserFormFields}
      </FormDialog>
      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteDialog.data?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        confirmLabel="Delete User"
        variant="destructive"
      />
    </DashboardLayout>
  );
}
