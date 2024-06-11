'use client';
import LixiButton from '@/src/components/Button/LixiButton';
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
      <FeatureEducation>
        <picture>
          <img className="feature-banner" src="/lixi-credit.svg" alt="" />
        </picture>
        <h3 className="feature-title">Control your money without an account</h3>
        <p className="feature-subtitle">
          Lixi app allows you to privately store, manage, and use your crypto funds without having to trust a
          centralized bank or exchange
        </p>
      </FeatureEducation>
      <FunctionalBar>
        {/* <LixiButton title="Create new account" classCustom="create-new-account" onClickItem={() => navigateWallet()} /> */}
        <LixiButton variant="linear">Create new account</LixiButton>

        {/* <LixiButton title="Import from backup" classCustom="no-border-btn import-backup" /> */}
        <LixiButton variant="linear">Import from backup</LixiButton>
      </FunctionalBar>
    </ContainerHome>
  );
}
