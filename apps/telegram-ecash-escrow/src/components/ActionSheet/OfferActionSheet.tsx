import { capitalizeStr } from '@/src/store/util';
import {
  OfferStatus,
  PostQueryItem,
  UpdateOfferHideFromHomeInput,
  UpdateOfferStatusInput,
  closeActionSheet,
  offerApi,
  openModal,
  showToast,
  useSliceDispatch as useLixiSliceDispatch
} from '@bcpros/redux-store';
import { useUpdateOfferHideFromHomeMutation } from '@bcpros/redux-store/build/main/store/escrow/offer/offer.api';
import { Box, List, ListItem, ListItemButton, ListItemText, SwipeableDrawer, styled } from '@mui/material';
import { useState } from 'react';

const ListStyled = styled(List)(({ theme }) => ({
  backgroundColor: theme.custom.bgSecondary,
  padding: '32px 16px',
  paddingTop: '16px',
  li: {
    backgroundColor: '#494949',
    borderRadius: '10px',
    marginTop: '7px'
  },

  '.MuiTypography-root': {
    color: '#fff'
  }
}));

interface OfferActionSheetProps {
  post: PostQueryItem;
}

export default function OfferActionSheet({ post }: OfferActionSheetProps) {
  const offer = post?.postOffer;
  const isOfferActive = offer?.status === OfferStatus.Active;
  const dispatch = useLixiSliceDispatch();

  const [open, setOpen] = useState(true);

  const { useUpdateOfferStatusMutation } = offerApi;
  const [triggerUpdateOfferStatus] = useUpdateOfferStatusMutation();
  const [updateOfferHideFromHomeTrigger] = useUpdateOfferHideFromHomeMutation();

  const editOffer = () => {
    dispatch(openModal('CreateOfferModal', { offer: offer, isEdit: true }));
    dispatch(closeActionSheet());
  };

  const handleClickArchiveOrReopen = async (offerStatus: OfferStatus) => {
    const input: UpdateOfferStatusInput = {
      id: offer.postId,
      status: offerStatus
    };
    await triggerUpdateOfferStatus({ input })
      .unwrap()
      .then(() => {
        dispatch(
          showToast('success', {
            message: 'Success',
            description: `${capitalizeStr(offerStatus)} successful`
          })
        );
      })
      .catch(err => {
        dispatch(
          showToast('error', {
            message: 'error',
            description: `Something wrong when ${capitalizeStr(offerStatus)}`
          })
        );
      });

    handleClose();
  };

  const handleListUnlistOffer = async () => {
    let inputUpdateOffer: UpdateOfferHideFromHomeInput = {
      id: offer?.postId,
      hideFromHome: !offer?.hideFromHome
    };
    await updateOfferHideFromHomeTrigger({ input: inputUpdateOffer })
      .unwrap()
      .then(() => {
        dispatch(
          showToast('success', {
            message: 'Success',
            description: `${offer?.hideFromHome ? 'List' : 'Unlist'} offer successfully!`
          })
        );
      })
      .catch(err => {
        dispatch(
          showToast('error', {
            message: 'error',
            description: `Something wrong when ${offer?.hideFromHome ? 'list' : 'unlist'} offer!`
          })
        );
      });

    handleClose();
  };

  const handleBoostOffer = async () => {
    dispatch(openModal('BoostModal', { post: post }));
  };

  const handleClickShare = () => {
    dispatch(openModal('ShareSocialModal', { offer: offer }));
    dispatch(closeActionSheet());
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(closeActionSheet());
    }, 500);
  };

  const listActionItemActive = (
    <ListStyled>
      <ListItem key={'Edit'} disablePadding>
        <ListItemButton onClick={editOffer}>
          <ListItemText primary={'Edit offer'} />
        </ListItemButton>
      </ListItem>
      <ListItem key={'Archive'} disablePadding>
        <ListItemButton onClick={() => handleClickArchiveOrReopen(OfferStatus.Archive)}>
          <ListItemText primary={'Archive offer'} />
        </ListItemButton>
      </ListItem>
      <ListItem key={'ListUnlist'} disablePadding>
        <ListItemButton onClick={handleListUnlistOffer}>
          <ListItemText primary={`${offer?.hideFromHome ? 'List' : 'Unlist'} offer`} />
        </ListItemButton>
      </ListItem>
      {!offer?.hideFromHome && (
        <ListItem key={'Boost'} disablePadding>
          <ListItemButton onClick={handleBoostOffer}>
            <ListItemText primary={'Boost offer'} />
          </ListItemButton>
        </ListItem>
      )}
      <ListItem key={'Share'} disablePadding>
        <ListItemButton onClick={handleClickShare}>
          <ListItemText primary={'Share offer'} />
        </ListItemButton>
      </ListItem>
    </ListStyled>
  );

  const listActionItemArchive = (
    <ListStyled>
      <ListItem key={'Reopen'} disablePadding>
        <ListItemButton onClick={() => handleClickArchiveOrReopen(OfferStatus.Active)}>
          <ListItemText primary={'Reopen offer'} />
        </ListItemButton>
      </ListItem>
    </ListStyled>
  );

  const list = () => <Box role="presentation">{isOfferActive ? listActionItemActive : listActionItemArchive}</Box>;

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={open}
      onClose={handleClose}
      onOpen={() => console.log('open')}
      PaperProps={{
        sx: {
          width: {
            xs: '100%',
            sm: 500
          },
          left: {
            sm: '50%'
          },
          transform: {
            sm: 'translateX(-50%)'
          }
        }
      }}
    >
      {list()}
    </SwipeableDrawer>
  );
}
