import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { 
  FilterBar, 
  DataTable, 
  ConfirmDialog, 
  FormDialog, 
  MobileCard,
  StatusBadge,
  type Column 
} from '@/components/shared';
import { mockUsers, availableRoles, type ManagedUser } from '@/data';
import { roleLabels } from '@/types/auth';
import { useDialog } from '@/hooks/useDialog';
import { useForm } from '@/hooks/useForm';
import { useSearch } from '@/hooks/useSearch';
import { UserPlus, Pencil, Trash2, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

type UserFormData = {
  name: string;
  email: string;
  role: string;
  department: string;
};

const initialFormValues: UserFormData = { name: '', email: '', role: '', department: '' };

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>(mockUsers);
  
  const addDialog = useDialog();
  const editDialog = useDialog<ManagedUser>();
  const deleteDialog = useDialog<ManagedUser>();
  
  const { searchQuery, setSearchQuery, filterValue, setFilterValue, filteredData } = useSearch({
    data: users,
    searchFields: ['name', 'email', 'department'],
    filterField: 'role',
  });

  const form = useForm<UserFormData>({
    initialValues: initialFormValues,
    validate: (values) => {
      const errors: Partial<Record<keyof UserFormData, string>> = {};
      if (!values.name) errors.name = 'Name is required';
      if (!values.email) errors.email = 'Email is required';
      if (!values.role) errors.role = 'Role is required';
      if (!values.department) errors.department = 'Department is required';
      return errors;
    },
  });

  const handleAddUser = () => {
    const newUser: ManagedUser = {
      id: Date.now().toString(),
      name: form.values.name,
      email: form.values.email,
      role: form.values.role as ManagedUser['role'],
      department: form.values.department,
      status: 'active',
      createdAt: new Date(),
    };
    setUsers([...users, newUser]);
    addDialog.close();
    form.reset();
    toast.success(`User ${form.values.name} added successfully`);
  };

  const handleEditUser = () => {
    if (!editDialog.data) return;
    setUsers(users.map(u => 
      u.id === editDialog.data!.id 
        ? { ...u, ...form.values, role: form.values.role as ManagedUser['role'] }
        : u
    ));
    editDialog.close();
    form.reset();
    toast.success('User updated successfully');
  };

  const handleDeleteUser = () => {
    if (!deleteDialog.data) return;
    setUsers(users.filter(u => u.id !== deleteDialog.data!.id));
    deleteDialog.close();
    toast.success(`User ${deleteDialog.data.name} deleted`);
  };

  const handleToggleStatus = (user: ManagedUser) => {
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
    toast.success(`User ${user.name} is now ${user.status === 'active' ? 'inactive' : 'active'}`);
  };

  const openEditDialog = (user: ManagedUser) => {
    form.setValues({ name: user.name, email: user.email, role: user.role, department: user.department });
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
              {user.name.split(' ').map(n => n[0]).join('')}
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
        <Badge variant="outline" className="font-normal">
          <Shield className="h-3 w-3 mr-1" />
          {roleLabels[user.role]}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (user) => <span className="text-muted-foreground">{user.department}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (user) => <span className="text-muted-foreground">{user.createdAt.toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => deleteDialog.open(user)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const UserFormFields = (
    <>
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={form.values.name} onChange={(e) => form.handleChange('name', e.target.value)} placeholder="Enter full name" />
      </div>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input type="email" value={form.values.email} onChange={(e) => form.handleChange('email', e.target.value)} placeholder="Enter email" />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={form.values.role} onValueChange={(v) => form.handleChange('role', v)}>
          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
          <SelectContent>
            {availableRoles.map(role => <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Department</Label>
        <Input value={form.values.department} onChange={(e) => form.handleChange('department', e.target.value)} placeholder="Enter department" />
      </div>
    </>
  );

  return (
    <DashboardLayout title="User Management" subtitle="Manage system users and their roles">
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users..."
        filters={[{
          value: filterValue,
          onChange: setFilterValue,
          options: [{ value: 'all', label: 'All Roles' }, ...availableRoles.map(r => ({ value: r, label: roleLabels[r] }))],
          placeholder: 'Filter role',
        }]}
        actions={
          <Button onClick={() => { form.reset(); addDialog.open(); }}>
            <UserPlus className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Add User</span><span className="sm:hidden">Add</span>
          </Button>
        }
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable data={filteredData} columns={columns} title="All Users" keyExtractor={(u) => u.id} emptyMessage="No users found" />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <p className="text-sm text-muted-foreground">{filteredData.length} user{filteredData.length !== 1 ? 's' : ''}</p>
        {filteredData.map(user => (
          <MobileCard
            key={user.id}
            header={
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">{user.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            }
            badges={<><Badge variant="outline" className="text-xs"><Shield className="h-3 w-3 mr-1" />{roleLabels[user.role]}</Badge><StatusBadge status={user.status} size="sm" /></>}
            footer={<p className="text-xs text-muted-foreground">{user.department} • Added {user.createdAt.toLocaleDateString()}</p>}
            actions={
              <>
                <DropdownMenuItem onClick={() => openEditDialog(user)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>{user.status === 'active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Email sent to ${user.email}`)}><Mail className="h-4 w-4 mr-2" />Email</DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteDialog.open(user)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
              </>
            }
          />
        ))}
      </div>

      {/* Dialogs */}
      <FormDialog open={addDialog.isOpen} onOpenChange={(open) => !open && addDialog.close()} title="Add New User" description="Create a new user account" onSubmit={handleAddUser} submitLabel="Add User">{UserFormFields}</FormDialog>
      <FormDialog open={editDialog.isOpen} onOpenChange={(open) => !open && editDialog.close()} title="Edit User" description="Update user information" onSubmit={handleEditUser} submitLabel="Save Changes">{UserFormFields}</FormDialog>
      <ConfirmDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && deleteDialog.close()} title="Delete User" description={`Are you sure you want to delete ${deleteDialog.data?.name}? This action cannot be undone.`} onConfirm={handleDeleteUser} confirmLabel="Delete User" variant="destructive" />
    </DashboardLayout>
  );
}
