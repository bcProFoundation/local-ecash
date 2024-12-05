import { GenerateAccountType, ImportAccountType } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const generateEscrowAccount = createAction<GenerateAccountType>('account/generateEscrowAccount');
export const importEscrowAccount = createAction<ImportAccountType>('account/importEscrowAccount');
