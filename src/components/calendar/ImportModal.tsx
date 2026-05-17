'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ImportResult } from '@/lib/types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportModal({ isOpen, onClose, onImported }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'csv' | 'ics'>('csv');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith('.csv') || dropped.name.endsWith('.ics'))) {
      setFile(dropped);
      setFormat(dropped.name.endsWith('.ics') ? 'ics' : 'csv');
      setResult(null);
    } else {
      toast.error('Please drop a .csv or .ics file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFormat(selected.name.endsWith('.ics') ? 'ics' : 'csv');
      setResult(null);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);

      const res = await fetch('/api/academic-calendar/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Import failed');
        return;
      }

      setResult(data as ImportResult);

      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} events`);
        onImported();
      }

      if (data.errors?.length > 0) {
        toast.error(`${data.errors.length} rows failed to import`);
      }
    } catch {
      toast.error('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }, [file, format, onImported]);

  const handleExport = useCallback(async () => {
    try {
      const res = await fetch('/api/academic-calendar?limit=1000');
      const data = await res.json();
      const events = data.data || [];

      let content = 'Title,Date,Type,Course,Location,Description\n';
      for (const event of events) {
        const date = new Date(event.startDate).toISOString().split('T')[0];
        content += `"${event.title}","${date}","${event.eventType}","${event.course || ''}","${event.location || ''}","${event.description || ''}"\n`;
      }

      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `academic-calendar-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${events.length} events`);
    } catch {
      toast.error('Export failed');
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg surface-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Import Calendar</h2>
                  <p className="text-xs text-white/40">CSV or iCal (.ics) format</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-white/[0.1] rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/60 mb-1">
                {file ? file.name : 'Drop a file here or click to browse'}
              </p>
              <p className="text-xs text-white/30">Supports .csv and .ics files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.ics"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
                <FileText className="w-5 h-5 text-primary/60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{file.name}</p>
                  <p className="text-xs text-white/30">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 rounded bg-white/[0.06] uppercase">
                  {format}
                </span>
              </div>
            )}

            {result && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.04]">
                <div className="flex items-center gap-2 mb-2">
                  {result.errors.length > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-[#ffa94d]" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-[#00b894]" />
                  )}
                  <span className="text-sm text-white/70">
                    {result.imported} of {result.total} events imported
                  </span>
                </div>
                {result.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto custom-scroll space-y-1">
                    {result.errors.map((d, i) => (
                      <p key={i} className="text-xs text-destructive/70">
                        Row {d.row}: {d.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="mt-4 text-xs text-white/30 leading-relaxed">
              CSV must have at least <strong>title</strong> and <strong>date</strong> columns.
              Optional columns: end date, time, type, course, location, description.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex-1 h-11 rounded-xl bg-primary text-black font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {importing ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {importing ? 'Importing...' : 'Import'}
              </button>

              <button
                onClick={handleExport}
                className="h-11 px-4 rounded-xl border border-white/[0.1] text-white/60 text-sm hover:bg-white/[0.06] transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>

              <button
                onClick={onClose}
                className="h-11 px-4 rounded-xl border border-white/[0.1] text-white/40 text-sm hover:bg-white/[0.06] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
