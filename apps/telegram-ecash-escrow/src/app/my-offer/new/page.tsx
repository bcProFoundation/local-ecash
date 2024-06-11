'use client';
import { Button, Card, TextField } from '@mui/material';

export default function NewOffer() {
  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
      <TextField id="outlined-basic" label="Title" variant="outlined" />
      <TextField id="outlined-basic" label="Description" variant="outlined" />
      <span>
        <TextField id="outlined-basic" label="Price" variant="outlined" />
        /
        <TextField id="outlined-basic" label="Amount" variant="outlined" />
        XEC
      </span>
      <span>
        <TextField id="outlined-basic" label="Order limit minimum" variant="outlined" />
        -
        <TextField id="outlined-basic" label="Order limit maximum" variant="outlined" />
      </span>
      <span style={{ display: 'flex', gap: 10 }}>
        <Card variant="outlined">Cash in person</Card>
        <Card variant="outlined">Bank transfer</Card>
        <Card variant="outlined">Crypto</Card>
      </span>

      <Button>Create new offer</Button>
    </div>
  );
}
