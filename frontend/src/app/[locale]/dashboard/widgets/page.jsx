'use client';

import { useState, useMemo } from 'react';
import {
  LayoutGrid, Truck, Receipt, FileText, Fuel, Radio, Plus, Search,
  CheckCircle2, AlertTriangle, Wallet, Banknote, Inbox, Info, Download,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';

import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import MultiSelect from '@/components/ui/MultiSelect';
import DatePicker from '@/components/ui/DatePicker';
import DateRangePicker from '@/components/ui/DateRangePicker';
import PhoneInput from '@/components/ui/PhoneInput';
import Switch from '@/components/ui/Switch';
import Checkbox from '@/components/ui/Checkbox';
import Tabs from '@/components/ui/Tabs';
import Tooltip from '@/components/ui/Tooltip';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import Skeleton, { SkeletonText, SkeletonCircle } from '@/components/ui/Skeleton';
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
import { useBranding } from '@/hooks/useBranding';
import { downloadInvoicePdf } from '@/lib/invoicePdf';
import { downloadLrPdf } from '@/lib/lrPdf';

import {
  mockTrips, mockExpenses, mockInvoices, mockTollTransactions,
  mockFuelTransactions, mockFastagWallets, mockFuelCards, mockClients,
} from '@/lib/mock';
import { formatINR, formatDate, cn } from '@/lib/utils';

// A labelled cell that frames each widget on the gallery.
// `bare` removes the card chrome so card-based children aren't double-wrapped.
function Showcase({ title, hint, children, span = 1, bare = false, actions }) {
  return (
    <section
      className={cn(
        !bare && 'rounded-2xl border border-brand-border bg-white p-5 shadow-card',
        span === 2 && 'xl:col-span-2',
        span === 3 && 'xl:col-span-3',
      )}
    >
      <div className={cn('mb-4 flex items-baseline justify-between gap-3', !bare && 'border-b border-brand-border pb-3')}>
        <h3 className="font-display text-sm font-semibold text-brand-navy">{title}</h3>
        <div className="flex items-center gap-2">
          {actions}
          {hint && <span className="font-mono text-[11px] text-brand-muted">{hint}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function WidgetsPage() {
  const toast = useToast();
  const { branding } = useBranding();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fxTrigger, setFxTrigger] = useState(0);
  const [otp, setOtp] = useState('');
  const [page, setPage] = useState(3);
  const [selectVal, setSelectVal] = useState('');
  const [multiVal, setMultiVal] = useState(['in_transit']);
  const [dateVal, setDateVal] = useState('');
  const [rangeVal, setRangeVal] = useState({ from: '', to: '' });
  const [phoneVal, setPhoneVal] = useState('');
  const [switchOn, setSwitchOn] = useState(true);
  const [checkOn, setCheckOn] = useState(false);
  const [tab, setTab] = useState('overview');

  const statusOptions = [
    { value: 'planned', label: 'Planned' },
    { value: 'loading', label: 'Loading' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];
  const cityOptions = ['Mumbai', 'Delhi', 'Ahmedabad', 'Surat', 'Pune'].map((c) => ({ value: c, label: c }));
  const demoTabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'details', label: 'Details' },
    { value: 'history', label: 'History' },
  ];

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
          <div className="space-y-2.5">
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
          <div className="space-y-2.5">
            <TollTransactionRow txn={mockTollTransactions[0]} trip={mockTrips[3]} />
            <FuelTransactionRow txn={mockFuelTransactions[0]} trip={mockTrips[4]} />
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

        {/* Pagination */}
        <Showcase title="Pagination" hint="<Pagination /> — ellipsis + numbered" span={2}>
          <Pagination
            page={page}
            totalPages={12}
            hasPrev={page > 1}
            hasNext={page < 12}
            onPageChange={setPage}
          />
        </Showcase>

        {/* Select */}
        <Showcase title="Select" hint="<Select /> — custom dropdown">
          <Select
            label="Trip status"
            value={selectVal}
            onChange={setSelectVal}
            options={statusOptions}
            placeholder="Choose a status"
            searchable
          />
        </Showcase>

        {/* MultiSelect */}
        <Showcase title="MultiSelect" hint="<MultiSelect /> — chips + checkboxes">
          <MultiSelect
            label="Filter by status"
            value={multiVal}
            onChange={setMultiVal}
            options={statusOptions}
            placeholder="Any status"
            searchable
          />
        </Showcase>

        {/* DatePicker */}
        <Showcase title="Date picker" hint="<DatePicker /> — month grid">
          <DatePicker label="Pickup date" value={dateVal} onChange={setDateVal} />
        </Showcase>

        {/* DateRangePicker */}
        <Showcase title="Date range" hint="<DateRangePicker />" span={2}>
          <DateRangePicker label="Reporting period" from={rangeVal.from} to={rangeVal.to} onChange={setRangeVal} />
        </Showcase>

        {/* PhoneInput */}
        <Showcase title="Phone input" hint="<PhoneInput /> — flag + dial code">
          <PhoneInput label="Mobile" value={phoneVal} onChange={setPhoneVal} />
          <p className="mt-3 font-mono text-xs text-brand-muted">digits: {phoneVal || '——'}</p>
        </Showcase>

        {/* Switch + Checkbox */}
        <Showcase title="Switch & Checkbox" hint="<Switch /> · <Checkbox />">
          <div className="space-y-4">
            <Switch checked={switchOn} onChange={setSwitchOn} label="Email alerts" description="Send notifications by email" />
            <div className="flex flex-wrap items-center gap-4">
              <Switch checked={switchOn} onChange={setSwitchOn} />
              <Checkbox checked={checkOn} onChange={setCheckOn} label="RCM applicable" />
              <Checkbox checked disabled label="Disabled" />
            </div>
          </div>
        </Showcase>

        {/* Tabs */}
        <Showcase title="Tabs" hint="<Tabs /> — tab list + panel">
          <Tabs tabs={demoTabs} value={tab} onChange={setTab}>
            <p className="text-sm text-brand-muted">Active panel: <span className="font-medium text-brand-navy">{tab}</span></p>
          </Tabs>
        </Showcase>

        {/* Tooltip */}
        <Showcase title="Tooltip" hint="<Tooltip /> — hover / focus">
          <div className="flex flex-wrap items-center gap-4">
            <Tooltip content="Top tooltip"><Button variant="outline">Hover me</Button></Tooltip>
            <Tooltip content="Saved to ledger" side="right">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-surface text-brand-blue"><Info className="h-4 w-4" /></span>
            </Tooltip>
          </div>
        </Showcase>

        {/* Spinner */}
        <Showcase title="Spinner" hint="<Spinner />">
          <div className="flex items-center gap-5">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Showcase>

        {/* EmptyState */}
        <Showcase title="Empty state" hint="<EmptyState />" span={2}>
          <EmptyState
            icon={Inbox}
            title="No invoices yet"
            subtitle="Create your first invoice to see it listed here."
            action={<Button variant="amber" icon={Plus}>Create invoice</Button>}
          />
        </Showcase>

        {/* Skeleton */}
        <Showcase title="Skeleton" hint="<Skeleton /> · SkeletonText · SkeletonCircle">
          <div className="flex items-start gap-4">
            <SkeletonCircle size={44} />
            <div className="flex-1">
              <Skeleton className="mb-3 h-5 w-32" />
              <SkeletonText lines={3} />
            </div>
          </div>
        </Showcase>

        {/* LR (Lorry Receipt) preview */}
        <Showcase
          title="LR preview"
          hint="Lorry Receipt"
          actions={<Button size="sm" variant="outline" icon={Download} onClick={() => downloadLrPdf(mockTrips[3], branding)}>PDF</Button>}
        >
          {(() => {
            const trip = mockTrips[3];
            return (
              <div className="rounded-xl border border-brand-border p-4 text-xs">
                <div className="flex items-start justify-between border-b border-brand-border pb-2">
                  <div>
                    <p className="font-display text-sm font-bold text-brand-navy">Lorry Receipt</p>
                    <p className="text-brand-muted">TransCo Logistics Pvt Ltd</p>
                  </div>
                  <p className="font-mono font-semibold text-brand-blue">{trip.lr_number}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div><p className="text-brand-muted">From</p><p className="font-medium text-brand-navy">{trip.origin_city}</p></div>
                  <div><p className="text-brand-muted">To</p><p className="font-medium text-brand-navy">{trip.destination_city}</p></div>
                  <div><p className="text-brand-muted">Vehicle</p><p className="font-mono text-brand-text">{trip.vehicle?.registration_no}</p></div>
                  <div><p className="text-brand-muted">Driver</p><p className="text-brand-text">{trip.driver?.name}</p></div>
                  <div><p className="text-brand-muted">Cargo</p><p className="text-brand-text">{trip.cargo_type}</p></div>
                  <div><p className="text-brand-muted">Weight</p><p className="font-mono text-brand-text">{trip.cargo_weight_kg} kg</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-brand-border pt-3">
                  <span className="font-semibold text-brand-navy">Freight</span>
                  <span className="font-mono text-base font-bold text-brand-navy">{formatINR(trip.freight_charges)}</span>
                </div>
              </div>
            );
          })()}
        </Showcase>

        {/* Invoice (GST/RCM) preview */}
        <Showcase
          title="Invoice preview"
          hint="GST / RCM invoice"
          span={2}
          actions={<Button size="sm" variant="outline" icon={Download} onClick={() => downloadInvoicePdf(mockInvoices[0], branding)}>PDF</Button>}
        >
          {(() => {
            const inv = mockInvoices[0];
            return (
              <div className="rounded-xl border border-brand-border p-4 text-xs">
                <div className="flex items-start justify-between border-b border-brand-border pb-3">
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-amber font-display text-base font-bold text-white">T</div>
                    <p className="mt-1.5 font-display text-sm font-bold text-brand-navy">TransCo Logistics Pvt Ltd</p>
                    <p className="text-brand-muted">GSTIN 24ABCDE1234F1Z5 · Ahmedabad, Gujarat</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-brand-navy">{inv.invoice_number}</p>
                    <p className="text-brand-muted">{formatDate(inv.due_date)}</p>
                    <div className="mt-1 flex justify-end"><RCMBadge isRcm={inv.is_rcm} /></div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-brand-muted">Bill to</p>
                  <p className="font-medium text-brand-navy">{inv.client?.company_name}</p>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between"><span className="text-brand-muted">Freight</span><span className="font-mono text-brand-text">{formatINR(inv.freight_amount)}</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Subtotal</span><span className="font-mono text-brand-text">{formatINR(inv.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">IGST / CGST / SGST</span><span className="font-mono text-brand-text">{inv.is_rcm ? 'RCM — NIL' : formatINR(inv.igst_amount + inv.cgst_amount + inv.sgst_amount)}</span></div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-brand-border pt-3">
                  <span className="font-semibold text-brand-navy">Total payable</span>
                  <span className="font-mono text-base font-bold text-brand-navy">{formatINR(inv.total_amount, { decimals: 2 })}</span>
                </div>
                {inv.is_rcm && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] font-medium text-brand-amber">
                    Tax payable under Reverse Charge (RCM)
                  </p>
                )}
              </div>
            );
          })()}
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
