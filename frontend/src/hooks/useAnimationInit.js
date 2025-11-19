/**
 * Custom hook for components to register their animations with the orchestrator
 * This replaces individual useGSAP hooks in components
 */

import { useEffect, useRef } from "react";
import orchestrator from "@/utils/animationOrchestrator";

/**
 * Hook for registering component animations with the central orchestrator
 * @param {string} componentName - Unique name for this component
 * @param {Function} initFunction - Function that initializes animations
 * @param {Object} options - Configuration options
 * @param {number} options.priority - Initialization priority (lower = earlier)
 * @param {Array} options.dependencies - React dependencies array
 */
export function useAnimationInit(
  componentName,
  initFunction,
  { priority = 100, dependencies = [] } = {}
) {
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    // Register with orchestrator
    if (!isRegisteredRef.current) {
      orchestrator.register(componentName, initFunction, priority);
      isRegisteredRef.current = true;
    }

    // Cleanup on unmount
    return () => {
      orchestrator.unregister(componentName);
      isRegisteredRef.current = false;
    };
  }, dependencies);
}

/**
 * Hook to get a ref that can be used for scoping animations
 * @returns {React.RefObject} - Ref to attach to component root element
 */
export function useAnimationScope() {
  return useRef(null);
}

