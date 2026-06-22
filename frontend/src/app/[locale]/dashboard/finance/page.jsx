import { redirect } from '@/i18n/routing';

export default function FinanceIndex({ params: { locale } }) {
  redirect({ href: '/dashboard/finance/expenses', locale });
}
