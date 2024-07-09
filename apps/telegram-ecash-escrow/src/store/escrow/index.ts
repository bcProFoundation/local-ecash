import {
  ALL_BIP143,
  Ecc,
  OP_1,
  OP_2,
  OP_3,
  OP_4,
  OP_CAT,
  OP_CHECKDATASIGVERIFY,
  OP_DUP,
  OP_ELSE,
  OP_ENDIF,
  OP_EQUAL,
  OP_EQUALVERIFY,
  OP_FROMALTSTACK,
  OP_HASH160,
  OP_IF,
  OP_SWAP,
  OP_TOALTSTACK,
  Script,
  UnsignedTxInput,
  fromHex,
  pushBytesOp,
  sha256,
  shaRmd160
} from 'ecash-lib';
import { ACTION } from './constant';

export class Escrow {
  public sellerPk: Uint8Array;
  public buyerPk: Uint8Array;
  public arbiPk: Uint8Array;
  public nonce: string;

  constructor({
    sellerPk,
    buyerPk,
    arbiPk,
    nonce
  }: {
    sellerPk: Uint8Array;
    buyerPk: Uint8Array;
    arbiPk: Uint8Array;
    nonce: string;
  }) {
    this.sellerPk = sellerPk;
    this.buyerPk = buyerPk;
    this.arbiPk = arbiPk;
    this.nonce = nonce;
  }

  /** Build the Script enforcing the Agora offer covenant. */
  public script(): Script {
    const sellerPkh = shaRmd160(this.sellerPk);
    const buyerPkh = shaRmd160(this.buyerPk);
    const arbiPkh = shaRmd160(this.arbiPk);
    const nonce = fromHex(Buffer.from(this.nonce, 'utf-8').toString('hex'));

    return Script.fromOps([
      OP_DUP, // We need to use the byte again afterwards
      //Get the hashed public keys we need to compare against (ours, and the oracle)
      OP_1,
      OP_EQUAL,
      OP_IF,
      pushBytesOp(sellerPkh), //<hash160(SellerPubKey)> # Oracle pub key
      pushBytesOp(buyerPkh), //<hash160(BuyerPubKey)> # Spender pub key
      OP_ELSE,
      OP_DUP,
      OP_2, //# = release from arbitrator
      OP_EQUAL,
      OP_IF,
      pushBytesOp(arbiPkh), //<hash160(ArbPubKey)> # Oracle pub key
      pushBytesOp(buyerPkh), //<hash160(BuyerPubKey)> # Spender pub key
      OP_ELSE,
      OP_DUP,
      OP_3, //# = return from buyer
      OP_EQUAL,
      OP_IF,
      pushBytesOp(buyerPkh), //<hash160(BuyerPubKey)> # Oracle pub key
      pushBytesOp(sellerPkh), //<hash160(SellerPubKey)> # Spender pub key
      OP_ELSE,
      OP_DUP,
      OP_4, //# = return from arbitrator
      OP_EQUALVERIFY, //# must be true, else the message is unknown
      pushBytesOp(arbiPkh), //<hash160(ArbPubKey)> # Oracle pub key
      pushBytesOp(sellerPkh), //<hash160(SellerPubKey)> # Spender pub key
      OP_ENDIF,
      OP_ENDIF,
      OP_ENDIF,
      //# Put the hashed public keys on the alt stack
      OP_TOALTSTACK,
      OP_TOALTSTACK, //# Stack is effectively reset to the input
      //# On the alt stack we have: [ hash160(SpenderPubKey), hash160(OraclePubKey) ]
      pushBytesOp(nonce), //<EscrowKey> # Append the nonce to the escrow key to make the message
      OP_CAT, //# Stack is [ ..., <OraclePubKey>, <0x01 || EscrowKey> ]
      OP_SWAP, //# Use this later; verify the oracle public key hash first
      OP_DUP,
      OP_HASH160,
      OP_FROMALTSTACK, //# Grab hashed pub key from alt stack
      OP_EQUALVERIFY, //# Public key checks out; now verify the oracle signature
      OP_CHECKDATASIGVERIFY, //# Now verify the sender
      OP_HASH160,
      OP_FROMALTSTACK,
      OP_EQUAL
    ]);
  }
}

export const SellerReleaseSignatory = (
  sellerSk: Uint8Array,
  sellerPk: Uint8Array,
  buyerPk: Uint8Array,
  nonce: string
) => {
  return (ecc: Ecc, input: UnsignedTxInput): Script => {
    const preimage = input.sigHashPreimage(ALL_BIP143);
    const hexNonce = Buffer.from(nonce, 'utf-8').toString('hex');
    const message = ACTION.SELLER_RELEASE + hexNonce;

    const oracleMessage = sha256(fromHex(message)); // ACTION BYTE - 01 + NONCE - 48656c6c6f
    const oracleSig = ecc.ecdsaSign(sellerSk, oracleMessage);

    return Script.fromOps([
      pushBytesOp(buyerPk),
      pushBytesOp(oracleSig),
      pushBytesOp(sellerPk),
      OP_1,
      pushBytesOp(preimage.redeemScript.bytecode)
    ]);
  };
};

export const ArbiReleaseSignatory = (arbiSk: Uint8Array, arbiPk: Uint8Array, buyerPk: Uint8Array, nonce: string) => {
  return (ecc: Ecc, input: UnsignedTxInput): Script => {
    const preimage = input.sigHashPreimage(ALL_BIP143);
    const hexNonce = Buffer.from(nonce, 'utf-8').toString('hex');
    const message = ACTION.ARBI_RELEASE + hexNonce;

    const oracleMessage = sha256(fromHex(message)); // ACTION BYTE - 01 + NONCE - 48656c6c6f
    const oracleSig = ecc.ecdsaSign(arbiSk, oracleMessage);

    return Script.fromOps([
      pushBytesOp(buyerPk),
      pushBytesOp(oracleSig),
      pushBytesOp(arbiPk),
      OP_2,
      pushBytesOp(preimage.redeemScript.bytecode)
    ]);
  };
};

export const BuyerReturnSignatory = (buyerSk: Uint8Array, buyerPk: Uint8Array, sellerPk: Uint8Array, nonce: string) => {
  return (ecc: Ecc, input: UnsignedTxInput): Script => {
    const preimage = input.sigHashPreimage(ALL_BIP143);
    const hexNonce = Buffer.from(nonce, 'utf-8').toString('hex');
    const message = ACTION.BUYER_RETURN + hexNonce;

    const oracleMessage = sha256(fromHex(message)); // ACTION BYTE - 01 + NONCE - 48656c6c6f
    const oracleSig = ecc.ecdsaSign(buyerSk, oracleMessage);

    return Script.fromOps([
      pushBytesOp(sellerPk),
      pushBytesOp(oracleSig),
      pushBytesOp(buyerPk),
      OP_3,
      pushBytesOp(preimage.redeemScript.bytecode)
    ]);
  };
};

export const ArbiReturnSignatory = (arbiSk: Uint8Array, arbiPk: Uint8Array, sellerPk: Uint8Array, nonce: string) => {
  return (ecc: Ecc, input: UnsignedTxInput): Script => {
    const preimage = input.sigHashPreimage(ALL_BIP143);
    const hexNonce = Buffer.from(nonce, 'utf-8').toString('hex');
    const message = ACTION.ARBI_RETURN + hexNonce;

    const oracleMessage = sha256(fromHex(message)); // ACTION BYTE - 01 + NONCE - 48656c6c6f
    const oracleSig = ecc.ecdsaSign(arbiSk, oracleMessage);

    return Script.fromOps([
      pushBytesOp(sellerPk),
      pushBytesOp(oracleSig),
      pushBytesOp(arbiPk),
      OP_4,
      pushBytesOp(preimage.redeemScript.bytecode)
    ]);
  };
};
