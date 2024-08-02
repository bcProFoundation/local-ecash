'use client';

import styled from '@emotion/styled';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import { Badge, Typography } from '@mui/material';

import Footer from '@/src/components/Footer/Footer';
import Header from '@/src/components/Header/Header';
import OfferItem from '@/src/components/OfferItem/OfferItem';
import TopSection from '@/src/components/TopSection/TopSection';

const HomePage = styled.div`
  position: relative;
  background-image: url('/shape-reg.svg');
  background-repeat: no-repeat;
  padding: 1rem;
  padding-bottom: 96px;
  min-height: 100svh;

  .shape-reg-footer {
    position: absolute;
    z-index: -1;
    bottom: 0;
    right: 0;
  }

  .MuiButton-root {
    text-transform: none;
  }

  .MuiIconButton-root {
    padding: 0 !important;

    &:hover {
      background: none;
      opacity: 0.8;
    }
  }
`;

const Section = styled.div`
  .content-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-offer {
      font-weight: 600;
    }
  }
`;

const StyledBadge = styled(Badge)`
  .MuiBadge-badge {
    background: #0f98f2;
    color: white;
    filter: drop-shadow(0px 0px 2px #0f98f2);
  }
`;

export default function Home() {
  return (
    <>
      <HomePage>
        <Header />
        <TopSection />

        <Section>
          <div className="content-wrap">
            <Typography className="title-offer" variant="body1">
              Offer Watchlist
            </Typography>
            <StyledBadge className="badge-new-offer" badgeContent={4} color="info">
              <CachedRoundedIcon color="action" />
            </StyledBadge>
          </div>
          <div className="offer-list">
            <OfferItem />
            <OfferItem />
            <OfferItem />
          </div>
        </Section>
        <picture>
          <img className="shape-reg-footer" src="/shape-reg-footer.svg" alt="" />
        </picture>
      </HomePage>

      <Footer />
    </>
  );
}
