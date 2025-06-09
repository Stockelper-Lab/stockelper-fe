import { formVariants } from "@/components/common/animations";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type MotionFormWrapperProps = {
  children: ReactNode;
  formKey: string;
};

export const MotionFormWrapper = ({
  children,
  formKey,
}: MotionFormWrapperProps) => (
  <motion.div
    key={formKey}
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={formVariants}
  >
    {children}
  </motion.div>
);
