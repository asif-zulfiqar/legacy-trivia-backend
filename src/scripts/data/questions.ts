// 100 relationship-themed easy questions (source: client PDF).
// Note: two questions share number 27 in the source — both included (101 unique entries).
// Seeded into BOTH Level 1 and Level 2; admin panel can split/differentiate per level later.

export interface SeedQuestion {
  text: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export const QUESTIONS: SeedQuestion[] = [
  // Q1-Q10
  { text: 'What is a kind way to greet your partner?', options: { A: 'Say hello quickly', B: 'Say hello warmly', C: 'Stay quiet', D: 'Look away' }, correctOption: 'B' },
  { text: 'What shows care in a relationship?', options: { A: 'Listening quickly', B: 'Talking more', C: 'Listening carefully', D: 'Ignoring' }, correctOption: 'C' },
  { text: 'What is a sweet way to say goodnight?', options: { A: 'Say goodnight softly', B: 'Say goodnight quickly', C: 'Say nothing', D: 'Leave' }, correctOption: 'A' },
  { text: 'What is a good way to spend time together?', options: { A: 'Sit silently', B: 'Talk a little', C: 'Ignore each other', D: 'Talk and laugh' }, correctOption: 'D' },
  { text: 'What shows respect?', options: { A: 'Speaking softly', B: 'Speaking politely', C: 'Shouting', D: 'Ignoring' }, correctOption: 'B' },
  { text: 'What is a caring action?', options: { A: 'Helping sometimes', B: 'Helping when needed', C: 'Avoiding', D: 'Leaving' }, correctOption: 'B' },
  { text: 'What is a simple way to show love?', options: { A: 'Saying kind things', B: 'Doing kind things', C: 'Ignoring', D: 'Complaining' }, correctOption: 'B' },
  { text: 'What makes a partner feel happy?', options: { A: 'Feeling noticed', B: 'Feeling appreciated', C: 'Feeling ignored', D: 'Feeling rushed' }, correctOption: 'B' },
  { text: 'What is a good habit in a relationship?', options: { A: 'Checking in sometimes', B: 'Ignoring', C: 'Checking in often', D: 'Avoiding' }, correctOption: 'C' },
  { text: 'What is a kind response when your partner is sad?', options: { A: 'Comfort them quickly', B: 'Change topic', C: 'Ignore them', D: 'Comfort them gently' }, correctOption: 'D' },

  // Q11-Q20
  { text: "What is a caring way to respond when your partner seems quiet?", options: { A: "Ask gently how they're feeling", B: "Ask quickly what's wrong", C: 'Ignore them', D: 'Change the topic' }, correctOption: 'A' },
  { text: 'What shows true attention in a relationship?', options: { A: 'Remembering what they said', B: 'Remembering how they felt', C: 'Forgetting small things', D: 'Ignoring details' }, correctOption: 'B' },
  { text: "When your partner asks for space, what's healthiest?", options: { A: 'Respect it while staying emotionally available', B: 'Respect it and completely disappear', C: 'Keep asking questions', D: 'Take it personally' }, correctOption: 'A' },
  { text: 'What makes an apology meaningful?', options: { A: 'Saying sorry sincerely', B: 'Saying sorry and changing behavior', C: 'Saying it quickly', D: 'Avoiding the topic' }, correctOption: 'B' },
  { text: 'What matters most when listening?', options: { A: 'Hearing their words', B: 'Understanding their feelings', C: 'Waiting your turn', D: 'Giving advice' }, correctOption: 'B' },
  { text: 'What is a subtle sign of emotional safety?', options: { A: 'Feeling comfortable talking', B: 'Feeling comfortable being imperfect', C: 'Always agreeing', D: 'Avoiding conflict' }, correctOption: 'B' },
  { text: 'What shows real commitment?', options: { A: 'Talking about the future', B: 'Planning the future together', C: 'Thinking about the future', D: 'Mentioning ideas' }, correctOption: 'B' },
  { text: 'What is the best way to handle confusion?', options: { A: 'Assume good intent', B: 'Ask calmly for clarity', C: 'Stay quiet', D: 'React emotionally' }, correctOption: 'B' },
  { text: 'What does consistent effort show?', options: { A: 'Habit', B: 'Responsibility', C: 'Genuine care', D: 'Routine' }, correctOption: 'C' },
  { text: 'What is a quiet way to show love?', options: { A: 'Saying kind words', B: 'Doing kind actions', C: 'Thinking kind thoughts', D: 'Avoiding conflict' }, correctOption: 'B' },

  // Q21-Q30
  { text: 'What is a thoughtful way to start a conversation with your partner?', options: { A: 'Talk about yourself first', B: 'Greet them warmly and ask about their day', C: 'Stay silent', D: 'Wait for them to speak first' }, correctOption: 'B' },
  { text: 'What shows emotional care in a relationship?', options: { A: 'Remembering what upsets them', B: 'Remembering what they like', C: 'Ignoring their mood', D: 'Talking over them' }, correctOption: 'B' },
  { text: 'When your partner is stressed, what is helpful?', options: { A: 'Give advice immediately', B: 'Stay calm and listen', C: 'Leave them alone without saying anything', D: 'Change the topic' }, correctOption: 'B' },
  { text: 'What is a respectful way to disagree?', options: { A: 'Prove your point', B: 'Stay calm and listen', C: 'Stay silent', D: 'End the conversation' }, correctOption: 'B' },
  { text: 'What shows emotional interest?', options: { A: 'Asking about their feelings', B: 'Asking about their schedule', C: 'Talking about yourself', D: 'Checking your phone' }, correctOption: 'A' },
  { text: 'What is a healthy reaction to a misunderstanding?', options: { A: 'Argue more', B: 'Clarify calmly', C: 'Ignore it', D: 'Walk away angry' }, correctOption: 'B' },
  { text: 'What makes a partner feel appreciated?', options: { A: 'Criticizing them', B: 'Noticing their efforts', C: 'Ignoring them', D: 'Testing them' }, correctOption: 'B' },
  { text: 'What does it mean if someone includes you in future plans?', options: { A: 'They are unsure', B: 'They feel secure about the relationship', C: 'They are being polite', D: 'They are avoiding commitment' }, correctOption: 'B' },
  { text: 'What is a good way to end a day with your partner?', options: { A: 'Ignore them', B: 'Say something kind before sleep', C: 'Stay on your phone', D: 'Leave quietly' }, correctOption: 'B' },
  { text: 'What shows real interest in your partner?', options: { A: 'Remembering small details', B: 'Asking random questions', C: 'Talking more than listening', D: 'Avoiding deep talks' }, correctOption: 'A' },

  // Q31-Q40
  { text: 'What is a caring response when your partner is sad?', options: { A: 'Tell them to stop thinking about it', B: 'Listen and stay present', C: 'Change the subject', D: 'Leave them alone' }, correctOption: 'B' },
  { text: 'What builds trust over time?', options: { A: 'Big promises', B: 'Consistent actions', C: 'Occasional effort', D: 'Talking a lot' }, correctOption: 'B' },
  { text: 'What is a kind way to show support?', options: { A: 'Ignore problems', B: 'Offer help when needed', C: 'Give advice only', D: 'Stay distant' }, correctOption: 'B' },
  { text: 'What shows good communication?', options: { A: 'Interrupting less', B: 'Listening and responding clearly', C: 'Talking more', D: 'Avoiding conflict' }, correctOption: 'B' },
  { text: 'What is a healthy emotional habit?', options: { A: 'Bottling feelings', B: 'Expressing feelings calmly', C: 'Ignoring emotions', D: 'Blaming others' }, correctOption: 'B' },
  { text: 'What makes someone feel safe in a relationship?', options: { A: 'Being judged', B: 'Being accepted', C: 'Being corrected often', D: 'Being tested' }, correctOption: 'B' },
  { text: 'What shows kindness in daily life?', options: { A: 'Helping without being asked', B: 'Helping only when asked', C: 'Avoiding responsibility', D: 'Ignoring needs' }, correctOption: 'A' },
  { text: 'What is a good response to good news?', options: { A: 'Stay neutral', B: 'Celebrate with them', C: 'Change topic', D: 'Stay silent' }, correctOption: 'B' },
  { text: 'What shows patience in love?', options: { A: 'Waiting calmly', B: 'Waiting impatiently', C: 'Leaving quickly', D: 'Interrupting' }, correctOption: 'A' },
  { text: 'What is a healthy relationship habit?', options: { A: 'Ignoring each other', B: 'Checking in regularly', C: 'Avoiding talks', D: 'Arguing often' }, correctOption: 'B' },

  // Q41-Q50
  { text: 'What shows emotional understanding?', options: { A: 'Guessing feelings', B: 'Recognizing feelings', C: 'Ignoring feelings', D: 'Changing feelings' }, correctOption: 'B' },
  { text: 'What is a caring message?', options: { A: '"Hope your day is okay"', B: '"Hope your day is great"', C: 'No message', D: '"Whatever"' }, correctOption: 'B' },
  { text: 'What shows respect in speech?', options: { A: 'Speaking calmly', B: 'Speaking loudly', C: 'Interrupting', D: 'Ignoring' }, correctOption: 'A' },
  { text: 'What is a good way to handle silence?', options: { A: 'Assume anger', B: 'Respect it calmly', C: 'Fill it quickly', D: 'Avoid it' }, correctOption: 'B' },
  { text: 'What builds connection between partners?', options: { A: 'Honest sharing', B: 'Avoiding topics', C: 'Silent treatment', D: 'Distance' }, correctOption: 'A' },
  { text: 'What shows care in action?', options: { A: 'Small helpful gestures', B: 'Ignoring needs', C: 'Complaining', D: 'Criticizing' }, correctOption: 'A' },
  { text: 'What is a loving reaction to mistakes?', options: { A: 'Learning from them', B: 'Ignoring them', C: 'Punishing', D: 'Avoiding' }, correctOption: 'A' },
  { text: 'What makes communication strong?', options: { A: 'Speaking clearly', B: 'Listening carefully', C: 'Talking fast', D: 'Interrupting' }, correctOption: 'B' },
  { text: 'What is a sweet habit?', options: { A: 'Saying kind words often', B: 'Saying nothing', C: 'Complaining often', D: 'Ignoring' }, correctOption: 'A' },
  { text: 'What shows emotional closeness?', options: { A: 'Feeling connected', B: 'Feeling distant', C: 'Feeling confused', D: 'Feeling pressured' }, correctOption: 'A' },

  // Q51-Q60
  { text: 'What is a supportive action?', options: { A: 'Encouraging effort', B: 'Criticizing effort', C: 'Ignoring effort', D: 'Comparing effort' }, correctOption: 'A' },
  { text: 'What shows attention in love?', options: { A: 'Listening carefully', B: 'Looking away', C: 'Multitasking', D: 'Ignoring' }, correctOption: 'A' },
  { text: 'What is a caring habit?', options: { A: 'Checking on them', B: 'Forgetting them', C: 'Avoiding them', D: 'Ignoring them' }, correctOption: 'A' },
  { text: 'What makes a relationship strong?', options: { A: 'Effort from both sides', B: 'One-sided effort', C: 'No effort', D: 'Random effort' }, correctOption: 'A' },
  { text: 'What is a kind reaction?', options: { A: 'Staying calm', B: 'Getting angry', C: 'Leaving', D: 'Ignoring' }, correctOption: 'A' },
  { text: 'What shows appreciation?', options: { A: 'Saying thank you', B: 'Staying silent', C: 'Complaining', D: 'Ignoring' }, correctOption: 'A' },
  { text: 'What is emotional care?', options: { A: 'Being thoughtful', B: 'Being careless', C: 'Being distant', D: 'Being rude' }, correctOption: 'A' },
  { text: 'What builds love over time?', options: { A: 'Consistent kindness', B: 'Occasional kindness', C: 'No kindness', D: 'Random actions' }, correctOption: 'A' },
  { text: 'What shows trust?', options: { A: 'Being honest', B: 'Hiding things', C: 'Avoiding talk', D: 'Lying' }, correctOption: 'A' },
  { text: 'What is a healthy choice in conflict?', options: { A: 'Listening first', B: 'Arguing first', C: 'Leaving first', D: 'Ignoring first' }, correctOption: 'A' },

  // Q61-Q70
  { text: 'What shows emotional support?', options: { A: 'Being present', B: 'Being absent', C: 'Being distracted', D: 'Being distant' }, correctOption: 'A' },
  { text: 'What is a loving action?', options: { A: 'Giving attention', B: 'Taking attention', C: 'Ignoring', D: 'Avoiding' }, correctOption: 'A' },
  { text: 'What builds understanding?', options: { A: 'Honest talks', B: 'Silent treatment', C: 'Avoiding topics', D: 'Arguments' }, correctOption: 'A' },
  { text: 'What shows care in daily life?', options: { A: 'Small thoughtful acts', B: 'No actions', C: 'Random actions', D: 'Ignoring' }, correctOption: 'A' },
  { text: 'What is a good relationship habit?', options: { A: 'Saying kind things', B: 'Saying rude things', C: 'Saying nothing', D: 'Avoiding' }, correctOption: 'A' },
  { text: 'What shows respect?', options: { A: 'Listening fully', B: 'Interrupting', C: 'Ignoring', D: 'Talking over' }, correctOption: 'A' },
  { text: 'What makes someone feel loved?', options: { A: 'Being valued', B: 'Being ignored', C: 'Being judged', D: 'Being avoided' }, correctOption: 'A' },
  { text: 'What is emotional support?', options: { A: 'Being there', B: 'Leaving', C: 'Ignoring', D: 'Avoiding' }, correctOption: 'A' },
  { text: 'What builds closeness?', options: { A: 'Sharing honestly', B: 'Hiding feelings', C: 'Avoiding talks', D: 'Silence' }, correctOption: 'A' },
  { text: 'What is a kind habit?', options: { A: 'Checking in', B: 'Ignoring', C: 'Avoiding', D: 'Forgetting' }, correctOption: 'A' },

  // Q71-Q80
  { text: 'What keeps love strong?', options: { A: 'Consistency', B: 'Random effort', C: 'No effort', D: 'Distance' }, correctOption: 'A' },
  { text: 'What is a kind way to respond when your partner shares a problem?', options: { A: 'Listen and show care', B: 'Change the topic', C: 'Stay silent', D: 'Walk away' }, correctOption: 'A' },
  { text: 'What shows emotional support?', options: { A: 'Being present for them', B: 'Giving quick advice', C: 'Ignoring feelings', D: 'Avoiding conversations' }, correctOption: 'A' },
  { text: 'What is a good way to show interest?', options: { A: 'Asking thoughtful questions', B: 'Talking about yourself', C: 'Looking away', D: 'Interrupting' }, correctOption: 'A' },
  { text: 'What helps a relationship feel balanced?', options: { A: 'Equal effort from both sides', B: 'One person doing everything', C: 'No effort at all', D: 'Random effort' }, correctOption: 'A' },
  { text: 'What is a caring response to stress?', options: { A: 'Offering calm support', B: 'Ignoring the situation', C: 'Adding pressure', D: 'Leaving them alone' }, correctOption: 'A' },
  { text: 'What shows emotional respect?', options: { A: 'Accepting their feelings', B: 'Judging their feelings', C: 'Ignoring their feelings', D: 'Dismissing their feelings' }, correctOption: 'A' },
  { text: 'What is a loving habit?', options: { A: 'Remembering important details', B: 'Forgetting everything', C: 'Ignoring details', D: 'Avoiding attention' }, correctOption: 'A' },
  { text: 'What builds trust in a relationship?', options: { A: 'Being dependable', B: 'Being unpredictable', C: 'Being distant', D: 'Being inconsistent' }, correctOption: 'A' },
  { text: 'What is a sweet way to show appreciation?', options: { A: 'Saying kind words', B: 'Complaining often', C: 'Staying silent', D: 'Avoiding praise' }, correctOption: 'A' },

  // Q81-Q90
  { text: 'What shows care in communication?', options: { A: 'Responding thoughtfully', B: 'Ignoring messages', C: 'Replying randomly', D: 'Delaying responses always' }, correctOption: 'A' },
  { text: 'What is a healthy emotional reaction?', options: { A: 'Staying calm', B: 'Getting angry quickly', C: 'Walking away angrily', D: 'Ignoring feelings' }, correctOption: 'A' },
  { text: 'What shows attention in conversation?', options: { A: 'Looking at the speaker', B: 'Looking around', C: 'Checking phone', D: 'Talking over them' }, correctOption: 'A' },
  { text: 'What is a supportive action?', options: { A: 'Encouraging your partner', B: 'Criticizing them', C: 'Ignoring them', D: 'Competing with them' }, correctOption: 'A' },
  { text: 'What makes a partner feel important?', options: { A: 'Prioritizing them sometimes', B: 'Ignoring them', C: 'Forgetting them', D: 'Avoiding them' }, correctOption: 'A' },
  { text: 'What is a kind tone in conversation?', options: { A: 'Gentle voice', B: 'Loud voice', C: 'Angry voice', D: 'Silent treatment' }, correctOption: 'A' },
  { text: 'What shows emotional connection?', options: { A: 'Sharing thoughts openly', B: 'Hiding everything', C: 'Avoiding talks', D: 'Changing topic' }, correctOption: 'A' },
  { text: 'What is a good response to happiness?', options: { A: 'Celebrating together', B: 'Ignoring it', C: 'Staying silent', D: 'Changing topic' }, correctOption: 'A' },
  { text: 'What shows patience in love?', options: { A: 'Waiting calmly', B: 'Getting irritated', C: 'Leaving quickly', D: 'Interrupting' }, correctOption: 'A' },
  { text: 'What is a healthy habit in relationships?', options: { A: 'Checking in often', B: 'Avoiding contact', C: 'Ignoring partner', D: 'Arguing often' }, correctOption: 'A' },

  // Q91-Q100
  { text: 'What shows emotional understanding?', options: { A: 'Listening deeply', B: 'Interrupting often', C: 'Ignoring feelings', D: 'Changing subject' }, correctOption: 'A' },
  { text: 'What is a loving message?', options: { A: '"Hope you\'re okay"', B: '"Whatever"', C: 'No message', D: '"Bye"' }, correctOption: 'A' },
  { text: 'What shows respect in arguments?', options: { A: 'Staying calm', B: 'Raising voice', C: 'Walking away angrily', D: 'Ignoring partner' }, correctOption: 'A' },
  { text: 'What builds closeness over time?', options: { A: 'Consistent care', B: 'Random effort', C: 'No effort', D: 'Distance' }, correctOption: 'A' },
  { text: 'What is a kind reaction to mistakes?', options: { A: 'Understanding and forgiving', B: 'Blaming quickly', C: 'Ignoring always', D: 'Ending conversation' }, correctOption: 'A' },
  { text: 'What shows emotional maturity?', options: { A: 'Handling feelings calmly', B: 'Reacting instantly', C: 'Avoiding feelings', D: 'Suppressing emotions' }, correctOption: 'A' },
  { text: 'What is a caring habit?', options: { A: 'Checking on your partner', B: 'Forgetting your partner', C: 'Ignoring them', D: 'Avoiding contact' }, correctOption: 'A' },
  { text: 'What makes communication better?', options: { A: 'Clear expression', B: 'Silent treatment', C: 'Confusing words', D: 'Avoidance' }, correctOption: 'A' },
  { text: 'What shows love in actions?', options: { A: 'Helping without being asked', B: 'Refusing help', C: 'Ignoring needs', D: 'Delaying help' }, correctOption: 'A' },
  { text: 'What is a sweet gesture?', options: { A: 'A kind surprise', B: 'No effort', C: 'Ignoring partner', D: 'Complaining' }, correctOption: 'A' },
  { text: 'What shows emotional safety?', options: { A: 'Feeling accepted', B: 'Feeling judged', C: 'Feeling ignored', D: 'Feeling pressured' }, correctOption: 'A' },
];
