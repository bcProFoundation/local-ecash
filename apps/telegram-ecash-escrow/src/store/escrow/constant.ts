export enum ACTION {
  SELLER_RELEASE = '01', // Seller release fund to buyer
  ARBI_RELEASE = '02', // Arbi release fund to buyer
  BUYER_RETURN = '03', // Buyer cancel order, return fund to seller
  ARBI_RETURN = '04' // Seller return fund to seller
}
