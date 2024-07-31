'use client';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import styled from '@emotion/styled';
import { LocationOn } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Radio,
  TextField,
  Typography
} from '@mui/material';

const NewOfferWrap = styled.div`
  min-height: 100vh;
  background-image: url('/bg-dialog.svg');
  background-repeat: no-repeat;
  background-size: cover;

  .offer-content {
    padding: 16px;
    .form-input {
      width: 100%;
    }
  }

  .create-offer-btn {
    width: 100%;
    text-transform: none;
    color: white;
    font-weight: 600;
    font-size: 16px;
    margin-top: 16px;
  }
`;

export default function NewOffer() {
  return (
    <NewOfferWrap>
      <TickerHeader title="Create new offer" />

      <div className="offer-content">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              className="form-input"
              id="amount"
              label="Amount"
              defaultValue="20,000,000"
              // helperText="helper text here."
              variant="standard"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              className="form-input"
              id="message"
              label="Message"
              defaultValue="I want to buy 20M XEC in cash"
              // helperText="helper text here."
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              className="form-input"
              id="min"
              label="Order limit (USD)"
              defaultValue="100"
              // helperText="helper text here."
              variant="standard"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className="form-input"
              id="max"
              label=" "
              defaultValue="1000"
              // helperText="helper text here."
              variant="standard"
            />
          </Grid>

          <Grid item xs={10}>
            <TextField
              className="form-input"
              id="max"
              label="Location"
              defaultValue="Hoi an, Vietnam"
              // helperText="helper text here."
              variant="standard"
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton>
              <LocationOn />
            </IconButton>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', margin: '16px 0' }}>
          <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <FormControlLabel control={<Checkbox name="cash" />} label="Cash in person" />
            <FormControlLabel control={<Checkbox name="bank" />} label="Bank transfer" />
          </FormGroup>
          {/* <FormHelperText>Be careful</FormHelperText> */}
        </Box>

        <Box>
          <Typography className="title" variant="body2">
            Payment currency (TBU) - available for Cash and bank transfer - single choice
          </Typography>
          <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            <FormControlLabel control={<Radio name="payment" />} label="Payment app" />
            <FormControlLabel control={<Radio name="crypto" />} label="Crypto" />
            <FormControlLabel control={<Radio name="good" />} label="Good/Services" />
          </FormGroup>
          {/* <FormHelperText>Be careful</FormHelperText> */}
        </Box>

        <Button className="create-offer-btn" variant="contained" color="info">
          Create offer
        </Button>
      </div>
    </NewOfferWrap>
  );
}
