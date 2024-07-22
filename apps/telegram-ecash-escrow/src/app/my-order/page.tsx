'use client';
import { TabType } from '@/src/store/constants';
import { AddCircleOutline } from '@mui/icons-material';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import Fab from '../../components/Fab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function MyOffer() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <div>
      <Tabs value={value} onChange={handleChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth">
        <Tab
          label={TabType.ACTIVE}
          id={`full-width-tab-${TabType.ACTIVE}`}
          aria-controls={`full-width-tabpanel-${TabType.ACTIVE}`}
        />
        <Tab
          label={TabType.ARCHIVED}
          id={`full-width-tab-${TabType.ARCHIVED}`}
          aria-controls={`full-width-tabpanel-${TabType.ARCHIVED}`}
        />
      </Tabs>
      <SwipeableViews index={value} onChangeIndex={handleChangeIndex} disableLazyLoading={true}>
        <TabPanel value={value} index={0}>
          Item One
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
      </SwipeableViews>

      <Fab route="/my-order/new" icon={<AddCircleOutline />} />
    </div>
  );
}
