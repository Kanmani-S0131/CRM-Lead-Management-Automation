import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { X, Upload, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `lead_id,name,email,phone,company,industry,source,region,created_date,status,budget,company_size,timeline,website_visits,emails_opened
L0001,Aarav Sharma,aarav.sharma1@example.com,+91 9876543210,Zenith Textiles,Manufacturing,Referral,North,2026-10-01,New,1200000,250,0-1 Months,6,5
L0002,Diya Kumar,diya.kumar2@example.com,+91 8765432109,BlueOak Logistics,Logistics,Webinar,South,2026-10-03,New,600000,80,1-3 Months,4,3
L0003,Rahul Nair,rahul.nair3@example.com,+91 7654321098,Orbit Pharma,Healthcare,Website,East,2026-10-05,Contacted,400000,45,3-6 Months,2,1
L0004,Sneha Reddy,sneha.reddy4@example.com,bad-phone,Lotus Retail,Retail,Trade Show,West,2026-10-07,New,150000,15,6+ Months,1,0
L0005,Aarav Sharma,aarav.sharma1@example.com,+91 9876543210,Zenith Textiles,Manufacturing,Referral,North,2026-10-10,New,1200000,250,0-1 Months,6,5`;

export const UploadCsvModal: React.FC<UploadCsvModalProps> = ({ isOpen, onClose }) => {
  const { uploadCsvData, resetToBenchmarkData } = useCRM();
  const [csvText, setCsvText] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!csvText.trim()) return;
    uploadCsvData(csvText);
    setStatusMsg('CSV data imported and processed through DIT-P06 pipeline.');
    setTimeout(() => {
      setStatusMsg(null);
      onClose();
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
  };

  const handleResetBenchmark = () => {
    resetToBenchmarkData();
    setStatusMsg('Restored original 126-row synthetic benchmark dataset.');
    setTimeout(() => {
      setStatusMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Upload / Ingest Raw Leads CSV (<code className="font-mono text-xs">leads_raw.csv</code>)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The dataset will immediately run through validation, deduplication, scoring, and regional assignment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          {statusMsg && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Quick Presets:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                Insert Sample Rows
              </button>
              <button
                type="button"
                onClick={handleResetBenchmark}
                className="px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded font-semibold hover:bg-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to 126 Benchmark Leads</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              File Upload (.csv)
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              Or Paste Raw CSV Content:
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste comma-separated lead records with header row..."
              className="w-full p-2.5 font-mono text-xs bg-slate-950 text-slate-200 rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!csvText.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Process Through Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
