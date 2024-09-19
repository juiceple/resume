'use client'
import React, { useEffect, useRef, ReactNode } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface SlideUpSectionProps {
  children: ReactNode;
  className?: string;
}

const SlideUpSection: React.FC<SlideUpSectionProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { y: 100, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      transition={{ duration: 2}}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default SlideUpSection;