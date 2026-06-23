'use client';

import { useState, useMemo } from 'react';
import {
  LayoutGrid, Truck, Receipt, FileText, Fuel, Radio, Plus, Search,
  CheckCircle2, AlertTriangle, Wallet, Banknote,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';

import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RCMBadge from '@/components/ui/RCMBadge';
import KPICard from '@/components/ui/KPICard';
import StatsCounter from '@/components/ui/StatsCounter';
import DataTable from '@/components/ui/DataTable';
import Timeline from '@/components/ui/Timeline';
import OTPInput from '@/components/ui/OTPInput';
import FormInput from '@/components/ui/FormInput';
import FileUpload from '@/components/ui/FileUpload';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import AuditDiff from '@/components/ui/AuditDiff';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import TripCard from '@/components/ui/TripCard';
import ExpenseRow from '@/components/ui/ExpenseRow';
import TollTransactionRow from '@/components/ui/TollTransactionRow';
import FuelTransactionRow from '@/components/ui/FuelTransactionRow';
import InvoiceForm from '@/components/ui/InvoiceForm';
import FasTagWalletCard from '@/components/fastag/FasTagWalletCard';
import FuelCardItem from '@/components/fuel/FuelCardItem';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';

import {
  mockTrips, mockExpenses, mockInvoices, mockTollTransactions,
  mockFuelTransactions, mockFastagWallets, mockFuelCards, mockClients,
} from '@/lib/mock';
import { formatINR } from '@/lib/utils';

// A labelled cell that frames each widget on the gallery.
function Showcase({ title, hint, children, span = 1 }) {
  return (
    <section
      className={`rounded-2xl border border-brand-border bg-white p-5 shadow-card ${
        span === 2 ? 'xl:col-span-2' : ''
      } ${span === 3 ? 'xl:col-span-3' : ''}`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-brand-border pb-3">
        <h3 className="font-display text-sm font-semibold text-brand-navy">{title}</h3>
        {hint && <span className="font-mono text-[11px] text-brand-muted">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export default function WidgetsPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fxTrigger, setFxTrigger] = useState(0);
  const [otp, setOtp] = useState('');

  const tableColumns = useMemo(
    () => [
      { accessorKey: 'lr_number', header: 'LR No.', cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-brand-navy">{row.original.lr_number}</span>
      ) },
      { id: 'route', header: 'Route', accessorFn: (r) => r.origin_city,
        cell: ({ row }) => `${row.original.origin_city} → ${row.original.destination_city}` },
      { accessorKey: 'freight_charges', header: 'Freight',
        cell: ({ row }) => <span className="font-mono">{formatINR(row.original.freight_charges)}</span> },
      { accessorKey: 'status', header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} label={row.original.status} /> },
    ],
    [],
  );

  const timelineSteps = [
    { label: 'Planned', status: 'done' },
    { label: 'Loading', status: 'done' },
    { label: 'In Transit', status: 'active' },
    { label: 'Delivered', status: 'pending' },
  ];

  return (
    <div>
      <PageHeader
        title="Widgets"
        subtitle="Live gallery of every shared component in the design system."
        icon={LayoutGrid}
        actions={<LanguageSwitcher compact />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {/* Buttons */}
        <Showcase title="Buttons" hint="<Button />">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="amber" icon={Plus}>Create</Button>
            <Button variant="navy">Navy</Button>
            <Button variant="success" icon={CheckCircle2}>Approve</Button>
            <Button variant="danger">Reject</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading</Button>
          </div>
        </Showcase>

        {/* Status + RCM badges */}
        <Showcase title="Status & RCM badges" hint="<StatusBadge /> <RCMBadge />">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="planned" label="Planned" />
            <StatusBadge status="loading" label="Loading" />
            <StatusBadge status="in_transit" label="In Transit" pulse />
            <StatusBadge status="delivered" label="Delivered" />
            <StatusBadge status="cancelled" label="Cancelled" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status="pending" label="Pending" />
            <StatusBadge status="approved" label="Approved" />
            <StatusBadge status="paid" label="Paid" />
            <StatusBadge status="overdue" label="Overdue" />
            <RCMBadge isRcm />
          </div>
        </Showcase>

        {/* Stats counter */}
        <Showcase title="Stats counter" hint="<StatsCounter />">
          <div className="flex items-baseline gap-6">
            <div>
              <p className="font-display text-3xl font-bold text-brand-navy">
                <StatsCounter to={48200} suffix="+" />
              </p>
              <p className="text-xs text-brand-muted">Trips managed</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-brand-success">
                <StatsCounter to={99} suffix="%" />
              </p>
              <p className="text-xs text-brand-muted">On-time</p>
            </div>
          </div>
        </Showcase>

        {/* KPI cards */}
        <Showcase title="KPI cards" hint="<KPICard />" span={2}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KPICard label="Active trips" value={128} delta="+12%" trend="up" icon={Truck} />
            <KPICard label="Pending expenses" value={42} delta="-8%" trend="down" icon={Receipt} accent="text-brand-amber" />
            <KPICard label="Revenue (₹)" value={8640000} icon={Banknote} accent="text-brand-success" format={(v) => formatINR(v)} />
          </div>
        </Showcase>

        {/* Data table */}
        <Showcase title="Data table" hint="<DataTable /> — TanStack v8" span={3}>
          <DataTable
            columns={tableColumns}
            data={mockTrips}
            pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }}
          />
        </Showcase>

        {/* Trip card */}
        <Showcase title="Trip card (Kanban)" hint="<TripCard />">
          <TripCard trip={mockTrips[3]} draggable />
        </Showcase>

        {/* Timeline */}
        <Showcase title="Timeline" hint="<Timeline />">
          <Timeline steps={timelineSteps} />
        </Showcase>

        {/* OTP input */}
        <Showcase title="OTP input" hint="<OTPInput />">
          <OTPInput length={6} onChange={setOtp} onComplete={(v) => toast.success('OTP entered', v)} />
          <p className="mt-3 font-mono text-xs text-brand-muted">value: {otp || '——————'}</p>
        </Showcase>

        {/* Form inputs */}
        <Showcase title="Form inputs" hint="<FormInput />">
          <div className="space-y-3">
            <FormInput label="Company name" placeholder="Acme Exports Pvt Ltd" />
            <FormInput label="GSTIN" placeholder="24ABCDE1234F1Z5" error="Invalid GSTIN format" />
            <FormInput as="select" label="Vehicle type">
              <option>Truck</option>
              <option>Trailer</option>
              <option>Tempo</option>
            </FormInput>
          </div>
        </Showcase>

        {/* File upload */}
        <Showcase title="File upload" hint="<FileUpload /> — drag-drop + camera">
          <FileUpload label="Upload POD / receipt" onUpload={() => toast.info('File selected')} />
        </Showcase>

        {/* Expense row */}
        <Showcase title="Expense row" hint="<ExpenseRow />" span={2}>
          <div className="divide-y divide-brand-border rounded-xl border border-brand-border">
            <ExpenseRow
              expense={mockExpenses[1]}
              onApprove={() => toast.success('Expense approved')}
              onReject={() => toast.error('Expense rejected')}
            />
            <ExpenseRow expense={mockExpenses[2]} />
          </div>
        </Showcase>

        {/* FASTag wallet */}
        <Showcase title="FASTag wallet card" hint="<FasTagWalletCard />">
          <FasTagWalletCard
            wallet={mockFastagWallets[2]}
            onSync={() => toast.info('Syncing balance…')}
            onRecharge={() => toast.success('Recharge logged')}
          />
        </Showcase>

        {/* Fuel card */}
        <Showcase title="Fuel card" hint="<FuelCardItem />">
          <FuelCardItem
            card={mockFuelCards[0]}
            onAssign={() => toast.info('Assign card')}
            onBlock={() => toast.warning('Card blocked')}
          />
        </Showcase>

        {/* Toll + Fuel transaction rows */}
        <Showcase title="Transaction rows" hint="<TollTransactionRow /> <FuelTransactionRow />">
          <div className="space-y-2">
            <div className="rounded-xl border border-brand-border">
              <TollTransactionRow txn={mockTollTransactions[0]} trip={mockTrips[3]} />
            </div>
            <div className="rounded-xl border border-brand-border">
              <FuelTransactionRow txn={mockFuelTransactions[0]} trip={mockTrips[4]} />
            </div>
          </div>
        </Showcase>

        {/* Audit diff */}
        <Showcase title="Audit diff" hint="<AuditDiff />">
          <AuditDiff
            before={{ status: 'pending', amount: 1200, approved_by: null }}
            after={{ status: 'approved', amount: 1200, approved_by: 'Priya Shah' }}
          />
        </Showcase>

        {/* Overlays: Modal vs Drawer */}
        <Showcase title="Overlays" hint="<Modal /> · <Drawer /> (aside)">
          <p className="mb-3 text-sm text-brand-muted">
            Add/edit flows now use the slide-in aside panel; modals are kept for read-only views.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="amber" icon={Plus} onClick={() => setDrawerOpen(true)}>Open aside panel</Button>
          </div>
        </Showcase>

        {/* Task completion FX */}
        <Showcase title="Task completion FX" hint="<TaskCompleteFX /> — confetti">
          <TaskCompleteFX type="approve" trigger={fxTrigger}>
            <Button variant="success" icon={CheckCircle2} onClick={() => setFxTrigger((n) => n + 1)}>
              Approve (celebrate)
            </Button>
          </TaskCompleteFX>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => toast.success('Saved', 'Changes saved successfully')}>Toast: success</Button>
            <Button variant="ghost" onClick={() => toast.error('Failed', 'Something went wrong')}>Toast: error</Button>
          </div>
        </Showcase>

        {/* Command palette hint */}
        <Showcase title="Command palette" hint="<CommandPalette /> — ⌘K / Ctrl+K">
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-muted">
            <Search className="h-4 w-4" />
            Press <kbd className="rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>
            to search trips, clients, vehicles & invoices.
          </div>
        </Showcase>

        {/* Invoice form (multi-step) */}
        <Showcase title="Invoice form" hint="<InvoiceForm /> — multi-step + RCM/GST" span={3}>
          <InvoiceForm mode="create" onSubmit={() => toast.success('Invoice drafted')} />
        </Showcase>
      </div>

      {/* Modal demo (read-only view) */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Read-only modal" size="md">
        <p className="text-sm text-brand-text">
          Centered modals are used for read-only views like the invoice PDF preview and shipment
          tracking — where a focused, glanceable overlay fits best.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-surface p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-brand-amber" />
          Add / edit forms open in the aside panel instead.
        </div>
      </Modal>

      {/* Drawer demo (add/edit) */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add client"
        description="Aside panel — used for all add & edit forms"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              variant="amber"
              onClick={() => { setDrawerOpen(false); toast.success('Client added'); }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormInput label="Company name" placeholder="Acme Exports Pvt Ltd" />
          <FormInput label="GSTIN" placeholder="24ABCDE1234F1Z5" />
          <FormInput label="Contact name" placeholder="Ravi Patel" />
          <FormInput label="Mobile" placeholder="98240 00000" />
          <FormInput as="select" label="Account manager">
            {mockClients.map((c) => <option key={c.id}>{c.contact_name || c.company_name}</option>)}
          </FormInput>
          <div className="flex items-center gap-2 rounded-xl bg-brand-surface p-3 text-xs text-brand-muted">
            <Wallet className="h-4 w-4 text-brand-blue" />
            The aside panel slides in from the right, keeping the list visible behind it.
          </div>
        </div>
      </Drawer>
    </div>
  );
}
