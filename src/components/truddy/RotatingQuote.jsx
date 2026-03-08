import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MARK_DOUGLAS_QUOTES = [
  // Trading in the Zone
  "The best traders have no fear because they have developed attitudes that give them the greatest degree of mental flexibility.",
  "You don't need to know what's going to happen next to make money.",
  "Every moment in the market is unique.",
  "To whatever degree you haven't accepted the risk, is the degree to which you will avoid the risk.",
  "Being a consistent winner is a matter of attitude.",
  "The market doesn't know you exist.",
  "A loss is simply the cost of doing business.",
  "Think of yourself as a casino operator, not a gambler.",
  "Every trade is just one of many. Think in probabilities.",
  "The best traders are not afraid — they've developed a mindset that makes fear irrelevant.",
  "Our beliefs about what is true determine what we notice.",
  "The degree to which you think you already know is the degree to which you are not learning.",
  "Your goal is to have your edge work over a series of trades, not on any single one.",
  "The market has no obligation to give you money.",
  "Consistency is a state of mind.",
  "When you truly accept the risk, you are no longer afraid of being wrong.",
  "Winning and losing streaks are a natural part of the market's randomness.",
  "You must believe in your edge completely to execute it without hesitation.",
  "The successful trader has learned to observe the market without projecting expectations onto it.",
  "There is always going to be another opportunity — let this one go if it doesn't meet your criteria.",

  // The Disciplined Trader
  "Mental discipline is the foundation of successful trading.",
  "The disciplined trader acts on his plan — not on his feelings.",
  "Self-discipline is the bridge between trading goals and trading success.",
  "Fear and greed are the enemies of clear thinking in the markets.",
  "You must be willing to accept losses as a natural cost of doing business.",
  "A trade is either working or it isn't. The market doesn't care about your opinion.",
  "Discipline is doing what needs to be done, even when you don't feel like doing it.",
  "Trading success begins with understanding your own psychology first.",
  "Cutting losses short is not failure — it is mastery of risk.",
  "You can't think your way into good trading. You have to develop the right beliefs.",
  "The market is a mirror — it reflects back exactly the psychology you bring to it.",
  "Most losses come not from bad analysis, but from poor mental execution.",
  "A disciplined trader separates the process from the outcome.",
  "You must manage your internal environment as carefully as you manage your trades.",
  "Emotions are indicators of your beliefs, not guides for your actions.",

  // Seminars & Videos
  "The secret to trading is that there is no secret — only consistent process.",
  "Learn to trade without needing to know what happens next.",
  "The market doesn't owe you a winning trade. Your edge plays out over time.",
  "Winning traders don't need the market to behave a certain way to feel okay.",
  "If you're attached to the outcome of any single trade, you've already lost your edge.",
  "Thinking in probabilities is the single most important mental skill a trader can develop.",
  "The moment you start hoping a trade will work, you've stopped trading and started gambling.",
  "Amateurs think about how much they can make. Professionals think about how much they can lose.",
  "Every loss contains a lesson. Your job is to find it.",
  "Fear of being wrong is more costly to a trader than being wrong itself.",
  "Your job is not to predict — it is to respond.",
  "Most traders lose because they are trading their beliefs about what the market should do.",
  "Structure your environment so that trading decisions are made before the market opens.",
  "The best trade setups come when your mind is clear and your rules are defined.",
  "Until you learn to lose properly, you cannot win consistently.",
  "A perfect execution of a losing trade is still a victory of process.",
  "Patience, discipline, and a defined edge — these are the only tools that matter.",
  "You are not trying to beat the market. You are trying to master yourself.",
  "The market will test every weakness in your psychology — and it will find them.",
  "Trading well means executing your system without letting your mind interfere.",
];

const STORAGE_KEY = "truddy_daily_quote_index";
const STORAGE_DATE_KEY = "truddy_daily_quote_date";

function getPersistedQuoteIndex() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(STORAGE_DATE_KEY);
  const storedIndex = localStorage.getItem(STORAGE_KEY);

  if (storedDate === today && storedIndex !== null) {
    return parseInt(storedIndex, 10);
  }

  // New session / new day — pick a new random quote
  const newIndex = Math.floor(Math.random() * MARK_DOUGLAS_QUOTES.length);
  localStorage.setItem(STORAGE_KEY, newIndex.toString());
  localStorage.setItem(STORAGE_DATE_KEY, today);
  return newIndex;
}

export default function RotatingQuote() {
  const [index] = useState(getPersistedQuoteIndex);

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="mt-1 text-[11px] sm:text-xs font-medium leading-snug text-[rgba(var(--muted),0.7)] max-w-[240px] sm:max-w-[360px]"
    >
      "{MARK_DOUGLAS_QUOTES[index]}"
      <span className="block text-[10px] sm:text-[11px] font-semibold mt-0.5 text-[rgba(var(--muted),0.45)]">— Mark Douglas</span>
    </motion.p>
  );
}