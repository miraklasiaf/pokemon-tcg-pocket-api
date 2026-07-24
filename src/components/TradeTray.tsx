'use client';

import { exportTradeLists } from '@/lib/exportTrade';
import { useState, type ReactElement } from 'react';
import { useTradeList } from '@/context/TradeListContext';

export default function TradeTray(): ReactElement | null {
  const { lists, reset } = useTradeList();
  const [exportText, setExportText] = useState<string>('');

  const ftCount = Object.keys(lists.ft).length;
  const lfCount = Object.keys(lists.lf).length;

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
          onClick={reset}
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
              onClick={() => navigator.clipboard.writeText(exportText)}
            >
              Copy
            </button>
            <button
              type="button"
              className="btn-close"
              onClick={() => setExportText('')}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
