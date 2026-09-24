import { COIN, coinInfo } from '@bcpros/lixi-models';
import {
  UtxoInNode,
  UtxoInNodeInput,
  escrowOrderApi,
  getSelectedAccount,
  getSlpBalancesAndUtxosNode,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import _ from 'lodash';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface LocalWalletSpend {
  spent: Array<{ txid: string; outIdx: number }>;
  remainingUtxos: UtxoInNode[];
  remainingAmount: number;
}

export interface UtxoContextType {
  totalValidAmount: number;
  totalValidUtxos: Array<UtxoInNode>;
  applyLocalSpend: (spend: LocalWalletSpend) => void;
}
// Create the Context
export const UtxoContext = createContext<UtxoContextType>(undefined);

export function UtxoProvider({ children }) {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('Authorization'));
  const utxosNode = useLixiSliceSelector(getSlpBalancesAndUtxosNode);
  const selectedAccount = useLixiSliceSelector(getSelectedAccount);

  const [totalValidAmount, setTotalValidAmount] = useState<number>(0);
  const [totalValidUtxos, setTotalValidUtxos] = useState<UtxoInNode[]>([]);

  const { useFilterUtxosMutation } = escrowOrderApi;
  const [filterUtxos] = useFilterUtxosMutation();

  const pendingSpendsRef = useRef<Array<{ txid: string; outIdx: number }>>([]);
  const syncGenerationRef = useRef(0);

  const applyLocalSpend = useCallback((spend: LocalWalletSpend) => {
    syncGenerationRef.current += 1;
    pendingSpendsRef.current = [...pendingSpendsRef.current, ...spend.spent];
    setTotalValidUtxos(spend.remainingUtxos);
    setTotalValidAmount(spend.remainingAmount);
  }, []);

  const contextValue = useMemo(
    () => ({ totalValidAmount, totalValidUtxos, applyLocalSpend }),
    [totalValidAmount, totalValidUtxos, applyLocalSpend]
  );

  useEffect(() => {
    if (_.isNil(token)) {
      const maximumAttempts = 10;
      let attempts = 0;

      const interval = setInterval(() => {
        const sessionToken = sessionStorage.getItem('Authorization');
        attempts++;
        if (sessionToken) {
          setToken(sessionToken);
          clearInterval(interval); // stop polling once token is set
        } else if (attempts >= maximumAttempts) {
          console.warn('Max attempts reached, interval cleared without finding token'); // Warning log
          clearInterval(interval); // Clear interval after maximum attempts
        }
      }, 500); // check every 500ms

      return () => clearInterval(interval);
    }
  }, [selectedAccount]);

  // Call to validate UTXOs. A broadcast updates the balance immediately; Chronik
  // snapshots that still contain those spent outpoints are ignored until the indexer catches up.
  useEffect(() => {
    if (_.isNil(utxosNode) || utxosNode.length === 0) return;

    const pending = pendingSpendsRef.current;
    const stillSpent = utxosNode.some(item =>
      pending.some(
        spend => spend.txid.toLowerCase() === item.outpoint.txid.toLowerCase() && spend.outIdx === item.outpoint.outIdx
      )
    );
    if (stillSpent) return;

    const listUtxos: UtxoInNodeInput[] = utxosNode.map(item => ({
      txid: item.outpoint.txid,
      outIdx: item.outpoint.outIdx,
      value: item.value
    }));
    const generation = syncGenerationRef.current;

    token &&
      (async () => {
        try {
          const listFilterUtxos = await filterUtxos({
            input: listUtxos
          }).unwrap();
          if (syncGenerationRef.current !== generation) return;
          pendingSpendsRef.current = [];
          const totalValueUtxos = listFilterUtxos.filterUtxos.reduce((acc, item) => acc + item.value, 0);
          setTotalValidUtxos(listFilterUtxos.filterUtxos);
          setTotalValidAmount(totalValueUtxos / Math.pow(10, coinInfo[COIN.XEC].cashDecimals));
        } catch (error) {
          console.error('Error filtering UTXOs:', error);
        }
      })();
  }, [utxosNode, token]);

  return <UtxoContext.Provider value={contextValue}>{children}</UtxoContext.Provider>;
}
