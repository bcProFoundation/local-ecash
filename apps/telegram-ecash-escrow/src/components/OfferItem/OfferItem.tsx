'use client';

import { withdrawFund } from '@/src/store/escrow';
import { COIN, coinInfo } from '@bcpros/lixi-models';
import {
  BoostForType,
  BoostType,
  CreateBoostInput,
  PostQueryItem,
  TimelineQueryItem,
  UtxoInNodeInput,
  boostApi,
  escrowOrderApi,
  getSelectedWalletPath,
  getWalletUtxosNode,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Card, CardContent, Collapse, IconButton, Typography } from '@mui/material';
import { fromHex, toHex } from 'ecash-lib';
import cashaddr from 'ecashaddrjs';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import useAuthorization from '../Auth/use-authorization.hooks';
import PlaceAnOrderModal from '../PlaceAnOrderModal/PlaceAnOrderModal';
import CustomToast from '../Toast/CustomToast';

const CardWrapper = styled(Card)`
  margin-top: 16px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 16px;

  .prefix {
    font-size: 12px;
    color: #79869b;
  }

  .MuiCardContent-root {
    padding: 16px 16px 0 16px;
  }

  .MuiCollapse-root {
    .MuiCardContent-root {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 16px 0;
    }

    .payment-group-btns {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      button {
        border-radius: 10px;
      }
    }
  }

  .boost-buy {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    align-items: center;

    .place-order-btn {
      display: flex;
      gap: 8px;
      font-weight: 600;
      margin: 0;
      background: #0076c4;
      width: fit-content;
      filter: drop-shadow(0px 0px 3px #0076c4);
      color: white;
      box-shadow: none;
      border-radius: 12px;
      font-size: 13px;
    }

    .boost-value {
      gap: 3px;
      align-items: center;
    }
  }
`;

const OfferShowWrapItem = styled.div`
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  .push-offer-wrap,
  .minmax-collapse-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

type OfferItemProps = {
  timelineItem?: TimelineQueryItem;
};

export default function OfferItem({ timelineItem }: OfferItemProps) {
  const post = timelineItem?.data as PostQueryItem;
  const token = sessionStorage.getItem('Authorization');
  const offerData = post?.postOffer;
  const countryName = offerData?.country?.name;
  const stateName = offerData?.state?.name;
  const [open, setOpen] = useState<boolean>(false);
  const { status } = useSession();
  const askAuthorization = useAuthorization();

  const handleBuyClick = e => {
    e.stopPropagation();

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      setOpen(true);
    }
  };

  const selectedWallet = useLixiSliceSelector(getSelectedWalletPath);
  const utxos = useLixiSliceSelector(getWalletUtxosNode);

  const { useCreateBoostMutation } = boostApi;
  const [createBoostTrigger] = useCreateBoostMutation();
  const { useFilterUtxosMutation } = escrowOrderApi;
  const [filterUtxos] = useFilterUtxosMutation();

  const [expanded, setExpanded] = React.useState(false);
  const [totalValidAmount, setTotalValidAmount] = useState<number>(0);
  const [totalValidUtxos, setTotalValidUtxos] = useState([]);
  const [boostSuccess, setBoostSuccess] = useState(false);

  const handleBoost = async () => {
    if (status === 'unauthenticated') {
      askAuthorization();
      return;
    }

    const amountBoost = 6;
    const myPk = fromHex(selectedWallet?.publicKey);
    const mySk = fromHex(selectedWallet?.privateKey);
    const GNCAddress = process.env.NEXT_PUBLIC_ADDRESS_GNC;
    const { hash: hashXEC } = cashaddr.decode(GNCAddress, false);
    const GNCHash = Buffer.from(hashXEC).toString('hex');

    const txBuild = withdrawFund(totalValidUtxos, mySk, myPk, GNCHash, amountBoost, undefined, 0);

    //create boost
    const createBoostInput: CreateBoostInput = {
      boostedBy: selectedWallet?.hash160,
      boostedValue: amountBoost,
      boostForId: timelineItem?.data?.id || '',
      boostForType: BoostForType.Post,
      boostType: BoostType.Up,
      txHex: toHex(txBuild)
    };
    await createBoostTrigger({ data: createBoostInput }).then(() => setBoostSuccess(true));
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  //call to validate utxos
  useEffect(() => {
    if (utxos.length === 0 || !token) return;
    const listUtxos: UtxoInNodeInput[] = utxos.map(item => {
      return {
        txid: item.outpoint.txid,
        outIdx: item.outpoint.outIdx,
        value: item.value
      };
    });

    const funcFilterUtxos = async () => {
      try {
        const listFilterUtxos = await filterUtxos({ input: listUtxos }).unwrap();
        const totalValueUtxos = listFilterUtxos.filterUtxos.reduce((acc, item) => acc + item.value, 0);
        setTotalValidUtxos(listFilterUtxos.filterUtxos);
        setTotalValidAmount(totalValueUtxos / Math.pow(10, coinInfo[COIN.XEC].cashDecimals));
      } catch (error) {
        console.error('Error filtering UTXOs:', error);
      }
    };

    token && funcFilterUtxos();
  }, [utxos, token]);

  const OfferItem = (
    <OfferShowWrapItem>
      <div className="push-offer-wrap">
        <Typography variant="body2">
          <span className="prefix">By: </span> {post?.account?.telegramUsername ?? ''}
        </Typography>
        <IconButton onClick={handleBoost}>
          <ArrowCircleUpRoundedIcon />
        </IconButton>
      </div>
      <Typography variant="body2">
        <span className="prefix">Offer: </span>
        {offerData?.message}
      </Typography>
      <div className="minmax-collapse-wrap">
        <Typography variant="body2">
          <span className="prefix">Min / max: </span>
          {offerData?.orderLimitMin} XEC - {offerData?.orderLimitMax} XEC
        </Typography>
        <ExpandMoreIcon onClick={handleExpandClick} style={{ cursor: 'pointer' }} />
      </div>
    </OfferShowWrapItem>
  );

  return (
    <React.Fragment>
      <CardWrapper>
        <CardContent>{OfferItem}</CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit className="hidden-item-wrap">
          <CardContent>
            <Typography variant="body2">
              <span className="prefix">Price: </span>
              {offerData?.price}
            </Typography>
            <Typography variant="body2">
              <span className="prefix">Location: </span>
              {[stateName, countryName].filter(Boolean).join(', ')}
            </Typography>
            <div className="payment-group-btns">
              {offerData?.paymentMethods &&
                offerData.paymentMethods?.length > 0 &&
                offerData.paymentMethods.map(item => {
                  return (
                    <Button size="small" color="warning" variant="outlined" key={item.paymentMethod.name}>
                      {item.paymentMethod.name}
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </Collapse>

        <Typography className="boost-buy">
          <Button className="place-order-btn boost-value">
            <span className="value">{post?.boostScore?.boostScore}</span>
            <span className="coin">XEC</span>
          </Button>
          <Button className="place-order-btn" color="success" variant="contained" onClick={e => handleBuyClick(e)}>
            Buy
            <Image width={25} height={25} src="/eCash.svg" alt="" />
          </Button>
        </Typography>
      </CardWrapper>

      <PlaceAnOrderModal isOpen={open} onDissmissModal={value => setOpen(value)} post={post} />

      <CustomToast
        isOpen={boostSuccess}
        handleClose={() => setBoostSuccess(false)}
        content="Boost offer successful"
        type="success"
      />
    </React.Fragment>
  );
}
