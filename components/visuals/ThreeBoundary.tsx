"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class ThreeBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") {
      const tag = this.props.label ?? "Three visual";
      console.warn(`${tag} failed, falling back:`, error);
    }
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
