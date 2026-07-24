'use client';

import { exportTradeLists } from '@/lib/exportTrade';
import { useState } from 'react';
import { useTradeList } from '@/context/TradeListContext';

export default function TradeTray() {
  const { lists } = useTradeList();
  const [copied, setCopied] = useState(false);

  const ftCount = Object.keys(lists.ft).length;
  const lfCount = Object.keys(lists.lf).length;

  if (ftCount === 0 && lfCount === 0) return null;

  const handleExport = async () => {
    const text = exportTradeLists(lists);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard permission denied or unavailable — fail silently or log
    }
  };

  return (
    <div className="trade-tray">
      <span>LF: <strong>{lfCount}</strong></span>
      <span>FT: <strong>{ftCount}</strong></span>
      <button type="button" onClick={handleExport}>
        {copied ? 'Copied' : 'Export Trade List'}
      </button>
    </div>
  );
}