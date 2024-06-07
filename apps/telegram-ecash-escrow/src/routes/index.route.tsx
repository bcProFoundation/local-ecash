import styled from '@emotion/styled';
import { Link, useLoaderData } from '@tanstack/react-router';
import axiosClient from '@utils/axiosClient';
import { useEffect } from 'react';
import { IconPayeeItem, Merchant } from './qpay.route';
import { Card, CardContent, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
import { darkTheme, lightTheme } from '../theme/theme';
import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import { usePostEvent, useInitData, useWebApp } from '@tma.js/sdk-react';
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const BWS_URL = process.env.REACT_PUBLIC_BWS_URL;

const ContainerHome = styled.div`
  display: grid;
  grid-template-rows: 85% 15%;
  padding: 1rem;
  height: 100vh;
  text-align: center;
`;

const FeatureEducation = styled.div`
  img {
    max-width: 100%;
  }
  .feature-title {
    font-weight: 600;
    align-items: center;
    text-align: center;
    line-height: 34px;
  }
  .feature-subtitle {
    font-size: 16px;
    text-align: center;
    color: #9aa5ac;
    font-weight: 300;
    padding-top: 15px;
    line-height: 28px;
  }
`;

const FunctionalBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 1rem;
  a {
    width: 100%;
  }
`;

const PayeeItem = styled(Typography)`
  display: flex;
  align-items: center;
`;

const qpayQueryOptions = queryOptions({
  queryKey: ['qpayInfo'],
  staleTime: Infinity,
  queryFn: async () => {
    try {
      const req = await axios.get(`${BWS_URL}v3/merchant/qpayinfo`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const { merchantList, streets, message, raipayFeeList, unit } = await req.data;
      const xecFee = raipayFeeList.find(item => item.coin === 'xec');
      if (req.status !== 200) {
        throw new Error(message);
      }

      return {
        merchantList,
        streets,
        xecFee,
        unit
      };
    } catch (e) {
      console.log(e);
    }
  }
});

export const Route = createFileRoute('/')({
  //@ts-ignore
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(qpayQueryOptions),
  component: Index,
  errorComponent: ({ error }) => {
    return <h3 style={{ textAlign: 'center' }}>Can't get Qpay's merchant</h3>;
  }
});

function Index() {
  const { data: qpayInfo } = useSuspenseQuery(qpayQueryOptions);
  const initData = useInitData();
  const postEvent = usePostEvent();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useQuery({
    queryKey: ['userBalance'],
    staleTime: Infinity,
    queryFn: async () => {
      const result = await axiosClient('/telegram-bot/balance', {
        params: {
          username: initData.user.username,
          userId: initData.user.id
        }
      }).then(res => res.data);

      return result;
    }
  });

  useEffect(() => {
    postEvent('web_app_expand');
  }, []);

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <ContainerHome>
        <FunctionalBar>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>QPay</h2>
          {qpayInfo.merchantList.map((merchant: Merchant) => {
            return (
              <Link
                to="/qpay"
                //@ts-ignore
                state={qpayInfo}
                search={{
                  merchantCode: merchant.code,
                  username: initData.user.username,
                  userId: initData.user.id.toString()
                }}
                key={merchant.code}
              >
                <Card sx={{ minWidth: 275 }}>
                  <CardContent style={{ paddingTop: '24px' }}>
                    <PayeeItem className="payee-item" sx={{ fontSize: 20 }} color="text.primary">
                      {IconPayeeItem(merchant.code)}
                      {merchant.name}
                    </PayeeItem>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </FunctionalBar>
      </ContainerHome>
    </ThemeProvider>
  );
}
