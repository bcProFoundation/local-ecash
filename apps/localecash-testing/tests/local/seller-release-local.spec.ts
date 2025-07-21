import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import {
  TEST_TIMEOUT_MS,
  TIME_TO_LOAD_UTXOS,
  buttonTexts,
  messageTexts,
  orderDetailText,
  statusTexts
} from '../../constants';
import { setupContext } from '../../utils';
import { createOrder } from '../../utils/orderUtils';

// Load environment variables
dotenv.config();
test.setTimeout(TEST_TIMEOUT_MS); // 3 minutes

test.describe('Release flow', () => {
  test('Seller release flow', async ({ browser }) => {
    // Create order first
    const { orderId, buyerContext, localLink } = await createOrder(browser);
    const { context, page } = buyerContext;

    const sellerContext = await setupContext(browser, 'Seller');
    // Navigate to the same order detail page as seller
    console.log(`Seller navigating to order: ${localLink}/order-detail?id=${orderId}`);
    await sellerContext.page.goto(`${localLink}/order-detail?id=${orderId}`);
    await sellerContext.page.waitForLoadState('domcontentloaded');

    // Wait for seller's order detail view to load
    await sellerContext.page.waitForSelector(`text=/${orderDetailText}/i`);

    // Verify seller action buttons
    await expect(sellerContext.page.locator(`button:has-text("${buttonTexts.decline}")`)).toBeVisible();
    await expect(sellerContext.page.locator(`button:has-text("${buttonTexts.escrow}")`)).toBeVisible();

    // Wait for escrow button to be fully enabled and clickable
    const escrowButton = sellerContext.page.locator(`button:has-text("${buttonTexts.escrow}")`);
    await expect(escrowButton).toBeEnabled({ timeout: TIME_TO_LOAD_UTXOS });

    // Step 8: Seller clicks Escrow button
    console.log('Seller clicking Escrow button...');
    await escrowButton.click();

    // Step 9: Wait for success notification and status change
    console.log('Waiting for escrow success notification...');

    // Wait for success message
    await expect(sellerContext.page.locator(`text=/${messageTexts.escrowSuccess}/i`)).toBeVisible({ timeout: 15000 });

    // Step 10: Verify order status changed to Escrowed
    await expect(sellerContext.page.locator(`text=/Status:.*${statusTexts.escrowed}/i`)).toBeVisible();

    // Step 11: Verify action buttons changed
    await expect(sellerContext.page.locator(`button:has-text("${buttonTexts.dispute}")`)).toBeVisible();
    await expect(sellerContext.page.locator(`button:has-text("${buttonTexts.release}")`)).toBeVisible();

    // Step 12: Seller clicks Release button
    console.log('Seller clicking Release button...');
    const releaseButton = sellerContext.page.locator(`button:has-text("${buttonTexts.release}")`);
    await releaseButton.click();

    // Step 13: Handle Confirmation modal
    console.log('Waiting for confirmation modal...');

    // Wait for confirmation modal to appear
    await expect(sellerContext.page.locator(`text=/${messageTexts.confirmationModal}/i`).first()).toBeVisible();

    // Initially, the checkbox should be unchecked and RELEASE button might be disabled
    const checkbox = sellerContext.page.locator('input[type="checkbox"]').first();
    const modalReleaseButton = sellerContext.page.locator(
      `button.confirm-btn:has-text("${buttonTexts.release.toUpperCase()}")`
    );

    // Verify checkbox is initially unchecked
    await expect(checkbox).not.toBeChecked();

    // Step 14: Click the checkbox
    console.log('Clicking confirmation checkbox...');
    await checkbox.click();

    // Verify checkbox is now checked
    await expect(checkbox).toBeChecked();

    // Verify RELEASE button is now enabled/visible
    await expect(modalReleaseButton).toBeVisible();
    await expect(modalReleaseButton).toBeEnabled();

    // Step 15: Click RELEASE button in modal
    console.log('Clicking RELEASE button in modal...');
    await modalReleaseButton.click();

    // Step 16: Wait for release to complete
    console.log('Waiting for release to complete...');

    // Wait for success indication (this might be a notification, status change, or redirect)
    // Adjust based on your app's behavior after release
    await expect(sellerContext.page.locator(`text=/${messageTexts.releaseSuccess}/i`)).toBeVisible({ timeout: 15000 });
    console.log('Order successfully released!');

    // Step 17: Buyer should automatically see updated status via socket
    console.log('Waiting for buyer to receive socket update...');

    // Wait for buyer's page to automatically update to Released status
    await expect(page.locator(`text=/Status:.*${statusTexts.released}/i`)).toBeVisible({ timeout: 10000 });

    // Verify success message elements appear
    await expect(page.locator(`text=/${messageTexts.releaseSuccessAlt}/i`)).toBeVisible();
    await expect(page.locator(`text=/${messageTexts.claimFunds}/i`)).toBeVisible();

    // Step 18: Buyer clicks CLAIM button
    console.log('Buyer clicking CLAIM button...');
    const claimButton = page.locator(`button:has-text("${buttonTexts.claim}")`);
    await expect(claimButton).toBeVisible();
    await claimButton.click();

    // Step 19: Wait for seller to receive socket update about claim
    console.log('Waiting for seller to receive socket update about claim...');

    // Seller's page should automatically update to show Completed status
    await expect(sellerContext.page.locator(`text=/Status:.*${statusTexts.completed}/i`)).toBeVisible({
      timeout: 10000
    });

    // Verify reclaim fee section appears automatically
    await expect(sellerContext.page.locator(`text=/${messageTexts.reclaimFee}/i`)).toBeVisible();

    // Get radio buttons and claim back fee button
    const sellerRadioButtons = sellerContext.page.locator('input[type="radio"]');
    const claimBackFeeButton = sellerContext.page.locator(`button:has-text("${buttonTexts.claimBackFee}")`);

    // Verify CLAIM BACK FEE button is initially disabled
    await expect(claimBackFeeButton).toBeDisabled();

    // Step 20: Seller makes random choice between radio button options
    console.log('Seller making random choice for security deposit...');

    // Get all seller radio button options
    const sellerRadioCount = await sellerRadioButtons.count();
    const sellerRandomIndex = Math.floor(Math.random() * sellerRadioCount);

    console.log(
      `Seller randomly selecting option ${sellerRandomIndex + 1} out of ${sellerRadioCount} available options`
    );

    // Get the label text for the selected option
    const sellerSelectedLabel = await sellerContext.page.locator('label').nth(sellerRandomIndex).textContent();
    console.log(`🎲 Seller selected option: ${sellerSelectedLabel}`);

    await sellerRadioButtons.nth(sellerRandomIndex).click();
    await expect(sellerRadioButtons.nth(sellerRandomIndex)).toBeChecked();

    // Verify CLAIM BACK FEE button is now enabled
    await expect(claimBackFeeButton).toBeEnabled();

    // Step 21: Seller clicks CLAIM BACK FEE
    console.log('Seller clicking CLAIM BACK FEE button...');
    await claimBackFeeButton.click();

    // Step 22: Wait for final state (socket update)
    console.log('Waiting for final order state...');

    // Verify the completion message appears
    await expect(sellerContext.page.locator(`text=/${messageTexts.orderCompleted}/i`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=/${messageTexts.errorTexts}/i`)).not.toBeVisible();

    console.log('Seller release flow - Random choice - completed successfully!');

    // Clean up
    await context.close();
    await sellerContext.context.close();
  });
});
