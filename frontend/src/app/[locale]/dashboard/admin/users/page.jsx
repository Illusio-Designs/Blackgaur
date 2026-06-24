'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Plus } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import PhoneInput from '@/components/ui/PhoneInput';
import { useToast } from '@/components/ui/Toast';
import { useUsers, useCreateUser } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { ROLES } from '@/lib/constants';
import { initials, timeAgo } from '@/lib/utils';

export default function UsersPage() {
  const t = useTranslations('users');
  const tr = useTranslations('roles');
  const tc = useTranslations('common');
  const toast = useToast();

  const { data: usersData } = useUsers();
  const rolesList = useRoles().data?.data ?? [];
  const createUser = useCreateUser();
  const [localUsers, setLocalUsers] = useState(null);
  const users = localUsers ?? usersData?.data ?? [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', role: 'trip_manager', language_pref: 'en' });

  const toggleActive = (id) => setLocalUsers(users.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u)));
  const submit = async () => {
    const roleId = rolesList.find((r) => r.name === form.role)?.id;
    try {
      await createUser.mutateAsync({
        name: form.name,
        mobile: form.mobile,
        email: form.email || null,
        role_id: roleId,
        language_pref: form.language_pref,
      });
      setOpen(false);
      setForm({ name: '', mobile: '', email: '', role: 'trip_manager', language_pref: 'en' });
      toast.success(tc('create'), form.name);
    } catch (err) {
      toast.error(tc('error'), err?.response?.data?.error?.message || String(err));
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', header: t('name'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">{initials(row.original.name)}</span>
            <span className="font-medium text-brand-navy">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: 'mobile', header: t('mobile'), cell: ({ row }) => <span className="font-mono text-xs">{row.original.mobile}</span> },
      { accessorKey: 'role', header: t('role'), cell: ({ row }) => { const rn = row.original.role?.name || row.original.role; return <span className="text-brand-text">{rn && tr.has(rn) ? tr(rn) : (row.original.role?.label || rn || '—')}</span>; } },
      { accessorKey: 'language_pref', header: tc('language'), cell: ({ row }) => <span className="uppercase">{row.original.language_pref}</span> },
      { accessorKey: 'last_login_at', header: t('lastLogin'), cell: ({ row }) => <span className="text-brand-muted">{row.original.last_login_at ? timeAgo(row.original.last_login_at) : '—'}</span> },
      {
        accessorKey: 'is_active', header: tc('status'), enableSorting: false,
        cell: ({ row }) => (
          <button onClick={() => toggleActive(row.original.id)}>
            <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} label={row.original.is_active ? tc('active') : tc('inactive')} />
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users],
  );

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={Users} actions={<Button variant="amber" icon={Plus} onClick={() => setOpen(true)}>{t('createUser')}</Button>} />
      <DataTable columns={columns} data={users} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={t('createUser')}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>{tc('cancel')}</Button><Button variant="amber" onClick={submit}>{tc('create')}</Button></>}>
        <div className="space-y-4">
          <FormInput label={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <PhoneInput label={t('mobile')} name="mobile" country="IN" value={form.mobile} onChange={(digits) => setForm({ ...form, mobile: digits })} />
          <FormInput label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FormInput as="select" label={t('role')} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{tr(r.value)}</option>)}
          </FormInput>
          <FormInput as="select" label={tc('language')} value={form.language_pref} onChange={(e) => setForm({ ...form, language_pref: e.target.value })}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="gu">ગુજરાતી</option>
          </FormInput>
        </div>
      </Drawer>
    </div>
  );
}
