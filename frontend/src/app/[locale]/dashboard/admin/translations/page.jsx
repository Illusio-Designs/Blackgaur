'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Languages, Save, Search } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import { useToast } from '@/components/ui/Toast';
import { mockTranslations } from '@/lib/mock';

export default function TranslationsPage() {
  const t = useTranslations('translations');
  const tc = useTranslations('common');
  const toast = useToast();
  const [rows, setRows] = useState(mockTranslations);
  const [search, setSearch] = useState('');

  const update = (key, lang, value) => setRows(rows.map((r) => (r.key === key ? { ...r, [lang]: value } : r)));
  const filtered = rows.filter((r) => !search || r.key.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title={t('title')} subtitle={t('subtitle')} icon={Languages} accent="text-brand-blue"
        actions={<Button variant="success" icon={Save} onClick={() => toast.success(t('saved'))}>{tc('save')}</Button>}
      />

      <div className="mb-4 max-w-xs">
        <FormInput icon={Search} placeholder={`${tc('search')} ${t('key')}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/60">
                <th className="px-4 py-3 text-left font-semibold text-brand-muted">{t('key')}</th>
                <th className="px-4 py-3 text-left font-semibold text-brand-muted">EN</th>
                <th className="px-4 py-3 text-left font-semibold text-brand-muted">HI</th>
                <th className="px-4 py-3 text-left font-semibold text-brand-muted">GU</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.key} className="border-b border-brand-border/60">
                  <td className="px-4 py-2.5"><span className="font-mono text-xs text-brand-blue">{r.key}</span></td>
                  {['en', 'hi', 'gu'].map((lang) => (
                    <td key={lang} className="px-2 py-2">
                      <input
                        value={r[lang]}
                        onChange={(e) => update(r.key, lang, e.target.value)}
                        className={`input-base !py-1.5 text-sm ${lang === 'hi' ? 'font-hindi' : lang === 'gu' ? 'font-gujarati' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
