'use client';

import styled from '@emotion/styled';
import { FilterAltOutlined } from '@mui/icons-material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { IconButton, Typography } from '@mui/material';

const TopSectionWrap = styled.div`
  padding: 12px 8px;
  border: 1px solid #f1f1f147;
  border-radius: 16px;
  margin-bottom: 16px;

  .location-wrap {
    display: grid;
    grid-template-columns: 1fr max-content;
    gap: 16px;

    div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

export default function TopSection() {
  return (
    <TopSectionWrap>
      <div className="location-wrap">
        <div>
          <IconButton>
            <LocationOnOutlinedIcon />
          </IconButton>
          <Typography variant="body2">HCM, Vietnam</Typography>
        </div>
        <div>
          <IconButton>
            <FilterAltOutlined />
          </IconButton>
          <Typography variant="body2">Bank transfer</Typography>
        </div>
      </div>
    </TopSectionWrap>
  );
}
