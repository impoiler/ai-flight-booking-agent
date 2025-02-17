import { motion } from "framer-motion";

export default function ToolCallLoading({ message = "Calling tools..." }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 w-max rounded-lg px-6 py-4 bg-muted/60 shadow-md"
    >
      <span className="text-sm font-semibold text-muted-foreground">
        {message}
      </span>
      <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
