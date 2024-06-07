import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import _ from 'lodash';
import { useBackButton, useHapticFeedback, useMainButton, usePopup } from '@tma.js/sdk-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { shareOnMobile } from 'react-mobile-share';
import { Snackbar, Stack, TextField } from '@mui/material';
import styled from '@emotion/styled';
import QRCodeStyling, { Options as QRCodeStylingOptions } from 'qr-code-styling';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ContainerReceive = styled.div`
  padding: 1rem;
  #qrcode {
    max-width: 100%;
    text-align: center;
  }
  .receive-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    img {
      align-self: center;
      filter: drop-shadow(2px 4px 6px black);
    }
    .header-receive {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      .title {
        margin-top: 1rem;
      }
      .subtitle {
        span {
          font-size: 12px;
          color: #d5d5d5;
        }
      }
    }
    .tooltip-info {
      padding: 0;
      align-self: end;
    }
  }
  .coin-address {
    .address-string {
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background: #4c5054;
      color: #fff;
      width: fit-content;
      margin: auto;
      border-radius: 4px;
      gap: 4px;
      svg {
        font-size: 14px;
      }
      span {
        font-size: 12px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
  .receive-form {
    padding: 1rem 0;
    .prefix-coin {
      color: #01abe8;
      font-size: 14px;
      font-weight: 600;
    }
  }
`;

const TooltipContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 4rem;
  padding: 1rem;
  border: 1px solid #5476eb;
  border-radius: 8px;
  background: #4c5054;
  p {
    font-size: 12px;
    letter-spacing: 0.25px;
    line-height: 20px;
  }
`;

const qrOptions: QRCodeStylingOptions = {
  width: 300,
  height: 300,
  margin: 12,
  image: '/xec.svg',
  type: 'svg',
  dotsOptions: {
    color: '#fff',
    type: 'dots'
  },
  cornersSquareOptions: {
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    type: 'dot'
  },
  backgroundOptions: {
    color: 'transparent'
  },
  imageOptions: {
    margin: 12
  }
};

export const component = function Receive() {
  const { navigate } = useRouter();
  const [isShowCopy, setIsShowCopy] = useState<boolean>(false);
  const addressAcount = 'qp8ks7622cklc7c9pm2d3ktwzctack6njq6q83ed9x';
  const [request, setRequest] = useState<string>('qp8ks7622cklc7c9pm2d3ktwzctack6njq6q83ed9x');
  const [shareMobile, setShareMobile] = useState<string>(`https://lixi-mini-app.vercel.app/startapp=${request}`);
  const qrCode = new QRCodeStyling(qrOptions);
  const ref = useRef<any>(null);

  const mainButton = useMainButton();
  const backButton = useBackButton();
  const popUp = usePopup();
  const haptic = useHapticFeedback();

  useEffect(() => {
    backButton.show();
    mainButton.enable().show();
    mainButton.setText('Share this');
  }, []);

  useEffect(() => {
    mainButton.on('click', onMainButtonClick);
    backButton.on('click', onBackButtonClick);
  }, [mainButton, backButton]);

  const onMainButtonClick = () => {
    haptic.impactOccurred('medium');
    shareOnMobile({
      text: shareMobile,
      // url: "https://www.npmjs.com/package/react-mobile-share",
      title: shareMobile
    });
  };

  const onBackButtonClick = () => {
    backButton.hide();
    mainButton.hide();
    mainButton.off('click', onMainButtonClick);
    backButton.off('click', onBackButtonClick);
    navigate({ to: '/wallet' });
  };

  const copyTextToClipboard = () => {
    haptic.impactOccurred('medium');
    setIsShowCopy(true);
  };

  const handleClose = () => {
    setIsShowCopy(false);
  };

  useEffect(() => {
    qrCode?.append(ref.current);
  }, [ref, qrCode]);

  useEffect(() => {
    qrCode?.update({ data: request });
  }, [request, qrCode]);

  useEffect(() => {
    setShareMobile(`https://lixi-mini-app.vercel.app/startapp=${request}`);
  }, [request]);

  const debounceAmount = useCallback(
    _.debounce(
      nextValue => (nextValue > 0 ? setRequest(`${addressAcount}?amount=${nextValue}`) : setRequest(addressAcount)),
      1000
    ),
    []
  );

  const onRequestChange: React.ChangeEventHandler<HTMLInputElement> | undefined = event => {
    event.preventDefault();
    const { value } = event.target;
    debounceAmount(value);
  };

  const infoReceive = () => {
    popUp.open({
      title: 'Receive info',
      message:
        'You can copy and share your wallet address by clicking on the address. You can also share your wallet QRCode.',
      buttons: [{ id: 'receive-ok', type: 'ok' }]
    });
    popUp.isOpened;
  };

  return (
    <>
      <ContainerReceive>
        <div className="receive-info">
          <img width={96} height={96} src="/request.svg" alt="" />
          <div className="header-receive">
            <h2 className="title">Receive</h2>
            <div onClick={infoReceive}>
              <InfoOutlinedIcon />
            </div>
          </div>
        </div>
        <div className="receive-form">
          <FormControl fullWidth={true}>
            <TextField
              id="address"
              label="Request amount (option)"
              placeholder="0"
              color="primary"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <p className="prefix-coin">XEC</p>
                  </InputAdornment>
                )
              }}
              onChange={onRequestChange}
            />
          </FormControl>
        </div>
        <div className="coin-address">
          <div style={{ textAlign: 'center' }} ref={ref}></div>
          <CopyToClipboard text={request} onCopy={copyTextToClipboard}>
            <div className="address-string">
              <ContentPasteIcon />
              <span>
                <span style={{ color: '#01abe8' }}>ecash:</span>
                {request}
              </span>
            </div>
          </CopyToClipboard>
        </div>
      </ContainerReceive>
      <Stack>
        <Snackbar
          open={isShowCopy}
          onClose={handleClose}
          autoHideDuration={2000}
          message={'The address has been copied.'}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Stack>
    </>
  );
};
