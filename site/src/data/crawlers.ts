// Which crawlers may read the site, for robots.txt. Checked against each company's own documentation
// on Nov 28 2026 (links below). Three kinds, treated differently on purpose:
//
// 1. Search engines and AI SEARCH crawlers: allowed. These decide whether the store shows up in
//    Google, Bing, Apple Maps/Siri, ChatGPT search, Claude search and Perplexity answers.
// 2. USER-REQUESTED fetchers: allowed. They fetch a page only when a person asks an assistant about
//    it. OpenAI and Perplexity say robots.txt may not apply to these at all; listing them makes the
//    intent clear either way.
// 3. AI TRAINING crawlers: disallowed by default. Allowing search does not require allowing training,
//    and the owners have not decided to allow it. Flip `allowTraining` only on an owner decision.
//
// Google-Extended is a special case: it is not a crawler, it is a permission token. Disallowing it
// keeps the site out of Gemini model training AND out of "grounding" in the Gemini app and Vertex AI
// (Google's docs bundle the two). It does not affect Google Search or AI Overviews. Decision for
// Peter and Rin: allow Google-Extended if showing up in Gemini app answers matters more than opting
// out of Gemini training. Until then it follows `allowTraining`.
//
// Sources:
//   OpenAI      https://developers.openai.com/api/docs/bots
//   Anthropic   https://support.claude.com/en/articles/8896518
//   Perplexity  https://docs.perplexity.ai/guides/perplexitybot
//   Google      https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
//   Apple       https://support.apple.com/en-us/119829
// robots.txt is a request, not a lock: private pages are protected by PINs, sessions and order codes.

export const crawlerPolicy = {
  allowTraining: false,
  allowGoogleExtended: false,
};

export const SEARCH_ENGINES = ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'Slurp', 'YandexBot'];
export const AI_SEARCH = ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'DuckAssistBot'];
export const AI_USER_FETCHERS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'Meta-ExternalFetcher', 'MistralAI-User'];
export const AI_TRAINING = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'Applebot-Extended', 'CCBot', 'Meta-ExternalAgent', 'Bytespider', 'Amazonbot', 'cohere-training-data-crawler', 'Diffbot', 'Omgilibot', 'img2dataset'];

/** Paths no crawler needs. Listed for every group, because a crawler that matches a named group ignores the `*` group. */
export const DISALLOW = ['/counter', '/api/', '/account', '/ship/done', '/cards/done', '/return/', '/labels/', '/track?', '/demo-label.html', '/indexnow.txt'];
