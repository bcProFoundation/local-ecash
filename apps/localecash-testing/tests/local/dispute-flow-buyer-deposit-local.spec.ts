import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { TEST_TIMEOUT_MS, buttonTexts, messageTexts, statusTexts } from '../../constants';
import { delay } from '../../utils';
import {
  executeArbitratorReleaseToBuyer,
  executeArbitratorReturnToSeller,
  executeCommonDisputeFlow
} from '../../utils/disputeFlowUtils';

// Load environment variables
dotenv.config();
test.setTimeout(TEST_TIMEOUT_MS);

test.describe.serial('Dispute flow with buyer deposit', () => {
  test('Dispute flow with buyer deposit - Release to buyer with random security deposit choice', async ({
    browser
  }) => {
    const { buyerContext, sellerContext, arbContext } = await executeCommonDisputeFlow(browser, true);
    const { context: buyerContext_context, page: buyerPage } = buyerContext;

    // Step 7: Release to buyer case
    await executeArbitratorReleaseToBuyer(arbContext.page);

    // Step 8: Verify buyer receives the funds and sees security deposit options
    console.log('Step 8: Verifying buyer page shows successful release...');
    await expect(buyerPage.locator(`text=/Status:.*${statusTexts.released}/i`)).toBeVisible({ timeout: 15000 });
    await expect(buyerPage.locator(`text=/${messageTexts.successfullyReleased}/i`)).toBeVisible();

    // Step 9: Buyer makes random choice for security deposit options
    console.log('Step 9: Buyer making random choice for security deposit...');

    // Wait for buyer security deposit options to appear
    await delay(2000);
    await buyerPage.waitForSelector('input[type="radio"]', { timeout: 10000 });

    const buyerRadioButtons = buyerPage.locator('input[type="radio"]');
    const buyerRadioCount = await buyerRadioButtons.count();

    console.log(`Buyer has ${buyerRadioCount} radio button options available`);

    // Randomly select one of the buyer options
    const buyerRandomIndex = Math.floor(Math.random() * buyerRadioCount);
    console.log(`Buyer randomly selecting option ${buyerRandomIndex + 1} out of ${buyerRadioCount}`);

    // Get the label text for the selected option
    const buyerSelectedLabel = await buyerPage.locator('label').nth(buyerRandomIndex).textContent();
    console.log(`Buyer selected option: ${buyerSelectedLabel}`);

    await buyerRadioButtons.nth(buyerRandomIndex).click();
    await expect(buyerRadioButtons.nth(buyerRandomIndex)).toBeChecked();

    // Buyer clicks CLAIM button
    const buyerClaimButton = buyerPage.locator(`button:has-text("${buttonTexts.claim}")`);
    await expect(buyerClaimButton).toBeVisible();
    await buyerClaimButton.click();

    // Wait for final completion
    await expect(buyerPage.locator(`text=/${messageTexts.orderCompleted}/i`)).toBeVisible({ timeout: 15000 });
    await expect(buyerPage.locator(`text=/${messageTexts.errorTexts}/i`)).not.toBeVisible();

    console.log('Dispute flow with buyer deposit - Release to buyer with random choice - completed successfully!');

    // Clean up
    await buyerContext_context.close();
    await sellerContext.context.close();
    await arbContext.context.close();
  });

  test('Dispute flow with buyer deposit - Return to seller', async ({ browser }) => {
    const { buyerContext, sellerContext, arbContext } = await executeCommonDisputeFlow(browser, true);
    const { context: buyerContext_context, page: buyerPage } = buyerContext;

    // Step 7: Return to seller case
    await executeArbitratorReturnToSeller(arbContext.page);

    // Step 8: Verify seller receives the returned funds and gets radio button options
    console.log('Step 8: Verifying seller page shows successful return with claim options...');
    await expect(sellerContext.page.locator(`text=/Status:.*${statusTexts.returned}/i`)).toBeVisible({
      timeout: 15000
    });
    await expect(sellerContext.page.locator(`text=/${messageTexts.successfullyReturned}/i`)).toBeVisible();

    // Step: Seller makes random choice between radio button options
    console.log('Seller making random choice for security deposit claim...');

    // Get all seller radio button options
    const sellerRadioButtons = sellerContext.page.locator('input[type="radio"]');
    const sellerRadioCount = await sellerRadioButtons.count();

    console.log(`Seller has ${sellerRadioCount} radio button options available`);

    // Randomly select one of the seller options
    const sellerRandomIndex = Math.floor(Math.random() * sellerRadioCount);
    console.log(`Seller randomly selecting option ${sellerRandomIndex + 1} out of ${sellerRadioCount}`);

    // Get the label text for the selected option
    const sellerSelectedLabel = await sellerContext.page.locator('label').nth(sellerRandomIndex).textContent();
    console.log(`Seller selected option: ${sellerSelectedLabel}`);

    await sellerRadioButtons.nth(sellerRandomIndex).click();
    await expect(sellerRadioButtons.nth(sellerRandomIndex)).toBeChecked();

    // Click CLAIM FEE button
    const claimBackFeeButton = sellerContext.page.locator(`button:has-text("${buttonTexts.claim}")`);
    await expect(claimBackFeeButton).toBeVisible();
    await claimBackFeeButton.click();

    await expect(sellerContext.page.locator(`text=${messageTexts.orderCancelled}`)).toBeVisible();
    await expect(sellerContext.page.locator(`text=/${messageTexts.errorTexts}/i`)).not.toBeVisible();

    console.log('Dispute flow with buyer deposit - Return to seller - completed successfully!');

    // Clean up
    await buyerContext_context.close();
    await sellerContext.context.close();
    await arbContext.context.close();
  });
});
