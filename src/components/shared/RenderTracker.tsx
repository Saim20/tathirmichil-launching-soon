"use client";

import { useRef, useEffect } from 'react';

interface RenderTrackerProps {
  name: string;
  props?: Record<string, any>;
}

export const RenderTracker = ({ name, props = {} }: RenderTrackerProps) => {
  const renderCount = useRef(0);
  const prevProps = useRef(props);
  
  renderCount.current += 1;
  
  useEffect(() => {
    console.log(`🎯 ${name} mounted (render #${renderCount.current})`);
    return () => {
      console.log(`🗑️  ${name} unmounted`);
    };
  }, [name]);
  
  useEffect(() => {
    if (renderCount.current > 1) {
      const changedProps: string[] = [];
      
      Object.keys(props).forEach(key => {
        if (props[key] !== prevProps.current[key]) {
          changedProps.push(`${key}: ${prevProps.current[key]} → ${props[key]}`);
        }
      });
      
      if (changedProps.length > 0) {
        console.log(`🔄 ${name} re-render #${renderCount.current} - Changed props:`, changedProps);
      } else {
        console.log(`🔄 ${name} re-render #${renderCount.current} - No prop changes detected`);
      }
    }
    
    prevProps.current = props;
  });
  
  return null;
};

export default RenderTracker;
