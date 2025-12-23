import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole, roleLabels } from '@/types/auth';
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Mail,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const initialUsers: ManagedUser[] = [
  { id: '1', name: 'Dr. Sarah Johnson', email: 'issuer@university.edu', role: 'issuer', department: 'Computer Science', status: 'active', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Dr. Emily Davis', email: 'approver@university.edu', role: 'reevaluation_approver', department: 'Examination Cell', status: 'active', createdAt: new Date('2024-02-20') },
  { id: '3', name: 'Mr. James Wilson', email: 'updater@university.edu', role: 'reevaluation_updater', department: 'Examination Cell', status: 'active', createdAt: new Date('2024-03-10') },
  { id: '4', name: 'Dr. Michael Brown', email: 'verifier@university.edu', role: 'verifying_admin', department: 'Quality Assurance', status: 'active', createdAt: new Date('2024-01-05') },
  { id: '5', name: 'Prof. Lisa Anderson', email: 'lisa@university.edu', role: 'issuer', department: 'Mathematics', status: 'inactive', createdAt: new Date('2023-11-20') },
  { id: '6', name: 'Dr. Robert Taylor', email: 'robert@university.edu', role: 'verifying_admin', department: 'Administration', status: 'active', createdAt: new Date('2024-04-01') },
];

const availableRoles: UserRole[] = ['issuer', 'reevaluation_approver', 'reevaluation_updater', 'verifying_admin'];

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    department: '',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', role: '', department: '' });
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      toast.error('Please fill in all fields');
      return;
    }

    const newUser: ManagedUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      department: formData.department,
      status: 'active',
      createdAt: new Date(),
    };

    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success(`User ${formData.name} added successfully`);
  };

  const handleEditUser = () => {
    if (!selectedUser || !formData.name || !formData.email || !formData.role || !formData.department) {
      toast.error('Please fill in all fields');
      return;
    }

    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, name: formData.name, email: formData.email, role: formData.role as UserRole, department: formData.department }
        : user
    ));
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
    toast.success('User updated successfully');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    toast.success(`User ${selectedUser.name} deleted`);
    setSelectedUser(null);
  };

  const handleToggleStatus = (user: ManagedUser) => {
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
    toast.success(`User ${user.name} is now ${user.status === 'active' ? 'inactive' : 'active'}`);
  };

  const openEditDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout 
      title="User Management" 
      subtitle="Manage system users and their roles"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {availableRoles.map(role => (
              <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with the specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      <Shield className="h-3 w-3 mr-1" />
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                      {user.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === 'active' ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Email sent to ${user.email}`)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
