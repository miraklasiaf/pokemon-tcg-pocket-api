'use client';

import { exportTradeLists } from '@/lib/exportTrade';
import { useState, type ReactElement } from 'react';
import { useTradeList } from '@/context/TradeListContext';

export default function TradeTray(): ReactElement | null {
  const { lists, reset } = useTradeList();
  const [exportText, setExportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const ftCount = Object.keys(lists.ft).length;
  const lfCount = Object.keys(lists.lf).length;

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleReset = (): void => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your trade lists? This action cannot be undone.'
    );

    if (confirmed) {
      reset();
      setExportText('');
      setCopied(false);
    }
  };

  return (
    <div className="trade-tray">
      <span>
        LF: <strong>{lfCount}</strong>
      </span>
      <span>
        FT: <strong>{ftCount}</strong>
      </span>

      <div className="trade-tray-export-actions">
        <button
          type="button"
          className="btn-export mr-2"
          onClick={() => setExportText(exportTradeLists(lists))}
        >
          Export
        </button>

        <button
          type="button"
          className="btn-reset"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      {exportText && (
        <div className="trade-tray-export">
          <textarea
            name="txtTrade"
            readOnly
            value={exportText}
            rows={8}
          />

          <div className="trade-tray-export-actions">
            <button
              type="button"
              className="btn-copy mr-2"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setExportText('');
                setCopied(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
