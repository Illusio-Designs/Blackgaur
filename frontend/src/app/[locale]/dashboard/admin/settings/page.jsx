'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Palette,
  Building2,
  Image as ImageIcon,
  Phone,
  Share2,
  FileText,
  Plus,
  Trash2,
  LayoutDashboard,
  Truck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import FileUpload from '@/components/ui/FileUpload';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useBranding, useUpdateBranding, useUploadLogo } from '@/hooks/useBranding';
import { normalizeHex } from '@/lib/color';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'identity', icon: Building2 },
  { key: 'theme', icon: Palette },
  { key: 'contact', icon: Phone },
  { key: 'social', icon: Share2 },
  { key: 'content', icon: FileText },
];

// Live theme preview — a mini sidebar + primary button + accent badge that
// updates instantly as the colours change.
function ThemePreview({ sidebar, primary, accent }) {
  const ts = useTranslations('settingsPage.theme');
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
      <div className="flex h-44">
        <div
          className="flex w-1/3 flex-col gap-2 p-3 text-white"
          style={{ backgroundColor: sidebar }}
        >
          <span className="flex items-center gap-2 text-xs font-semibold">
            <LayoutDashboard className="h-4 w-4" /> {ts('previewNav')}
          </span>
          <span
            className="mt-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white"
            style={{ backgroundColor: primary }}
          >
            <Truck className="mr-1 inline h-3 w-3" /> Trips
          </span>
          <span className="rounded-lg px-2 py-1.5 text-[11px] text-white/70">Invoices</span>
          <span className="rounded-lg px-2 py-1.5 text-[11px] text-white/70">FASTag</span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-brand-navy">Dashboard</span>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {ts('previewBadge')}
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-brand-border" />
            <div className="h-2 w-1/2 rounded-full bg-brand-border" />
          </div>
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: primary }}
          >
            {ts('previewButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="label-base">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-brand-border bg-white p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-base font-mono uppercase"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default function BrandingSettingsPage() {
  const t = useTranslations('settingsPage');
  const toast = useToast();
  const { branding } = useBranding();
  const updateBranding = useUpdateBranding();
  const uploadLogo = useUploadLogo();

  const [tab, setTab] = useState('identity');
  const [savedTrigger, setSavedTrigger] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
  } = useForm({ defaultValues: branding });

  // Keep the form in sync once branding loads from the query.
  useEffect(() => {
    reset(branding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    branding.companyName,
    branding.theme.sidebar,
    branding.theme.primary,
    branding.theme.accent,
  ]);

  const stats = useFieldArray({ control, name: 'content.stats' });
  const services = useFieldArray({ control, name: 'content.services' });

  const theme = watch('theme');

  const onSubmit = async (values) => {
    // Normalise colour hexes before persisting.
    const payload = {
      ...values,
      theme: {
        sidebar: normalizeHex(values.theme.sidebar, '#0B1E3D'),
        primary: normalizeHex(values.theme.primary, '#1A56DB'),
        accent: normalizeHex(values.theme.accent, '#D97706'),
      },
    };
    await updateBranding.mutateAsync(payload);
    setSavedTrigger((n) => n + 1);
    toast.success(t('saved'), t('savedBody'));
  };

  const handleLogoUpload = (variant, fieldName) => async (file) => {
    const url = await uploadLogo.mutateAsync({ file, variant });
    if (url) {
      setValue(fieldName, url, { shouldDirty: true });
      toast.success(t('identity.uploaded'), file.name);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={Palette}
        accent="text-brand-amber"
        actions={
          <TaskCompleteFX type="approve" trigger={savedTrigger}>
            <Button type="submit" variant="amber" loading={updateBranding.isPending}>
              {t('save')}
            </Button>
          </TaskCompleteFX>
        }
      />

      {/* tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-brand-border">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition',
              tab === key ? 'text-brand-blue' : 'text-brand-muted hover:text-brand-navy',
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`tabs.${key}`)}
            {tab === key && (
              <motion.span
                layoutId="settings-tab"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-blue"
              />
            )}
          </button>
        ))}
      </div>

      {/* IDENTITY */}
      {tab === 'identity' && (
        <div className="card space-y-6 p-6">
          <h2 className="font-display text-lg font-semibold text-brand-navy">
            {t('identity.title')}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput label={t('identity.companyName')} {...register('companyName')} />
            <FormInput label={t('identity.legalName')} {...register('legalName')} />
          </div>
          <FormInput label={t('identity.tagline')} {...register('tagline')} />

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="label-base flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" /> {t('identity.logo')}
              </label>
              {watch('logoUrl') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watch('logoUrl')}
                  alt="logo"
                  className="mb-2 h-12 w-auto rounded-lg border border-brand-border bg-white object-contain p-1"
                />
              ) : null}
              <FileUpload
                accept="image/*"
                label={t('identity.logo')}
                onUpload={handleLogoUpload('logo', 'logoUrl')}
              />
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" /> {t('identity.logoDark')}
              </label>
              {watch('logoDarkUrl') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watch('logoDarkUrl')}
                  alt="dark logo"
                  className="mb-2 h-12 w-auto rounded-lg bg-brand-navy object-contain p-1"
                />
              ) : null}
              <FileUpload
                accept="image/*"
                label={t('identity.logoDark')}
                onUpload={handleLogoUpload('logo_dark', 'logoDarkUrl')}
              />
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" /> {t('identity.favicon')}
              </label>
              {watch('faviconUrl') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watch('faviconUrl')}
                  alt="favicon"
                  className="mb-2 h-12 w-12 rounded-lg border border-brand-border bg-white object-contain p-1"
                />
              ) : null}
              <FileUpload
                accept="image/*"
                label={t('identity.favicon')}
                onUpload={handleLogoUpload('favicon', 'faviconUrl')}
              />
            </div>
          </div>
        </div>
      )}

      {/* THEME */}
      {tab === 'theme' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card space-y-5 p-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-brand-navy">
                {t('theme.title')}
              </h2>
              <p className="mt-1 text-sm text-brand-muted">{t('theme.subtitle')}</p>
            </div>
            <ColorField
              label={t('theme.sidebar')}
              value={theme?.sidebar || '#0B1E3D'}
              onChange={(v) => setValue('theme.sidebar', v, { shouldDirty: true })}
            />
            <ColorField
              label={t('theme.primary')}
              value={theme?.primary || '#1A56DB'}
              onChange={(v) => setValue('theme.primary', v, { shouldDirty: true })}
            />
            <ColorField
              label={t('theme.accent')}
              value={theme?.accent || '#D97706'}
              onChange={(v) => setValue('theme.accent', v, { shouldDirty: true })}
            />
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-brand-navy">
              {t('theme.preview')}
            </h2>
            <ThemePreview
              sidebar={normalizeHex(theme?.sidebar, '#0B1E3D')}
              primary={normalizeHex(theme?.primary, '#1A56DB')}
              accent={normalizeHex(theme?.accent, '#D97706')}
            />
          </div>
        </div>
      )}

      {/* CONTACT */}
      {tab === 'contact' && (
        <div className="card space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-brand-navy">
            {t('contact.title')}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput label={t('contact.email')} type="email" {...register('contact.email')} />
            <FormInput label={t('contact.phone')} {...register('contact.phone')} />
            <FormInput label={t('contact.whatsapp')} {...register('contact.whatsapp')} />
            <FormInput label={t('contact.gstin')} {...register('contact.gstin')} />
          </div>
          <FormInput label={t('contact.addressLine')} {...register('contact.addressLine')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput label={t('contact.city')} {...register('contact.city')} />
            <FormInput label={t('contact.state')} {...register('contact.state')} />
          </div>
        </div>
      )}

      {/* SOCIAL */}
      {tab === 'social' && (
        <div className="card space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-brand-navy">
            {t('social.title')}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput label={t('social.facebook')} {...register('social.facebook')} />
            <FormInput label={t('social.instagram')} {...register('social.instagram')} />
            <FormInput label={t('social.linkedin')} {...register('social.linkedin')} />
            <FormInput label={t('social.twitter')} {...register('social.twitter')} />
          </div>
        </div>
      )}

      {/* CONTENT */}
      {tab === 'content' && (
        <div className="space-y-6">
          <div className="card space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-brand-navy">
              {t('content.title')}
            </h2>
            <FormInput label={t('content.heroTitle')} {...register('content.hero.title')} />
            <FormInput
              as="textarea"
              label={t('content.heroSubtitle')}
              {...register('content.hero.subtitle')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput label={t('content.ctaPrimary')} {...register('content.hero.ctaPrimary')} />
              <FormInput
                label={t('content.ctaSecondary')}
                {...register('content.hero.ctaSecondary')}
              />
            </div>
          </div>

          {/* stats */}
          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-brand-navy">
                {t('content.stats')}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => stats.append({ value: '', label: '' })}
              >
                {t('content.add')}
              </Button>
            </div>
            {stats.fields.map((field, i) => (
              <div key={field.id} className="flex items-end gap-3">
                <FormInput
                  label={t('content.statValue')}
                  {...register(`content.stats.${i}.value`)}
                />
                <FormInput
                  label={t('content.statLabel')}
                  {...register(`content.stats.${i}.label`)}
                />
                <button
                  type="button"
                  onClick={() => stats.remove(i)}
                  className="mb-1 rounded-lg p-2.5 text-brand-muted transition hover:bg-red-50 hover:text-brand-danger"
                  aria-label={t('content.remove')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* services */}
          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-brand-navy">
                {t('content.services')}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() =>
                  services.append({ key: `svc-${Date.now()}`, title: '', description: '' })
                }
              >
                {t('content.add')}
              </Button>
            </div>
            {services.fields.map((field, i) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <FormInput
                    label={t('content.serviceTitle')}
                    {...register(`content.services.${i}.title`)}
                  />
                  <FormInput
                    label={t('content.serviceDesc')}
                    {...register(`content.services.${i}.description`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => services.remove(i)}
                  className="mt-7 rounded-lg p-2.5 text-brand-muted transition hover:bg-red-50 hover:text-brand-danger"
                  aria-label={t('content.remove')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* about */}
          <div className="card space-y-5 p-6">
            <FormInput label={t('content.aboutHeading')} {...register('content.about.heading')} />
            <FormInput
              as="textarea"
              label={t('content.aboutBody')}
              {...register('content.about.body')}
            />
          </div>
        </div>
      )}
    </form>
  );
}
