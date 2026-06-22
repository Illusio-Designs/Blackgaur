import { redirect } from '@/i18n/routing';

export default function AccountsIndex({ params: { locale } }) {
  redirect({ href: '/dashboard/accounts/clients', locale });
}
