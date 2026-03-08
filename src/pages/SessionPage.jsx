import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SessionAnalysis from "@/components/truddy/session/SessionAnalysis";
import { ChevronLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SessionPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      setLoading(true);
      try {
        const sessions = await base44.entities.TradingSession.list();
        const found = sessions.find(s => s.id === sessionId);
        setSession(found || null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg opacity-60">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg opacity-60">Session not found</p>
        <Link to={createPageUrl("Dashboard")} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to={createPageUrl("Dashboard")} className="btn-secondary mb-8 flex items-center gap-2 w-fit">
          <ChevronLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Session Analysis</h1>
        <p className="text-sm opacity-60 mb-8">{new Date(session.started_at).toLocaleString()}</p>

        <SessionAnalysis session={session} />
      </motion.div>
    </div>
  );
}