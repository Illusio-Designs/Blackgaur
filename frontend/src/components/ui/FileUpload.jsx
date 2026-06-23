'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Camera, FileText, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export default function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  onUpload,
  label = 'Upload file',
}) {
  const tc = useTranslations('common');
  const toast = useToast();
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFiles = (fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (f.size > maxSize) {
      toast.error('File too large', `Maximum size is ${formatBytes(maxSize)}`);
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    onUpload?.(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={accept}
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={file.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-brand-muted">
              <FileText className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">{file.name}</p>
            <p className="text-xs text-brand-muted">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg p-1.5 text-brand-muted transition hover:bg-brand-surface hover:text-brand-danger"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition',
            dragOver
              ? 'border-brand-blue bg-brand-blue/5'
              : 'border-brand-border bg-brand-surface/40 hover:border-brand-blue/50',
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-blue shadow-sm">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-brand-navy">{label}</p>
          <p className="text-xs text-brand-muted">
            {tc('dragDropHint')} {formatBytes(maxSize)}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraRef.current?.click();
            }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-navy transition hover:bg-brand-surface"
          >
            <Camera className="h-3.5 w-3.5" />
            {tc('capturePhoto')}
          </button>
        </div>
      )}
    </div>
  );
}
