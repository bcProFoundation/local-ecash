'use client';
import { Info } from '@/src/components/info';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

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

export default function Home() {
  const router = useRouter();

  const navigateWallet = () => {
    router.push('/wallet');
  };

  return (
    <ContainerHome>
      <Info botUsername={`${process.env.NEXT_PUBLIC_BOT_USERNAME}`} />
      {/* <LoginButton
        botUsername={'test2212231_bot'}
        onAuthCallback={(data) => {
          console.log(data);
          // call your backend here to validate the data and sign in the user
        }}
      /> */}
    </ContainerHome>
  );
}
