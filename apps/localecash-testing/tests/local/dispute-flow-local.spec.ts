import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { TEST_TIMEOUT_MS, buttonTexts, messageTexts, statusTexts } from '../../constants';
import {
  executeArbitratorReleaseToBuyer,
  executeArbitratorReturnToSeller,
  executeCommonDisputeFlow
} from '../../utils/disputeFlowUtils';

// Load environment variables
dotenv.config();
test.setTimeout(TEST_TIMEOUT_MS);

test.describe.serial('Dispute flow', () => {
  test('Dispute flow - Release to buyer', async ({ browser }) => {
    const { buyerContext, sellerContext, arbContext } = await executeCommonDisputeFlow(browser);
    const { context: buyerContext_context, page: buyerPage } = buyerContext;

    // Step 7: Release to buyer case
    await executeArbitratorReleaseToBuyer(arbContext.page);

    // Step 8: Verify buyer receives the funds and can claim
    console.log('Step 8: Verifying buyer page shows successful release...');
    await expect(buyerPage.locator(`text=/Status:.*${statusTexts.released}/i`)).toBeVisible({ timeout: 15000 });
    await expect(buyerPage.locator(`text=/${messageTexts.successfullyReleased}/i`)).toBeVisible();

    // Buyer should see CLAIM button and click it
    const buyerClaimButton = buyerPage.locator(`button:has-text("${buttonTexts.claim}")`);
    await expect(buyerClaimButton).toBeVisible();
    await buyerClaimButton.click();

    await expect(buyerContext.page.locator(`text=${messageTexts.orderCompleted}`)).toBeVisible();
    await expect(buyerContext.page.locator(`text=/${messageTexts.errorTexts}/i`)).not.toBeVisible();

    console.log('Dispute flow - Release to buyer - completed successfully!');

    // Clean up
    await buyerContext_context.close();
    await sellerContext.context.close();
    await arbContext.context.close();
  });

  test('Dispute flow - Return to seller', async ({ browser }) => {
    const { buyerContext, sellerContext, arbContext } = await executeCommonDisputeFlow(browser);
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

    console.log('Dispute flow - Return to seller - completed successfully!');

    // Clean up
    await buyerContext_context.close();
    await sellerContext.context.close();
    await arbContext.context.close();
  });
});
