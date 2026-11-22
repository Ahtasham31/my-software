import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/data/states";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center bg-background p-6">
          <ErrorState
            title="Application error"
            description={this.state.error.message}
            onRetry={this.handleReset}
          />
        </div>
      );
    }
    return this.props.children;
  }
}