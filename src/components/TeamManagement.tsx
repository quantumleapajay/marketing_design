
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { User, AppState } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { cn, getAvatarColors } from '../lib/utils';
import { 
  Plus, 
  MoreVertical, 
  UserPlus, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  Shield, 
  Trash2, 
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Power,
  Copy,
  X,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Separator } from './ui/separator';
import { AccessLevel, Role } from '../types';
import { MODULE_SECTIONS, getPillStyles, getDotColor } from '../constants';
import { MemberDetailPanel } from './MemberDetailPanel';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_TEAM: User[] = [
  {
    id: '1',
    firstName: 'Ria',
    lastName: 'Sharma',
    email: 'ria@quantumleap.co.in',
    mobile: '+91 9876543210',
    role: 'Marketing Head',
    status: 'Active',
  },
  {
    id: '2',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit@quantumleap.co.in',
    mobile: '+91 9876543211',
    role: 'Marketing Team Member',
    status: 'Active',
  },
  {
    id: '3',
    firstName: 'Charu',
    lastName: 'Mehta',
    email: 'charu@quantumleap.co.in',
    mobile: '+91 9876543212',
    role: 'Marketing Team Member',
    status: 'Active',
  },
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'head',
    name: 'Marketing Head',
    memberCount: 1,
    isDeletable: false,
    permissions: {
      bsw: 'Admin', bbs: 'Admin', pace: 'Admin',
      campaigns: 'Admin', calls: 'Admin',
      contacts: 'Admin', payments: 'Admin', products: 'Admin', transactions: 'Admin', export: 'Full',
      team: 'Admin', settings: 'Admin',
    },
  },
  {
    id: 'member',
    name: 'Marketing Team Member',
    memberCount: 1,
    isDeletable: false,
    permissions: {
      bsw: 'Full', bbs: 'Full', pace: 'Full',
      campaigns: 'Full', calls: 'Edit',
      contacts: 'View', payments: 'View', products: 'View', transactions: 'None', export: 'None',
      team: 'None', settings: 'None',
    },
  },
  {
    id: 'campaign-manager',
    name: 'Campaign Manager',
    memberCount: 0,
    isDeletable: true,
    permissions: {
      bsw: 'Full', bbs: 'None', pace: 'None',
      campaigns: 'Full', calls: 'Edit',
      contacts: 'View', payments: 'None', products: 'None', transactions: 'None', export: 'None',
      team: 'None', settings: 'None',
    },
  },
];

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>('loading');
  const [team, setTeam] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewRoleSheetOpen, setIsNewRoleSheetOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', copyFrom: '' });
  const [showDeleteError, setShowDeleteError] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isMemberPanelOpen, setIsMemberPanelOpen] = useState(false);
  const [memberOverrides, setMemberOverrides] = useState<Record<string, AccessLevel | 'default'>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'Marketing Team Member',
  });

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setTeam(MOCK_TEAM);
      setState('filled');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMember.email === 'error@test.com') {
      toast.error('Member created but password email failed to send.', {
        action: {
          label: 'Resend',
          onClick: () => toast.success('Email resent successfully!'),
        },
      });
      return;
    }

    const member: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newMember,
      status: 'Active',
    };

    setTeam([...team, member]);
    // Update role member count
    setRoles(prev => prev.map(r => r.name === newMember.role ? { ...r, memberCount: r.memberCount + 1 } : r));
    
    setIsAddDialogOpen(false);
    toast.success('Team member added. A password setup email has been sent.');
    setNewMember({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      role: 'Marketing Team Member',
    });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;

    const basePermissions = newRole.copyFrom && newRole.copyFrom !== 'blank'
      ? roles.find(r => r.id === newRole.copyFrom)?.permissions || {}
      : {};

    const permissions: Record<string, AccessLevel> = {};
    MODULE_SECTIONS.forEach(section => {
      section.modules.forEach(mod => {
        permissions[mod.id] = basePermissions[mod.id] || 'None';
        // Ensure Admin modules are handled correctly
        if (section.title === 'Admin' && permissions[mod.id] === 'Admin') {
           permissions[mod.id] = 'None'; 
        }
      });
    });

    const role: Role = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRole.name,
      memberCount: 0,
      isDeletable: true,
      permissions,
    };

    setRoles([...roles, role]);
    setIsNewRoleSheetOpen(false);
    setNewRole({ name: '', copyFrom: '' });
    toast.success('New role created successfully.');
  };

  const updatePermission = (roleId: string, moduleId: string, level: AccessLevel) => {
    if (roleId === 'head') return; // Marketing Head is locked

    // Rule: At least one role must have Admin access to Team Management
    if (moduleId === 'team' && level === 'None') {
      const otherAdminRoles = roles.filter(r => r.id !== roleId && (r.permissions['team'] === 'Admin' || r.permissions['team'] === 'Full'));
      if (otherAdminRoles.length === 0) {
        toast.error('At least one role must have admin access to Team Management.');
        return;
      }
    }

    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: { ...r.permissions, [moduleId]: level }
        };
      }
      return r;
    }));

    toast.success('Permissions updated.', {
      duration: 2000,
      className: 'bg-slate-900 text-white border-none',
    });
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.memberCount > 0) {
      setShowDeleteError(true);
      return;
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    toast.success('Role deleted successfully.');
  };

  const renderPermissionPill = (role: Role, moduleId: string, level: AccessLevel) => {
    const isMarketingHead = role.id === 'head';
    const isAdminLevel = level === 'Admin';
    const isLocked = isMarketingHead || isAdminLevel;
    
    const content = (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPillStyles(level)} ${!isLocked ? 'cursor-pointer hover:opacity-80' : ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getDotColor(level)}`} />
        {level}
        {isLocked && <Lock className="ml-1.5 h-3 w-3 opacity-50" />}
      </div>
    );

    if (isLocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {content}
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isMarketingHead 
                  ? "Marketing Head always has full access. Cannot be changed." 
                  : "This permission is locked to Admin roles only"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          {content}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => updatePermission(role.id, moduleId, 'Full')}>
            Full
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePermission(role.id, moduleId, 'Edit')}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePermission(role.id, moduleId, 'View')}>
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePermission(role.id, moduleId, 'None')}>
            None
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleMemberClick = (member: User) => {
    setSelectedMember(member);
    setIsMemberPanelOpen(true);
    setHasUnsavedChanges(false);
    
    // Simulate loading overrides for Charu
    if (member.firstName === 'Charu') {
      setMemberOverrides({
        'payments': 'None'
      });
    } else {
      setMemberOverrides({});
    }
  };

  const handleOverrideChange = (moduleId: string, level: AccessLevel | 'default') => {
    setMemberOverrides(prev => ({ ...prev, [moduleId]: level }));
    setHasUnsavedChanges(true);
  };

  const saveMemberPermissions = () => {
    setHasUnsavedChanges(false);
    toast.success('Permissions saved successfully.');
  };

  const toggleStatus = (id: string) => {
    setTeam(team.map(m => {
      if (m.id === id) {
        const newStatus = m.status === 'Active' ? 'Inactive' : 'Active';
        toast.success(`Member ${newStatus === 'Active' ? 'reactivated' : 'deactivated'} successfully.`);
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  if (user?.role !== 'Marketing Head') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to perform this action.</p>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">We couldn't load the team members. Please try again.</p>
        <Button onClick={() => setState('loading')}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (team.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6">
        <div className="text-center py-12">
          <UserPlus className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No team members yet</h3>
          <p className="text-xs text-gray-400 mb-4">Add your first team member to get started.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs defaultValue="members" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">Manage your marketing team and their roles.</p>
          </div>
          
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name..." 
                className="pl-10 h-10 border-slate-200 rounded-xl bg-white"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Member
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new member to your marketing team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newMember.firstName}
                        onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newMember.lastName}
                        onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={newMember.mobile}
                      onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value) => setNewMember({ ...newMember, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">Create Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team
                .filter(member => 
                  `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberSearchQuery.toLowerCase())
                )
                .map((member) => {
                  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
                  return (
                    <TableRow 
                      key={member.id} 
                      className="group cursor-pointer"
                      onClick={() => handleMemberClick(member)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                            getAvatarColors(initials)
                          )}>
                            {initials}
                          </div>
                          <span className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors">
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#6B7280]">{member.email}</TableCell>
                      <TableCell className="text-xs text-[#6B7280]">{member.mobile}</TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-[#6B7280]">{member.role}</span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-none",
                          member.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-grey-100 text-grey-600'
                        )}>
                          {member.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#6B7280] hover:text-slate-900 border border-slate-200 h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                            onClick={() => handleMemberClick(member)}
                          >
                            <ChevronRight className="h-3 w-3 mr-1" />
                            ViewDetails
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6B7280] hover:text-slate-900">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-0">
                              <DropdownMenuItem 
                                onClick={() => toggleStatus(member.id)}
                                className={cn(
                                  "cursor-pointer gap-2 font-bold text-[10px] uppercase tracking-widest p-2 px-3",
                                  member.status === 'Active' ? 'text-red-600' : 'text-emerald-600'
                                )}
                              >
                                {member.status === 'Active' ? <Power className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                <span>{member.status === 'Active' ? 'Deactivate' : 'Reactivate'}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {team.filter(member => 
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberSearchQuery.toLowerCase())
              ).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="text-center py-12">
                      <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">No team members found</h3>
                      <p className="text-xs text-gray-400 mb-4 max-w-[250px] mx-auto">
                        We couldn't find any team members matching "{memberSearchQuery}"
                      </p>
                      <Button 
                        variant="ghost" 
                        onClick={() => setMemberSearchQuery('')}
                        className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50"
                      >
                        Clear search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Role Permissions Matrix</h2>
              <p className="text-sm text-muted-foreground">Define what each role can see and do across the platform.</p>
            </div>
            
            <Button className="bg-primary" onClick={() => setIsNewRoleSheetOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              + New Role
            </Button>

            <AnimatePresence>
              {isNewRoleSheetOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNewRoleSheetOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                  />
                  
                  {/* Sidebar */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l flex flex-col overflow-hidden"
                  >
                    <div className="relative px-5 py-4 border-b border-gray-100 shrink-0">
                      <button 
                        type="button"
                        onClick={() => setIsNewRoleSheetOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-[60]"
                      >
                        <X className="h-5 w-5 text-slate-500" />
                      </button>
                      <div className="space-y-1 pr-10">
                        <h2 className="text-base font-semibold text-gray-900">Create New Role</h2>
                        <p className="text-sm text-muted-foreground">
                          Add a new role to your team and define its initial permissions.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateRole} className="flex flex-col flex-1 min-h-0">
                      <div className="flex-1 overflow-y-auto space-y-6 p-6">
                        <div className="space-y-2">
                          <Label htmlFor="roleName">Role Name</Label>
                          <Input 
                            id="roleName" 
                            placeholder="e.g. Content Manager" 
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="copyFrom">Initial Permissions</Label>
                          <Select 
                            value={newRole.copyFrom} 
                            onValueChange={(v) => setNewRole({ ...newRole, copyFrom: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Start blank (all None)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blank">Start blank (all None)</SelectItem>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>Copy from {role.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 shrink-0 bg-white">
                        <Button type="submit" className="min-w-[120px]">Create Role</Button>
                      </div>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px] pl-6">Module / Feature</TableHead>
                    {roles.map(role => (
                      <TableHead key={role.id} className="min-w-[180px] text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="font-bold text-slate-900">{role.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{role.memberCount} members</span>
                            {role.isDeletable && (
                              <button 
                                onClick={() => deleteRole(role.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULE_SECTIONS.map((section, sIdx) => (
                    <React.Fragment key={section.title}>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableCell colSpan={roles.length + 1} className="py-2.5 px-6 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-y border-slate-100">
                          {section.title}
                        </TableCell>
                      </TableRow>
                      {section.modules.map((mod, mIdx) => (
                        <TableRow key={mod.id} className="group">
                          <TableCell className="font-bold text-slate-700 pl-8 text-xs">
                            <div className="flex items-center">
                              <ChevronRight className="h-3 w-3 mr-2.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                              {mod.label}
                            </div>
                          </TableCell>
                          {roles.map(role => (
                            <TableCell key={`${role.id}-${mod.id}`} className="text-center">
                              {renderPermissionPill(role, mod.id, role.permissions[mod.id] || 'None')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700">Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-slate-700">Edit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold text-slate-700">View</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-semibold text-slate-700">None</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {isMemberPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMemberPanelOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l flex flex-col overflow-hidden"
            >
              <MemberDetailPanel
                member={selectedMember!}
                roles={roles}
                overrides={memberOverrides}
                onOverrideChange={handleOverrideChange}
                onSave={saveMemberPermissions}
                hasUnsavedChanges={hasUnsavedChanges}
                onStatusChange={() => toggleStatus(selectedMember!.id)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showDeleteError} onOpenChange={setShowDeleteError}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">Cannot Delete Role</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Cannot delete as a user exists (active/ inactive) in this role and has taken actions hence the role cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setShowDeleteError(false)} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
