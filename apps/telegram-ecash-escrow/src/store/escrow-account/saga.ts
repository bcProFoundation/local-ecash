import { GenerateAccountType } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const generateEscrowAccount = createAction<GenerateAccountType>('account/generateEscrowAccount');
