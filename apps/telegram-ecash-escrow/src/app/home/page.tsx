'use client';

import styled from '@emotion/styled';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import { Badge, Typography } from '@mui/material';

import CreateOfferModal from '@/src/components/CreateOfferModal/CreateOfferModal';
import Footer from '@/src/components/Footer/Footer';
import Header from '@/src/components/Header/Header';
import OfferItem from '@/src/components/OfferItem/OfferItem';
import TopSection from '@/src/components/TopSection/TopSection';
import { offerApi } from '@bcpros/redux-store';
import Fade from '@mui/material/Fade';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const WrapHome = styled.div`
  .btn-create-offer {
    position: absolute;
    right: 5%;
    bottom: 100px;
    z-index: 1;
    cursor: pointer;
    background-color: rgb(255, 219, 209);
    padding: 10px;
    border-radius: 50%;
    display: flex;
  }
`;

const HomePage = styled.div`
  position: relative;
  background-image: url('/shape-reg.svg');
  background-repeat: no-repeat;
  padding: 1rem;
  padding-bottom: 56px;
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
  const prevRef = useRef(0);
  const [visible, setVisible] = useState(true);
  const { useAllOfferQuery } = offerApi;

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = (e) => {
        const currentScrollPos = window.scrollY;
        setVisible(prevRef.current > currentScrollPos || currentScrollPos < 100);
        prevRef.current = currentScrollPos;
      };
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <WrapHome>
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
        <Image width={200} height={200} className="shape-reg-footer" src="/shape-reg-footer.svg" alt="" />
      </HomePage>
      <Fade in={visible}>
        <div className="btn-create-offer" onClick={() => setOpen(true)}>
          <picture>
            <img src="/ico-create-post.svg" alt="ico-create-post" />
          </picture>
        </div>
      </Fade>
      <CreateOfferModal
        isOpen={open}
        onDissmissModal={(value) => {
          setOpen(value);
        }}
      />
      <Footer hidden={visible} />
    </WrapHome>
  );
}
