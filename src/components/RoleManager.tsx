import React, { useEffect, useState } from 'react';
import roleService, { Role } from '@/services/role.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

interface User { id: number; name: string }

const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([{ id: 1, name: 'demo'}]);
  const [userId, setUserId] = useState<number>(1);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [newRole, setNewRole] = useState('');

  const load = async () => {
    try { setRoles(await roleService.list()); } catch { toast.error('Failed to load roles'); }
  };

  useEffect(() => { load(); }, []);

  const assign = async () => {
    if (!roleId) return;
    try { await roleService.assign(userId, roleId); toast.success('Role updated'); } catch { toast.error('Failed to update role'); }
  };

  const create = async () => {
    if (!newRole.trim()) return;
    try { await roleService.create(newRole.trim()); setNewRole(''); await load(); toast.success('Role created'); } catch { toast.error('Failed to create role'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="New role name" className="w-48" />
        <Button size="sm" onClick={create}>Create</Button>
      </div>
      <div className="flex items-center gap-3">
        <Select value={String(userId)} onValueChange={v => setUserId(Number(v))}>
          <SelectTrigger className="w-48"><SelectValue placeholder="User"/></SelectTrigger>
          <SelectContent>
            {users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(roleId ?? '')} onValueChange={v => setRoleId(Number(v))}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Role"/></SelectTrigger>
          <SelectContent>
            {roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={assign}>Assign Role</Button>
      </div>
    </div>
  );
};

export default RoleManager;


