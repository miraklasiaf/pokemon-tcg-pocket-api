'use client';

import { useState, type ReactElement } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { useTradeList } from '@/context/TradeListContext';
import { exportTradeLists } from '@/lib/exportTrade';

export default function TradeTray(): ReactElement | null {
  const { lists, reset } = useTradeList();
  const [exportText, setExportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const ftCount = Object.keys(lists.ft).length;
  const lfCount = Object.keys(lists.lf).length;

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleCloseExport = (): void => {
    setExportText('');
    setCopied(false);
  };

  const handleConfirmReset = (): void => {
    reset();
    handleCloseExport();
    setConfirmOpen(false);
  };

  return (
    <>
      {/* Tray bar */}
      <Paper
        elevation={8}
        square
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          px: 2,
          py: 1,
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Chip
            color="info"
            variant="outlined"
            label={
              <>
                LF: <strong>{lfCount}</strong>
              </>
            }
          />
          <Chip
            color="success"
            variant="outlined"
            label={
              <>
                FT: <strong>{ftCount}</strong>
              </>
            }
          />

          <Box sx={{ flexGrow: { xs: 0, sm: 1 } }} />

          <Button
            variant="contained"
            size="small"
            onClick={() => setExportText(exportTradeLists(lists))}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setConfirmOpen(true)}
          >
            Reset
          </Button>
        </Stack>
      </Paper>

      {/* Export dialog */}
      <Dialog
        open={Boolean(exportText)}
        onClose={handleCloseExport}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export trade lists</DialogTitle>
        <DialogContent>
          <TextField
            name="txtTrade"
            multiline
            minRows={8}
            fullWidth
            value={exportText}
            slotProps={{ input: { readOnly: true } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCopy}
            variant="contained"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={handleCloseExport}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reset confirmation */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Reset trade lists?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset your trade lists? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReset}
            color="error"
            variant="contained"
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
