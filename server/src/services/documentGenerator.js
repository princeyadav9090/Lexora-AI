/**
 * Document Generator Proxy for Lexora AI
 * Proxies dynamic natural-language document generation requests to the Python AI engine.
 */

const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

export const generateLegalDocument = async (prompt, jurisdiction) => {
  try {
    const response = await fetch(`${aiBackendUrl}/api/v1/research/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        jurisdiction: jurisdiction || 'India'
      })
    });

    if (response.ok) {
      const result = await response.json();
      let draftText = result.draft;
      // Remove markdown code block wrappers if present
      draftText = draftText.replace(/^```markdown\n?/m, '').replace(/```$/m, '').trim();
      return draftText;
    } else {
      console.warn(`Python AI Backend returned ${response.status} for document generation.`);
      throw new Error(`AI Engine Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to communicate with Python AI Engine for document generation:', error.message);
    throw new Error('Failed to reach AI engine for document drafting.');
  }
};
