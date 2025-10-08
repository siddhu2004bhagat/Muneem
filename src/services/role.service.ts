export interface Role { id: number; name: string; description?: string }

export const roleService = {
  async list(): Promise<Role[]> {
    const r = await fetch('http://localhost:8000/api/v1/roles');
      if (!r.ok) throw new Error('Failed to fetch roles');
      return r.json();
  },
  async create(name: string, description = ''): Promise<Role> {
    const url = `http://localhost:8000/api/v1/roles?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create role');
    return res.json();
  },
  async assign(userId: number, roleId: number): Promise<{ ok: boolean } | any> {
    const url = `http://localhost:8000/api/v1/assign-role?user_id=${userId}&role_id=${roleId}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to assign role');
    try { return await res.json(); } catch { return { ok: true }; }
  },
};

export default roleService;


