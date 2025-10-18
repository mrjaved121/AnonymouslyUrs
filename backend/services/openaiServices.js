// backend/services/openaiService.js
const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    // Initialize OpenAI client with API key from environment variables
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePrayer(prayerData) {
    try {
      const {
        intention,
        situation,
        style,
        emotion,
        length,
        includeScripture
      } = prayerData;

      // Create a detailed prompt for prayer generation
      const prompt = this.buildPrayerPrompt(prayerData);

      console.log("🤖 Sending request to OpenAI...");

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo", // Using gpt-3.5-turbo for cost efficiency
        messages: [
          {
            role: "system",
            content: `You are a compassionate spiritual assistant that creates beautiful, meaningful Christian prayers. 
            Your prayers should be:
            - Biblically sound and theologically appropriate
            - Personal and heartfelt
            - Respectful and reverent
            - Encouraging and hopeful
            - Accessible to people of all Christian denominations
            
            Format your response exactly as follows:
            
            POETIC_PRAYER:
            [4-6 lines of poetic prayer, each on a new line]
            
            PROSE_PRAYER:
            [A paragraph of prose prayer that expands on the poetic prayer]
            
            ${includeScripture ? "SCRIPTURE:\n[One relevant Bible verse with reference]" : ""}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const prayerText = completion.choices[0].message.content;
      console.log("✅ OpenAI response received");
      
      return this.parsePrayerResponse(prayerText, includeScripture);

    } catch (error) {
      console.error('❌ OpenAI API Error:', error.message);
      
      // Handle specific OpenAI errors
      if (error.status === 401) {
        throw new Error('OpenAI API key is invalid');
      } else if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded');
      } else if (error.status === 500) {
        throw new Error('OpenAI server error');
      } else {
        throw new Error(`OpenAI service unavailable: ${error.message}`);
      }
    }
  }

  buildPrayerPrompt(prayerData) {
    const { intention, situation, style, emotion, length, includeScripture } = prayerData;

    let prompt = `Create a Christian prayer with the following details:

Primary Intention: ${intention}`;

    if (situation) {
      prompt += `\nSpecific Situation: ${situation}`;
    }

    prompt += `\nPrayer Style: ${this.getStyleDescription(style)}`;
    prompt += `\nEmotional Tone: ${this.getEmotionDescription(emotion)}`;
    prompt += `\nLength: ${this.getLengthDescription(length)}`;
    prompt += `\nInclude Scripture: ${includeScripture ? 'Yes' : 'No'}`;

    // Add day-specific context
    const today = new Date();
    const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" });
    const dayContext = this.getDayContext(dayOfWeek);
    
    prompt += `\n\nToday is ${dayOfWeek}. ${dayContext}`;

    prompt += `\n\nPlease create a prayer that is authentic, comforting, and spiritually uplifting.`;

    return prompt;
  }

  getStyleDescription(style) {
    const styles = {
      contemplative: "deep, reflective, meditative - focus on God's presence and inner peace",
      intercessory: "praying for others - compassionate, caring, focused on others' needs",
      petition: "personal requests - humble, trusting, specific to needs",
      thanksgiving: "gratitude and praise - joyful, appreciative, celebratory",
      reflective: "self-examination - thoughtful, introspective, growth-oriented",
      gospel: "scripture-based - biblical, faithful to Gospel teachings",
      worship: "adoration and praise - reverent, awe-filled, focused on God's nature"
    };
    return styles[style] || styles.contemplative;
  }

  getEmotionDescription(emotion) {
    const emotions = {
      peaceful: "calm, serene, trusting in God's peace",
      joyful: "happy, grateful, celebratory of God's goodness",
      hopeful: "optimistic, trusting, forward-looking with faith",
      humble: "modest, reverent, dependent on God's grace",
      strength: "courageous, resilient, faith-filled in challenges"
    };
    return emotions[emotion] || emotions.peaceful;
  }

  getLengthDescription(length) {
    const lengths = {
      short: "brief and concise (3-4 poetic lines, short prose)",
      medium: "moderate length (4-5 poetic lines, medium prose)",
      long: "comprehensive (5-6 poetic lines, longer prose)"
    };
    return lengths[length] || lengths.medium;
  }

  getDayContext(dayOfWeek) {
    const contexts = {
      Monday: "A new week begins - pray for strength, guidance, and fresh perspective.",
      Tuesday: "Midweek approaches - seek perseverance and trust in God's plan.",
      Wednesday: "The week continues - focus on wisdom and steady progress.",
      Thursday: "Preparation day - offer gratitude and intercession for others.",
      Friday: "Weekend approaches - reflect on Christ's love and find peace.",
      Saturday: "Day of rest - reflect on God's faithfulness and prepare for worship.",
      Sunday: "Day of worship - celebrate renewal, community, and God's grace."
    };
    return contexts[dayOfWeek] || "Each day is a gift from God - seek His presence and guidance.";
  }

  parsePrayerResponse(prayerText, includeScripture) {
    console.log("📖 Parsing OpenAI response...");
    
    // Initialize sections
    let poetic = [];
    let prose = "";
    let scripture = null;

    // Split by sections
    const lines = prayerText.split('\n');
    let currentSection = null;

    for (let line of lines) {
      line = line.trim();
      
      if (!line) continue;

      // Detect section headers
      if (line.startsWith('POETIC_PRAYER:') || line.startsWith('POETIC:')) {
        currentSection = 'poetic';
        const content = line.replace(/^(POETIC_PRAYER:|POETIC:)\s*/, '');
        if (content) poetic.push(content);
        continue;
      }

      if (line.startsWith('PROSE_PRAYER:') || line.startsWith('PROSE:')) {
        currentSection = 'prose';
        const content = line.replace(/^(PROSE_PRAYER:|PROSE:)\s*/, '');
        if (content) prose = content;
        continue;
      }

      if ((line.startsWith('SCRIPTURE:') || line.startsWith('BIBLE VERSE:')) && includeScripture) {
        currentSection = 'scripture';
        const content = line.replace(/^(SCRIPTURE:|BIBLE VERSE:)\s*/, '');
        if (content) scripture = content;
        continue;
      }

      // Add content to appropriate section
      if (currentSection === 'poetic') {
        poetic.push(line);
      } else if (currentSection === 'prose') {
        prose += (prose ? ' ' : '') + line;
      } else if (currentSection === 'scripture' && includeScripture) {
        scripture += (scripture ? ' ' : '') + line;
      }
    }

    // Fallback parsing if no explicit sections found
    if (poetic.length === 0 && prose === '') {
      return this.parseUnstructuredPrayer(prayerText, includeScripture);
    }

    // Clean up poetic lines (remove empty lines)
    poetic = poetic.filter(line => line.trim().length > 0);

    // Ensure we have at least some content
    if (poetic.length === 0) {
      poetic = ["Lord, in Your mercy, hear our prayer."];
    }

    if (!prose) {
      prose = `Heavenly Father, ${poetic.join(' ')} We trust in Your love and submit to Your will. In Jesus' name, Amen.`;
    }

    // Validate scripture format
    if (scripture && !this.isValidScripture(scripture)) {
      console.log("⚠️ Scripture format invalid, removing:", scripture);
      scripture = null;
    }

    console.log("✅ Prayer parsed successfully");
    return {
      poetic,
      prose,
      scripture
    };
  }

  parseUnstructuredPrayer(prayerText, includeScripture) {
    console.log("🔄 Using fallback parsing for unstructured response");
    
    const lines = prayerText.split('\n').filter(line => line.trim());
    let poetic = [];
    let proseLines = [];
    let scripture = null;

    // Simple heuristic: short lines are poetic, longer ones are prose
    for (let line of lines) {
      if (line.length < 80 && !line.includes(':')) {
        poetic.push(line);
      } else {
        proseLines.push(line);
      }
    }

    // Look for scripture patterns in prose
    if (includeScripture) {
      const scripturePattern = /[A-Za-z]+\s+\d+:\d+/;
      for (let i = 0; i < proseLines.length; i++) {
        if (scripturePattern.test(proseLines[i])) {
          scripture = proseLines[i];
          proseLines.splice(i, 1); // Remove scripture from prose
          break;
        }
      }
    }

    const prose = proseLines.join(' ');

    // Ensure minimum content
    if (poetic.length === 0) {
      poetic = ["Gracious God, we come before You with open hearts."];
    }

    if (!prose) {
      prose = `Lord, we bring these words before You. May they be pleasing in Your sight and may Your will be done in our lives. Amen.`;
    }

    return {
      poetic,
      prose,
      scripture
    };
  }

  isValidScripture(text) {
    // Basic scripture validation - should contain book name and chapter:verse
    const scripturePattern = /[A-Za-z]+\s+\d+:\d+/;
    return scripturePattern.test(text);
  }

  // Health check for OpenAI service
  async healthCheck() {
    try {
      // Simple completion to test API
      await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say 'OK'" }],
        max_tokens: 5
      });
      return { status: 'healthy', message: 'OpenAI API is accessible' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Export a singleton instance
module.exports = new OpenAIService();