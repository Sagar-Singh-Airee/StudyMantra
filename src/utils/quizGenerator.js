export function generateQuizFromText(text, numQuestions = 10) {
  // Split text into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200);

  if (sentences.length < numQuestions) {
    numQuestions = sentences.length;
  }

  const quizQuestions = [];

  for (let i = 0; i < numQuestions; i++) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    const words = sentence.split(' ').filter(w => w.length > 4);
    
    if (words.length < 3) continue;

    // Pick a random important word
    const answerWord = words[Math.floor(Math.random() * words.length)];
    const questionText = sentence.replace(answerWord, '______');

    // Generate wrong options
    const allWords = text.split(/\s+/).filter(w => w.length > 4 && w !== answerWord);
    const wrongOptions = [];
    
    while (wrongOptions.length < 3 && allWords.length > 0) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      if (!wrongOptions.includes(randomWord)) {
        wrongOptions.push(randomWord);
      }
    }

    const options = [...wrongOptions, answerWord].sort(() => Math.random() - 0.5);

    quizQuestions.push({
      id: `q${i + 1}`,
      question: questionText,
      options: options,
      correctAnswer: answerWord,
      explanation: `The correct word is "${answerWord}" based on the context.`,
    });
  }

  return quizQuestions;
}

// Generate quiz using AI (optional - requires API key)
export async function generateQuizWithAI(text, numQuestions = 10) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Generate ${numQuestions} multiple choice questions from this text. Return ONLY valid JSON array with no markdown or explanation:

${text.substring(0, 2000)}

Format:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why A is correct"
  }
]`
          }
        ],
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('AI quiz generation failed:', error);
    // Fallback to local generation
    return generateQuizFromText(text, numQuestions);
  }
}