export const INTENT_RULES = {
  greetings: ['hi', 'hello', 'hey', 'hola', 'greetings', 'yo'],
  fillers: [
    'i am looking for',
    'i\'m looking for',
    'find me',
    'search for',
    'can you find',
    'do you have',
    'looking for',
    'show me'
  ],
  types: {
    tenders: ['tender', 'tender opportunity', 'bid', 'contract', 'procurement'],
    grants: ['grant', 'grant opportunity', 'funding', 'scholarship', 'subsidies'],
    equity: ['equity', 'investment', 'vc', 'venture capital', 'angel investor', 'seed funding'],
  },
  domain_keywords: [
    'opportunity', 'funding', 'grant', 'tender', 'equity', 'investment', 
    'project', 'contract', 'bid', 'scholarship', 'money', 'financial', 
    'support', 'venture', 'capital', 'funding'
  ]
};

export function analyzeIntent(query: string) {
  const lowerQuery = query.toLowerCase().trim();
  
  if (INTENT_RULES.greetings.some(g => lowerQuery === g)) {
    return { type: 'greeting', cleaned: lowerQuery };
  }
  
  let cleaned = lowerQuery;
  INTENT_RULES.fillers.forEach(filler => {
    cleaned = cleaned.replace(filler, '');
  });
  
  cleaned = cleaned.trim();
  
  if (!cleaned) {
    return { type: 'vague', cleaned: lowerQuery };
  }

  // 1. Check for specific type match
  for (const [type, keywords] of Object.entries(INTENT_RULES.types)) {
    if (keywords.some(kw => cleaned.includes(kw))) {
      return { type: 'type_match', opportunityType: type, cleaned };
    }
  }

  // 2. Check if it's related to the domain at all
  const isDomainRelated = INTENT_RULES.domain_keywords.some(kw => cleaned.includes(kw));
  
  if (!isDomainRelated) {
    return { type: 'unrelated', cleaned };
  }
  
  return { type: 'search', cleaned };
}
