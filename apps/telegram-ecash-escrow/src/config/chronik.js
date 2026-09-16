/** @typedef {string[]} ChronikUrlList */

/** Default XEC Chronik endpoints (PayButton-style failover). */
const DEFAULT_XEC_CHRONIK_URLS = [
  'https://xec.paybutton.io',
  'https://chronik.pay2stay.com/xec',
  'https://chronik.danaverse.org/xec',
  'https://chronik.e.cash',
  'https://chronik.lixi.app/xec'
];

const HOSTS_REQUIRING_XEC_SUFFIX = /chronik\.(pay2stay|danaverse|lixi\.app)(?:\/xec\d*)?$/;

function normalizeXecChronikUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.endsWith('/xec') || trimmed.endsWith('/xec2')) {
    return trimmed;
  }

  if (HOSTS_REQUIRING_XEC_SUFFIX.test(trimmed) || trimmed === 'https://chronik.pay2stay.com') {
    return `${trimmed.replace(/\/$/, '')}/xec`;
  }

  return trimmed;
}

/**
 * @param {string | undefined} envValue
 * @returns {ChronikUrlList}
 */
function parseXecChronikUrls(envValue) {
  if (!envValue?.trim()) {
    return [...DEFAULT_XEC_CHRONIK_URLS];
  }

  const urls = envValue.split(',').map(normalizeXecChronikUrl).filter(Boolean);
  return urls.length > 0 ? urls : [...DEFAULT_XEC_CHRONIK_URLS];
}

module.exports = {
  DEFAULT_XEC_CHRONIK_URLS,
  normalizeXecChronikUrl,
  parseXecChronikUrls
};
