'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Truck, MapPin, Camera, IndianRupee, CheckCircle2, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import FileUpload from '@/components/ui/FileUpload';
import Timeline from '@/components/ui/Timeline';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useTrips } from '@/hooks/useTrips';
import { EXPENSE_TYPES } from '@/lib/constants';
import { formatINR } from '@/lib/utils';

const STEP_ORDER = ['planned', 'loading', 'in_transit', 'delivered'];

export default function DriverPage() {
  const t = useTranslations('driver');
  const tt = useTranslations('trips');
  const te = useTranslations('expenses');
  const tc = useTranslations('common');
  const toast = useToast();

  const { data: tripsData } = useTrips();
  const activeTrip = useMemo(() => {
    const trips = tripsData?.data ?? [];
    return trips.find((tr) => tr.status === 'in_transit') || trips[0] || null;
  }, [tripsData]);
  const [override, setOverride] = useState(null);
  const trip = override ?? activeTrip ?? {};
  const setTrip = setOverride;
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [fxTrigger, setFxTrigger] = useState(0);
  const [exp, setExp] = useState({ expense_type: 'fuel', amount: '', description: '' });

  const idx = STEP_ORDER.indexOf(trip.status);
  const steps = STEP_ORDER.map((s, i) => ({
    label: tt(`status.${s}`),
    status: i < idx ? 'done' : i === idx ? 'active' : 'pending',
  }));

  const advance = () => {
    if (idx >= STEP_ORDER.length - 1) return;
    const next = STEP_ORDER[idx + 1];
    setTrip({ ...trip, status: next });
    if (next === 'delivered') {
      setFxTrigger((n) => n + 1);
      toast.success(tt('status.delivered'), trip.lr_number);
    } else {
      toast.info(t('updateStatus'), tt(`status.${next}`));
    }
  };

  const submitExpense = () => {
    setExpenseOpen(false);
    toast.success(te('title'), `${te(`types.${exp.expense_type}`)} ${formatINR(exp.amount || 0)}`);
    setExp({ expense_type: 'fuel', amount: '', description: '' });
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t('title')} icon={Truck} accent="text-brand-blue" />

      <TaskCompleteFX type="delivered" trigger={fxTrigger}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card overflow-hidden ${trip.status === 'delivered' ? 'ring-2 ring-brand-success/40' : ''}`}
        >
          <div className="bg-brand-navy p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-white/70">{trip.lr_number}</span>
              <StatusBadge status={trip.status} label={tt(`status.${trip.status}`)} pulse={trip.status === 'in_transit'} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-brand-amber" />
              {trip.origin_city} → {trip.destination_city}
            </div>
            <p className="mt-1 text-sm text-white/70">{trip.client?.company_name} · {trip.vehicle?.registration_no}</p>
          </div>

          <div className="p-5">
            <Timeline steps={steps} />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-brand-border p-4">
            {trip.status === 'planned' && (
              <Button variant="primary" icon={PlayCircle} className="col-span-2" onClick={advance}>{t('startTrip')}</Button>
            )}
            {(trip.status === 'loading' || trip.status === 'in_transit') && (
              <Button variant="success" icon={CheckCircle2} className="col-span-2" onClick={advance}>
                {trip.status === 'in_transit' ? t('markDelivered') : t('updateStatus')}
              </Button>
            )}
            <Button variant="outline" icon={IndianRupee} onClick={() => setExpenseOpen(true)}>{t('logExpense')}</Button>
            <Button variant="outline" icon={Camera} onClick={() => setPodOpen(true)}>{t('uploadPod')}</Button>
          </div>
        </motion.div>
      </TaskCompleteFX>

      <Drawer open={expenseOpen} onClose={() => setExpenseOpen(false)} title={t('logExpense')}
        footer={<><Button variant="ghost" onClick={() => setExpenseOpen(false)}>{tc('cancel')}</Button><Button variant="amber" onClick={submitExpense}>{tc('submit')}</Button></>}>
        <div className="space-y-4">
          <FormInput as="select" label={t('expenseType')} value={exp.expense_type} onChange={(e) => setExp({ ...exp, expense_type: e.target.value })}>
            {EXPENSE_TYPES.map((ty) => <option key={ty} value={ty}>{te(`types.${ty}`)}</option>)}
          </FormInput>
          <FormInput label={tc('amount')} type="number" icon={IndianRupee} value={exp.amount} onChange={(e) => setExp({ ...exp, amount: e.target.value })} />
          <FormInput as="textarea" label={te('title')} value={exp.description} onChange={(e) => setExp({ ...exp, description: e.target.value })} />
          <FileUpload accept="image/*" maxSize={10 * 1024 * 1024} label={t('addReceipt')} onUpload={() => {}} />
        </div>
      </Drawer>

      <Modal open={podOpen} onClose={() => setPodOpen(false)} title={t('uploadPod')}
        footer={<Button variant="success" onClick={() => { setPodOpen(false); toast.success(t('podUploaded'), trip.lr_number); }}>{tc('submit')}</Button>}>
        <FileUpload accept="image/*" maxSize={10 * 1024 * 1024} label={t('uploadPod')} onUpload={() => {}} />
      </Modal>
    </div>
  );
}
