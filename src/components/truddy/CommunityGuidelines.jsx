import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Heart, Users, Shield } from "lucide-react";

const guidelines = [
  {
    icon: Heart,
    title: "Be Respectful",
    description: "Treat all community members with kindness and respect. We're all learning together."
  },
  {
    icon: Users,
    title: "Share Experiences",
    description: "Share your trading challenges and wins. Help others by sharing what you've learned."
  },
  {
    icon: Shield,
    title: "Stay On Topic",
    description: "Keep discussions focused on trading psychology and personal growth."
  },
  {
    icon: AlertCircle,
    title: "No Spam",
    description: "Avoid promotional content, links, or messages that aren't directly related to trading."
  }
];

export default function CommunityGuidelines() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-base font-semibold mb-2">Community Guidelines</h3>
        <p className="text-xs text-[rgba(var(--muted),0.6)] mb-4">
          Help us maintain a positive and supportive environment
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {guidelines.map((guide, i) => {
          const Icon = guide.icon;
          return (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-[14px] p-4"
            >
              <div className="flex items-start gap-3">
                <Icon size={16} className="text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">{guide.title}</h4>
                  <p className="text-xs text-[rgba(var(--muted),0.6)]">{guide.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}