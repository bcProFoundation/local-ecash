import { expect } from '@playwright/test';
import { buttonTexts, messageTexts, orderDetailText, statusTexts, TIME_TO_LOAD_UTXOS } from '../constants';
import { setupContext } from './index';
import { createOrder, createOrderWithDeposit } from './orderUtils';

/**
 * Executes the common dispute flow setup that's shared between both dispute test files
 * This includes: order creation → seller escrow → dispute creation → arbitrator navigation → resolve modal
 */
export async function executeCommonDisputeFlow(browser: any, withDeposit: boolean = false) {
  // Create order using appropriate function based on deposit requirement
  const orderFunction = withDeposit ? createOrderWithDeposit : createOrder;
  const { orderId, buyerContext, localLink } = await orderFunction(browser);
  const { context: buyerContext_context, page: buyerPage } = buyerContext;

  // Setup seller context and navigate to the order
  const sellerContext = await setupContext(browser, 'Seller');
  console.log(`Seller navigating to order: ${localLink}/order-detail?id=${orderId}`);
  await sellerContext.page.goto(`${localLink}/order-detail?id=${orderId}`);
  await sellerContext.page.waitForLoadState('domcontentloaded');

  // Wait for seller's order detail view to load
  await sellerContext.page.waitForSelector(`text=/${orderDetailText}/i`);

  // Verify seller action buttons are present and click Escrow
  const escrowButton = sellerContext.page.locator(`button:has-text("${buttonTexts.escrow}")`);
  await expect(escrowButton).toBeEnabled({ timeout: TIME_TO_LOAD_UTXOS });

  // Step 1: Seller clicks Escrow button
  console.log('Seller clicking Escrow button...');
  await escrowButton.click();

  // Wait for escrow to complete on seller's side
  console.log('Waiting for escrow to complete...');
  await expect(sellerContext.page.locator(`text=/Status:.*${statusTexts.escrowed}/i`)).toBeVisible({ timeout: 15000 });
  await expect(sellerContext.page.locator(`text=/${messageTexts.escrowSuccess}/i`)).toBeVisible();

  // Step 2: Seller clicks Dispute button
  console.log('Step 2: Seller clicking Dispute button...');
  const disputeButton = sellerContext.page.locator(`button:has-text("${buttonTexts.dispute}")`);
  await expect(disputeButton).toBeVisible();
  await disputeButton.click();

  // Step 3: Fill dispute reason and create dispute
  console.log('Step 3: Filling dispute reason and creating dispute...');

  // Wait for dispute modal to appear - target the heading specifically
  await expect(sellerContext.page.locator('h2:has-text("Create dispute")')).toBeVisible({ timeout: 5000 });

  // Fill reason field with "create-dispute"
  const reasonField = sellerContext.page
    .locator(
      'input[placeholder*="Reason"], textarea[placeholder*="Reason"], input[name*="reason"], textarea[name*="reason"]'
    )
    .first();
  await expect(reasonField).toBeVisible();
  await reasonField.fill('create-dispute');

  // Click CREATE DISPUTE button
  const createDisputeButton = sellerContext.page.locator(`button:has-text("${buttonTexts.createDispute}")`);
  await expect(createDisputeButton).toBeVisible();
  await createDisputeButton.click();

  // Wait for dispute to be created and status to change
  console.log('Waiting for dispute to be created...');
  await expect(sellerContext.page.locator(`text=/Status:.*${statusTexts.dispute}/i`)).toBeVisible({ timeout: 15000 });

  // Step 4: Setup arbitrator context and navigate to order
  const arbContext = await setupContext(browser, 'Arb');
  console.log(`Arbitrator navigating to order: ${localLink}/order-detail?id=${orderId}`);
  await arbContext.page.goto(`${localLink}/order-detail?id=${orderId}`);
  await arbContext.page.waitForLoadState('domcontentloaded');

  // Wait for arbitrator's order detail view to load
  await arbContext.page.waitForSelector(`text=/${orderDetailText}/i`);

  // Verify dispute status is visible and "Please resolve the dispute" message
  await expect(arbContext.page.locator(`text=/Status:.*${statusTexts.dispute}/i`)).toBeVisible();
  await expect(arbContext.page.locator(`text=/${messageTexts.pleaseResolveDispute}/i`)).toBeVisible();

  // Step 5: Arbitrator clicks "GO TO DISPUTE" button
  console.log('Step 5: Arbitrator clicking GO TO DISPUTE button...');
  const goToDisputeButton = arbContext.page.locator(`button:has-text("${buttonTexts.goToDispute}")`);
  await expect(goToDisputeButton).toBeVisible();
  await goToDisputeButton.click();

  // Wait for navigation to dispute detail page
  console.log('Waiting for navigation to dispute detail...');
  await arbContext.page.waitForURL('**/dispute-detail**', { timeout: 10000 });
  await arbContext.page.waitForLoadState('domcontentloaded');

  // Verify we're on dispute detail page
  await expect(arbContext.page.locator(`text=/${messageTexts.disputeDetail}/i`)).toBeVisible({ timeout: 10000 });

  // Step 6: Arbitrator clicks RESOLVE button
  console.log('Step 6: Arbitrator clicking RESOLVE button...');
  const resolveButton = arbContext.page.locator(`button:has-text("${buttonTexts.resolve}")`);
  await expect(resolveButton).toBeVisible();
  await resolveButton.click();

  // Wait for resolve modal to appear
  console.log('Waiting for resolve dispute modal...');
  await expect(arbContext.page.locator(`text=/${messageTexts.resolveDispute}/i`)).toBeVisible({ timeout: 5000 });

  return {
    buyerContext: { context: buyerContext_context, page: buyerPage },
    sellerContext,
    arbContext,
    localLink,
    orderId
  };
}

/**
 * Handles arbitrator releasing funds to buyer in dispute resolution
 */
export async function executeArbitratorReleaseToBuyer(arbPage: any, buyerName?: string) {
  console.log('Arbitrator resolving dispute - Release to buyer...');

  // Get buyer name from the input placeholder "Type @name to release"
  const buyerNameInput = arbPage.locator('#input-buyer');
  await expect(buyerNameInput).toBeVisible();

  if (!buyerName) {
    const placeholder = await buyerNameInput.getAttribute('placeholder');
    const buyerNameMatch = placeholder?.match(/@(\w+)/);
    buyerName = buyerNameMatch ? `@${buyerNameMatch[1]}` : '@testArbb'; // fallback name
  }

  console.log(`Using buyer name: ${buyerName}`);

  // Fill in buyer name in the input field
  await buyerNameInput.fill(buyerName);

  // Click "Release to Buyer" button
  const releaseToBuyerButton = arbPage.locator(`button:has-text("${buttonTexts.releaseToBuyer}")`);
  await expect(releaseToBuyerButton).toBeVisible();
  await releaseToBuyerButton.click();
}

/**
 * Handles arbitrator returning funds to seller in dispute resolution
 */
export async function executeArbitratorReturnToSeller(arbPage: any, sellerName?: string) {
  console.log('Arbitrator resolving dispute - Return to seller...');

  // Click on SELLER tab
  const sellerTab = arbPage.locator('#full-width-tab-Seller');
  await expect(sellerTab).toBeVisible();
  await sellerTab.click();

  // Get seller name from the input placeholder "Type @name to return"
  const sellerNameInput = arbPage.locator('#input-seller');
  await expect(sellerNameInput).toBeVisible();

  if (!sellerName) {
    const placeholder = await sellerNameInput.getAttribute('placeholder');
    const sellerNameMatch = placeholder?.match(/@(\w+)/);
    sellerName = sellerNameMatch ? `@${sellerNameMatch[1]}` : '@BoHsuu'; // fallback name
  }

  console.log(`Using seller name: ${sellerName}`);

  // Fill in seller name in the input field
  await sellerNameInput.fill(sellerName);

  // Click "Return to Seller" button
  const returnToSellerButton = arbPage.locator(`button:has-text("${buttonTexts.returnToSeller}")`);
  await expect(returnToSellerButton).toBeVisible();
  await returnToSellerButton.click();
}
