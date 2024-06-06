'use client';
import LixiButton from '@/src/components/Button/LixiButton';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { useState } from 'react';

export interface TxHistory {
  type: string;
  amount: string;
  username?: string;
  dateTime: string;
  coin: string;
}

export default function Wallet() {
  const [hideBalance, setHideBalance] = useState<boolean>(false);
  const [txHistory, setTxHistory] = useState<Array<TxHistory>>([
    {
      type: 'receive',
      amount: '29190.35',
      coin: 'XEC',
      dateTime: '24/12/2023',
      username: 'nghiacc'
    },
    {
      type: 'sent',
      amount: '2453.09',
      coin: 'XEC',
      dateTime: '24/12/2023',
      username: 'nghiacc'
    },
    {
      type: 'receive',
      amount: '6805.82',
      coin: 'XEC',
      dateTime: '19/12/2023',
      username: 'vincex'
    }
  ]);

  const handleHideBalance = () => {
    setHideBalance(!hideBalance);
  };

  // useEffect(() => {
  //   // shortName = nameArr.reduce((rs, name) => {
  //   //   return (rs += name.charAt(0).toUpperCase());
  //   // }, '');
  //   const balance = txHistory.reduce((rs, tx) => {
  //     if (tx.type === 'sent') {
  //       tx.amount = +
  //     } else {

  //     }
  //   }, 0)
  // },[txHistory])

  const addTxHistory = () => {
    setTxHistory([
      {
        type: 'receive',
        amount: '8291.82',
        coin: 'XEC',
        dateTime: '27/12/2023',
        username: 'kendev'
      },
      ...txHistory
    ]);
  };

  return (
    <div>
      <div {...stylex.props(style.walletInfoContainer)}>
        <div {...stylex.props(style.currencyInfo)}>
          <picture>
            <img {...stylex.props(style.curencyImage)} src="/xec.svg" alt="" />
          </picture>
          <div {...stylex.props(style.currencyInfo)}>
            <p className="coin-symbol">eCash</p>
            <h3 className="coin-name">XEC</h3>
          </div>
        </div>
        <div {...stylex.props(balanceStyle.container)}>
          <div {...stylex.props(balanceStyle.balanceHeader)}>
            <h2 {...stylex.props(balanceStyle.titleBalance)}>Total balance:</h2>
            <div {...stylex.props(balanceStyle.hiddenBalance)} onClick={handleHideBalance}>
              {hideBalance ? <RemoveRedEyeOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
            </div>
          </div>
          <div {...stylex.props(balanceStyle.balanceContent)}>
            {hideBalance ? (
              <>
                <p {...stylex.props(balanceStyle.amount)}>******</p>
                <p {...stylex.props(balanceStyle.fiatRate)}>******</p>
              </>
            ) : (
              <>
                <p {...stylex.props(balanceStyle.amount)}>
                  33,542 <span>XEC</span>
                </p>
                <p {...stylex.props(balanceStyle.fiatRate)}>~ 2.20 USD</p>
              </>
            )}
          </div>
        </div>
        <div {...stylex.props(style.groupActionWallet)}>
          <Link href="/send" {...stylex.props(style.link)}>
            <LixiButton
              variant="linear"
              icon={
                <picture>
                  <img src="/send.svg" alt="send" />
                </picture>
              }
            >
              Send
            </LixiButton>
          </Link>
          <Link href="/receive" {...stylex.props(style.link)}>
            <LixiButton
              variant="linear"
              icon={
                <picture>
                  <img src="/request.svg" alt="request" />
                </picture>
              }
            >
              Recieve
            </LixiButton>
          </Link>
        </div>
        <div {...stylex.props(transactionStyle.container)}>
          <h5 {...stylex.props(transactionStyle.title)}>Transaction History</h5>
          <div {...stylex.props(transactionStyle.transactionDetail)}>
            {txHistory &&
              txHistory.map((tx) => (
                <div {...stylex.props(transactionStyle.txContainer)} key={Math.random()}>
                  <div>
                    <p
                      {...stylex.props(transactionStyle.txHistoryAmount)}
                      style={{ color: tx.type === 'sent' ? '#73daa5' : '#ffb4a9' }}
                    >
                      {(tx.type === 'sent' ? '-' : '+') + tx.amount + ' ' + tx.coin}
                    </p>
                    <p {...stylex.props(transactionStyle.txHistoryUsername)}>
                      {(tx.type === 'sent' ? 'To: ' : 'From: ') + tx.username}
                      <picture>
                        <img width={12} height={12} src="/telegram-ico.svg" alt="telegram icon" />
                      </picture>
                    </p>
                  </div>
                  <div {...stylex.props(transactionStyle.dateTime)}>{tx.dateTime}</div>
                </div>
              ))}
            {txHistory.length === 0 && (
              <div className="ghost-town">
                <picture>
                  <img src="/ghost.svg" alt="" />
                </picture>
                <h4 className="blank-title">No History Yet</h4>
                <p className="blank-subtitle">Once you start making transactions, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const transactionStyle = stylex.create({
  container: {
    width: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    marginTop: '1rem',
    background: '#2c2c2c',
    borderRadius: '1rem'
  },
  title: {
    fontSize: '12px',
    fontWeight: 400,
    textTransform: 'uppercase',
    padding: '1rem',
    paddingBottom: 0
  },
  transactionDetail: {
    padding: '0.5rem 0'
  },
  txContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #383838',
    borderLeft: 0,
    borderRight: 0,
    padding: '1rem',
    background: '#333',
    margin: '0.5rem 0'
  },
  txHistoryAmount: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#73daa5',
    letterSpacing: '0.25px'
  },
  txHistoryUsername: {
    fontSize: '14px',
    color: '#e0e4e7',
    letterSpacing: '0.25px',
    marginTop: '4px'
  },
  dateTime: {
    fontSize: '10px',
    color: '#d5d5d5'
  }
});

const balanceStyle = stylex.create({
  container: {
    width: '100%',
    marginTop: '1rem',
    alignSelf: 'flexStart'
  },
  balanceHeader: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  titleBalance: {
    fontSize: '18px',
    fontWeight: 500
  },
  hiddenBalance: {
    height: '24px'
  },
  balanceContent: {
    textAlign: 'center',
    padding: '2rem',
    background: '#2c2c2c',
    margin: '1rem 0',
    borderRadius: '0.5rem'
  },
  span: {
    fonWeight: 400,
    fontSize: '16px',
    letterSpacing: '0.25px',
    opacity: '0.6'
  },
  svg: {
    opacity: '0.6'
  },
  amount: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    fontSize: '26px',
    fontWeight: '500'
  },
  fiatRate: {
    fontWeight: 400,
    fontSize: '16px',
    letterSpacing: '0.25px',
    opacity: 0.6
  }
});

const style = stylex.create({
  walletInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem'
  },
  currencyInfo: {
    textAlign: 'center'
  },
  curencyImage: {
    width: '96px',
    height: '96px'
  },
  groupActionWallet: {
    width: '100%',
    display: 'flex',
    gap: '8px'
  },
  link: {
    width: '100%'
  }
});
