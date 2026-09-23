import { COIN, coinInfo } from '@bcpros/lixi-models';
import { ALL_BIP143, EccDummy, P2PKHSignatory, Script, TxBuilder, calcTxFee, shaRmd160 } from 'ecash-lib';

// Same conversion withdrawFund uses in store/util.ts.
const convertXECToSatoshi = (amount: number) => {
  return parseInt((amount * Math.pow(10, coinInfo[COIN.XEC].cashDecimals)).toFixed(0));
};

export interface WalletUtxoValue {
  value: number;
}

export interface WalletSendQuote {
  inputSats: bigint;
  sendSats: bigint;
  feeSats: bigint;
  changeSats: bigint;
}

const feeCache = new Map<string, bigint>();

const feePerKb = () => Math.floor(coinInfo[COIN.XEC].defaultFee * 1000);

const dustLimitSats = () => BigInt(coinInfo[COIN.XEC].etokenSats);

/**
 * Miner fee for a P2PKH send that spends `inputCount` coins.
 * One output is the recipient. Two outputs include the change leftover.
 * Size is measured with the same dummy signatures TxBuilder uses.
 */
function minerFeeSats(inputCount: number, outputs: 1 | 2): bigint {
  if (inputCount <= 0) return BigInt(0);
  const key = `${inputCount}:${outputs}`;
  const cached = feeCache.get(key);
  if (cached !== undefined) return cached;

  const dummySk = new Uint8Array(32);
  const dummyPk = new Uint8Array(33);
  dummyPk[0] = 2;
  const p2pkh = Script.p2pkh(shaRmd160(dummyPk));
  const txid = '11'.repeat(32);
  const inputs = Array.from({ length: inputCount }, () => ({
    input: {
      prevOut: { txid, outIdx: 0 },
      signData: {
        value: 100000,
        outputScript: p2pkh
      }
    },
    signatory: P2PKHSignatory(dummySk, dummyPk, ALL_BIP143)
  }));
  const txOutputs = Array.from({ length: outputs }, () => ({
    value: Number(dustLimitSats()),
    script: p2pkh
  }));
  const tx = new TxBuilder({ inputs, outputs: txOutputs }).sign(new EccDummy(), feePerKb(), Number(dustLimitSats()));
  const fee = calcTxFee(tx.serSize(), feePerKb());
  feeCache.set(key, fee);
  return fee;
}

export function formatSatsAsXec(sats: bigint): string {
  const decimals = coinInfo[COIN.XEC].cashDecimals;
  const negative = sats < BigInt(0);
  const digits = (negative ? -sats : sats).toString().padStart(decimals + 1, '0');
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals);
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

function satsToXec(sats: bigint): number {
  return Number(formatSatsAsXec(sats));
}

/**
 * Fee and change for a wallet send that spends every passed UTXO.
 * Matches TxBuilder: the change output is dropped when it would be below dust,
 * and that value is added to the miner fee.
 */
export function quoteWalletSend(utxos: WalletUtxoValue[], sendAmountXec: number): WalletSendQuote | null {
  if (!utxos.length || !Number.isFinite(sendAmountXec) || sendAmountXec <= 0) return null;
  const inputSats = utxos.reduce((sum, utxo) => sum + BigInt(utxo.value), BigInt(0));
  const sendSats = BigInt(convertXECToSatoshi(sendAmountXec));
  if (sendSats <= BigInt(0)) return null;

  const feeWithChange = minerFeeSats(utxos.length, 2);
  const leftover = inputSats - sendSats - feeWithChange;
  const dropsChange = leftover < dustLimitSats();
  const minFee = dropsChange ? minerFeeSats(utxos.length, 1) : feeWithChange;
  if (inputSats < sendSats + minFee) {
    return { inputSats, sendSats, feeSats: minFee, changeSats: BigInt(0) };
  }
  // Dropping a dust leftover adds those sats to the miner fee.
  const feeSats = dropsChange ? inputSats - sendSats : feeWithChange;
  const changeSats = dropsChange ? BigInt(0) : leftover;
  return { inputSats, sendSats, feeSats, changeSats };
}

/**
 * Largest XEC amount withdrawFund can pay to a P2PKH recipient.
 * The change output is omitted, so the recipient receives every sat that is not the miner fee.
 */
export function maxSendableXec(utxos: WalletUtxoValue[]): number | null {
  if (!utxos.length) return null;
  const inputSats = utxos.reduce((sum, utxo) => sum + BigInt(utxo.value), BigInt(0));
  const feeSats = minerFeeSats(utxos.length, 1);
  let sendSats = inputSats - feeSats;
  const minimum = BigInt(convertXECToSatoshi(5.46));
  // Walk back a few sats if float conversion would not round-trip into withdrawFund.
  for (let step = 0; step < 5 && sendSats > minimum; step++) {
    const xec = satsToXec(sendSats);
    if (xec > 5.46 && BigInt(convertXECToSatoshi(xec)) === sendSats) return xec;
    sendSats -= BigInt(1);
  }
  return null;
}
