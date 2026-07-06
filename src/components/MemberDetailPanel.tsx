
import React from 'react';
import { User, Role, AccessLevel } from '../types';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { ChevronRight, ChevronDown, Power, RefreshCw } from 'lucide-react';
import { MODULE_SECTIONS, getPillStyles, getDotColor } from '../constants';
import { cn, getAvatarColors } from '../lib/utils';
import AuditTrail from './AuditTrail';

interface MemberDetailPanelProps {
  member: User;
  roles: Role[];
  overrides: Record<string, AccessLevel | 'default'>;
  hasUnsavedChanges: boolean;
  onOverrideChange: (moduleId: string, level: AccessLevel | 'default') => void;
  onSave: () => void;
  onStatusChange: (id: string) => void;
}

export const MemberDetailPanel: React.FC<MemberDetailPanelProps> = ({
  member,
  roles,
  overrides,
  hasUnsavedChanges,
  onOverrideChange,
  onSave,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="relative px-5 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
            getAvatarColors(`${member.firstName[0]}${member.lastName[0]}`)
          )}>
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                {member.firstName} {member.lastName}
              </h2>
              <Badge variant={member.role === 'Marketing Head' ? 'default' : 'secondary'} className="text-[10px] h-5">
                {member.role}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{member.email}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="flex-1 flex flex-col">
        <div className="px-6 border-b bg-white">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-8">
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12 font-semibold text-sm"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="permissions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12 font-semibold text-sm"
            >
              Permissions
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12 font-semibold text-sm"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <TabsContent value="details" className="p-6 m-0 space-y-6">
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: `${member.firstName} ${member.lastName}` },
                { label: 'Email', value: member.email },
                { label: 'Mobile', value: member.mobile },
                { label: 'Role', value: member.role },
                { label: 'Status', value: (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors outline-none",
                        member.status === 'Active' 
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' 
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      )}>
                        {member.status}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(member.id)}
                        className="cursor-pointer gap-2"
                      >
                        {member.status === 'Active' ? (
                          <>
                            <Power className="h-4 w-4 text-red-500" />
                            <span>Deactivate Member</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 text-emerald-500" />
                            <span>Reactivate Member</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-3 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-medium text-slate-500">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>

            {member.role === 'Marketing Head' && (
              <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 text-center leading-relaxed">
                  Marketing Head has full access to all modules.<br />
                  Permissions cannot be changed for this role.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="p-0 m-0 flex flex-col h-full">
            {member.role === 'Marketing Head' ? (
              <div className="p-12 text-center">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Marketing Head has full access to all modules.<br />
                  Permissions cannot be changed for this role.
                </p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                  <p className="text-xs text-slate-500">
                    Overrides apply to this person only and do not affect their role.
                  </p>
                </div>
                
                {hasUnsavedChanges && (
                  <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5">
                    <span className="text-xs font-medium text-amber-800">You have unsaved changes — click Save to apply</span>
                  </div>
                )}

                <div className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Module</TableHead>
                        <TableHead>Role Default</TableHead>
                        <TableHead>{member.firstName} Gets</TableHead>
                        <TableHead className="text-right">Override</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MODULE_SECTIONS.flatMap(section => section.modules).map((mod) => {
                        const role = roles.find(r => r.name === member.role);
                        const roleDefault = role?.permissions[mod.id] || 'None';
                        const override = overrides[mod.id] || 'default';
                        const effectiveLevel = override === 'default' ? roleDefault : override;
                        const isOverridden = override !== 'default';

                        return (
                          <TableRow key={mod.id} className={cn(
                            "border-b border-slate-50",
                            isOverridden ? 'bg-purple-50/40' : ''
                          )}>
                            <TableCell className="text-sm font-bold text-black">{mod.label}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPillStyles(roleDefault)} opacity-60 grayscale-[0.5]`}>
                                {roleDefault}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPillStyles(effectiveLevel)}`}>
                                <span className={`w-1 h-1 rounded-full mr-1.5 ${isOverridden ? 'bg-purple-500' : getDotColor(effectiveLevel)}`} />
                                {effectiveLevel}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger className={cn(
                                  "h-8 px-2 text-[10px] font-bold uppercase tracking-widest border rounded-md transition-all flex items-center ml-auto",
                                  isOverridden ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-[#E5E7EB] text-[#6B7280]'
                                )}>
                                  {isOverridden ? override : 'Use role default'}
                                  <ChevronRight className={cn(
                                    "ml-1 h-3 w-3 rotate-90 transition-transform",
                                    isOverridden ? 'text-purple-400' : 'text-slate-400'
                                  )} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 p-0">
                                  <DropdownMenuItem onClick={() => onOverrideChange(mod.id, 'default')} className="text-[10px] font-bold uppercase tracking-widest p-2 px-3">
                                    Use role default {override === 'default' && '✓'}
                                  </DropdownMenuItem>
                                  <Separator className="my-0" />
                                  <DropdownMenuItem onClick={() => onOverrideChange(mod.id, 'Full')} className="text-[10px] font-bold uppercase tracking-widest p-2 px-3">
                                    Full {override === 'Full' && '✓'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onOverrideChange(mod.id, 'Edit')} className="text-[10px] font-bold uppercase tracking-widest p-2 px-3">
                                    Edit {override === 'Edit' && '✓'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onOverrideChange(mod.id, 'View')} className="text-[10px] font-bold uppercase tracking-widest p-2 px-3">
                                    View {override === 'View' && '✓'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onOverrideChange(mod.id, 'None')} className="text-[10px] font-bold uppercase tracking-widest p-2 px-3 text-red-600">
                                    None {override === 'None' && '✓'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="activity" className="p-6 m-0">
            <AuditTrail
              title="Team member activity"
              maxVisible={5}
              entries={[
                {
                  id: '1',
                  actor: 'Ria Sharma (Marketing Head)',
                  action: 'Created team member',
                  module: 'Team Management',
                  detail: 'Amit Patel · Marketing Team Member',
                  timestamp: '1 Apr 2026, 10:00 AM',
                  relative_time: '1 month ago',
                  type: 'create',
                },
                {
                  id: '2',
                  actor: 'Ria Sharma (Marketing Head)',
                  action: 'Changed role',
                  module: 'Team Management',
                  field: 'Role',
                  old_value: 'Marketing Team Member',
                  new_value: 'Marketing Head',
                  timestamp: '15 Apr 2026, 2:00 PM',
                  relative_time: '2 weeks ago',
                  type: 'edit',
                },
                {
                  id: '3',
                  actor: 'Ria Sharma (Marketing Head)',
                  action: 'Deactivated team member',
                  module: 'Team Management',
                  detail: 'Amit Patel',
                  timestamp: '20 Apr 2026, 9:00 AM',
                  relative_time: '1 week ago',
                  type: 'deactivate',
                },
                {
                  id: '4',
                  actor: 'Ria Sharma (Marketing Head)',
                  action: 'Reactivated team member',
                  module: 'Team Management',
                  detail: 'Amit Patel',
                  timestamp: '22 Apr 2026, 11:30 AM',
                  relative_time: '5 days ago',
                  type: 'reactivate',
                },
              ]}
            />
          </TabsContent>
        </div>

      </Tabs>

      {member.role !== 'Marketing Head' && (
        <div className="px-5 py-3 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex justify-end gap-2">
          <Button 
            className="min-w-[140px] h-11 font-bold shadow-sm" 
            disabled={!hasUnsavedChanges}
            onClick={onSave}
          >
            Save Permissions
          </Button>
        </div>
      )}
    </div>
  );
};
