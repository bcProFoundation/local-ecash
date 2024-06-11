import LixiButton from '@/components/Common/LixiButton';
import styled from '@emotion/styled';
import { Typography, useMediaQuery } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useInitData, usePostEvent } from '@tma.js/sdk-react';
import { generateAccount, useSliceDispatch as useLixiSliceDispatch } from '@bcpros/redux-store';


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
  row-gap: 0.5rem;
`;

const PayeeItem = styled(Typography)`
  display: flex;
  align-items: center;
`;

export const Route = createFileRoute('/')({
  //@ts-ignore
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(qpayQueryOptions),
  component: Index,
  errorComponent: ({ error }) => {
    return <h3 style={{ textAlign: 'center' }}>Can't get Qpay's merchant</h3>;
  }
});

function Index() {
  const initData = useInitData();
  const postEvent = usePostEvent();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const dispatch = useLixiSliceDispatch();

  return (
    <ContainerHome>
      <FeatureEducation>
        <img className="feature-banner" src="/lixi-credit.svg" alt="" />
        <h3 className="feature-title">Control your money without an account</h3>
        <p className="feature-subtitle">
          Lixi app allows you to privately store, manage, and use your crypto
          funds without having to trust a centralized bank or exchange
        </p>
      </FeatureEducation>
      <FunctionalBar>
        <LixiButton
          title="Create new account"
          classCustom="create-new-account"
          onClickItem={() => dispatch(generateAccount({ coin: 'XPI' });}
        />
        <LixiButton
          title="Import from backup"
          classCustom="no-border-btn import-backup"
        />
      </FunctionalBar>
    </ContainerHome>
  );
}
